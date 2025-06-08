# model_loader.py
import torch
import os
from pathlib import Path
import cv2
import numpy as np
from PIL import Image
import torchvision.transforms as transforms

class ModelArchitecture(torch.nn.Module):
    """Model architecture matching your trained models"""
    def __init__(self):
        super(ModelArchitecture, self).__init__()
        
        class ResidualBlock(torch.nn.Module):
            def __init__(self, dim):
                super(ResidualBlock, self).__init__()
                self.conv_block = torch.nn.Sequential(
                    torch.nn.ReflectionPad2d(1),
                    torch.nn.Conv2d(dim, dim, kernel_size=3),
                    torch.nn.InstanceNorm2d(dim),
                    torch.nn.ReLU(True),
                    torch.nn.ReflectionPad2d(1),
                    torch.nn.Conv2d(dim, dim, kernel_size=3),
                    torch.nn.InstanceNorm2d(dim)
                )

            def forward(self, x):
                return x + self.conv_block(x)
        
        # Create layers
        layers = []
        
        # Initial layers
        layers.append(torch.nn.ReflectionPad2d(3))
        layers.append(torch.nn.Conv2d(3, 64, kernel_size=7))  # model.1
        layers.append(torch.nn.InstanceNorm2d(64))
        layers.append(torch.nn.ReLU(True))
        
        # Downsample
        layers.append(torch.nn.Conv2d(64, 128, kernel_size=3, stride=2, padding=1))  # model.4
        layers.append(torch.nn.InstanceNorm2d(128))
        layers.append(torch.nn.ReLU(True))
        
        layers.append(torch.nn.Conv2d(128, 256, kernel_size=3, stride=2, padding=1))  # model.7
        layers.append(torch.nn.InstanceNorm2d(256))
        layers.append(torch.nn.ReLU(True))
        
        # Residual blocks
        for i in range(9):
            layers.append(ResidualBlock(256))
        
        # Upsample
        layers.append(torch.nn.ConvTranspose2d(256, 128, kernel_size=3, stride=2, padding=1, output_padding=1))
        layers.append(torch.nn.InstanceNorm2d(128))
        layers.append(torch.nn.ReLU(True))
        
        layers.append(torch.nn.ConvTranspose2d(128, 64, kernel_size=3, stride=2, padding=1, output_padding=1))
        layers.append(torch.nn.InstanceNorm2d(64))
        layers.append(torch.nn.ReLU(True))
        
        # Output layers
        layers.append(torch.nn.ReflectionPad2d(3))
        layers.append(torch.nn.Conv2d(64, 3, kernel_size=7))
        layers.append(torch.nn.Tanh())
        
        self.model = torch.nn.Sequential(*layers)
    
    def forward(self, x):
        return self.model(x)

class ModelLoader:
    def __init__(self):
        self.models = {}
        self.models_loaded = False
        base_path = Path(__file__).parent.parent.parent
        self.model_paths = {
            'G_A': str(base_path / '83_net_G_A.pth'),
            'G_B': str(base_path / '83_net_G_B.pth'),
            'D_A': str(base_path / '83_net_D_A.pth'),
            'D_B': str(base_path / '83_net_D_B.pth')
        }
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.transform = self._get_transform()
    
    def _get_transform(self):
        """Get image transformation pipeline"""
        return transforms.Compose([
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.5, 0.5, 0.5], std=[0.5, 0.5, 0.5])
        ])
    
    async def load_models(self):
        """Load all PyTorch models"""
        try:
            print(f"Loading models on device: {self.device}")
            
            # Load Generator A (main model for adding glasses)
            print(f"Loading G_A from {self.model_paths['G_A']}")
            model = ModelArchitecture().to(self.device)
            state_dict = torch.load(self.model_paths['G_A'], map_location=self.device)
            model.load_state_dict(state_dict)
            model.eval()
            self.models['G_A'] = model
            
            self.models_loaded = True
            return True
        except Exception as e:
            print(f"Error loading models: {str(e)}")
            import traceback
            print(traceback.format_exc())
            return False
            
    def process_image(self, image):
        """Process an image through the model"""
        if not self.models_loaded:
            raise RuntimeError("Models not loaded")
            
        try:
            print(f"Processing image with shape: {image.shape}")
            with torch.no_grad():
                # Convert BGR to RGB
                print("Converting BGR to RGB...")
                image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
                
                # Convert to PIL Image
                print("Converting to PIL Image...")
                pil_image = Image.fromarray(image_rgb)
                
                # Transform image
                print("Applying image transformations...")
                input_tensor = self.transform(pil_image)
                input_tensor = input_tensor.unsqueeze(0).to(self.device)
                print(f"Input tensor shape: {input_tensor.shape}")
                
                # Process through model
                print("Running model inference...")
                output_tensor = self.models['G_A'](input_tensor)
                print(f"Output tensor shape: {output_tensor.shape}")
                
                # Convert back to image
                print("Converting output tensor to image...")
                output_tensor = output_tensor.cpu().squeeze()
                output_tensor = (output_tensor + 1) / 2.0
                output_tensor = torch.clamp(output_tensor, 0, 1)
                
                # Convert to numpy array
                output_array = output_tensor.permute(1, 2, 0).numpy()
                print(f"Output array shape: {output_array.shape}")
                
                # Scale to [0, 255]
                output_array = (output_array * 255).astype(np.uint8)
                
                # Convert RGB to BGR
                print("Converting RGB to BGR for final output...")
                output_bgr = cv2.cvtColor(output_array, cv2.COLOR_RGB2BGR)
                print(f"Final output shape: {output_bgr.shape}")
                
                return output_bgr
                
        except Exception as e:
            print(f"Error processing image: {str(e)}")
            import traceback
            print(traceback.format_exc())
            raise
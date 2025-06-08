import torch
import torch.nn as nn
import torchvision.transforms as transforms
import cv2
import numpy as np
from PIL import Image
from pathlib import Path

class ResidualBlock(nn.Module):
    """Residual Block used in Generator"""
    def __init__(self, dim):
        super(ResidualBlock, self).__init__()
        self.conv_block = nn.Sequential(
            nn.ReflectionPad2d(1),
            nn.Conv2d(dim, dim, 3),
            nn.InstanceNorm2d(dim),
            nn.ReLU(inplace=True),
            nn.ReflectionPad2d(1),
            nn.Conv2d(dim, dim, 3),
            nn.InstanceNorm2d(dim)
        )

    def forward(self, x):
        return x + self.conv_block(x)

class Generator(nn.Module):
    """Generator network for virtual glasses"""
    def __init__(self, input_nc=3, output_nc=3, ngf=64, n_blocks=9):
        super(Generator, self).__init__()
        
        model = []
        
        # Initial convolution block (model.1 -> model.7)
        model += [
            nn.ReflectionPad2d(3),
            nn.Conv2d(input_nc, ngf, kernel_size=7, padding=0),
            nn.InstanceNorm2d(ngf),
            nn.ReLU(True),
            nn.Conv2d(ngf, ngf*2, kernel_size=3, stride=2, padding=1),
            nn.InstanceNorm2d(ngf*2),
            nn.ReLU(True)
        ]
        
        # Middle conv blocks (model.8 -> model.18)
        for i in range(n_blocks):
            model += [
                ResidualBlock(ngf*2)
            ]
            
        # Upsampling and output blocks (model.19 -> model.26)
        model += [
            nn.ConvTranspose2d(ngf*2, ngf, kernel_size=3, stride=2, padding=1, output_padding=1),
            nn.InstanceNorm2d(ngf),
            nn.ReLU(True),
            nn.ReflectionPad2d(3),
            nn.Conv2d(ngf, output_nc, kernel_size=7, padding=0),
            nn.Tanh()
        ]
        
        self.model = nn.Sequential(*model)

    def forward(self, x):
        return self.model(x)

class Discriminator(nn.Module):
    """Discriminator network"""
    def __init__(self, input_nc=3, ndf=64, n_layers=3):
        super(Discriminator, self).__init__()
        
        model = [
            nn.Conv2d(input_nc, ndf, 4, stride=2, padding=1),
            nn.LeakyReLU(0.2, inplace=True)
        ]

        for i in range(1, n_layers):
            mult = min(2**i, 8)
            prev_mult = min(2**(i-1), 8)
            model += [
                nn.Conv2d(ndf * prev_mult, ndf * mult, 4, stride=2, padding=1),
                nn.InstanceNorm2d(ndf * mult),
                nn.LeakyReLU(0.2, inplace=True)
            ]

        mult = min(2**n_layers, 8)
        prev_mult = min(2**(n_layers-1), 8)
        model += [
            nn.Conv2d(ndf * prev_mult, ndf * mult, 4, padding=1),
            nn.InstanceNorm2d(ndf * mult),
            nn.LeakyReLU(0.2, inplace=True),
            nn.Conv2d(ndf * mult, 1, 4, padding=1)
        ]

        self.model = nn.Sequential(*model)

    def forward(self, x):
        return self.model(x)

class VirtualGlassesGAN:
    def __init__(self, device='cuda' if torch.cuda.is_available() else 'cpu'):
        self.device = device
        self.transform = transforms.Compose([
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.5, 0.5, 0.5], std=[0.5, 0.5, 0.5])
        ])
        
        # Initialize models
        self.netG_A = Generator().to(device)  # Original to Glasses
        self.netG_B = Generator().to(device)  # Glasses to Original
        self.netD_A = Discriminator().to(device)  # Discriminator for domain A
        self.netD_B = Discriminator().to(device)  # Discriminator for domain B
        
    def load_models(self, model_paths: Dict[str, str]):
        """Load trained model weights"""
        try:
            self.netG_A.load_state_dict(torch.load(model_paths['G_A'], map_location=self.device))
            self.netG_B.load_state_dict(torch.load(model_paths['G_B'], map_location=self.device))
            self.netD_A.load_state_dict(torch.load(model_paths['D_A'], map_location=self.device))
            self.netD_B.load_state_dict(torch.load(model_paths['D_B'], map_location=self.device))
            
            # Set models to evaluation mode
            self.netG_A.eval()
            self.netG_B.eval()
            self.netD_A.eval()
            self.netD_B.eval()
            
            return True
        except Exception as e:
            print(f"Error loading models: {str(e)}")
            return False
            
    def preprocess_image(self, image: np.ndarray) -> torch.Tensor:
        """Preprocess image for model input"""
        # Convert BGR to RGB
        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        # Apply transformations
        tensor = self.transform(image_rgb)
        # Add batch dimension
        tensor = tensor.unsqueeze(0).to(self.device)
        return tensor
        
    def postprocess_image(self, tensor: torch.Tensor) -> np.ndarray:
        """Convert model output tensor to image"""
        # Move to CPU and convert to numpy
        image = tensor.cpu().squeeze().permute(1, 2, 0).detach().numpy()
        # Denormalize
        image = ((image + 1) * 127.5).clip(0, 255).astype(np.uint8)
        # Convert RGB to BGR
        image_bgr = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
        return image_bgr
        
    @torch.no_grad()
    def process_image(self, image: np.ndarray) -> np.ndarray:
        """Process an image through the GAN"""
        # Preprocess
        input_tensor = self.preprocess_image(image)
        
        # Generate output using G_A (add virtual glasses)
        output_tensor = self.netG_A(input_tensor)
        
        # Postprocess
        result_image = self.postprocess_image(output_tensor)
        
        return result_image

import os
import sys
import torch
import numpy as np
from PIL import Image
import torchvision.transforms as transforms
import cv2
import requests
from pathlib import Path

class ResnetGenerator(torch.nn.Module):
    def __init__(self, input_nc=3, output_nc=3, ngf=64, n_blocks=9):
        super(ResnetGenerator, self).__init__()
        model = []
        model += [torch.nn.ReflectionPad2d(3),
                 torch.nn.Conv2d(input_nc, ngf, kernel_size=7, padding=0),
                 torch.nn.InstanceNorm2d(ngf),
                 torch.nn.ReLU(True)]

        n_downsampling = 2
        for i in range(n_downsampling):
            mult = 2**i
            model += [torch.nn.Conv2d(ngf * mult, ngf * mult * 2, kernel_size=3, stride=2, padding=1),
                     torch.nn.InstanceNorm2d(ngf * mult * 2),
                     torch.nn.ReLU(True)]

        mult = 2**n_downsampling
        for i in range(n_blocks):
            model += [ResnetBlock(ngf * mult)]

        for i in range(n_downsampling):
            mult = 2**(n_downsampling - i)
            model += [torch.nn.ConvTranspose2d(ngf * mult, int(ngf * mult / 2), kernel_size=3, stride=2, padding=1, output_padding=1),
                     torch.nn.InstanceNorm2d(int(ngf * mult / 2)),
                     torch.nn.ReLU(True)]

        model += [torch.nn.ReflectionPad2d(3),
                 torch.nn.Conv2d(ngf, output_nc, kernel_size=7, padding=0),
                 torch.nn.Tanh()]

        self.model = torch.nn.Sequential(*model)

    def forward(self, x):
        return self.model(x)

class ResnetBlock(torch.nn.Module):
    def __init__(self, dim):
        super(ResnetBlock, self).__init__()
        self.conv_block = self.build_conv_block(dim)

    def build_conv_block(self, dim):
        conv_block = []
        conv_block += [torch.nn.ReflectionPad2d(1)]
        conv_block += [torch.nn.Conv2d(dim, dim, kernel_size=3, padding=0),
                      torch.nn.InstanceNorm2d(dim),
                      torch.nn.ReLU(True)]
        conv_block += [torch.nn.ReflectionPad2d(1)]
        conv_block += [torch.nn.Conv2d(dim, dim, kernel_size=3, padding=0),
                      torch.nn.InstanceNorm2d(dim)]
        return torch.nn.Sequential(*conv_block)

    def forward(self, x):
        return x + self.conv_block(x)

def process_image(input_path, output_dir):
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    # Load model
    model_path = os.path.join(os.path.dirname(__file__), '83_net_G_A.pth')
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model file not found at {model_path}")

    # Create and load the model
    netG = ResnetGenerator()
    try:
        state_dict = torch.load(model_path, map_location=torch.device('cpu'))
        netG.load_state_dict(state_dict)
        netG.eval()
    except Exception as e:
        raise Exception(f"Error loading model: {str(e)}")

    # Load and process input image
    transform = transforms.Compose([
        transforms.Resize(256),
        transforms.ToTensor(),
        transforms.Normalize((0.5, 0.5, 0.5), (0.5, 0.5, 0.5))
    ])

    try:
        image = Image.open(input_path).convert('RGB')
        input_tensor = transform(image).unsqueeze(0)
    except Exception as e:
        raise Exception(f"Error loading input image: {str(e)}")

    # Generate output
    with torch.no_grad():
        output = netG(input_tensor)

    # Save output image
    output_name = os.path.splitext(os.path.basename(input_path))[0] + '_fake.png'
    output_path = os.path.join(output_dir, output_name)

    try:
        output_np = output[0].cpu().float().numpy()
        output_np = (np.transpose(output_np, (1, 2, 0)) + 1) / 2.0 * 255.0
        output_np = output_np.astype(np.uint8)
        output_img = Image.fromarray(output_np)
        output_img.save(output_path)
        print(f"Output saved to: {output_path}")
    except Exception as e:
        raise Exception(f"Error saving output image: {str(e)}")

    return output_path

def main():
    if len(sys.argv) != 3:
        print("Usage: python test_real_image.py <input_path> <output_dir>")
        sys.exit(1)

    input_path = sys.argv[1]
    output_dir = sys.argv[2]

    try:
        output_path = process_image(input_path, output_dir)
        print(f"Successfully processed image: {output_path}")
    except Exception as e:
        print(f"Error: {str(e)}")
        sys.exit(1)

if __name__ == '__main__':
    main()
    """
    Test the virtual glasses API with a real image
    
    Args:
        image_path (str): Path to the image file to test
    """
    # First try the debug endpoint
    debug_url = "http://localhost:8000/debug-face-detection/"
    print(f"\nTesting face detection with debug endpoint...")
    
    try:
        with open(image_path, "rb") as f:
            files = {"file": f}
            response = requests.post(debug_url, files=files)
            
        if response.status_code == 200:
            # Save debug result
            debug_output = Path("debug_result.png")
            with open(debug_output, "wb") as f:
                f.write(response.content)
            print(f"Debug visualization saved to {debug_output}")
        else:
            print(f"Debug endpoint error: {response.text}")
    except Exception as e:
        print(f"Debug endpoint error: {str(e)}")

def test_with_real_image(image_path):
    # Now try the main endpoint
    url = "http://localhost:8000/process-image/"
    
    try:
        # Verify image exists
        if not Path(image_path).exists():
            print(f"Error: Image file not found at {image_path}")
            return

        # Read image to verify it's valid
        img = cv2.imread(image_path)
        if img is None:
            print(f"Error: Could not read image file {image_path}")
            return
            
        print(f"Processing image: {image_path}")
        
        # Send request to API
        with open(image_path, "rb") as f:
            files = {"file": f}
            print("Sending request to API...")
            response = requests.post(url, files=files)
        
        if response.status_code == 200:
            # Create output filename
            input_path = Path(image_path)
            output_path = input_path.parent / f"result_{input_path.name}"
            
            # Save result
            with open(output_path, "wb") as f:
                f.write(response.content)
            print(f"Success! Result saved to: {output_path}")
        else:
            print(f"Error: API returned status code {response.status_code}")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"Error occurred: {str(e)}")

def main():
    if len(sys.argv) != 2:
        print("Usage: python test_real_image.py <path_to_image>")
        print("Example: python test_real_image.py test_images/face.jpg")
        return
        
    image_path = sys.argv[1]
    test_with_real_image(image_path)

if __name__ == "__main__":
    main()

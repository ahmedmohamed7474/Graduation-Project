#!/usr/bin/env python3
import sys
import os
import cv2
from app.utils.glasses_style_transfer import GlassesStyleTransfer

def main():
    if len(sys.argv) != 4:
        print("Usage: python tryon_glasses.py <input_image> <glasses_image> <output_dir>")
        sys.exit(1)

    input_image_path = sys.argv[1]
    glasses_image_path = sys.argv[2]
    output_dir = sys.argv[3]

    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)

    # Load input image
    image = cv2.imread(input_image_path)
    if image is None:
        print(f"Error: Could not load input image: {input_image_path}")
        sys.exit(1)

    # Initialize glasses overlay with style transfer
    glasses_transfer = GlassesStyleTransfer()

    # Process image
    output_image, success = glasses_transfer.overlay_glasses_with_style(image, glasses_image_path)
    
    if not success:
        print("Error: Could not detect face in the image")
        sys.exit(1)

    # Save output image
    output_path = os.path.join(output_dir, f"{os.path.splitext(os.path.basename(input_image_path))[0]}_with_glasses.png")
    cv2.imwrite(output_path, output_image)

if __name__ == "__main__":
    main()

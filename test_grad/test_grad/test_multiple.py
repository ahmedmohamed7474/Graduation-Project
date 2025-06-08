import cv2
import numpy as np
from pathlib import Path
import requests
from PIL import Image
import matplotlib.pyplot as plt
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

def create_comparison_grid(images_data):
    """Create a matplotlib grid of all comparisons"""
    n_images = len(images_data)
    if n_images == 0:
        return
        
    # Create a figure with n_images rows and 2 columns
    fig, axes = plt.subplots(n_images, 2, figsize=(12, 6*n_images))
    if n_images == 1:
        axes = axes.reshape(1, -1)
        
    for idx, (name, orig_path, result_path) in enumerate(images_data):
        # Read images
        orig = cv2.imread(str(orig_path))
        result = cv2.imread(str(result_path))
        
        # Convert BGR to RGB for matplotlib
        orig_rgb = cv2.cvtColor(orig, cv2.COLOR_BGR2RGB)
        result_rgb = cv2.cvtColor(result, cv2.COLOR_BGR2RGB)
        
        axes[idx, 0].imshow(orig_rgb)
        axes[idx, 0].set_title(f'Original: {name}')
        axes[idx, 0].axis('off')
        
        axes[idx, 1].imshow(result_rgb)
        axes[idx, 1].set_title(f'With Virtual Glasses: {name}')
        axes[idx, 1].axis('off')
    
    plt.tight_layout()
    grid_path = Path("test_images") / "comparison_grid.png"
    plt.savefig(str(grid_path))
    plt.close()
    logging.info(f"Comparison grid saved to {grid_path}")

def compare_images(original_path, result_path):
    """Compare original and processed images"""
    # Read images
    original = cv2.imread(str(original_path))
    result = cv2.imread(str(result_path))
    
    # Create side-by-side comparison
    h1, w1 = original.shape[:2]
    h2, w2 = result.shape[:2]
    
    # Ensure same height
    height = max(h1, h2)
    width = w1 + w2
    
    # Create comparison image
    comp = np.zeros((height, width, 3), dtype=np.uint8)
    comp[:h1, :w1] = original
    comp[:h2, w1:w1+w2] = result
    
    # Add labels
    cv2.putText(comp, 'Original', (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
    cv2.putText(comp, 'With Glasses', (w1 + 10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
    
    # Save comparison
    output_path = Path(original_path).parent / f"comparison_{Path(original_path).name}"
    cv2.imwrite(str(output_path), comp)
    logging.info(f"Saved comparison to: {output_path}")
    return comp

def test_multiple_images():
    """Test the API with multiple images"""
    test_dir = Path("test_images")
    images = [f for f in test_dir.glob("*.jpg") if not f.name.startswith(("result_", "comparison_"))]
    
    url = "http://localhost:8000/process-image/"
    
    logging.info(f"Found {len(images)} test images")
    
    # Store data for grid comparison
    processed_images = []
    
    for img_path in images:
        logging.info(f"\nProcessing {img_path.name}...")
        
        try:
            # Send request to API
            with open(img_path, "rb") as f:
                response = requests.post(url, files={"file": f})
            
            if response.status_code == 200:
                # Save result
                result_path = img_path.parent / f"result_{img_path.name}"
                with open(result_path, "wb") as f:
                    f.write(response.content)
                logging.info(f"Success! Saved to {result_path}")
                
                # Create individual comparison
                compare_images(img_path, result_path)
                
                # Add to grid data
                processed_images.append((img_path.stem, img_path, result_path))
            else:
                logging.error(f"Error: {response.status_code}")
                logging.error(response.text)
                
        except Exception as e:
            logging.error(f"Error processing {img_path.name}: {str(e)}")
            import traceback
            logging.error(traceback.format_exc())
    
    # Create comparison grid of all processed images
    if processed_images:
        create_comparison_grid(processed_images)
    else:
        logging.warning("No images were processed successfully")

if __name__ == "__main__":
    test_multiple_images()

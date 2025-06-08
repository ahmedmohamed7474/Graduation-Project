import requests
import cv2
import numpy as np
from pathlib import Path

def test_api():
    """Test the virtual glasses API with a sample image"""
    # URL of the API
    url = "http://localhost:8000/process-image/"
    
    # Create a simple test image with a face
    img = np.zeros((300, 300, 3), dtype=np.uint8)
    img.fill(255)  # White background
    
    # Draw a simple face
    cv2.circle(img, (150, 150), 50, (0, 0, 0), 2)  # Face
    cv2.circle(img, (130, 130), 5, (0, 0, 0), -1)  # Left eye
    cv2.circle(img, (170, 130), 5, (0, 0, 0), -1)  # Right eye
    
    # Save test image
    test_image_path = Path("test_face.jpg")
    cv2.imwrite(str(test_image_path), img)
    
    try:
        # Send request to API
        with open(test_image_path, "rb") as f:
            files = {"file": f}
            response = requests.post(url, files=files)
        
        if response.status_code == 200:
            # Save result
            result_path = Path("result.png")
            with open(result_path, "wb") as f:
                f.write(response.content)
            print(f"Success! Check {result_path} for the result")
        else:
            print(f"Error: {response.status_code}")
            print(response.text)
            
    except Exception as e:
        print(f"Error: {str(e)}")
    finally:
        # Cleanup
        if test_image_path.exists():
            test_image_path.unlink()

if __name__ == "__main__":
    test_api()

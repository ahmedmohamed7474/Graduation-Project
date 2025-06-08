import cv2
import numpy as np
from pathlib import Path
import logging

class GlassesProcessor:
    def __init__(self):
        # Directory containing glasses styles
        self.glasses_dir = Path(__file__).parent.parent / "assets" / "glasses"
        self.glasses_dir.mkdir(parents=True, exist_ok=True)
        
        # Create default glasses if none exist
        if not list(self.glasses_dir.glob("*.png")):
            self.create_dummy_glasses(self.glasses_dir / "1.png", "rectangular")
            self.create_dummy_glasses(self.glasses_dir / "2.png", "round")
            self.create_dummy_glasses(self.glasses_dir / "3.png", "sunglasses")
        
        # Cache for loaded glasses images
        self.glasses_cache = {}
        
    def create_dummy_glasses(self, path, style="rectangular"):
        """Create a simple glasses overlay for testing with different styles"""
        glasses = np.zeros((100, 300, 4), dtype=np.uint8)
        
        if style == "rectangular":
            # Draw rectangular frames
            cv2.rectangle(glasses, (10, 20), (290, 80), (0, 0, 0, 255), 2)
            cv2.rectangle(glasses, (70, 30), (130, 70), (0, 0, 0, 255), 2)
            cv2.rectangle(glasses, (170, 30), (230, 70), (0, 0, 0, 255), 2)
        elif style == "round":
            # Draw round frames
            cv2.circle(glasses, (100, 50), 30, (0, 0, 0, 255), 2)
            cv2.circle(glasses, (200, 50), 30, (0, 0, 0, 255), 2)
            cv2.line(glasses, (130, 50), (170, 50), (0, 0, 0, 255), 2)
        elif style == "sunglasses":
            # Draw sunglasses style
            pts = np.array([[20, 40], [280, 40], [260, 70], [40, 70]], np.int32)
            cv2.fillPoly(glasses, [pts], (0, 0, 0, 128))
        
        cv2.imwrite(str(path), glasses)
        logging.info(f"Created dummy glasses style '{style}' at {path}")

    def get_glasses_image(self, glasses_id):
        """Load a specific glasses style by ID"""
        try:
            glasses_id = str(glasses_id)  # Convert to string for path operations
            if glasses_id in self.glasses_cache:
                return self.glasses_cache[glasses_id]
            
            glasses_path = self.glasses_dir / f"{glasses_id}.png"
            if not glasses_path.exists():
                logging.warning(f"Glasses style {glasses_id} not found, using default style")
                glasses_path = self.glasses_dir / "1.png"
            
            image = cv2.imread(str(glasses_path), cv2.IMREAD_UNCHANGED)
            if image is None:
                raise RuntimeError(f"Failed to load glasses image from {glasses_path}")
            
            self.glasses_cache[glasses_id] = image
            return image
        except Exception as e:
            logging.error(f"Error loading glasses style {glasses_id}: {str(e)}")
            raise

    def process(self, image, face_data, models, glasses_id="1"):
        """Process image with face detection and add virtual glasses"""
        try:
            # Load the selected glasses style
            glasses_image = self.get_glasses_image(glasses_id)
            
            # Extract face and eye coordinates
            face_x, face_y, face_w, face_h = face_data['face']
            left_eye = face_data['left_eye']
            right_eye = face_data['right_eye']
            
            # Calculate glasses dimensions based on eye positions
            eye_distance = right_eye[0] - left_eye[0]
            glasses_width = int(eye_distance * 1.5)
            
            # Maintain aspect ratio
            aspect_ratio = glasses_image.shape[0] / glasses_image.shape[1]
            glasses_height = int(glasses_width * aspect_ratio)
            
            # Resize glasses
            glasses = cv2.resize(glasses_image, (glasses_width, glasses_height))
            
            # Calculate position
            glasses_x = face_x + left_eye[0] - int(glasses_width * 0.2)
            glasses_y = face_y + min(left_eye[1], right_eye[1]) - int(glasses_height * 0.3)
            
            # Ensure within bounds
            glasses_x = max(0, min(glasses_x, image.shape[1] - glasses_width))
            glasses_y = max(0, min(glasses_y, image.shape[0] - glasses_height))
            
            # Create output image
            result = image.copy()
            
            # Handle alpha channel for transparency
            if glasses.shape[2] == 4:
                alpha_channel = glasses[:, :, 3] / 255.0
                for c in range(3):
                    result[glasses_y:glasses_y+glasses_height, 
                          glasses_x:glasses_x+glasses_width, c] = \
                        image[glasses_y:glasses_y+glasses_height, 
                             glasses_x:glasses_x+glasses_width, c] * (1 - alpha_channel) + \
                        glasses[:, :, c] * alpha_channel
            else:
                # No alpha channel, simple overlay
                result[glasses_y:glasses_y+glasses_height, 
                      glasses_x:glasses_x+glasses_width] = glasses[:, :, :3]
            
            return result
            
        except Exception as e:
            logging.error(f"Error processing image: {str(e)}")
            raise

import cv2
import numpy as np
import mediapipe as mp
import os
from pathlib import Path

class GlassesOverlay:
    def __init__(self):
        self.mp_face_mesh = mp.solutions.face_mesh
        self.face_mesh = self.mp_face_mesh.FaceMesh(
            static_image_mode=True,
            max_num_faces=1,
            min_detection_confidence=0.5
        )
        
        # Define eye region landmarks indices for MediaPipe Face Mesh
        self.LEFT_EYE = [33, 133]  # Outer corners of left eye
        self.RIGHT_EYE = [362, 263]  # Outer corners of right eye
        
        # Load default glasses
        self.default_glasses_path = os.path.join(
            os.path.dirname(__file__),
            "..",
            "..",
            "glasses_images",
            "default_glasses.png"
        )
        
    def get_face_landmarks(self, image):
        """Get facial landmarks using MediaPipe Face Mesh"""
        rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        results = self.face_mesh.process(rgb_image)
        
        if not results.multi_face_landmarks:
            return None
            
        return results.multi_face_landmarks[0].landmark
        
    def get_eye_coordinates(self, image, landmarks):
        """Extract eye coordinates from landmarks"""
        h, w = image.shape[:2]
        
        # Get left eye coordinates
        left_eye_points = [
            (int(landmarks[idx].x * w), int(landmarks[idx].y * h))
            for idx in self.LEFT_EYE
        ]
        
        # Get right eye coordinates
        right_eye_points = [
            (int(landmarks[idx].x * w), int(landmarks[idx].y * h))
            for idx in self.RIGHT_EYE
        ]
        
        return left_eye_points, right_eye_points
        
    def overlay_glasses(self, image, glasses_path=None):
        """Overlay glasses on the image"""
        # Use default glasses if none provided
        if glasses_path is None or not os.path.exists(glasses_path):
            glasses_path = self.default_glasses_path
            
        # Get face landmarks
        landmarks = self.get_face_landmarks(image)
        if landmarks is None:
            return image, False
            
        # Get eye coordinates
        left_eye_points, right_eye_points = self.get_eye_coordinates(image, landmarks)
        
        # Calculate glasses dimensions and position
        eye_distance = np.linalg.norm(
            np.array(right_eye_points[0]) - np.array(left_eye_points[0])
        )
        glasses_width = int(eye_distance * 1.5)
        
        # Load and resize glasses image
        glasses = cv2.imread(glasses_path, cv2.IMREAD_UNCHANGED)
        if glasses is None:
            return image, False
            
        # Keep aspect ratio when resizing
        aspect_ratio = glasses.shape[0] / glasses.shape[1]
        glasses_height = int(glasses_width * aspect_ratio)
        glasses = cv2.resize(glasses, (glasses_width, glasses_height))
        
        # Calculate position
        center_x = (left_eye_points[0][0] + right_eye_points[0][0]) // 2
        center_y = (left_eye_points[0][1] + right_eye_points[0][1]) // 2
        
        x1 = center_x - glasses_width // 2
        y1 = center_y - glasses_height // 2
        
        # Ensure coordinates are within image bounds
        x1 = max(0, x1)
        y1 = max(0, y1)
        x2 = min(image.shape[1], x1 + glasses_width)
        y2 = min(image.shape[0], y1 + glasses_height)
        
        # Adjust glasses crop if needed
        glasses_crop = glasses[:y2-y1, :x2-x1]
        
        # Create mask for transparent overlay
        if glasses.shape[2] == 4:  # With alpha channel
            mask = glasses_crop[:, :, 3] / 255.0
            for c in range(3):
                image[y1:y2, x1:x2, c] = (
                    image[y1:y2, x1:x2, c] * (1 - mask) +
                    glasses_crop[:, :, c] * mask
                )
        else:  # Without alpha channel
            image[y1:y2, x1:x2] = glasses_crop
            
        return image, True

    def process_image(self, image_path, glasses_path=None):
        """Process an image file and return the result"""
        # Read input image
        image = cv2.imread(str(image_path))
        if image is None:
            raise ValueError("Could not read input image")
            
        # Apply glasses overlay
        result, success = self.overlay_glasses(image.copy(), glasses_path)
        
        if not success:
            raise ValueError("Could not detect face or apply glasses")
            
        return result

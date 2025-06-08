import cv2
import numpy as np
import os

class FaceDetector:
    def __init__(self):
        # Load pre-trained face and eye detection models from OpenCV
        self.face_cascade = cv2.CascadeClassifier(
            cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
        )
        self.eye_cascade = cv2.CascadeClassifier(
            cv2.data.haarcascades + 'haarcascade_eye.xml'
        )
        # Additional cascade for better eye detection
        self.eye_tree_cascade = cv2.CascadeClassifier(
            cv2.data.haarcascades + 'haarcascade_eye_tree_eyeglasses.xml'
        )

    def detect(self, image):
        """
        Detect face and eyes in the image using multiple detection passes
        Returns: Dictionary containing face and eye coordinates
        """
        # Convert to grayscale for detection
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        # Enhance contrast
        gray = cv2.equalizeHist(gray)
        
        # Try multiple face detection parameters
        face_params = [
            {'scale': 1.1, 'neighbors': 5, 'size': (30, 30)},
            {'scale': 1.2, 'neighbors': 3, 'size': (30, 30)},
            {'scale': 1.3, 'neighbors': 4, 'size': (25, 25)}
        ]
        
        detected_face = None
        for params in face_params:
            faces = self.face_cascade.detectMultiScale(
                gray,
                scaleFactor=params['scale'],
                minNeighbors=params['neighbors'],
                minSize=params['size']
            )
            if len(faces) > 0:
                detected_face = faces[0]
                break
        
        if detected_face is None:
            return None

        # Get the face ROI
        x, y, w, h = detected_face
        face_roi_gray = gray[y:y+h, x:x+w]
        face_roi_color = image[y:y+h, x:x+w]
        
        # Enhance contrast in face region
        face_roi_gray = cv2.equalizeHist(face_roi_gray)
        
        # Try multiple eye detection methods
        eyes = self.detect_eyes(face_roi_gray, face_roi_color)
        
        if eyes is None or len(eyes) < 2:
            return None

        # Sort eyes by x-coordinate to get left and right eye
        eyes = sorted(eyes, key=lambda x: x[0])
        left_eye = eyes[0]
        right_eye = eyes[1]
        
        # More lenient validation of eye positions
        eye_y_diff = abs(left_eye[1] - right_eye[1])
        if (left_eye[0] < w * 0.6 and  # Left eye is reasonably on the left
            right_eye[0] > w * 0.2 and  # Right eye is reasonably on the right
            eye_y_diff < h * 0.4):      # Eyes are roughly at same height
            
            return {
                'face': (x, y, w, h),
                'left_eye': tuple(left_eye),
                'right_eye': tuple(right_eye)
            }
        
        return None

    def detect_eyes(self, face_roi_gray, face_roi_color):
        """Try multiple methods to detect eyes"""
        all_eyes = []
        height, width = face_roi_gray.shape[:2]
        
        # Try different detection methods and parameters
        detection_params = [
            # Regular eye cascade with different parameters
            (self.eye_cascade, 1.1, 5, (20, 20)),
            (self.eye_cascade, 1.2, 3, (15, 15)),
            (self.eye_cascade, 1.05, 4, (25, 25)),
            # Eye tree cascade (better for eyes with glasses)
            (self.eye_tree_cascade, 1.1, 5, (20, 20)),
            (self.eye_tree_cascade, 1.2, 3, (15, 15)),
            (self.eye_tree_cascade, 1.05, 4, (25, 25))
        ]
        
        # Try each detection method
        for cascade, scale, neighbors, min_size in detection_params:
            eyes = cascade.detectMultiScale(
                face_roi_gray,
                scaleFactor=scale,
                minNeighbors=neighbors,
                minSize=min_size
            )
            
            # Filter and add detected eyes
            for eye in eyes:
                x, y, w, h = eye
                
                # Basic position validation (eyes should be in upper 75% of face)
                if y < height * 0.75:
                    if len(all_eyes) == 0:
                        all_eyes.append(eye)
                    else:
                        # Check if this eye overlaps with existing ones
                        is_new = True
                        for existing_eye in all_eyes:
                            ex, ey, ew, eh = existing_eye
                            # Check for significant overlap
                            if (abs(x - ex) < w/2 and abs(y - ey) < h/2):
                                is_new = False
                                break
                        if is_new:
                            all_eyes.append(eye)
            
            # If we have enough eyes, process them
            if len(all_eyes) >= 2:
                # Sort by x-coordinate
                all_eyes.sort(key=lambda x: x[0])
                
                # If we have more than 2 eyes, select the best pair
                if len(all_eyes) > 2:
                    # Try to find the best pair based on y-coordinate similarity
                    best_pair = None
                    min_y_diff = float('inf')
                    
                    for i in range(len(all_eyes)-1):
                        for j in range(i+1, len(all_eyes)):
                            y_diff = abs(all_eyes[i][1] - all_eyes[j][1])
                            if y_diff < min_y_diff:
                                min_y_diff = y_diff
                                best_pair = [all_eyes[i], all_eyes[j]]
                    
                    return best_pair
                
                return all_eyes[:2]
        
        return None

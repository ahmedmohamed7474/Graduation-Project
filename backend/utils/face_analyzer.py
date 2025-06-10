import cv2
import numpy as np
import mediapipe as mp

class FaceShapeAnalyzer:
    def __init__(self):
        """Initialize FaceShapeAnalyzer with MediaPipe Face Mesh"""
        self.mp_face_mesh = mp.solutions.face_mesh
        self.face_mesh = self.mp_face_mesh.FaceMesh(
            static_image_mode=True,
            max_num_faces=1,
            min_detection_confidence=0.5
        )

    def _get_distance(self, point1, point2):
        """Calculate Euclidean distance between two points"""
        return np.sqrt(
            (point2.x - point1.x) ** 2 + 
            (point2.y - point1.y) ** 2
        )

    def analyze_face_shape(self, image_path):
        """Analyze face shape from an image"""
        # Read image
        image = cv2.imread(image_path)
        if image is None:
            raise ValueError("Could not read image")
        
        # Convert to RGB for MediaPipe
        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        height, width = image.shape[:2]
        
        # Detect face landmarks
        results = self.face_mesh.process(image_rgb)
        
        if not results.multi_face_landmarks:
            raise ValueError("No face detected in the image")
        
        landmarks = results.multi_face_landmarks[0].landmark
        
        # Extract key measurements
        forehead_width = self._get_distance(landmarks[71], landmarks[301])
        cheekbone_width = self._get_distance(landmarks[137], landmarks[367])
        jaw_width = self._get_distance(landmarks[172], landmarks[397])
        face_length = self._get_distance(landmarks[152], landmarks[10])
        
        # Calculate key ratios
        length_to_width = face_length / cheekbone_width
        jaw_to_cheek = jaw_width / cheekbone_width
        jaw_to_forehead = jaw_width / forehead_width
        
        # Determine face shape based on ratios and measurements
        face_shape = self._determine_face_shape(
            length_to_width,
            jaw_to_cheek,
            jaw_to_forehead,
            forehead_width,
            cheekbone_width,
            jaw_width
        )
        
        return {
            'face_shape': face_shape,
            'measurements': {
                'forehead_width': float(forehead_width),
                'cheekbone_width': float(cheekbone_width),
                'jaw_width': float(jaw_width),
                'face_length': float(face_length),
                'length_to_width_ratio': float(length_to_width),
                'jaw_to_cheek_ratio': float(jaw_to_cheek),
                'jaw_to_forehead_ratio': float(jaw_to_forehead)
            }
        }

    def _determine_face_shape(self, length_to_width, jaw_to_cheek, jaw_to_forehead,
                          forehead_width, cheekbone_width, jaw_width):
        """Determine face shape based on measurements and ratios"""
        scores = {
            "Round": 0,
            "Oval": 0,
            "Square": 0,
            "Heart": 0,
            "Oblong": 0,
            "Triangle": 0
        }

        # Round Face characteristics
        if 0.9 <= length_to_width <= 1.1:
            scores["Round"] += 1
        if 0.8 <= jaw_to_cheek <= 1.0:
            scores["Round"] += 1
        
        # Oval Face characteristics
        if 1.25 <= length_to_width <= 1.75:
            scores["Oval"] += 1
        if 0.65 <= jaw_to_cheek <= 0.85:
            scores["Oval"] += 1
        if 0.65 <= jaw_to_forehead <= 0.95:
            scores["Oval"] += 1

        # Square Face characteristics
        if 0.9 <= length_to_width <= 1.2:
            scores["Square"] += 1
        if 0.85 <= jaw_to_cheek <= 1.1:
            scores["Square"] += 1
        if 0.85 <= jaw_to_forehead <= 1.1:
            scores["Square"] += 1

        # Heart Face characteristics
        if forehead_width > cheekbone_width:
            scores["Heart"] += 1
        if cheekbone_width > jaw_width:
            scores["Heart"] += 1
        if jaw_to_forehead < 0.8:
            scores["Heart"] += 1

        # Oblong Face characteristics
        if length_to_width > 1.6:
            scores["Oblong"] += 2
        if jaw_to_cheek >= 0.85:
            scores["Oblong"] += 1

        # Triangle Face characteristics
        if jaw_width > cheekbone_width:
            scores["Triangle"] += 1
        if cheekbone_width > forehead_width:
            scores["Triangle"] += 1
        if jaw_to_forehead > 1.2:
            scores["Triangle"] += 1

        # Get the shape with the highest score
        max_score = max(scores.values())
        if max_score >= 2:  # Require at least 2 matching characteristics
            top_shapes = [shape for shape, score in scores.items() if score == max_score]
            return top_shapes[0]  # Return the first shape if there's a tie
        
        # If no clear match with at least 2 characteristics, determine based on primary ratios
        if length_to_width > 1.5:
            return "Oblong"
        elif jaw_width > cheekbone_width and jaw_width > forehead_width:
            return "Triangle"
        elif forehead_width > jaw_width and jaw_to_forehead < 0.8:
            return "Heart"
        elif 0.9 <= length_to_width <= 1.1 and 0.85 <= jaw_to_cheek <= 1.1:
            return "Square"
        elif 0.95 <= length_to_width <= 1.05:
            return "Round"
        else:
            return "Oval"

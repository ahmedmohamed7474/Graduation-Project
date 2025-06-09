import os
import sys
import cv2
import numpy as np
import torch
import torchvision.transforms as transforms
from PIL import Image

class GlassesStyleTransfer:
    def __init__(self):
        # Load face and eye detection cascades
        self.face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
        self.eye_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_eye.xml")
        
        # Set model path relative to this file
        current_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
        self.model_path = os.path.join(current_dir, "83_net_G_A.pth")
        print(f"Looking for model at: {self.model_path}")
        
        # Load the model
        self.netG = self.load_model()

    def load_model(self):
        try:
            # Add the parent directory to sys.path to find test_real_image
            parent_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
            if parent_dir not in sys.path:
                sys.path.append(parent_dir)
                
            from test_real_image import ResnetGenerator
            
            if not os.path.exists(self.model_path):
                raise FileNotFoundError(f"Model file not found at {self.model_path}")
                
            netG = ResnetGenerator()
            
            # Load model with CPU fallback
            try:
                if torch.cuda.is_available():
                    state_dict = torch.load(self.model_path)
                else:
                    state_dict = torch.load(self.model_path, map_location=torch.device("cpu"))
            except RuntimeError as e:
                print(f"Error loading model: {e}")
                state_dict = torch.load(self.model_path, map_location=torch.device("cpu"))
                
            netG.load_state_dict(state_dict)
            netG.eval()
            return netG
            
        except ImportError as e:
            raise ImportError(f"Could not import ResnetGenerator: {e}. Make sure test_real_image.py is in the correct location.")
        except Exception as e:
            raise Exception(f"Error loading model: {e}")

    def detect_face_and_eyes(self, image):
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        faces = self.face_cascade.detectMultiScale(gray, 1.3, 5)
        
        if len(faces) == 0:
            return None, None, None
            
        # Get the first face
        x, y, w, h = faces[0]
        face_roi = gray[y:y+h, x:x+w]
        
        # Detect eyes in the face region
        eyes = self.eye_cascade.detectMultiScale(face_roi)
        if len(eyes) < 2:
            return None, None, None
            
        # Sort eyes by x coordinate to get left and right
        eyes = sorted(eyes, key=lambda e: e[0])
        
        return faces[0], eyes[0], eyes[1]

    def get_eye_region(self, image, face, left_eye, right_eye):
        x, y, w, h = face
        
        # Calculate eye region coordinates
        eye_x = x + left_eye[0]
        eye_y = y + min(left_eye[1], right_eye[1])
        eye_w = (right_eye[0] + right_eye[2]) - left_eye[0]
        eye_h = max(left_eye[3], right_eye[3])
        
        # Add padding
        padding = 20
        eye_y = max(0, eye_y - padding)
        eye_h = min(image.shape[0] - eye_y, eye_h + 2*padding)
        eye_x = max(0, eye_x - padding)
        eye_w = min(image.shape[1] - eye_x, eye_w + 2*padding)
        
        return image[eye_y:eye_y+eye_h, eye_x:eye_x+eye_w], (eye_x, eye_y, eye_w, eye_h)

    def apply_style_transfer(self, image_region):
        # Convert to RGB for processing
        image_rgb = cv2.cvtColor(image_region, cv2.COLOR_BGR2RGB)
        image_pil = Image.fromarray(image_rgb)
        
        # Remember original size
        original_size = image_region.shape[:2][::-1]  # width, height
        
        # Apply transformations
        transform = transforms.Compose([
            transforms.Resize(256),
            transforms.ToTensor(),
            transforms.Normalize((0.5, 0.5, 0.5), (0.5, 0.5, 0.5))
        ])
        
        image_tensor = transform(image_pil).unsqueeze(0)
        
        # Generate styled image
        with torch.no_grad():
            output = self.netG(image_tensor)
        
        # Convert back to image
        output = output.squeeze().cpu().float().numpy()
        output = (np.transpose(output, (1, 2, 0)) + 1) / 2.0 * 255.0
        output = output.astype(np.uint8)
        
        # Convert back to BGR and resize to original size
        output = cv2.cvtColor(output, cv2.COLOR_RGB2BGR)
        output = cv2.resize(output, original_size)
        
        return output

    def overlay_glasses_with_style(self, image, glasses_path):
        # Detect face and eyes
        face, left_eye, right_eye = self.detect_face_and_eyes(image)
        if face is None:
            print("No face or eyes detected")
            return None, False
            
        # Get eye region
        eye_region, (ex, ey, ew, eh) = self.get_eye_region(image, face, left_eye, right_eye)
        
        # Load glasses image
        glasses_img = cv2.imread(glasses_path, cv2.IMREAD_UNCHANGED)
        if glasses_img is None:
            print(f"Could not load glasses image: {glasses_path}")
            return None, False
            
        try:
            # Resize glasses to match eye region
            glasses_resized = cv2.resize(glasses_img, (ew, eh))
            
            # Apply style transfer to eye region
            styled_region = self.apply_style_transfer(eye_region)
            
            # Create mask from glasses
            # Ensure glasses_resized is in the correct format
            if len(glasses_resized.shape) == 3 and glasses_resized.shape[2] == 4:  # If glasses image has alpha channel
                alpha = glasses_resized[:, :, 3] / 255.0
                glasses_rgb = glasses_resized[:, :, :3]
            else:
                alpha = np.ones((eh, ew))
                glasses_rgb = glasses_resized if len(glasses_resized.shape) == 3 else cv2.cvtColor(glasses_resized, cv2.COLOR_GRAY2BGR)
            
            # Create 3-channel alpha mask
            alpha_3channel = np.stack([alpha] * 3, axis=2)
            
            # Blend the images using the alpha mask
            blended = cv2.addWeighted(styled_region, 0.7, glasses_rgb, 0.3, 0)
            result = image.copy()
            
            # Apply the blended region only where the glasses should be (using alpha mask)
            result[ey:ey+eh, ex:ex+ew] = alpha_3channel * blended + (1 - alpha_3channel) * result[ey:ey+eh, ex:ex+ew]
            
            return result, True
            
        except Exception as e:
            print(f"Error in overlay process: {str(e)}")
            return None, False

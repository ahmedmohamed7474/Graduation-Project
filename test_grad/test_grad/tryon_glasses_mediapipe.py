import cv2
import mediapipe as mp
import numpy as np
import os

def overlay_glasses(image_path, glasses_path, output_path):
    # Initialize MediaPipe Face Mesh
    mp_face_mesh = mp.solutions.face_mesh
    face_mesh = mp_face_mesh.FaceMesh(
        static_image_mode=True,
        max_num_faces=1,
        min_detection_confidence=0.5
    )

    # Read the input image and glasses image
    image = cv2.imread(image_path)
    if image is None:
        raise ValueError(f"Could not read image from {image_path}")
    
    # Convert BGR to RGB for MediaPipe
    rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    
    # Get face landmarks
    results = face_mesh.process(rgb_image)
    
    if not results.multi_face_landmarks:
        raise ValueError("No face detected in the image")
    
    # Get left and right eye landmarks (33 is right eye, 263 is left eye)
    face_landmarks = results.multi_face_landmarks[0]
    right_eye = face_landmarks.landmark[33]
    left_eye = face_landmarks.landmark[263]
    
    # Get image dimensions
    img_height, img_width = image.shape[:2]
    
    # Convert normalized coordinates to pixel coordinates
    right_eye_px = (int(right_eye.x * img_width), int(right_eye.y * img_height))
    left_eye_px = (int(left_eye.x * img_width), int(left_eye.y * img_height))
    
    # Calculate eye distance for glasses sizing
    eye_distance = np.sqrt(
        (left_eye_px[0] - right_eye_px[0])**2 + 
        (left_eye_px[1] - right_eye_px[1])**2
    )
    
    # Read glasses image with alpha channel
    glasses = cv2.imread(glasses_path, cv2.IMREAD_UNCHANGED)
    if glasses is None:
        raise ValueError(f"Could not read glasses image from {glasses_path}")
    
    # Calculate angle between eyes for rotation
    angle_rad = np.arctan2(
        left_eye_px[1] - right_eye_px[1],
        left_eye_px[0] - right_eye_px[0]
    )
    angle_deg = np.degrees(angle_rad)
    
    # Calculate desired width of glasses (1.5x eye distance for better fit)
    desired_width = int(eye_distance * 1.5)
    aspect_ratio = glasses.shape[1] / glasses.shape[0]
    desired_height = int(desired_width / aspect_ratio)
    
    # Resize glasses
    glasses_resized = cv2.resize(glasses, (desired_width, desired_height))
    
    # Rotate glasses
    center = (desired_width // 2, desired_height // 2)
    rotation_matrix = cv2.getRotationMatrix2D(center, angle_deg, 1.0)
    glasses_rotated = cv2.warpAffine(glasses_resized, rotation_matrix, 
                                   (desired_width, desired_height))
    
    # Calculate position to place glasses
    center_x = (left_eye_px[0] + right_eye_px[0]) // 2
    center_y = (left_eye_px[1] + right_eye_px[1]) // 2
    
    # Calculate top-left corner for overlay
    x_offset = int(center_x - desired_width // 2)
    y_offset = int(center_y - desired_height // 2)
    
    # Create overlay
    for y in range(glasses_rotated.shape[0]):
        for x in range(glasses_rotated.shape[1]):
            if (y_offset + y < 0 or y_offset + y >= img_height or 
                x_offset + x < 0 or x_offset + x >= img_width):
                continue
                
            # Get the alpha value from the glasses image
            alpha = glasses_rotated[y, x, 3] / 255.0 if glasses_rotated.shape[2] == 4 else 1.0
            
            if alpha > 0:  # Only process pixels that aren't fully transparent
                # Get the RGB values from the glasses
                overlay_color = glasses_rotated[y, x, :3]
                
                # Get the original image color at this position
                original_color = image[y_offset + y, x_offset + x]
                
                # Blend the colors based on alpha
                blended_color = (1 - alpha) * original_color + alpha * overlay_color
                
                # Update the pixel in the original image
                image[y_offset + y, x_offset + x] = blended_color
    
    # Save the result
    output_dir = os.path.dirname(output_path)
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    
    cv2.imwrite(output_path, image)
    return output_path

def main(image_path, glasses_path, output_dir):
    """
    Main function to process the virtual try-on
    """
    # Generate output path
    image_name = os.path.splitext(os.path.basename(image_path))[0]
    output_path = os.path.join(output_dir, f"{image_name}_with_glasses.png")
    
    try:
        result_path = overlay_glasses(image_path, glasses_path, output_path)
        print(f"Successfully processed image. Result saved at: {result_path}")
        return result_path
    except Exception as e:
        print(f"Error processing image: {str(e)}")
        raise

if __name__ == "__main__":
    import sys
    if len(sys.argv) != 4:
        print("Usage: python tryon_glasses_mediapipe.py <image_path> <glasses_path> <output_dir>")
        sys.exit(1)
    
    main(sys.argv[1], sys.argv[2], sys.argv[3])

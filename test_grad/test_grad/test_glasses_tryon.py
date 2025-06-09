import requests
import json
import os

def test_glasses_tryon():
    # API endpoint
    url = 'http://localhost:3000/api/try-on-glasses'
    
    # Test image path - replace with your test image
    test_image_path = 'd:/projects/gradproj/test_grad/test_grad/test_images/test_face.jpg'
    
    # Prepare the files and data
    files = {
        'image': ('test_face.jpg', open(test_image_path, 'rb'), 'image/jpeg')
    }
    data = {
        'glassesId': 'test_glasses'  # This corresponds to test_glasses.png in glasses_images directory
    }
    
    try:
        # Make the request
        response = requests.post(url, files=files, data=data)
        
        # Check if request was successful
        if response.status_code == 200:
            # Save the response image
            output_path = 'd:/projects/gradproj/test_grad/test_grad/results/test_output.png'
            with open(output_path, 'wb') as f:
                f.write(response.content)
            print(f'Success! Output saved to: {output_path}')
        else:
            print('Error:', response.status_code)
            print('Response:', response.text)
            
    except Exception as e:
        print('Exception occurred:', str(e))

if __name__ == '__main__':
    test_glasses_tryon()

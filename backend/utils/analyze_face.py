import sys
import json
from face_analyzer import FaceShapeAnalyzer

def main():
    """Main function to analyze face shape from an image"""
    if len(sys.argv) != 2:
        print(json.dumps({
            'error': 'Invalid arguments. Usage: analyze_face.py <image_path>'
        }))
        sys.exit(1)

    image_path = sys.argv[1]
    
    try:
        analyzer = FaceShapeAnalyzer()
        result = analyzer.analyze_face_shape(image_path)
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({
            'error': 'Analysis failed',
            'details': str(e)
        }))
        sys.exit(1)

if __name__ == '__main__':
    main()

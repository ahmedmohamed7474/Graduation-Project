# Virtual Glasses Try-On API

This FastAPI application provides an API for trying on virtual glasses using computer vision and deep learning models.

## Setup

1. Make sure you have Python 3.8+ installed
2. Install the required dependencies:
```bash
pip install -r requirements.txt
```

## Running the Application

1. Start the FastAPI server:
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

2. Access the API documentation at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Testing the API

You can test the API using curl:

```bash
curl -X POST "http://localhost:8000/process-image/" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@path/to/your/image.jpg"
```

Or using Python requests:

```python
import requests

url = "http://localhost:8000/process-image/"
files = {"file": open("path/to/your/image.jpg", "rb")}
response = requests.post(url, files=files)

# Save the response image
with open("result.png", "wb") as f:
    f.write(response.content)
```

## Using with React Frontend

The API includes CORS configuration to work with your React frontend. Configure your React application to send requests to `http://localhost:8000`.

Example React code:
```javascript
async function tryOnGlasses(imageFile) {
  const formData = new FormData();
  formData.append('file', imageFile);

  const response = await fetch('http://localhost:8000/process-image/', {
    method: 'POST',
    body: formData,
  });

  if (response.ok) {
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  }
  throw new Error('Failed to process image');
}
```

## Exposing the API Using ngrok

To make your API accessible from the internet (useful for testing with mobile devices or sharing with others):

1. Install ngrok from https://ngrok.com/
2. Run ngrok to expose your local server:
```bash
ngrok http 8000
```
3. Use the generated ngrok URL to access your API

Note: The ngrok URL will change each time you restart ngrok unless you have a paid account.

## Project Structure

```
app/
├── main.py           # FastAPI application
├── assets/          # Store glasses overlay images
├── models/
│   └── model_loader.py  # PyTorch model loading
├── utils/
│   ├── face_detector.py    # Face and eye detection
│   └── glasses_processor.py # Glasses overlay processing
```

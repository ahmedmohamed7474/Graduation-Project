# filepath: e:\Grad1\app\main.py
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import cv2
import numpy as np
import io
from pathlib import Path
from .models.model_loader import ModelLoader

app = FastAPI(
    title="Virtual Glasses API",
    description="API for adding virtual glasses to facial images",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins in development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize model loader
model_loader = ModelLoader()

@app.on_event("startup")
async def startup_event():
    """Load models on startup"""
    success = await model_loader.load_models()
    if not success:
        print("Failed to load models during startup!")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "models_loaded": model_loader.models_loaded
    }

@app.post("/process-image/")
async def process_image(file: UploadFile = File(...)):
    """
    Process an uploaded image using the trained GAN models
    """
    try:
        print(f"Processing file: {file.filename}")
        
        # Read the image file
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            raise HTTPException(
                status_code=400,
                detail="Invalid image file"
            )
            
        # Process the image
        result_img = model_loader.process_image(img)
        
        # Convert the result image to bytes
        _, encoded_img = cv2.imencode('.png', result_img)
        io_buf = io.BytesIO(encoded_img.tobytes())
        
        return StreamingResponse(
            io_buf, 
            media_type="image/png",
            headers={
                "Content-Disposition": f"attachment; filename=result_{file.filename}",
                "Access-Control-Expose-Headers": "Content-Disposition"
            }
        )
        
    except Exception as e:
        print(f"Error processing image: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)

import React, { useState } from 'react';

const glassesRecommendations = {
  round: {
    shape: "Round Face",
    description: "Your face has similar length and width with soft curves.",
    recommendations: [
      "Rectangle frames",
      "Square frames",
      "Angular frames",
      "Wayfarer style"
    ]
  },
  oval: {
    shape: "Oval Face",
    description: "Your face is longer than it is wide with balanced proportions.",
    recommendations: [
      "Almost any frame style",
      "Geometric shapes",
      "Wayfarer style",
      "Aviator style"
    ]
  },
  square: {
    shape: "Square Face",
    description: "Your face has strong angles and similar length and width.",
    recommendations: [
      "Round frames",
      "Oval frames",
      "Thin frames",
      "Semi-rimless styles"
    ]
  },
  heart: {
    shape: "Heart Face",
    description: "Your face is wider at the forehead and narrower at the chin.",
    recommendations: [
      "Bottom-heavy frames",
      "Oval frames",
      "Light-colored frames",
      "Round frames"
    ]
  },
  oblong: {
    shape: "Oblong Face",
    description: "Your face is longer than it is wide with straight cheek lines.",
    recommendations: [
      "Wide frames",
      "Decorative temples",
      "Round frames",
      "Deep frames"
    ]
  },
  triangle: {
    shape: "Triangle Face",
    description: "Your face is narrow at the forehead and wider at the jawline.",
    recommendations: [
      "Cat-eye frames",
      "Top-heavy frames",
      "Semi-rimless styles",
      "Colorful frames"
    ]
  }
};

const FaceShapeAnalyzer = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [faceShape, setFaceShape] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [measurements, setMeasurements] = useState(null);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setError(null);
      setFaceShape(null);
      setMeasurements(null);
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setError('Please select an image first');
      return;
    }

    setIsProcessing(true);
    setError(null);

    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      const response = await fetch('http://localhost:3002/api/face-analysis/analyze', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Analysis failed');
      }

      setFaceShape(data.face_shape.toLowerCase());
      setMeasurements(data.measurements);
    } catch (err) {
      setError(err.message || 'Error analyzing face shape. Please try again.');
      console.error('Analysis error:', err);
    } finally {
      setIsProcessing(false);    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
        Face Shape Analysis
      </h2>

      <div className="mb-6">
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
        />
      </div>

      {previewUrl && (
        <div className="mb-6">
          <img
            src={previewUrl}
            alt="Uploaded face"
            className="max-w-full h-auto rounded-lg"
          />
        </div>
      )}

      {previewUrl && !isProcessing && !error && !faceShape && (
        <div className="mb-6">
          <button
            onClick={handleAnalyze}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Analyze Face Shape
          </button>
        </div>
      )}

      {isProcessing && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Analyzing face shape...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {faceShape && glassesRecommendations[faceShape] && (
        <div className="bg-blue-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-2 text-blue-900">
            {glassesRecommendations[faceShape].shape}
          </h3>
          <p className="text-blue-800 mb-4">
            {glassesRecommendations[faceShape].description}
          </p>
          <div>
            <h4 className="font-semibold text-blue-900 mb-2">
              Recommended Frames:
            </h4>
            <ul className="list-disc list-inside text-blue-800">
              {glassesRecommendations[faceShape].recommendations.map((rec, index) => (
                <li key={index}>{rec}</li>
              ))}
            </ul>
          </div>
          {measurements && (
            <div className="mt-4 pt-4 border-t border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">
                Face Measurements:
              </h4>
              <ul className="text-blue-800">
                {Object.entries(measurements).map(([key, value], index) => (
                  <li key={index}>
                    {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}: {value.toFixed(2)}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FaceShapeAnalyzer;

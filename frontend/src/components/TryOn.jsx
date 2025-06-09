import React, { useState } from 'react';
import PropTypes from 'prop-types';

const TryOn = ({ productId, product }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [processedImage, setProcessedImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [tryOnMode, setTryOnMode] = useState('random'); // 'random' or 'glasses'

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
        setProcessedImage(null);
        setError(null);
    };    const handleSubmit = async () => {
        if (!selectedFile) {
            setError('Please select an image first');
            return;
        }

        if (!product?.images?.[0]?.imageUrl) {
            setError('Product image not available');
            return;
        }

        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('image', selectedFile);
        // Get the image path based on the try-on mode
        if (tryOnMode === 'glasses') {
            // Extract the image filename from the URL
            const glassesImageUrl = product.images[0].imageUrl;
            // We only need the filename part as the backend will look in the uploads folder
            const imageName = glassesImageUrl.split('/').pop();
            // Ensure we have a valid image name
            if (!imageName) {
                throw new Error('Invalid glasses image URL');
            }
            // Send both the glasses image name and path information
            formData.append('glassesImage', imageName);
            formData.append('glassesPath', `/uploads/${imageName}`);
            formData.append('glassesImageUrl', glassesImageUrl);
            formData.append('productId', product.id.toString());
        } else {
            formData.append('productImage', product.images[0].imageUrl);
        }

        try {
            const endpoint = tryOnMode === 'glasses' ? 'try-on-glasses' : 'try-on';
            const response = await fetch(`http://localhost:3002/api/tryon/${endpoint}`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || errorData.message || 'Failed to process image');
            }

            // Check content type to handle both JSON errors and image responses
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                const errorData = await response.json();
                throw new Error(errorData.error || errorData.message);
            }

            // The response should be the processed image
            const blob = await response.blob();
            const imageUrl = URL.createObjectURL(blob);
            setProcessedImage(imageUrl);
        } catch (err) {
            setError(err.message);
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4">            <div className="mb-4 space-y-4">
                <div className="flex justify-center space-x-4">
                    <button
                        onClick={() => setTryOnMode('random')}
                        className={`px-4 py-2 rounded-md ${
                            tryOnMode === 'random'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-700'
                        }`}
                    >
                        Random Style
                    </button>
                    <button
                        onClick={() => setTryOnMode('glasses')}
                        className={`px-4 py-2 rounded-md ${
                            tryOnMode === 'glasses'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-700'
                        }`}
                    >
                        Exact Glasses
                    </button>
                </div>

                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100"
                />
            </div>

            <button
                onClick={handleSubmit}
                disabled={!selectedFile || loading}
                className={`w-full py-2 px-4 rounded-md text-white font-medium
                    ${!selectedFile || loading
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700'}`}
            >
                {loading ? 'Processing...' : 'Try On'}
            </button>

            {error && (
                <div className="mt-4 text-red-600">
                    {error}
                </div>
            )}

            {processedImage && (
                <div className="mt-4">
                    <h3 className="text-lg font-semibold mb-2">Result:</h3>
                    <img
                        src={processedImage}
                        alt="Processed"
                        className="max-w-full h-auto rounded-lg shadow-lg"
                    />
                </div>            )}
        </div>
    );
};

TryOn.propTypes = {
    productId: PropTypes.number.isRequired,
    product: PropTypes.shape({
        id: PropTypes.number.isRequired,
        images: PropTypes.arrayOf(
            PropTypes.shape({
                imageUrl: PropTypes.string.isRequired,
            })
        ),
    }).isRequired,
};

export default TryOn;

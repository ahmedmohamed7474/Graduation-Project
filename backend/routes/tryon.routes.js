const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const { spawn } = require('child_process');
const fs = require('fs');

// Ensure the results directory exists
const resultsDir = path.join(__dirname, '../../test_grad/test_grad/results');
if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
}

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../../test_grad/test_grad/test_images');
        // Ensure the upload directory exists
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// Try-on endpoint
router.post('/try-on', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image file uploaded' });
        }

        const inputImage = req.file.filename;
        const pythonScript = path.join(__dirname, '../../test_grad/test_grad/test_real_image.py');
        const inputPath = path.join(__dirname, '../../test_grad/test_grad/test_images', inputImage);
        const outputDir = path.join(__dirname, '../../test_grad/test_grad/results');        // Run the Python script
        console.log('Running Python script:', {
            script: pythonScript,
            input: inputPath,
            output: outputDir
        });

        const pythonProcess = spawn('python', [
            pythonScript,
            inputPath,
            outputDir
        ]);

        let errorOutput = '';

        pythonProcess.stderr.on('data', (data) => {
            errorOutput += data.toString();
        });

        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                return res.status(500).json({ 
                    message: 'Error processing image',
                    error: errorOutput
                });
            }

            // Get the output image path
            const outputImage = path.join(outputDir, `${path.parse(inputImage).name}_fake.png`);
            
            // Send the processed image
            res.sendFile(outputImage, (err) => {
                if (err) {
                    res.status(500).json({ 
                        message: 'Error sending processed image',
                        error: err.message
                    });
                }
            });
        });

    } catch (error) {
        res.status(500).json({ 
            message: 'Error processing try-on request',
            error: error.message
        });
    }
});

module.exports = router;

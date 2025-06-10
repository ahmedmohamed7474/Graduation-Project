const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, uniqueSuffix + path.extname(file.originalname))
    }
});

const upload = multer({ storage: storage });

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

router.post('/analyze', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file uploaded' });
        }

        const imagePath = path.join(__dirname, '..', req.file.path);
        
        // Create a Python process to analyze the face
        const python = spawn('python', [
            path.join(__dirname, '..', 'utils', 'analyze_face.py'),
            imagePath
        ]);

        let result = '';
        let error = '';

        python.stdout.on('data', (data) => {
            result += data.toString();
        });

        python.stderr.on('data', (data) => {
            error += data.toString();
        });        python.on('close', (code) => {
            // Clean up the uploaded file
            fs.unlink(imagePath, (err) => {
                if (err) console.error('Error deleting file:', err);
            });

            if (code !== 0) {
                console.error('Python script error:', error);
                return res.status(500).json({ 
                    error: 'Face analysis failed', 
                    details: error.trim() 
                });
            }

            if (!result) {
                return res.status(500).json({ 
                    error: 'No analysis result', 
                    details: 'The analysis script did not return any data' 
                });
            }

            try {
                const analysis = JSON.parse(result);
                if (!analysis.face_shape) {
                    throw new Error('Invalid analysis result: missing face shape');
                }
                res.json(analysis);
            } catch (e) {
                console.error('Analysis parsing error:', e, 'Result:', result);
                res.status(500).json({ 
                    error: 'Invalid analysis result', 
                    details: e.message 
                });
            }
        });

    } catch (error) {
        res.status(500).json({ 
            error: 'Server error', 
            details: error.message 
        });
    }
});

module.exports = router;

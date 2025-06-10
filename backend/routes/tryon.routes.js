const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const { spawn } = require('child_process');
const fs = require('fs');

// Helper function to copy file
const copyFile = async (src, dest) => {
    return new Promise((resolve, reject) => {
        fs.copyFile(src, dest, (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
};

// Ensure required directories exist
const ensureDirectories = () => {
    const baseDir = path.join(__dirname, '../../test_grad/test_grad');
    const dirs = [
        path.join(baseDir, 'test_images'),
        path.join(baseDir, 'results'),
        path.join(baseDir, 'glasses_images')
    ];
    
    dirs.forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    });
};

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

// Helper function to run Python scripts
const runPythonScript = async (scriptPath, ...args) => {
    return new Promise((resolve, reject) => {
        if (!fs.existsSync(scriptPath)) {
            reject(new Error(`Python script not found: ${scriptPath}`));
            return;
        }

        console.log('Running Python script:', { scriptPath, args });
        const pythonProcess = spawn('python', [scriptPath, ...args]);
        let errorOutput = '';
        let stdoutOutput = '';

        pythonProcess.stderr.on('data', (data) => {
            const error = data.toString();
            console.error('Python error:', error);
            errorOutput += error;
        });

        pythonProcess.stdout.on('data', (data) => {
            const output = data.toString();
            console.log('Python output:', output);
            stdoutOutput += output;
        });

        pythonProcess.on('close', (code) => {
            console.log('Python process exited with code:', code);
            if (code !== 0) {
                reject(new Error(errorOutput || 'Python script failed'));
            } else {
                resolve();
            }
        });
    });
};

// Try-on endpoint (regular CycleGAN)
router.post('/try-on', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image file uploaded' });
        }

        const inputImage = req.file.filename;
        const baseDir = path.join(__dirname, '../../test_grad/test_grad');
        const scriptPath = path.join(baseDir, 'test_real_image.py');
        const inputPath = path.join(baseDir, 'test_images', inputImage);
        const outputDir = path.join(baseDir, 'results');

        console.log('Running style transfer:', { inputPath, outputDir });
        
        await runPythonScript(scriptPath, inputPath, outputDir);
        
        // Get the output image path
        const outputImage = path.join(outputDir, `${path.parse(inputImage).name}_fake.png`);
        
        if (!fs.existsSync(outputImage)) {
            throw new Error('Output image was not generated');
        }
        
        // Send the processed image
        res.sendFile(outputImage, (err) => {
            if (err) {
                res.status(500).json({ 
                    message: 'Error sending processed image',
                    error: err.message
                });
            }
        });

    } catch (error) {
        console.error('Error in try-on:', error);
        res.status(500).json({ 
            message: 'Error processing try-on request',
            error: error.message
        });
    }
});

// Glasses try-on endpoint (uses CycleGAN model for style transfer)
router.post('/try-on-glasses', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image file uploaded' });
        }
        
        if (!req.body.glassesImage) {
            return res.status(400).json({ message: 'No glasses image specified' });
        }

        // Ensure directories exist
        ensureDirectories();
        
        const inputImage = req.file.filename;
        const baseDir = path.join(__dirname, '../../test_grad/test_grad');
        const testImagesDir = path.join(baseDir, 'test_images');
        const inputPath = path.join(testImagesDir, inputImage);
        const outputDir = path.join(baseDir, 'results');        // First apply the glasses at a fixed position for CycleGAN input
        const fixedGlassesScript = path.join(baseDir, 'apply_fixed_glasses.py');
        const backendDir = path.join(__dirname, '..');
        const glassesSourcePath = path.join(backendDir, 'uploads', req.body.glassesImage);
        const glassesDestPath = path.join(baseDir, 'glasses_images', req.body.glassesImage);
        
        // Parameters for fixed glasses positioning
        const scale = 1.0;
        const yOffset = 0.42;
        const width = 0.8;

        // Copy glasses image to the correct location
        try {
            await copyFile(glassesSourcePath, glassesDestPath);
        } catch (err) {
            console.error('Error copying glasses file:', err);
            throw new Error('Could not access glasses image');
        }        // First run: Apply fixed glasses
        console.log('Applying fixed glasses:', { 
            script: fixedGlassesScript,
            input: inputPath,
            glasses: glassesDestPath,
            output: outputDir,
            params: { scale, yOffset, width }
        });
        
        try {
            await runPythonScript(
                fixedGlassesScript, 
                inputPath, 
                glassesDestPath, 
                outputDir,
                scale.toString(),
                yOffset.toString(),
                width.toString()
            );
        } catch (err) {
            console.error('Error in fixed glasses step:', err);
            throw new Error(`Fixed glasses error: ${err.message}`);
        }
        
        // Get the intermediate output path (input for CycleGAN)
        const intermediatePath = path.join(outputDir, `${path.parse(inputImage).name}_with_glasses_input.png`);
        
        // Second run: Apply style transfer with CycleGAN
        const cycleGANScript = path.join(baseDir, 'tryon_glasses.py');
        console.log('Running style transfer:', {
            script: cycleGANScript,
            input: intermediatePath,
            output: outputDir
        });
        
        await runPythonScript(cycleGANScript, intermediatePath, outputDir);
        
        // Get the output image path from tryon_glasses.py output
        const outputImage = path.join(outputDir, `${path.parse(inputImage).name}_with_glasses.png`);
        console.log('Looking for output image at:', outputImage);
        
        if (!fs.existsSync(outputImage)) {
            throw new Error('Output image was not generated');
        }
        
        // Send the processed image
        res.sendFile(outputImage, (err) => {
            if (err) {
                console.error('Error sending file:', err);
                res.status(500).json({ 
                    message: 'Error sending processed image',
                    error: err.message
                });
            }
        });

    } catch (error) {
        console.error('Error in try-on-glasses:', error);
        res.status(500).json({ 
            message: 'Error processing try-on request',
            error: error.message
        });
    }
});

module.exports = router;

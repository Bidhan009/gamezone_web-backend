import { Router } from 'express';
import { uploads } from '../middleware/upload.middleware';
import { authenticateToken } from '../middleware/auth.middleware';
import { UserController } from '../controllers/auth.controller';

const router = Router();
const userController = new UserController();

// Example: Uploading a profile picture
router.post(
  '/profile/upload',
  authenticateToken,           // 1. Check if user is logged in
  uploads.single('avatar'),    // 2. Look for a file in the 'avatar' field
  (req, res) => {
    // If successful, the file info is available in req.file
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    // In Clean Architecture, you would pass req.file.path to your Use Case
    res.status(200).json({
      message: 'File uploaded successfully!',
      filePath: req.file.path 
    });
  }
);

export { uploads };

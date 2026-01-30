import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { UserService } from '../services/user.service';
import { AuthRequest } from '../middleware/auth.middleware';

const userService = new UserService();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/profiles';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

export class ProfileController {
  // Upload profile image
  async uploadProfileImage(req: AuthRequest, res: Response) {
    try {
      const uploadSingle = upload.single('profileImage');
      
      uploadSingle(req, res, async (err: any) => {
        if (err) {
          return res.status(400).json({
            success: false,
            message: err.message || 'Error uploading file'
          });
        }

        if (!req.file) {
          return res.status(400).json({
            success: false,
            message: 'No file uploaded'
          });
        }

        // Get user ID from authenticated request (you'll need to implement auth middleware)
        const userId = (req as any).user?.id;
        if (!userId) {
          return res.status(401).json({
            success: false,
            message: 'User not authenticated'
          });
        }

        // Update user's profile image in database
        const imageUrl = `/uploads/profiles/${req.file.filename}`;
        const updatedUser = await userService.updateProfileImage(userId, imageUrl);

        res.status(200).json({
          success: true,
          message: 'Profile image uploaded successfully',
          data: {
            profileImage: imageUrl,
            user: updatedUser
          }
        });
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Internal server error'
      });
    }
  }

  // Get user profile
  async getProfile(req: AuthRequest, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      const user = await userService.getUserById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.status(200).json({
        success: true,
        data: user
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Internal server error'
      });
    }
  }

  // Update user profile
  async updateProfile(req: AuthRequest, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      const { fullName, email } = req.body;
      const updatedUser = await userService.updateUserProfile(userId, { fullName, email });

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: updatedUser
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Internal server error'
      });
    }
  }
}

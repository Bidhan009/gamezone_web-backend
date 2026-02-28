import { UserService } from "../services/user.service";
import { CreateUserDTO, LoginUserDTO, UpdateUserDTO } from "../dtos/user.dto";
import { Request, Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import z from "zod";

// In Clean Architecture, consider injecting this via the constructor later
const userService = new UserService();

export class AuthController {
    
    // Use arrow functions to prevent "this" binding issues in Express routes
    register = async (req: Request, res: Response) => {
        try {
            const parsedData = CreateUserDTO.safeParse(req.body);
            if (!parsedData.success) {
                return res.status(400).json({ 
                    success: false, 
                    message: z.prettifyError(parsedData.error) 
                });
            }

            const newUser = await userService.createUser(parsedData.data);
            return res.status(201).json({ 
                success: true, 
                message: "User Created", 
                data: newUser 
            });
        } catch (error: any) {
            return res.status(error.statusCode ?? 500).json({ 
                success: false, 
                message: error.message || "Internal Server Error" 
            });
        }
    };

    login = async (req: Request, res: Response) => {
        try {
            const parsedData = LoginUserDTO.safeParse(req.body);
            if (!parsedData.success) {
                return res.status(400).json({ 
                    success: false, 
                    message: z.prettifyError(parsedData.error) 
                });
            }

            const { token, user } = await userService.loginUser(parsedData.data);
            return res.status(200).json({ 
                success: true, 
                message: "Login successful", 
                data: user, 
                token 
            });
        } catch (error: any) {
            return res.status(error.statusCode ?? 500).json({ 
                success: false, 
                message: error.message || "Internal Server Error" 
            });
        }
    };

    logout = async (req: Request, res: Response) => {
        try {
            res.status(200).json({
                success: true,
                message: "Logout successful"
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    };

    getProfile = async (req: AuthRequest, res: Response) => {
        try {
            const userId = req.user?._id;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: "User not authenticated"
                });
            }

            const user = await userService.getUserById(userId);
            return res.status(200).json({
                success: true,
                data: user
            });
        } catch (error: any) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    };

    updateProfile = async (req: AuthRequest, res: Response) => {
        try {
            const userId = req.user?._id;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: "User not authenticated"
                });
            }

            const parsedData = UpdateUserDTO.safeParse(req.body);
            if (!parsedData.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(parsedData.error)
                });
            }

            const updateData = parsedData.data;
            
            // Handle profile picture from Multer
            if (req.file) {
                // store relative path so frontend can prefix API base URL later
                updateData.profileImage = `/uploads/${req.file.filename}`;
            }

            const updatedUser = await userService.updateUser(userId, updateData);
            return res.status(200).json({
                success: true,
                message: "Profile updated successfully",
                data: updatedUser
            });
        } catch (error: any) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    };
}
import { UserService } from "../services/user.service";
import { CreateUserDTO, LoginUserDTO, UpdateUserDTO } from "../dtos/user.dto";
import { Request, Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import z from "zod";
import { blacklistToken } from "../utils/token-blacklist";
import { logSecurityEvent } from "../utils/logger";

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
            logSecurityEvent("USER_REGISTERED", {
                userId: newUser._id,
                email: newUser.email,
                ip: req.ip
            });
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
            logSecurityEvent("LOGIN_SUCCESS", {
                userId: user._id,
                email: user.email,
                ip: req.ip
            });
            return res.status(200).json({ 
                success: true, 
                message: "Login successful", 
                data: user, 
                token 
            });
        } catch (error: any) {
            logSecurityEvent("LOGIN_FAILED", {
                attemptedEmail: req.body?.email,
                ip: req.ip,
                reason: error.message
            });
            return res.status(error.statusCode ?? 500).json({ 
                success: false, 
                message: error.message || "Internal Server Error" 
            });
        }
    };

    logout = async (req: Request, res: Response) => {
        try {
            const authHeader = req.headers.authorization;
            const token = authHeader?.split(" ")[1];
            if (token) {
                blacklistToken(token);
            }
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
    setupMfa = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            return res.status(401).json({ success: false, message: "User not authenticated" });
        }
        const result = await userService.generateMfaSecret(userId);
        return res.status(200).json({ success: true, data: result });
    } catch (error: any) {
        return res.status(error.statusCode ?? 500).json({
            success: false,
            message: error.message || "Internal Server Error"
        });
    }
};

confirmMfa = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            return res.status(401).json({ success: false, message: "User not authenticated" });
        }
        const { token } = req.body;
        if (!token) {
            return res.status(400).json({ success: false, message: "MFA code required" });
        }
        const result = await userService.verifyAndEnableMfa(userId, token);
        return res.status(200).json({ success: true, message: result.message });
    } catch (error: any) {
        return res.status(error.statusCode ?? 500).json({
            success: false,
            message: error.message || "Internal Server Error"
        });
    }
};
}
import { Request, Response } from "express";
import { UserService } from "../services/user.service";
import { CreateUserDTO, UpdateUserDTO } from "../dtos/user.dto";
import { AuthRequest } from "../middleware/auth.middleware";
import z from "zod";

const userService = new UserService();

export class UserController {

    async getAllUsers(req: Request, res: Response) {
        try {
            const users = await userService.getAllUsers();
            return res.status(200).json({ success: true, data: users });
        } catch (error: any) {
            return res.status(error.statusCode || 500).json({ 
                success: false, 
                message: error.message || "Failed to get users" 
            });
        }
    }

    async getUserById(req: Request, res: Response) {
        try {
            const user = await userService.getUserById(req.params.id);
            return res.status(200).json({ success: true, data: user });
        } catch (error: any) {
            return res.status(error.statusCode || 500).json({ 
                success: false, 
                message: error.message || "Failed to get user" 
            });
        }
    }

    async updateUser(req: AuthRequest, res: Response) {
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

            const updateData: any = { ...parsedData.data };
            if (req.file) {
                updateData.profileImage = `/uploads/${req.file.filename}`;
            }

            const updatedUser = await userService.updateUser(userId, updateData);
            return res.status(200).json({
                success: true,
                message: "User updated successfully",
                data: updatedUser
            });
        } catch (error: any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Failed to update user"
            });
        }
    }

    async deleteUser(req: AuthRequest, res: Response) {
        try {
            const userId = req.user?._id;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: "User not authenticated"
                });
            }

            const result = await userService.deleteUser(userId);
            return res.status(200).json({
                success: true,
                message: result.message
            });
        } catch (error: any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Failed to delete user"
            });
        }
    }
}

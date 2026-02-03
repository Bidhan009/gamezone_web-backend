import { UserService } from "../services/user.service";

import { CreateUserDTO, LoginUserDTO } from "../dtos/user.dto";

import { Request, Response } from "express";

import z from "zod";
import { UserModel } from "../models/user.model";

let userService = new UserService();

export class AuthController {

    async register(req: Request, res: Response) {

        try {

            const parsedData = CreateUserDTO.safeParse(req.body); // validate request body

            if (!parsedData.success) { // validation failed

                return res.status(400).json(

                    { success: false, message: z.prettifyError(parsedData.error) }

                )

            }

            const userData: CreateUserDTO = parsedData.data;

            const newUser = await userService.createUser(userData);

            return res.status(201).json(

                { success: true, message: "User Created", data: newUser }

            );

        } catch (error: Error | any) { // exception handling

            return res.status(error.statusCode ?? 500).json(

                { success: false, message: error.message || "Internal Server Error" }

            );

        }

    }



    async login(req: Request, res: Response) {

        try {

            const parsedData = LoginUserDTO.safeParse(req.body);

            if (!parsedData.success) {

                return res.status(400).json(

                    { success: false, message: z.prettifyError(parsedData.error) }

                )

            }

            const loginData: LoginUserDTO = parsedData.data;

            const { token, user } = await userService.loginUser(loginData);

            return res.status(200).json(

                { success: true, message: "Login successful", data: user, token }

            );



        } catch (error: Error | any) {

            return res.status(error.statusCode ?? 500).json(

                { success: false, message: error.message || "Internal Server Error" }

            );

        }

    }



    async logout(req: Request, res: Response) {

        try {

            // For JWT-based auth, logout is typically handled client-side

            // by removing the token. Server-side logout could involve token blacklisting

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

    }

    async getProfile(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;

            const user = await UserModel.findById(userId).select("-password");

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found"
                });
            }

            return res.status(200).json({
                success: true,
                data: user
            });

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Server error"
            });
        }
    }

    async updateProfile(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;

            const updatedUser = await UserModel.findByIdAndUpdate(
                userId,
                req.body,
                { new: true }
            ).select("-password");

            return res.status(200).json({
                success: true,
                data: updatedUser
            });

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Server error"
            });
        }
    }
    


    

}
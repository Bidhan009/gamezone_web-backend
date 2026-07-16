import { CreateUserDTO, LoginUserDTO, UpdateUserDTO } from "../dtos/user.dto";
import { UserRepository } from "../repositories/user.repository";
import  bcryptjs from "bcryptjs"
import { HttpError } from "../errors/http-error";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";

let userRepository = new UserRepository();

export class UserService {

    async createUser(data: CreateUserDTO){
    const emailCheck = await userRepository.getUserByEmail(data.email);
    if(emailCheck){
        throw new HttpError(403, "Email already in use");
    }

    const hashedPassword = await bcryptjs.hash(data.password, 10);
    data.password = hashedPassword;

    // Force role to 'user' for all public registrations — role can only be
    // changed via the admin-protected user management endpoints
    const newUser = await userRepository.createUser({
        ...data,
        role: "user"
    });
    return newUser;
}
    async loginUser(data: LoginUserDTO){

        const user =  await userRepository.getUserByEmail(data.email);

        if(!user){
            throw new HttpError(404, "User not found");
        }
        // compare password
        const validPassword = await bcryptjs.compare(data.password, user.password);
        // plaintext, hashed

        if(!validPassword){
            throw new HttpError(401, "Invalid credentials");
        }
        // generate jwt
        const payload = { // user identifier
            id: user._id,
            fullName: user.fullName,
            email: user.email,
            role: user.role
        }
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' }); // 30 days
        return { token, user }
    }

    async getUserById(userId: string) {
        const user = await userRepository.getUserById(userId);
        if (!user) {
            throw new HttpError(404, "User not found");
        }
        return user;
    }

    // async updateUserProfile(fullName: string, email:string, imageUrl: string) {

    //     const updatedUser = await this.updateUser(fullName, email, { profileImage: imageUrl });

    //     if (!updatedUser) {

    //         throw new HttpError(404, "User not found");

    //     }

    //     return updatedUser;

    // }
    async updateUserProfile(userId: string, updateData: { fullName?: string; email?: string }) {
        const updatedUser = await userRepository.updateUser(userId, updateData);
        if (!updatedUser) {
            throw new HttpError(404, "User not found");
        }
        return updatedUser;
    }

    async updateUser(
    userId: string,
    // updateData: {
    //     fullName?: string;
    //     email?: string;
    //     profileImage?: string;
    // }
    updateData: UpdateUserDTO
) {
    const updatedUser = await userRepository.updateUser(userId, updateData);
    if (!updatedUser) {
        throw new HttpError(404, "User not found");
    }
    return updatedUser;
} 
    async getAllUsers() {
    return await userRepository.getAllUsers();
}

async deleteUser(userId: string) {
    const deleted = await userRepository.deleteUser(userId);
    if (!deleted) {
        throw new HttpError(404, "User not found");
    }
    return { message: "User deleted successfully" };
}
}
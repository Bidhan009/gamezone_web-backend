import { CreateUserDTO, LoginUserDTO, UpdateUserDTO } from "../dtos/user.dto";
import { UserRepository } from "../repositories/user.repository";
import  bcryptjs from "bcryptjs"
import { HttpError } from "../errors/http-error";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";
import speakeasy from "speakeasy";
import QRCode from "qrcode";

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
        // If MFA is enabled, don't issue the real token yet —
        // require the second factor first
        if (user.mfaEnabled) {
            const mfaPendingToken = jwt.sign(
                { id: user._id, mfaPending: true },
                JWT_SECRET,
                { expiresIn: '5m' } // short-lived, only valid to complete MFA
            );
            return { mfaRequired: true, mfaPendingToken, user: null, token: null };
        }
        // generate jwt
        const payload = { // user identifier
            id: user._id,
            fullName: user.fullName,
            email: user.email,
            role: user.role
        }
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' }); 
        return { token, user }
    }
    async verifyMfaLogin(mfaPendingToken: string, mfaCode: string) {
    let decoded: any;
    try {
        decoded = jwt.verify(mfaPendingToken, JWT_SECRET);
    } catch {
        throw new HttpError(401, "Invalid or expired MFA session");
    }

    if (!decoded.mfaPending) {
        throw new HttpError(401, "Invalid MFA session");
    }

    const user = await userRepository.getUserByIdWithSecret(decoded.id);
    if (!user || !user.mfaSecret) {
        throw new HttpError(400, "MFA not set up for this user");
    }

    const isValid = speakeasy.totp.verify({
        secret: user.mfaSecret,
        encoding: "base32",
        token: mfaCode,
        window: 1,
    });

    if (!isValid) {
        throw new HttpError(401, "Invalid MFA code");
    }

    const payload = {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role
    };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
    return { token, user };
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
async generateMfaSecret(userId: string) {
    const user = await userRepository.getUserById(userId);
    if (!user) {
        throw new HttpError(404, "User not found");
    }

    const secret = speakeasy.generateSecret({
        name: `GameZone (${user.email})`,
        length: 20,
    });

    // Store the secret temporarily — not yet "enabled" until user confirms
    await userRepository.updateUser(userId, {
        mfaSecret: secret.base32,
    } as any);

    const qrCodeDataUrl = await QRCode.toDataURL(secret.otpauth_url!);

    return { qrCodeDataUrl, manualEntryKey: secret.base32 };
}

async verifyAndEnableMfa(userId: string, token: string) {
    const user = await userRepository.getUserByIdWithSecret(userId);
    if (!user || !user.mfaSecret) {
        throw new HttpError(400, "MFA setup not initiated");
    }

    const isValid = speakeasy.totp.verify({
        secret: user.mfaSecret,
        encoding: "base32",
        token: token,
        window: 1, // allows 30s clock drift tolerance
    });

    if (!isValid) {
        throw new HttpError(400, "Invalid MFA code");
    }

    await userRepository.updateUser(userId, { mfaEnabled: true } as any);
    return { message: "MFA enabled successfully" };
}
}
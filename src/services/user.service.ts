import { CreateUserDTO, LoginUserDTO, UpdateUserDTO, ImportUserDTO } from "../dtos/user.dto";
import { UserRepository } from "../repositories/user.repository";
import  bcryptjs from "bcryptjs"
import { HttpError } from "../errors/http-error";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";
import speakeasy from "speakeasy";
import QRCode from "qrcode";
import { encrypt, decrypt } from "../utils/encryption";

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes
let userRepository = new UserRepository();

export class UserService {

    async createUser(data: CreateUserDTO){
    const emailCheck = await userRepository.getUserByEmail(data.email);
    if(emailCheck){
        throw new HttpError(403, "Email already in use");
    }

    const hashedPassword = await bcryptjs.hash(data.password, 10);
    data.password = hashedPassword;

    // Encrypt phone before storing, if provided
    // role is never client-writable; it is set by the server
    const userToCreate: any = { ...data, role: "user" };
    if (userToCreate.phone) {
        userToCreate.phone = encrypt(userToCreate.phone);
    }

    const newUser = await userRepository.createUser(userToCreate);
    return decryptUserPhone(newUser.toObject ? newUser.toObject() : newUser);
}

async loginUser(data: LoginUserDTO) {
    const user = await userRepository.getUserByEmail(data.email);
    if (!user) {
        throw new HttpError(404, "User not found");
    }

    // Check if account is currently locked
    if (user.lockedUntil && user.lockedUntil.getTime() > Date.now()) {
        const minutesLeft = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
        throw new HttpError(423, `Account locked due to too many failed attempts. Try again in ${minutesLeft} minute(s).`);
    }

    const validPassword = await bcryptjs.compare(data.password, user.password);
    if (!validPassword) {
        const attempts = (user.failedLoginAttempts || 0) + 1;
        const updateData: any = { failedLoginAttempts: attempts };

        if (attempts >= MAX_FAILED_ATTEMPTS) {
            updateData.lockedUntil = new Date(Date.now() + LOCKOUT_DURATION_MS);
        }

        await userRepository.updateUser(user._id.toString(), updateData);
        throw new HttpError(401, "Invalid credentials");
    }

    // Successful login — reset lockout counters
    if (user.failedLoginAttempts > 0 || user.lockedUntil) {
        await userRepository.updateUser(user._id.toString(), {
            failedLoginAttempts: 0,
            lockedUntil: null,
        } as any);
    }

    // ...rest of existing MFA/token logic unchanged...

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
        return decryptUserPhone(user.toObject ? user.toObject() : user);
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

    async updateUser(userId: string, updateData: UpdateUserDTO) {
    const dataToUpdate: any = { ...updateData };
    if (dataToUpdate.phone) {
        dataToUpdate.phone = encrypt(dataToUpdate.phone);
    }

    const updatedUser = await userRepository.updateUser(userId, dataToUpdate);
    if (!updatedUser) {
        throw new HttpError(404, "User not found");
    }
    return decryptUserPhone(updatedUser.toObject ? updatedUser.toObject() : updatedUser);
}
    async getAllUsers() {
    const users = await userRepository.getAllUsers();
    return users.map((u: any) => decryptUserPhone(u.toObject ? u.toObject() : u));
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

async exportUserData(userId: string) {
    const user = await userRepository.getUserById(userId);
    if (!user) {
        throw new HttpError(404, "User not found");
    }
    const decrypted = decryptUserPhone(user.toObject ? user.toObject() : user);

    return {
        exportedAt: new Date().toISOString(),
        account: {
            fullName: decrypted.fullName,
            email: decrypted.email,
            phone: decrypted.phone,
            profileImage: decrypted.profileImage,
            role: decrypted.role,
            mfaEnabled: decrypted.mfaEnabled,
            createdAt: decrypted.createdAt,
        },
    };
}

async importUserData(userId: string, data: ImportUserDTO) {
    // Reuses updateUser so phone is encrypted at rest exactly like every
    // other write path, then decryptUserPhone strips password/mfaSecret.
    return this.updateUser(userId, data);
}
}

function decryptUserPhone(user: any) {
    if (user?.phone) {
        try {
            user.phone = decrypt(user.phone);
        } catch {
            user.phone = null;
        }
    }
    // Since .toObject() bypasses Mongoose's toJSON transform, we must
    // strip these sensitive fields manually here as well.
    delete user.password;
    delete user.mfaSecret;
    return user;
}

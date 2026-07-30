import z from "zod";
import { UserSchema } from "../types/user.type";

const passwordSchema = z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character");

export const CreateUserDTO = UserSchema.pick({
    fullName: true,
    email: true,
    profileImage: true
}).extend({
    password: passwordSchema,
    confirmPassword: z.string().min(8),
    phone: z.string().optional()
}).refine(
    (data) => data.password === data.confirmPassword,
    { message: "Passwords do not match", path: ["confirmPassword"] }
);

export type CreateUserDTO = z.infer<typeof CreateUserDTO>;

export const LoginUserDTO = z.object({
    email: z.email(),
    password: z.string().min(6)
});
export type LoginUserDTO = z.infer<typeof LoginUserDTO>;

export const UpdateUserDTO = UserSchema.pick({
    fullName: true,
    profileImage: true,
    phone: true,
}).partial();

export type UpdateUserDTO = z.infer<typeof UpdateUserDTO>;

export const ImportUserDTO = z.object({
    fullName: z.string().min(2).optional(),
    phone: z.string().optional(),
    profileImage: z.string().optional()
}).strict();

export type ImportUserDTO = z.infer<typeof ImportUserDTO>;

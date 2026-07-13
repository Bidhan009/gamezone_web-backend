import z from "zod";
import { UserSchema } from "../types/user.type";

// re-use UserSchema from types
export const CreateUserDTO = UserSchema.pick({
    fullName: true,
    email: true,
    password: true,
    profileImage: true
    // role intentionally excluded — kaile ni client-controlled hunu hunna at registration
}).extend({
    confirmPassword: z.string().min(6),
    phone: z.string().optional()
}).refine(
    (data) => data.password === data.confirmPassword,
    {
        message: "Passwords do not match",
        path: ["confirmPassword"]
    }
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

import z from "zod";
import { UserSchema } from "../types/user.type";

// re-use UserSchema from types
export const CreateUserDTO = UserSchema.pick({
    fullName: true,
    email: true,
    password: true
}).extend({
    confirmPassword: z.string().min(6),
    phone: z.string().optional() // <-- add this line
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

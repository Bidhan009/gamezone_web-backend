import z from "zod";

export const UserSchema = z.object({
    fullName: z.string().min(1),
    email: z.email(),
    password: z.string().min(6),
    role: z.enum(["user", "admin"]).default("user"),
    profileImage: z.string().nullable().default(null),
    phone: z.string().nullable().default(null),
    mfaSecret: z.string().nullable().default(null),
    mfaEnabled: z.boolean().default(false),
});

export type UserType = z.infer<typeof UserSchema>;
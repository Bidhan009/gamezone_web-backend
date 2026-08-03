import dotenv from "dotenv";
dotenv.config();

export const PORT: number = 
    process.env.PORT ? parseInt(process.env.PORT) : 5000;
export const MONGODB_URI: string = 
    process.env.MONGODB_URI || 'mongodb://localhost:27017/gamezone_backend';

// JWT_SECRET must always be explicitly set — never fall back to a
// default value, since a predictable secret allows forging valid
// tokens for any user, including admin accounts.
if (!process.env.JWT_SECRET) {
    throw new Error(
        "FATAL: JWT_SECRET environment variable is not set. " +
        "The application will not start without it, to prevent " +
        "use of a predictable, insecure signing key."
    );
}
export const JWT_SECRET: string = process.env.JWT_SECRET;

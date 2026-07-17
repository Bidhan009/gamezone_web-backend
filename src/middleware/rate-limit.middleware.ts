import rateLimit from "express-rate-limit";

// Strict limiter for login — the most sensitive, most targeted endpoint
export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per IP per window
    message: {
        success: false,
        message: "Too many login attempts. Please try again in 15 minutes."
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Slightly looser limiter for registration — still sensitive, but
// legitimate signup bursts (e.g. shared networks) shouldn't be over-restricted
export const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10,
    message: {
        success: false,
        message: "Too many registration attempts. Please try again later."
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// General limiter for all other API routes — baseline protection
export const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        success: false,
        message: "Too many requests. Please slow down."
    },
    standardHeaders: true,
    legacyHeaders: false,
});
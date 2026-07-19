import { Request, Response, NextFunction } from "express";
import axios from "axios";

export const verifyCaptcha = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { captchaToken } = req.body;
        if (!captchaToken) {
            return res.status(400).json({ success: false, message: "CAPTCHA verification required" });
        }

        const secretKey = process.env.RECAPTCHA_SECRET_KEY;
        const response = await axios.post(
            `https://www.google.com/recaptcha/api/siteverify`,
            null,
            { params: { secret: secretKey, response: captchaToken } }
        );

        if (!response.data.success) {
            return res.status(400).json({ success: false, message: "CAPTCHA verification failed" });
        }

        next();
    } catch (error: any) {
        return res.status(500).json({ success: false, message: "CAPTCHA verification error" });
    }
};
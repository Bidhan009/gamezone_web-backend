import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { authorizationMiddleware } from "../middleware/auth.middleware";
import { uploads } from "../middleware/upload.middleware";
import { loginLimiter, registerLimiter } from "../middleware/rate-limit.middleware";
import { verifyCaptcha } from "../middleware/captcha.middleware";

let authController = new AuthController();
const router = Router();

router.post("/register", registerLimiter, verifyCaptcha, authController.register) // implementing captcha
router.post("/login", loginLimiter, verifyCaptcha, authController.login) // implementing captcha
router.post("/logout", authorizationMiddleware, authController.logout);
router.get("/whoami", authorizationMiddleware, authController.getProfile);
router.post("/mfa/setup", authorizationMiddleware, authController.setupMfa);
router.post("/mfa/confirm", authorizationMiddleware, authController.confirmMfa);
router.post("/mfa/verify-login", authController.verifyMfa);

router.put(
    '/update-profile',
    authorizationMiddleware,
    ...uploads.single("profileImage"), // applying ... spreads
    authController.updateProfile
)

export default router;
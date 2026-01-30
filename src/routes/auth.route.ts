import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { ProfileController } from "../controllers/profile.controller";
import { authenticateToken } from "../middleware/auth.middleware";

let authController = new AuthController();
let profileController = new ProfileController();
const router = Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/logout", authController.logout);

// Profile routes
router.get("/profile", authenticateToken, profileController.getProfile);
router.put("/profile", authenticateToken, profileController.updateProfile);
router.post("/profile/upload", authenticateToken, profileController.uploadProfileImage);

export default router;
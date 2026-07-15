import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { authorizationMiddleware, adminMiddleware } from "../middleware/auth.middleware";
import { uploads } from "../middleware/upload.middleware"; // Import your multer config

const userController = new UserController();
const router = Router();

router.use(authorizationMiddleware);

// Update this line:
// Use 'profileImage' as the key name (or whatever you prefer)
router.put("/", uploads.single('profileImage'), userController.updateUser);

// router.get("/", userController.getAllUsers);
// router.get("/:id", userController.getUserById);
router.delete("/", userController.deleteUser);

// These two now require admin — regular users should never list/view other accounts
router.get("/", adminMiddleware, userController.getAllUsers);
router.get("/:id", adminMiddleware, userController.getUserById);

export default router;
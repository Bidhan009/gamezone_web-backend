import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { authorizationMiddleware } from "../middleware/auth.middleware";

const userController = new UserController();
const router = Router();

// Apply authentication middleware to all user routes
router.use(authorizationMiddleware);

// User routes (non-admin)
router.get("/", userController.getAllUsers);
router.get("/:id", userController.getUserById);
router.put("/", userController.updateUser);
router.delete("/", userController.deleteUser);

export default router;

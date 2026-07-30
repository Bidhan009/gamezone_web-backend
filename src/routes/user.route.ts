import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { authorizationMiddleware, adminMiddleware } from "../middleware/auth.middleware";
import { uploads } from "../middleware/upload.middleware"; // Import your multer config

const userController = new UserController();
const router = Router();

router.use(authorizationMiddleware);

// using the spreads in uploads
router.put("/", ...uploads.single('profileImage'), userController.updateUser);

// router.get("/", userController.getAllUsers);
// router.get("/:id", userController.getUserById);
router.delete("/", userController.deleteUser);

// Must stay above "/:id" — otherwise Express matches "export"/"import" as an :id param (see SEC-03)
router.get("/export", userController.exportData);
router.post("/import", userController.importData);

// These two now require admin — regular users should never list/view other accounts
router.get("/", adminMiddleware, userController.getAllUsers);
router.get("/:id", adminMiddleware, userController.getUserById);

export default router;
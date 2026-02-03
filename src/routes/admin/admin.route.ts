import { Router } from "express";
import { authorizationMiddleware, adminMiddleware } from "../../middleware/auth.middleware";
import { AdminUserController } from "../../controllers/admin/user.controller";
import { uploads } from "../../middleware/upload.middleware";
let adminUserController = new AdminUserController();

const router = Router();

router.use(authorizationMiddleware); // apply all with middleware
router.use(adminMiddleware); // apply all with middleware

router.post("/", uploads.single("profileImage"), adminUserController.createUser);
router.get("/", adminUserController.getAllUsers);
router.put("/:id", uploads.single("profileImage"), adminUserController.updateUser);
router.delete("/:id", adminUserController.deleteUser);
router.get("/:id", adminUserController.getUserById);

export default router;
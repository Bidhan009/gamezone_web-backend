import { Router } from "express";

import { AuthController } from "../controllers/auth.controller";

import { authorizationMiddleware } from "../middleware/auth.middleware";

import { uploads } from "../middleware/upload.middleware";



let authController = new AuthController();

const router = Router();



router.post("/register", authController.register)

router.post("/login", authController.login)

// add remaning routes like login, logout, etc.



router.get("/whoami", authorizationMiddleware, authController.getProfile);

router.put(

    '/update-profile',

    authorizationMiddleware,

    uploads.single("profileImage"), // "image"-fields name from frontend/client

    authController.updateProfile

)



export default router;
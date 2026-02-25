import { Router } from "express";
import { CartController } from "../controllers/cart.controller";
import { authorizationMiddleware } from "../middleware/auth.middleware";

const cartController = new CartController();
const router = Router();

router.get("/", authorizationMiddleware, cartController.getCart);
router.post("/", authorizationMiddleware, cartController.addItem);
router.patch("/", authorizationMiddleware, cartController.updateItem);
router.delete("/", authorizationMiddleware, cartController.clearCart);
router.delete("/:productId", authorizationMiddleware, cartController.removeItem);

export default router;

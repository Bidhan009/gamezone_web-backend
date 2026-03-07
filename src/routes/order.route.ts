import { Router } from "express";
import { OrderController } from "../controllers/order.controller";
import { authorizationMiddleware } from "../middleware/auth.middleware";

const router = Router();
const orderController = new OrderController();

router.post("/", authorizationMiddleware, orderController.createOrder);
router.get("/", authorizationMiddleware, orderController.getUserOrders);

export default router;
import { Router } from "express";
import { authorizationMiddleware, adminMiddleware } from "../../middleware/auth.middleware";
import { AdminUserController } from "../../controllers/admin/user.controller";
import { AdminOrderController } from "../../controllers/admin/order.controller";
import { ProductController } from "../../controllers/product.controller";
import { uploads } from "../../middleware/upload.middleware";

let adminUserController = new AdminUserController();
let adminOrderController = new AdminOrderController();
let productController = new ProductController();

const router = Router();

router.use(authorizationMiddleware); // apply all with middleware
router.use(adminMiddleware); // apply all with middleware

// User management routes
router.post("/users", ...uploads.single("profileImage"), adminUserController.createUser);
router.get("/users", adminUserController.getAllUsers);
router.put("/users/:id", ...uploads.single("profileImage"), adminUserController.updateUser);
router.delete("/users/:id", adminUserController.deleteUser);
router.get("/users/:id", adminUserController.getUserById);

// Product management routes
router.post("/products", ...uploads.single("productImage"), productController.createProduct);
router.get("/products", productController.getAllProducts);
router.put("/products/:id", ...uploads.single("productImage"), productController.updateProduct);
router.delete("/products/:id", productController.deleteProduct);
router.get("/products/:id", productController.getProductById);

// Order management routes
router.get("/orders/stats", adminOrderController.getOrderStats);
router.get("/orders", adminOrderController.getAllOrders);
router.get("/orders/:orderId", adminOrderController.getOrderById);
router.put("/orders/:orderId", adminOrderController.updateOrderStatus);

console.log("Admin routes loaded");

export default router;
import { Router } from "express";
import { ProductController } from "../controllers/product.controller";
import { authorizationMiddleware } from "../middleware/auth.middleware";
// import { uploads } from "../middleware/upload.middleware"; // Use if image upload is needed directly in route

const productController = new ProductController();
const router = Router();

// Public routes (if any, e.g. view products)
router.get("/", productController.getAllProducts);
router.get("/:id", productController.getProductById);

// Protected routes (admin/user based on requirements, assuming auth needed for mutation)
router.post("/", authorizationMiddleware, productController.createProduct);
router.put("/:id", authorizationMiddleware, productController.updateProduct);
router.delete("/:id", authorizationMiddleware, productController.deleteProduct);

export default router;

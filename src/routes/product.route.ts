import { Router } from "express";
import { ProductController } from "../controllers/product.controller";
import { adminMiddleware, authorizationMiddleware } from "../middleware/auth.middleware";
import { uploads } from "../middleware/upload.middleware";

const productController = new ProductController();
const router = Router();

// Public routes (if any, e.g. view products)
router.get("/", productController.getAllProducts);
router.get("/:id", productController.getProductById);

// Protected routes (admin/user based on requirements, assuming auth needed for mutation)
// adding ... spreads in the uploads
router.post("/", authorizationMiddleware, adminMiddleware, ...uploads.single("productImage"), productController.createProduct);
router.put("/:id", authorizationMiddleware, adminMiddleware, ...uploads.single("productImage"), productController.updateProduct);
router.delete("/:id", authorizationMiddleware, adminMiddleware, productController.deleteProduct);

export default router;

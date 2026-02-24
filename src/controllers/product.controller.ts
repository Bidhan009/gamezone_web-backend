import { Request, Response } from "express";
import { ProductService } from "../services/product.service";
import { CreateProductDTO, UpdateProductDTO } from "../dtos/product.dto";
import z from "zod";

const productService = new ProductService();

export class ProductController {

    async createProduct(req: Request, res: Response) {
        try {
            // Handle both FormData and JSON requests
            let productData;
            
            if (req.file) {
                // FormData request - parse req.body (which contains strings)
                productData = {
                    name: req.body.name,
                    price: req.body.price,
                    category: req.body.category,
                    stock: req.body.stock,
                    description: req.body.description,
                    imageUrl: `/uploads/${req.file.filename}`
                };
            } else {
                // Regular JSON request
                productData = req.body;
            }
            
            const parsedData = CreateProductDTO.safeParse(productData);
            if (!parsedData.success) {
                return res.status(400).json({ 
                    success: false, 
                    message: z.prettifyError(parsedData.error) 
                });
            }
            
            const product = await productService.createProduct(parsedData.data);
            return res.status(201).json({ success: true, data: product });
        } catch (error: any) {
            return res.status(error.statusCode || 500).json({ 
                success: false, 
                message: error.message || "Failed to create product" 
            });
        }
    }

    async getAllProducts(req: Request, res: Response) {
        try {
            const products = await productService.getAllProducts();
            return res.status(200).json({ success: true, data: products });
        } catch (error: any) {
            return res.status(error.statusCode || 500).json({ success: false, message: error.message });
        }
    }

    async getProductById(req: Request, res: Response) {
        try {
            const product = await productService.getProductById(req.params.id);
            return res.status(200).json({ success: true, data: product });
        } catch (error: any) {
            return res.status(error.statusCode || 500).json({ success: false, message: error.message });
        }
    }

    async updateProduct(req: Request, res: Response) {
        try {
            // Handle both FormData and JSON requests
            let updateData;
            
            if (req.file) {
                // FormData request - parse req.body (which contains strings)
                updateData = {
                    ...req.body,
                    imageUrl: `/uploads/${req.file.filename}`
                };
            } else {
                // Regular JSON request
                updateData = req.body;
            }
            
            const parsedData = UpdateProductDTO.safeParse(updateData);
            if (!parsedData.success) {
                return res.status(400).json({ 
                    success: false, 
                    message: z.prettifyError(parsedData.error) 
                });
            }
            
            const product = await productService.updateProduct(req.params.id, parsedData.data);
            return res.status(200).json({ success: true, data: product });
        } catch (error: any) {
            return res.status(error.statusCode || 500).json({ 
                success: false, 
                message: error.message || "Failed to update product" 
            });
        }
    }

    async deleteProduct(req: Request, res: Response) {
        try {
            const result = await productService.deleteProduct(req.params.id);
            return res.status(200).json({ success: true, message: result.message });
        } catch (error: any) {
            return res.status(error.statusCode || 500).json({ success: false, message: error.message });
        }
    }
}

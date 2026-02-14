import { Request, Response } from "express";
import { ProductService } from "../services/product.service";
import { CreateProductDTO, UpdateProductDTO } from "../dtos/product.dto";
import z from "zod";

const productService = new ProductService();

export class ProductController {

    async createProduct(req: Request, res: Response) {
        try {
            const parsedData = CreateProductDTO.safeParse(req.body);
            if (!parsedData.success) {
                return res.status(400).json({ success: false, message: z.prettifyError(parsedData.error) });
            }
            const product = await productService.createProduct(parsedData.data);
            return res.status(201).json({ success: true, data: product });
        } catch (error: any) {
            return res.status(error.statusCode || 500).json({ success: false, message: error.message });
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
            const parsedData = UpdateProductDTO.safeParse(req.body);
            if (!parsedData.success) {
                return res.status(400).json({ success: false, message: z.prettifyError(parsedData.error) });
            }
            const product = await productService.updateProduct(req.params.id, parsedData.data);
            return res.status(200).json({ success: true, data: product });
        } catch (error: any) {
            return res.status(error.statusCode || 500).json({ success: false, message: error.message });
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

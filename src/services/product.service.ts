import { CreateProductDTO, UpdateProductDTO } from "../dtos/product.dto";
import { ProductRepository, PaginatedResult } from "../repositories/product.repository";
import { HttpError } from "../errors/http-error";
import mongoose from "mongoose";

const productRepository = new ProductRepository();

export class ProductService {
    async createProduct(data: CreateProductDTO) {
        return await productRepository.createProduct(data as any);
    }

    async getAllProducts() {
        return await productRepository.getAllProducts();
    }

    async getProductsPaginated(page: number = 1, limit: number = 10): Promise<PaginatedResult<any>> {
        const result = await productRepository.getProductsPaginated(page, limit);
        
        const products = result.data.map(product => ({
            _id: product._id,
            name: product.name,
            price: product.price,
            category: product.category,
            stock: product.stock,
            description: product.description,
            imageUrl: product.imageUrl,
            createdAt: product.createdAt,
            updatedAt: product.updatedAt
        }));

        return {
            data: products,
            total: result.total,
            page: result.page,
            limit: result.limit,
            totalPages: result.totalPages
        };
    }

    async getProductById(id: string) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new HttpError(400, "Invalid product ID");
        }
        const product = await productRepository.getProductById(id);
        if (!product) {
            throw new HttpError(404, "Product not found");
        }
        return {
            _id: product._id,
            name: product.name,
            price: product.price,
            category: product.category,
            stock: product.stock,
            description: product.description,
            imageUrl: product.imageUrl,
            createdAt: product.createdAt,
            updatedAt: product.updatedAt
        };
    }

    async updateProduct(id: string, data: UpdateProductDTO) {
        const updatedProduct = await productRepository.updateProduct(id, data);
        if (!updatedProduct) {
            throw new HttpError(404, "Product not found");
        }
        return updatedProduct;
    }

    async deleteProduct(id: string) {
        const deleted = await productRepository.deleteProduct(id);
        if (!deleted) {
            throw new HttpError(404, "Product not found");
        }
        return { message: "Product deleted successfully" };
    }
}

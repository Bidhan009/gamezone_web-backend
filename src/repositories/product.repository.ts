import { Product, IProduct } from "../models/product.model";
import mongoose from "mongoose";

export interface PaginatedResult<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export class ProductRepository {
    async createProduct(productData: Partial<IProduct>): Promise<IProduct> {
        const product = new Product(productData);
        return await product.save();
    }

    async getAllProducts(): Promise<IProduct[]> {
        return await Product.find();
    }

    async getProductsPaginated(page: number = 1, limit: number = 10): Promise<PaginatedResult<IProduct>> {
        const skip = (page - 1) * limit;
        
        const [data, total] = await Promise.all([
            Product.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
            Product.countDocuments()
        ]);

        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        };
    }

    async getProductById(id: string): Promise<IProduct | null> {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }
        return await Product.findById(id);
    }

    async updateProduct(id: string, updateData: Partial<IProduct>): Promise<IProduct | null> {
        return await Product.findByIdAndUpdate(id, updateData, { new: true });
    }

    async deleteProduct(id: string): Promise<boolean> {
        const result = await Product.findByIdAndDelete(id);
        return result ? true : false;
    }
}

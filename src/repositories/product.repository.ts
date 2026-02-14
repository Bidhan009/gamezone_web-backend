import { Product, IProduct } from "../models/product.model";

export class ProductRepository {
    async createProduct(productData: Partial<IProduct>): Promise<IProduct> {
        const product = new Product(productData);
        return await product.save();
    }

    async getAllProducts(): Promise<IProduct[]> {
        return await Product.find();
    }

    async getProductById(id: string): Promise<IProduct | null> {
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

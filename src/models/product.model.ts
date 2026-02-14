import mongoose, { Schema, model, models, Document } from "mongoose";
import { ProductType } from "../types/product.type";

const ProductSchema: Schema = new Schema<ProductType>({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  stock: { type: Number, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String, required: false }, // Store the URL from Cloudinary here
}, { timestamps: true });

export interface IProduct extends ProductType, Document {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export const Product = mongoose.models.Product || model<IProduct>("Product", ProductSchema);
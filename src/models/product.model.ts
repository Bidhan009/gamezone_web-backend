import mongoose, { Schema, model, models } from "mongoose";

const ProductSchema = new Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  stock: { type: Number, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String, required: false }, // Store the URL from Cloudinary here
}, { timestamps: true });

export const Product = models.Product || model("Product", ProductSchema);
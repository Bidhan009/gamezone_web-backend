import { Cart, ICart } from "../models/cart.model";
import mongoose from "mongoose";

export class CartRepository {
  async findByUserId(userId: string): Promise<ICart | null> {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return null;
    }
    return await Cart.findOne({ user: userId }).populate("items.product");
  }

  async createCart(userId: string): Promise<ICart> {
    const cart = new Cart({
      user: new mongoose.Types.ObjectId(userId),
      items: [],
    });
    return await cart.save();
  }

  async getOrCreateCart(userId: string): Promise<ICart> {
    let cart = await this.findByUserId(userId);
    if (!cart) {
      cart = await this.createCart(userId);
    }
    return cart;
  }

  async addItem(userId: string, productId: string, quantity: number): Promise<ICart> {
    const cart = await this.getOrCreateCart(userId);
    
    const existingItemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      cart.items.push({
        product: new mongoose.Types.ObjectId(productId),
        quantity,
      });
    }

    return await cart.save();
  }

  async updateItem(userId: string, productId: string, quantity: number): Promise<ICart | null> {
    const cart = await this.findByUserId(userId);
    if (!cart) {
      return null;
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return null;
    }

    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = quantity;
    }

    return await cart.save();
  }

  async removeItem(userId: string, productId: string): Promise<ICart | null> {
    const cart = await this.findByUserId(userId);
    if (!cart) {
      return null;
    }

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );

    return await cart.save();
  }

  async clearCart(userId: string): Promise<ICart | null> {
    const cart = await this.findByUserId(userId);
    if (!cart) {
      return null;
    }

    cart.items = [];
    return await cart.save();
  }
}

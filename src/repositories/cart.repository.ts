import { Cart, ICart } from "../models/cart.model";
import { Product } from "../models/product.model";
import mongoose from "mongoose";

export class CartRepository {
  private recalculateTotals(cart: ICart) {
    const items = cart.items || [];

    cart.totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

    // totalPrice uses populated product price when available; falls back to 0 otherwise
    cart.totalPrice = items.reduce((sum, item: any) => {
      const price = item.product && (item.product as any).price
        ? (item.product as any).price
        : 0;
      return sum + price * item.quantity;
    }, 0);
  }
  async findByUserId(userId: string): Promise<ICart | null> {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return null;
    }
    return await Cart.findOne({ user: userId })
      .populate("items.product")
      .populate("user", "fullName email");
  }

  async createCart(userId: string): Promise<ICart> {
    const cart = new Cart({
      user: new mongoose.Types.ObjectId(userId),
      items: [],
    });
    this.recalculateTotals(cart);
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

  const product = await Product.findById(productId);
  if (!product) {
    throw new Error("Product not found");
  }

  const existingItemIndex = cart.items.findIndex((item: any) => {
    const itemProductId =
      typeof item.product === "object"
        ? item.product._id.toString()
        : item.product.toString();

    return itemProductId === productId;
  });

  if (existingItemIndex > -1) {
    cart.items[existingItemIndex].quantity += quantity;
  } else {
    cart.items.push({
      product: product._id,
      quantity,
    });
  }

  // 🔥 recalc using real product prices
  cart.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  let total = 0;
  for (const item of cart.items) {
    const prod = await Product.findById(
      typeof item.product === "object"
        ? item.product._id
        : item.product
    );
    if (prod) {
      total += prod.price * item.quantity;
    }
  }

  cart.totalPrice = total;

  return await cart.save();
}

  async updateItem(
  userId: string,
  productId: string,
  quantity: number
): Promise<ICart | null> {
  const cart = await this.findByUserId(userId);
  if (!cart) return null;

  const itemIndex = cart.items.findIndex((item: any) => {
    const itemProductId =
      typeof item.product === "object"
        ? item.product._id.toString()
        : item.product.toString();

    return itemProductId === productId;
  });

  if (itemIndex === -1) return null;

  if (quantity <= 0) {
    cart.items.splice(itemIndex, 1);
  } else {
    cart.items[itemIndex].quantity = quantity;
  }

  this.recalculateTotals(cart);
  return await cart.save();
}

  async removeItem(userId: string, productId: string): Promise<ICart | null> {
  const cart = await this.findByUserId(userId);
  if (!cart) return null;

  cart.items = cart.items.filter((item: any) => {
    const itemProductId =
      typeof item.product === "object"
        ? item.product._id.toString()
        : item.product.toString();

    return itemProductId !== productId;
  });

  this.recalculateTotals(cart);
  return await cart.save();
}

  async clearCart(userId: string): Promise<ICart | null> {
    const cart = await this.findByUserId(userId);
    if (!cart) {
      return null;
    }

    cart.items = [];
    this.recalculateTotals(cart);
    return await cart.save();
  }
}

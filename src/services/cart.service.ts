import { AddToCartDTO, UpdateCartItemDTO } from "../dtos/cart.dto";
import { CartRepository } from "../repositories/cart.repository";
import { ProductRepository } from "../repositories/product.repository";
import { HttpError } from "../errors/http-error";
import mongoose from "mongoose";

const cartRepository = new CartRepository();
const productRepository = new ProductRepository();

export interface CartItem {
  product: {
    _id: string;
    name: string;
    price: number;
    imageUrl?: string;
    stock: number;
  };
  quantity: number;
}

export interface CartResponse {
  _id: string;
  user: {
    _id: string;
    fullName: string;
    email: string;
  };
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  createdAt: Date;
  updatedAt: Date;
}

export class CartService {
  private formatCart(cart: any): CartResponse {
    const items = cart.items.map((item: any) => ({
      product: {
        _id: item.product._id.toString(),
        name: item.product.name,
        price: item.product.price,
        imageUrl: item.product.imageUrl,
        stock: item.product.stock,
      },
      quantity: item.quantity,
    }));

    const totalItems = items.reduce((sum: number, item: CartItem) => sum + item.quantity, 0);
    const totalPrice = items.reduce(
      (sum: number, item: CartItem) => sum + item.product.price * item.quantity,
      0
    );

    return {
      _id: cart._id.toString(),
      user: {
        _id: cart.user._id?.toString() || cart.user.toString(),
        fullName: cart.user.fullName || 'Unknown User',
        email: cart.user.email || 'unknown@example.com'
      },
      items,
      totalItems,
      totalPrice: Math.round(totalPrice * 100) / 100,
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
    };
  }

  async getCart(userId: string) {
    const cart = await cartRepository.findByUserId(userId);
    if (!cart) {
      return this.formatCart(await cartRepository.createCart(userId));
    }
    return this.formatCart(cart);
  }

  async addItem(userId: string, data: AddToCartDTO) {
    if (!mongoose.Types.ObjectId.isValid(data.productId)) {
      throw new HttpError(400, "Invalid product ID");
    }

    const product = await productRepository.getProductById(data.productId);
    if (!product) {
      throw new HttpError(404, "Product not found");
    }

    if (product.stock < data.quantity) {
      throw new HttpError(400, `Only ${product.stock} items available in stock`);
    }

    const cart = await cartRepository.addItem(userId, data.productId, data.quantity);
    return this.formatCart(cart);
  }

  async updateItem(userId: string, productId: string, data: UpdateCartItemDTO) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new HttpError(400, "Invalid user ID");
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      throw new HttpError(400, "Invalid product ID");
    }

    if (data.quantity < 0) {
      throw new HttpError(400, "Quantity cannot be negative");
    }

    const cart = await cartRepository.updateItem(userId, productId, data.quantity);
    if (!cart) {
      throw new HttpError(404, "Cart or item not found");
    }

    return this.formatCart(cart);
  }

  async removeItem(userId: string, productId: string) {
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      throw new HttpError(400, "Invalid product ID");
    }

    const cart = await cartRepository.removeItem(userId, productId);
    if (!cart) {
      throw new HttpError(404, "Cart not found");
    }

    return this.formatCart(cart);
  }

  async clearCart(userId: string) {
    const cart = await cartRepository.clearCart(userId);
    if (!cart) {
      throw new HttpError(404, "Cart not found");
    }

    return this.formatCart(cart);
  }
}

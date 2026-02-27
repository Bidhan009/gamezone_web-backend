import { Order } from "../models/order.model";
import { CartRepository } from "../repositories/cart.repository";
import { OrderRepository } from "../repositories/order.repository";
import { HttpError } from "../errors/http-error";

const cartRepository = new CartRepository();
const orderRepository = new OrderRepository();

export class OrderService {
  async createOrder(userId: string, orderData: any) {
    // Get the user's cart
    const cart = await cartRepository.findByUserId(userId);
    if (!cart || cart.items.length === 0) {
      throw new HttpError(400, "Cart is empty");
    }

    if (!orderData?.shippingAddress) {
      throw new HttpError(400, "Shipping address is required");
    }

    // Build order items from cart
    const items = cart.items.map((item: any) => {
      const productDoc: any = item.product;
      const price = productDoc?.price ?? 0;

      return {
        product: productDoc._id ?? productDoc,
        quantity: item.quantity,
        price,
      };
    });

    const totalAmount = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const orderToCreate = {
      user: cart.user._id ?? cart.user,
      items,
      totalAmount: Math.round(totalAmount * 100) / 100,
      shippingAddress: orderData.shippingAddress,
      status: "pending" as const,
    };

    const order = await orderRepository.create(orderToCreate);

    // Clear cart after successful order
    await cartRepository.clearCart(userId);

    return order;
  }

  async getUserOrders(userId: string) {
    return await orderRepository.findByUserId(userId);
  }
}
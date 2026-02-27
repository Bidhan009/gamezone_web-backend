import { Order, IOrder } from "../models/order.model";
import mongoose from "mongoose";

export class OrderRepository {
  async create(orderData: Partial<IOrder>): Promise<IOrder> {
    const order = new Order(orderData);
    return await order.save();
  }
  
  // async findByUserId(userId: string): Promise<IOrder[]> {
  //   if (!mongoose.Types.ObjectId.isValid(userId)) {
  //     return [];
  //   }
  //   return await Order.find({ user: userId })
  //     .populate("items.product", "name price imageUrl")
  //     .sort({ createdAt: -1 });
  // }
  
  // async findById(orderId: string): Promise<IOrder | null> {
  //   if (!mongoose.Types.ObjectId.isValid(orderId)) {
  //     return null;
  //   }
  //   return await Order.findById(orderId)
  //     .populate("items.product", "name price imageUrl")
  //     .populate("user", "fullName email");
  // }
  
  async findByUserId(userId: string): Promise<IOrder[]> {
  return await Order.find({ user: userId })
    .populate("user", "fullName email")
    .populate("items.product", "name imageUrl price")
    .sort({ createdAt: -1 });
}

async findById(orderId: string): Promise<IOrder | null> {
  return await Order.findById(orderId)
    .populate("user", "fullName email")
    .populate("items.product", "name imageUrl price");
}

  async updateStatus(orderId: string, status: string): Promise<IOrder | null> {
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return null;
    }
    return await Order.findByIdAndUpdate(
      orderId, 
      { status }, 
      { new: true }
    ).populate("items.product", "name price imageUrl");
  }
}

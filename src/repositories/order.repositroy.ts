import { Order, IOrder } from "../models/order.model";

export class OrderRepository {
  async create(orderData: any): Promise<IOrder> {
    const order = new Order(orderData);
    return await order.save();
  }
  
  async findByUserId(userId: string): Promise<IOrder[]> {
    return await Order.find({ user: userId }).populate("items.product");
  }
  
  async findById(orderId: string): Promise<IOrder | null> {
    return await Order.findById(orderId).populate("items.product");
  }
}
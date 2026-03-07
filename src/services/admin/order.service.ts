import { AdminOrderRepository } from "../../repositories/admin/order.repository";
import { HttpError } from "../../errors/http-error";

export class AdminOrderService {
  private adminOrderRepository = new AdminOrderRepository();

  async getAllOrders(filters: any = {}, sortBy: string = "createdAt") {
    const orders = await this.adminOrderRepository.findAll(filters, sortBy);
    return orders;
  }

  async getOrderById(orderId: string) {
    if (!orderId) {
      throw new HttpError(400, "Order ID is required");
    }

    const order = await this.adminOrderRepository.findById(orderId);
    if (!order) {
      throw new HttpError(404, "Order not found");
    }

    return order;
  }

  async getOrderStats() {
    const stats = await this.adminOrderRepository.getStats();
    return stats;
  }

  //Added code
  async updateOrderStatus(orderId: string, status: string) {
  if (!orderId) {
    throw new HttpError(400, "Order ID is required");
  }

  const allowedStatuses = [
    "pending",
    "paid",
    "shipped",
    "completed",
    "cancelled",
  ];

  if (!allowedStatuses.includes(status)) {
    throw new HttpError(400, "Invalid order status");
  }

  const updatedOrder = await this.adminOrderRepository.updateOrderStatus(
    orderId,
    status as any
  );

  if (!updatedOrder) {
    throw new HttpError(404, "Order not found");
  }

  return updatedOrder;
}
}

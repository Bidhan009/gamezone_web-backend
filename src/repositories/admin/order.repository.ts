import { Order, IOrder } from "../../models/order.model";
import mongoose from "mongoose";

export class AdminOrderRepository {
  async findAll(filters: any = {}, sortBy: string = "createdAt"): Promise<IOrder[]> {
    const sortOptions: any = {};
    
    if (sortBy === "createdAt") {
      sortOptions.createdAt = -1; // newest first
    } else if (sortBy === "totalAmount") {
      sortOptions.totalAmount = -1; // highest amount first
    } else if (sortBy === "status") {
      sortOptions.status = 1;
    }

    return await Order.find(filters)
      .populate("user", "fullName email phone")
      .populate("items.product", "name imageUrl price category")
      .sort(sortOptions)
      .lean();
  }

  async findById(orderId: string): Promise<IOrder | null> {
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return null;
    }

    return await Order.findById(orderId)
      .populate("user", "fullName email phone profileImage")
      .populate("items.product", "name imageUrl price category description");
  }

  async getStats() {
    const stats = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: "$totalAmount" },
          pendingOrders: {
            $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
          },
          paidOrders: {
            $sum: { $cond: [{ $eq: ["$status", "paid"] }, 1, 0] },
          },
          shippedOrders: {
            $sum: { $cond: [{ $eq: ["$status", "shipped"] }, 1, 0] },
          },
          completedOrders: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
          },
          cancelledOrders: {
            $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] },
          },
        },
      },
    ]);

    return stats[0] || {
      totalOrders: 0,
      totalRevenue: 0,
      pendingOrders: 0,
      paidOrders: 0,
      shippedOrders: 0,
      completedOrders: 0,
      cancelledOrders: 0,
    };
  }
 //Added code
  async updateOrderStatus(
  orderId: string,
  status: "pending" | "paid" | "shipped" | "completed" | "cancelled"
): Promise<IOrder | null> {

  // 1️⃣ Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    return null;
  }

  // 2️⃣ Validate allowed status (extra safety)
  const allowedStatuses = ["pending", "paid", "shipped", "completed", "cancelled"];
  if (!allowedStatuses.includes(status)) {
    throw new Error("Invalid order status");
  }

  // 3️⃣ Update order
  const updatedOrder = await Order.findByIdAndUpdate(
    orderId,
    { status },
    { new: true }
  )
    .populate("user", "fullName email phone profileImage")
    .populate("items.product", "name imageUrl price category");

  return updatedOrder;
}

}


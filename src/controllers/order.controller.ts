import { Response } from "express";
import { OrderService } from "../services/order.service";
import { CreateOrderDTO } from "../dtos/order.dto";
import { AuthRequest } from "../middleware/auth.middleware";
import z from "zod";

export class OrderController {
  private orderService = new OrderService();

  createOrder = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?._id.toString();
      if (!userId) {
        return res.status(401).json({ success: false, message: "User not authenticated" });
      }

      const parsedData = CreateOrderDTO.safeParse(req.body);
      if (!parsedData.success) {
        return res.status(400).json({
          success: false,
          message: z.prettifyError(parsedData.error),
        });
      }

      const order = await this.orderService.createOrder(userId, parsedData.data);
      return res.status(201).json({ success: true, data: order });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Failed to create order"
      });
    }
  };

  getUserOrders = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?._id.toString();
      if (!userId) {
        return res.status(401).json({ success: false, message: "User not authenticated" });
      }

      const orders = await this.orderService.getUserOrders(userId);
      return res.status(200).json({ success: true, data: orders });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Failed to get orders",
      });
    }
  };
}
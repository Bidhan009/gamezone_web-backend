import { Response } from "express";
import { AdminOrderService } from "../../services/admin/order.service";
import { AuthRequest } from "../../middleware/auth.middleware";

export class AdminOrderController {
  private adminOrderService = new AdminOrderService();

  getAllOrders = async (req: AuthRequest, res: Response) => {
    try {
      const { status, sortBy } = req.query;
      
      const filters: any = {};
      if (status && typeof status === 'string') {
        filters.status = status;
      }

      const orders = await this.adminOrderService.getAllOrders(filters, sortBy as string);
      return res.status(200).json({ 
        success: true, 
        data: orders,
        message: "All orders retrieved successfully"
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Failed to fetch orders",
      });
    }
  };

  getOrderById = async (req: AuthRequest, res: Response) => {
    try {
      const { orderId } = req.params;
      const order = await this.adminOrderService.getOrderById(orderId);
      return res.status(200).json({ 
        success: true, 
        data: order 
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Failed to fetch order",
      });
    }
  };

  getOrderStats = async (req: AuthRequest, res: Response) => {
    try {
      const stats = await this.adminOrderService.getOrderStats();
      return res.status(200).json({ 
        success: true, 
        data: stats 
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Failed to fetch order stats",
      });
    }
  };
  //Added code
  updateOrderStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required",
      });
    }

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    const updatedOrder = await this.adminOrderService.updateOrderStatus(
      orderId,
      status
    );

    return res.status(200).json({
      success: true,
      data: updatedOrder,
      message: "Order status updated successfully",
    });
  } catch (error: any) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to update order status",
    });
  }
};
}

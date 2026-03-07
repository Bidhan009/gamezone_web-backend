import { Response } from "express";
import { CartService } from "../services/cart.service";
import { AddToCartDTO, UpdateCartItemDTO } from "../dtos/cart.dto";
import { AuthRequest } from "../middleware/auth.middleware";
import z from "zod";

const cartService = new CartService();

export class CartController {
  getCart = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?._id.toString();
      if (!userId || !req.user) {
        return res.status(401).json({ success: false, message: "User not authenticated" });
      }

      const cart = await cartService.getCart(userId);
      return res.status(200).json({ 
        success: true, 
        data: {
          ...cart,
          currentUser: {
            _id: req.user._id,
            fullName: req.user.fullName,
            email: req.user.email
          }
        }
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Failed to get cart",
      });
    }
  };

  addItem = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?._id.toString();
      if (!userId) {
        return res.status(401).json({ success: false, message: "User not authenticated" });
      }

      const parsedData = AddToCartDTO.safeParse(req.body);
      if (!parsedData.success) {
        return res.status(400).json({
          success: false,
          message: z.prettifyError(parsedData.error),
        });
      }

      const cart = await cartService.addItem(userId, parsedData.data);
      return res.status(200).json({ success: true, data: cart });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Failed to add item to cart",
      });
    }
  };

  updateItem = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?._id.toString();
      if (!userId) {
        return res.status(401).json({ success: false, message: "User not authenticated" });
      }

      const { productId } = req.params;
      const parsedData = UpdateCartItemDTO.safeParse(req.body);
      if (!parsedData.success) {
        return res.status(400).json({
          success: false,
          message: z.prettifyError(parsedData.error),
        });
      }

      const cart = await cartService.updateItem(userId, productId, parsedData.data);
      return res.status(200).json({ success: true, data: cart });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Failed to update item",
      });
    }
  };

  removeItem = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?._id.toString();
      if (!userId) {
        return res.status(401).json({ success: false, message: "User not authenticated" });
      }

      const { productId } = req.params;
      const cart = await cartService.removeItem(userId, productId);
      return res.status(200).json({ success: true, data: cart });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Failed to remove item",
      });
    }
  };

  clearCart = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?._id.toString();
      if (!userId) {
        return res.status(401).json({ success: false, message: "User not authenticated" });
      }

      const cart = await cartService.clearCart(userId);
      return res.status(200).json({ success: true, data: cart });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Failed to clear cart",
      });
    }
  };
}

import mongoose, { Schema, model, Document, Types } from "mongoose";

export interface IOrderItem {
  product: Types.ObjectId;
  quantity: number;
  price: number;
}

export interface IOrder extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  items: IOrderItem[];
  totalAmount: number;
  shippingAddress: {
    street: string;
    city: string;
    zipCode: string;
  };
  status: "pending" | "paid" | "shipped" | "completed" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    items: { type: [OrderItemSchema], required: true },
    totalAmount: { type: Number, required: true, min: 0 },
    shippingAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      zipCode: { type: String, required: true },
    },
    status: {
      type: String,
      enum: ["pending", "paid", "shipped", "completed", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export const Order = mongoose.models.Order || model<IOrder>("Order", OrderSchema);
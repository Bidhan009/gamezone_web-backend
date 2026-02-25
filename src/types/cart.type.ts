import z from "zod";

export const CartItemSchema = z.object({
  product: z.string().min(1),
  quantity: z.number().min(1).default(1),
});

export const CartSchema = z.object({
  user: z.string().min(1),
  items: z.array(CartItemSchema).default([]),
});

export type CartItemType = z.infer<typeof CartItemSchema>;
export type CartType = z.infer<typeof CartSchema>;

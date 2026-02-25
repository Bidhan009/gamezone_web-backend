import z from "zod";

export const AddToCartDTO = z.object({
  productId: z.string().min(1, "Product ID is required"),
  quantity: z.number().min(1).default(1),
});

export type AddToCartDTO = z.infer<typeof AddToCartDTO>;

export const UpdateCartItemDTO = z.object({
  quantity: z.number().min(0, "Quantity cannot be negative"),
});

export type UpdateCartItemDTO = z.infer<typeof UpdateCartItemDTO>;

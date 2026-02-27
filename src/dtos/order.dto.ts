import z from "zod";

export const CreateOrderDTO = z.object({
  items: z.array(z.object({
    product: z.string(), // product ID
    quantity: z.number().min(1),
    price: z.number().min(0),
  })),
  totalAmount: z.number().min(0),
  shippingAddress: z.object({
    street: z.string(),
    city: z.string(),
    zipCode: z.string(),
  }),
  contactInfo: z.object({
    phone: z.string(),
    email: z.string().email(),
  }),
  paymentMethod: z.string(), // "COD"
  paymentStatus: z.string(), // "pending"
  status: z.string(), // "pending"
});
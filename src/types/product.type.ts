
import z from "zod";

export const ProductSchema = z.object({
    name: z.string().min(1),
    price: z.number().min(0),
    category: z.string().min(1),
    stock: z.number().min(0),
    description: z.string().min(1),
    imageUrl: z.string().optional()
});

export type ProductType = z.infer<typeof ProductSchema>;

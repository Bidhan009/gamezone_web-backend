import z from "zod";

import { ProductSchema } from "../types/product.type";

// CreateProductDTO that handles FormData (strings) and converts to proper types
export const CreateProductDTO = z.object({
    name: z.string().min(1),
    price: z.union([z.number(), z.string()]).transform((val) => {
        if (typeof val === 'string') {
            const num = parseFloat(val);
            if (isNaN(num)) throw new Error('Invalid price format');
            return num;
        }
        return val;
    }),
    category: z.string().min(1),
    stock: z.union([z.number(), z.string()]).transform((val) => {
        if (typeof val === 'string') {
            const num = parseInt(val, 10);
            if (isNaN(num)) throw new Error('Invalid stock format');
            return num;
        }
        return val;
    }),
    description: z.string().min(1),
    imageUrl: z.string().optional()
});

export type CreateProductDTO = z.infer<typeof CreateProductDTO>;

// UpdateProductDTO for partial updates
export const UpdateProductDTO = ProductSchema.partial().extend({
    price: z.union([z.number(), z.string()]).transform((val) => {
        if (typeof val === 'string') {
            const num = parseFloat(val);
            if (isNaN(num)) throw new Error('Invalid price format');
            return num;
        }
        return val;
    }).optional(),
    stock: z.union([z.number(), z.string()]).transform((val) => {
        if (typeof val === 'string') {
            const num = parseInt(val, 10);
            if (isNaN(num)) throw new Error('Invalid stock format');
            return num;
        }
        return val;
    }).optional()
});

export type UpdateProductDTO = z.infer<typeof UpdateProductDTO>;


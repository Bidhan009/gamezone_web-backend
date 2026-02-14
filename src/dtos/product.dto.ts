import z from "zod";
import { ProductSchema } from "../types/product.type";

export const CreateProductDTO = ProductSchema.extend({
    price: z.union([z.number(), z.string()]).transform((val) => {
        if (typeof val === 'string') {
            const num = parseFloat(val);
            if (isNaN(num)) throw new Error('Invalid price format');
            return num;
        }
        return val;
    }),
    stock: z.union([z.number(), z.string()]).transform((val) => {
        if (typeof val === 'string') {
            const num = parseInt(val, 10);
            if (isNaN(num)) throw new Error('Invalid stock format');
            return num;
        }
        return val;
    })
});

export type CreateProductDTO = z.infer<typeof CreateProductDTO>;

export const UpdateProductDTO = CreateProductDTO.partial();
export type UpdateProductDTO = z.infer<typeof UpdateProductDTO>;

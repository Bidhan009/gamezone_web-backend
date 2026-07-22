import z from "zod";
import sanitizeHtml from "sanitize-html";
import { ProductSchema } from "../types/product.type";

// Strips all HTML tags/scripts from user-supplied text fields before
// they are stored, as a defense-in-depth measure against stored XSS —
// even though frontend rendering currently escapes this safely, this
// prevents any future rendering change from becoming exploitable.
const sanitizeText = (val: string) =>
    sanitizeHtml(val, { allowedTags: [], allowedAttributes: {} });

// CreateProductDTO that handles FormData (strings) and converts to proper types
export const CreateProductDTO = z.object({
    name: z.string().min(1).transform(sanitizeText),
    price: z.union([z.number(), z.string()]).transform((val) => {
        if (typeof val === 'string') {
            const num = parseFloat(val);
            if (isNaN(num)) throw new Error('Invalid price format');
            return num;
        }
        return val;
    }),
    category: z.string().min(1).transform(sanitizeText),
    stock: z.union([z.number(), z.string()]).transform((val) => {
        if (typeof val === 'string') {
            const num = parseInt(val, 10);
            if (isNaN(num)) throw new Error('Invalid stock format');
            return num;
        }
        return val;
    }),
    description: z.string().min(1).transform(sanitizeText),
    imageUrl: z.string().optional()
});
export type CreateProductDTO = z.infer<typeof CreateProductDTO>;

// UpdateProductDTO for partial updates
export const UpdateProductDTO = ProductSchema.partial().extend({
    name: z.string().min(1).transform(sanitizeText).optional(),
    description: z.string().min(1).transform(sanitizeText).optional(),
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
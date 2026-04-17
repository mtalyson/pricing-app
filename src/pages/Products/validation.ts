import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(1, 'Nome do produto é obrigatório'),
  category_id: z
    .string()
    .nullable()
    .transform(v => v || null),
  profit_margin_desired: z.number().min(0),
  delivery_fee_percentage: z.number().min(0),
  fixed_costs_allowance: z.number().min(0),
});

export type ProductFormValues = z.infer<typeof productSchema>;

export const defaultProductFormValues: ProductFormValues = {
  name: '',
  category_id: null,
  profit_margin_desired: 0,
  delivery_fee_percentage: 0,
  fixed_costs_allowance: 0,
};

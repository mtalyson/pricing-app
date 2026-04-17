import { z } from 'zod';

export const ingredientSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  unit_of_measure: z.enum(['g', 'kg', 'ml', 'l', 'un']),
  purchase_price: z.number().min(0.01, 'Preço não pode ser zero'),
  purchase_quantity: z.number().min(0.01, 'Quantidade não pode ser zero'),
});

export type IngredientFormValues = z.infer<typeof ingredientSchema>;

export const defaultIngredientFormValues: IngredientFormValues = {
  name: '',
  unit_of_measure: 'g',
  purchase_price: 0,
  purchase_quantity: 0,
};

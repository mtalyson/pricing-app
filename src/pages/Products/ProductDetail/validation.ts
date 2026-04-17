import { z } from 'zod';

export const costParamsSchema = z.object({
  delivery_fee_percentage: z.number().min(0).max(100),
  fixed_costs_allowance: z.number().min(0),
  profit_margin_desired: z.number().min(0).max(100),
});

export type CostParamsValues = z.infer<typeof costParamsSchema>;

export const recipeIngredientSchema = z.object({
  ingredient_id: z.string().min(1, 'O ingrediente é obrigatório'),
  quantity_used: z.number().min(0.01, 'A quantidade deve ser maior que zero'),
});

export type RecipeIngredientFormValues = z.infer<typeof recipeIngredientSchema>;

export const defaultCostParamsValues: CostParamsValues = {
  delivery_fee_percentage: 15,
  fixed_costs_allowance: 0,
  profit_margin_desired: 30,
};

export const defaultRecipeIngredientValues: RecipeIngredientFormValues = {
  ingredient_id: '',
  quantity_used: 0,
};

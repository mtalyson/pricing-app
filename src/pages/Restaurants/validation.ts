import { z } from 'zod';

export const restaurantSchema = z.object({
  name: z
    .string()
    .min(2, 'O nome deve ter pelo menos 2 caracteres')
    .max(60, 'O nome deve ter no máximo 60 caracteres'),
});

export type RestaurantFormValues = z.infer<typeof restaurantSchema>;

export const defaultRestaurantFormValues: RestaurantFormValues = {
  name: '',
};

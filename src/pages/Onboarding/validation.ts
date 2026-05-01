import { z } from 'zod';

export const onboardingSchema = z.object({
  name: z
    .string()
    .min(2, 'O nome deve ter pelo menos 2 caracteres')
    .max(60, 'O nome deve ter no máximo 60 caracteres'),
});

export type OnboardingFormValues = z.infer<typeof onboardingSchema>;

export const defaultOnboardingValues: OnboardingFormValues = {
  name: '',
};

import { z } from 'zod';

export const loginSchema = z.object({
  email: z.email('E-mail inválido').min(1, 'E-mail é obrigatório'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const defaultLoginValues: LoginFormValues = {
  email: '',
  password: '',
};

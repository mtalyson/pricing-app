import type { Category, CategoryFormData } from '~/types/database';

export interface CategoriesState {
  categories: Category[];
  loading: boolean;
  error: string | null;
  fetch: () => Promise<void>;
  add: (data: CategoryFormData) => Promise<void>;
  update: (id: string, data: CategoryFormData) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

import type {
  Product,
  ProductFormData,
  ProductIngredient,
  ProductIngredientFormData,
} from '~/types/database';

export interface ProductsState {
  products: Product[];
  loading: boolean;
  ingredientsLoading: boolean;
  error: string | null;
  fetch: () => Promise<void>;
  add: (data: ProductFormData) => Promise<Product | null>;
  update: (id: string, data: Partial<ProductFormData>) => Promise<void>;
  remove: (id: string) => Promise<void>;
  productIngredients: ProductIngredient[];
  fetchProductIngredients: (productId: string) => Promise<void>;
  addProductIngredient: (
    productId: string,
    data: ProductIngredientFormData,
  ) => Promise<void>;
  removeProductIngredient: (id: string) => Promise<void>;
  updateProductIngredient: (id: string, quantityUsed: number) => Promise<void>;
}

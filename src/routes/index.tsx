import { createBrowserRouter, Navigate } from 'react-router-dom';

import { DashboardLayout } from '~/components/layout/DashboardLayout';
import { CategoriesPage } from '~/pages/CategoriesPage';
import { IngredientsPage } from '~/pages/IngredientsPage';
import { LoginPage } from '~/pages/LoginPage';
import { ProductDetailPage } from '~/pages/ProductDetailPage';
import { ProductsPage } from '~/pages/ProductsPage';
import { RegisterPage } from '~/pages/RegisterPage';

import { ProtectedRoute } from './ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/ingredients" replace />,
      },
      {
        path: 'ingredients',
        element: <IngredientsPage />,
      },
      {
        path: 'categories',
        element: <CategoriesPage />,
      },
      {
        path: 'products',
        element: <ProductsPage />,
      },
      {
        path: 'products/:id',
        element: <ProductDetailPage />,
      },
    ],
  },
]);

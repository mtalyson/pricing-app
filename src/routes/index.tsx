import { createBrowserRouter, Navigate } from 'react-router-dom';

import { Dashboard } from '~/components';
import {
  Categories,
  Ingredients,
  Login,
  ProductDetail,
  Products,
  Register,
} from '~/pages';

import { ProtectedRoute } from './ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/ingredients" replace />,
      },
      {
        path: 'ingredients',
        element: <Ingredients />,
      },
      {
        path: 'categories',
        element: <Categories />,
      },
      {
        path: 'products',
        element: <Products />,
      },
      {
        path: 'products/:id',
        element: <ProductDetail />,
      },
    ],
  },
]);

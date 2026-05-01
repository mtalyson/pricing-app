import { createBrowserRouter, Navigate } from 'react-router-dom';

import { Dashboard } from '~/components';
import {
  Categories,
  Ingredients,
  Login,
  Onboarding,
  ProductDetail,
  Products,
  Register,
  Restaurants,
} from '~/pages';

import { ProtectedRoute } from './ProtectedRoute';
import { RestaurantGuard } from './RestaurantGuard';

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
    path: '/onboarding',
    element: (
      <ProtectedRoute>
        <Onboarding />
      </ProtectedRoute>
    ),
  },

  {
    path: '/',
    element: (
      <ProtectedRoute>
        <RestaurantGuard>
          <Dashboard />
        </RestaurantGuard>
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
      {
        path: 'restaurants',
        element: <Restaurants />,
      },
    ],
  },
]);

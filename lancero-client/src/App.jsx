import { createBrowserRouter, RouterProvider } from 'react-router-dom'

// HomePage Structure
import Layout from './layouts/Layout';
import ProductPage from './pages/LandingPages/ProductPage';
import HomePage from './pages/LandingPages/HomePage';
import AboutPage from './pages/LandingPages/AboutPage';
import ProductListPage from './pages/LandingPages/ProductListPage';

// Auth Pages Structure
import AuthLayout from './layouts/AuthLayout';
import SignInPage from './pages/AuthPages/SignInPage';
import SignUpPage from './pages/AuthPages/SignUpPage';

// Protected Pages
import ProtectedRoute from './components/ProtectedRoute';
import ProfilePage from './pages/ProfilePage';
import AdminDashboardPage from './pages/AdminPages/AdminDashboardPage';

import NotFoundPage from './pages/NotFoundPage';
import CartPage from './pages/CartPage';
import OrdersPage from './pages/OrdersPage';

const routes = [
  {
    path: '/',
    element: <Layout />,
    errorElement: <NotFoundPage />,
    children: [
      {
        path: '',
        element: <HomePage />,
      },
      {
        path: 'about',
        element: <AboutPage />,
      },
      {
        path: 'products',
        element: <ProductListPage />,
      },
      {
        path: 'products/:name',
        element: <ProductPage />,
      },
          {
            element: <ProtectedRoute />,
            children: [
              { path: 'cart', element: <CartPage /> },
              { path: 'orders', element: <OrdersPage /> },
            ],
          },
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: 'profile',
            element: <ProfilePage />,
          },
        ],
      },
      {
        element: <ProtectedRoute requiredRole="Admin" />,
        children: [
          {
            path: 'admin',
            element: <AdminDashboardPage />,
          },
        ],
      },
    ],
  },
  {
    path: "auth/",
    element: <AuthLayout />,
    errorElement: <NotFoundPage />,
    children: [
      {
        path: "signin",
        element: <SignInPage />,
      },
      {
        path: "signup",
        element: <SignUpPage />,
      }
    ],
  },
];

const router = createBrowserRouter(routes);

function App() {
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App;
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App';
import { Login } from './pages/Login';
import { AdminProducts } from './pages/AdminProducts';
import { ProductProvider } from './context/ProductContext';
import { Carousel } from './components/Carousel';
import { ProductCard } from './components/ProductCard';
import { PrivateRoute } from './components/PrivateRoute';
// Initialize Firebase
import './config/firebase';
import { loadStoreConfig } from './config/store';
import './index.css';

// Cargar configuración de la carnicería al iniciar
loadStoreConfig().then(() => {
  console.log('✅ Configuración de carnicería cargada');
}).catch((error) => {
  console.error('❌ Error al cargar configuración:', error);
});

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <ProductProvider>
        <App />
      </ProductProvider>
    ),
    children: [
      {
        index: true,
        element: (
          <div className="flex-1 p-6">
            <Carousel />
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {/* ProductCard will be rendered using global state in App.tsx */}
              </div>
            </div>
          </div>
        )
      },
      {
        path: 'admin',
        element: <PrivateRoute />,
        children: [
          {
            path: 'productos',
            element: <AdminProducts />
          }
        ]
      }
    ]
  },
  {
    path: '/login',
    element: <Login />,
  }
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
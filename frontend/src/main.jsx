import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { Route, RouterProvider, createBrowserRouter, createRoutesFromElements, useRouteError } from 'react-router-dom'
import Layout from './Layout.jsx'
import { Home, ProtectedRoute } from './components/'
import { AddProduct, CategoryManager, Dashboard, EditProduct, Login, ProductList, Profile, QRScanner, Cart, Staff } from './components/Pages'

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path='/' element={<Layout />} errorElement={<RouteError />}>
      {/* Public Routes */}
      <Route path='' element={<Home />} />
      <Route path='login' element={<Login />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path='add-product' element={<AddProduct />} />
        <Route path='category-manager' element={<CategoryManager />} />
        <Route path='dashboard' element={<Dashboard />} />
        <Route path='edit-product/:id' element={<EditProduct />} />
        <Route path='product' element={<ProductList />} />
        <Route path='scan' element={<QRScanner />} />
        <Route path='cart' element={<Cart />} />
        <Route path='staff' element={<Staff />} />
        <Route path='profile' element={<Profile />} />
      </Route>
    </Route>

  ))

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)

function RouteError() {
  const error = useRouteError();
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="text-center">
        <h1 className="text-2xl font-semibold mb-2">Unexpected Application Error!</h1>
        <p className="text-gray-600">{error?.statusText || error?.message || '404 Not Found'}</p>
      </div>
    </div>
  );
}
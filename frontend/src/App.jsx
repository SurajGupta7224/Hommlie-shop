import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Roles from './pages/Roles';
import Permissions from './pages/Permissions';
import Profile from './pages/Profile';
import Categories from './pages/Categories';
import SubCategories from './pages/SubCategories';
import Products from './pages/Products';
import WarehouseManagement from './pages/WarehouseManagement';
import OrderBooking from './pages/OrderBooking';
import OrderManagement from './pages/OrderManagement';
import OrderDetails from './pages/OrderDetails';
import PaymentManagement from './pages/PaymentManagement';
import VendorProfile from './pages/VendorProfile';
import Unauthorized from './pages/Unauthorized';

function App() {
  const PrivateRoute = ({ children }) => {
    const isAuthenticated = localStorage.getItem('token');
    return isAuthenticated ? children : <Navigate to="/login" replace />;
  };

  const RequirePermission = ({ children, requiredPermission }) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const permissions = user.permissions || [];

    // If a specific permission is strictly required to render this view, check it
    if (requiredPermission && !permissions.includes(requiredPermission)) {
      return <Navigate to="/unauthorized" replace />;
    }

    return children;
  };

  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Protected Routes inside Layout */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <DashboardLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route
            path="users"
            element={
              <RequirePermission requiredPermission="user_management">
                <Users />
              </RequirePermission>
            }
          />
          <Route
            path="roles"
            element={
              <RequirePermission requiredPermission="role_management">
                <Roles />
              </RequirePermission>
            }
          />
          <Route
            path="permissions"
            element={
              <RequirePermission requiredPermission="permission">
                <Permissions />
              </RequirePermission>
            }
          />
          <Route
            path="profile"
            element={
              <RequirePermission requiredPermission="profile">
                <Profile />
              </RequirePermission>
            }
          />
          <Route
            path="categories"
            element={
              <RequirePermission requiredPermission="category_management">
                <Categories />
              </RequirePermission>
            }
          />
          <Route
            path="sub-categories"
            element={
              <RequirePermission requiredPermission="sub_category_management">
                <SubCategories />
              </RequirePermission>
            }
          />
          <Route 
            path="products" 
            element={
              <RequirePermission requiredPermission="product_management">
                <Products />
              </RequirePermission>
            } 
          />
          <Route 
            path="warehouse" 
            element={
              <RequirePermission requiredPermission="warehouse_management">
                <WarehouseManagement />
              </RequirePermission>
            } 
          />
          <Route 
            path="order-booking" 
            element={
              <RequirePermission requiredPermission="order_management">
                <OrderBooking />
              </RequirePermission>
            } 
          />
          <Route 
            path="order-management" 
            element={
              <RequirePermission requiredPermission="order_management">
                <OrderManagement />
              </RequirePermission>
            } 
          />
          <Route 
            path="order-management/:id" 
            element={
              <RequirePermission requiredPermission="order_management">
                <OrderDetails />
              </RequirePermission>
            } 
          />
          <Route 
            path="vendor-profile/:id" 
            element={
              <RequirePermission requiredPermission="order_management">
                <VendorProfile />
              </RequirePermission>
            } 
          />
          <Route 
            path="payment-management" 
            element={
              <RequirePermission requiredPermission="order_management">
                <PaymentManagement />
              </RequirePermission>
            } 
          />
        </Route>

        {/* Full Screen Unauthorized Error Page */}
        <Route path="/unauthorized" element={<Unauthorized />} />
      </Routes>
    </>
  );
}

export default App;

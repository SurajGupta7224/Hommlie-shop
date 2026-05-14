import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePageClient from './pages/home/HomePageClient';
import CartClient from './pages/cart/CartClient';
import ProductListingClient from './pages/product-listing/ProductListingClient';
import ProductDetailClient from './pages/product-detail/ProductDetailClient';
import CheckoutClient from './pages/checkout/CheckoutClient';
import ProfileClient from './pages/profile/ProfileClient';
import MyOrdersClient from './pages/orders/MyOrdersClient';
import OrderDetailsClient from './pages/orders/OrderDetailsClient';
import AddressesClient from './pages/addresses/AddressesClient';
import SupportClient from './pages/support/SupportClient';
import { CartProvider } from './context/CartContext';
import './styles/tailwind.css';

import FloatingCartBar from './components/FloatingCartBar';
import MobileNavbar from './components/MobileNavbar';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="min-h-screen pb-16 md:pb-0">
            <Routes>
              <Route path="/" element={<HomePageClient />} />
              <Route path="/cart" element={<CartClient />} />
              <Route path="/product-listing" element={<ProductListingClient />} />
              
              {/* Specific routes should come before general dynamic routes */}
              <Route path="/profile" element={<ProfileClient />} />
              <Route path="/my-orders" element={<MyOrdersClient />} />
              <Route path="/order-details/:orderNumber" element={<OrderDetailsClient />} />
              <Route path="/addresses" element={<AddressesClient />} />
              <Route path="/support" element={<SupportClient />} />
              <Route path="/product/:slug" element={<ProductDetailClient />} />
              <Route path="/checkout" element={<CheckoutClient />} />
              
              {/* SEO Friendly Product Detail Route - Must be last to avoid catching other 3-segment routes */}
              <Route path="/:category/:subcategory/:slug" element={<ProductDetailClient />} />
            </Routes>
            <FloatingCartBar />
            <MobileNavbar />
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;

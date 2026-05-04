import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePageClient from './pages/home/HomePageClient';
import CartClient from './pages/cart/CartClient';
import ProductListingClient from './pages/product-listing/ProductListingClient';
import ProductDetailClient from './pages/product-detail/ProductDetailClient';
import CheckoutClient from './pages/checkout/CheckoutClient';
import { CartProvider } from './context/CartContext';
import './styles/tailwind.css';

import FloatingCartBar from './components/FloatingCartBar';

function App() {
  return (
    <CartProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePageClient />} />
          <Route path="/cart" element={<CartClient />} />
          <Route path="/product-listing" element={<ProductListingClient />} />
          <Route path="/product/:id" element={<ProductDetailClient />} />
          <Route path="/checkout" element={<CheckoutClient />} />
        </Routes>
        <FloatingCartBar />
      </Router>
    </CartProvider>
  );
}

export default App;

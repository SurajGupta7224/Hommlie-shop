import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePageClient from './pages/home/HomePageClient';
import CartClient from './pages/cart/CartClient';
import ProductListingClient from './pages/product-listing/ProductListingClient';
import ProductDetailClient from './pages/product-detail/ProductDetailClient';
import { CartProvider } from './context/CartContext';
import './styles/tailwind.css';

function App() {
  return (
    <CartProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePageClient />} />
          <Route path="/cart" element={<CartClient />} />
          <Route path="/product-listing" element={<ProductListingClient />} />
          <Route path="/product/:id" element={<ProductDetailClient />} />
        </Routes>
      </Router>
    </CartProvider>
  );
}

export default App;

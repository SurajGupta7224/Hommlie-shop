import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePageClient from './pages/home/HomePageClient';
import CartClient from './pages/cart/CartClient';
import ProductListingClient from './pages/product-listing/ProductListingClient';
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
        </Routes>
      </Router>
    </CartProvider>
  );
}

export default App;

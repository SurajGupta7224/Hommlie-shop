import Navbar from './components/Navbar';
import HeroBanner from './components/HeroBanner';
import CategorySection from './components/CategorySection';
import FlashSale from './components/FlashSale';
import { NewProductsSection, NewArrivalsSection } from './components/ProductSection';
import { PromoBanner, PromoCards } from './components/PromoBanner';
import FeaturesSection from './components/FeaturesSection';
import Newsletter from './components/Newsletter';
import Footer from './components/Footer';

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar className="pt-12" />
      <main className="flex-grow">
        <HeroBanner />
        <CategorySection />
        {/* <PromoBanner /> */}
        <NewProductsSection />
        {/* <FlashSale /> */}
        <PromoCards />
        {/* <NewArrivalsSection /> */}
        <FeaturesSection />
        {/* <Newsletter /> */}
      </main>
      <Footer />
    </div>
  );
}

export default App;

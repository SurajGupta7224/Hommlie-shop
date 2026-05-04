
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import Icon from '@/components/ui/AppIcon';
import AppLogo from '@/components/ui/AppLogo';
import Footer from '@/components/Footer';

const paymentMethods = [
  { id: 'upi', name: 'UPI (GPay, PhonePe)', icon: 'BoltIcon', color: 'bg-blue-50', text: 'text-blue-600' },
  { id: 'card', name: 'Credit/Debit Card', icon: 'CreditCardIcon', color: 'bg-purple-50', text: 'text-purple-600' },
  { id: 'cod', name: 'Cash on Delivery', icon: 'BanknotesIcon', color: 'bg-green-50', text: 'text-green-600' },
];

const addresses = [
  { id: 1, type: 'Home', address: 'B-12, Green Park, Koramangala, Bengaluru - 560034', isDefault: true },
  { id: 2, type: 'Office', address: '4th Floor, Tech Hub, HSR Layout, Bengaluru - 560102', isDefault: false },
];

export default function CheckoutClient() {
  const { items, getTotalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [selectedAddress, setSelectedAddress] = useState(addresses[0].id);
  const [selectedPayment, setSelectedPayment] = useState(paymentMethods[0].id);
  const [isPlacing, setIsPlacing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const totalPrice = getTotalPrice();
  const deliveryFee = totalPrice < 199 ? 30 : 0;
  const platformFee = 5;
  const finalAmount = totalPrice + deliveryFee + platformFee;

  const handlePlaceOrder = () => {
    setIsPlacing(true);
    // Mock processing
    setTimeout(() => {
      setIsPlacing(false);
      setShowSuccess(true);
      clearCart();
    }, 2000);
  };

  if (items.length === 0 && !showSuccess) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h2 className="text-xl font-bold mb-4">No items to checkout</h2>
        <Link to="/" className="text-primary font-bold hover:underline">Go back to shopping</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-10">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-full bg-muted hover:bg-border transition-colors">
              <Icon name="ArrowLeftIcon" size={18} />
            </button>
            <h1 className="text-base font-bold text-foreground">Checkout</h1>
          </div>
          <div className="flex items-center gap-2">
            <AppLogo size={24} />
            <span className="text-sm font-black text-foreground hidden sm:block">Hommlie Shop</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Left: Details (2 columns) */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Delivery Address Section */}
            <section className="bg-white rounded-[2rem] p-6 shadow-sm border border-border">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Icon name="MapPinIcon" size={20} className="text-primary" variant="solid" />
                  <h2 className="text-base font-black text-foreground">Delivery Address</h2>
                </div>
                <button className="text-xs font-bold text-primary hover:underline">+ Add New</button>
              </div>
              <div className="space-y-3">
                {addresses.map((addr) => (
                  <div 
                    key={addr.id}
                    onClick={() => setSelectedAddress(addr.id)}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${selectedAddress === addr.id ? 'border-primary bg-primary/5' : 'border-gray-50 bg-gray-50'}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">{addr.type}</span>
                      {selectedAddress === addr.id && <Icon name="CheckCircleIcon" size={18} className="text-primary" variant="solid" />}
                    </div>
                    <p className="text-sm font-bold text-foreground leading-relaxed">{addr.address}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Payment Method Section */}
            <section className="bg-white rounded-[2rem] p-6 shadow-sm border border-border">
              <div className="flex items-center gap-2 mb-4">
                <Icon name="CreditCardIcon" size={20} className="text-primary" variant="solid" />
                <h2 className="text-base font-black text-foreground">Payment Method</h2>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {paymentMethods.map((pm) => (
                  <div 
                    key={pm.id}
                    onClick={() => setSelectedPayment(pm.id)}
                    className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer ${selectedPayment === pm.id ? 'border-primary bg-primary/5' : 'border-gray-50 hover:bg-gray-100'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 ${pm.color} rounded-xl flex items-center justify-center`}>
                        <Icon name={pm.icon as any} size={20} className={pm.text} />
                      </div>
                      <span className="text-sm font-bold text-foreground">{pm.name}</span>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedPayment === pm.id ? 'border-primary bg-primary' : 'border-gray-300'}`}>
                      {selectedPayment === pm.id && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right: Summary (1 column) */}
          <div className="space-y-6">
            <section className="bg-white rounded-[2rem] p-6 shadow-sm border border-border sticky top-24">
              <h2 className="text-base font-black text-foreground mb-4">Bill Details</h2>
              <div className="space-y-3 pb-4 border-b border-gray-100">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground font-medium">Item Total</span>
                  <span className="font-bold text-foreground">₹{totalPrice}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground font-medium">Delivery Fee</span>
                  <span className={`font-bold ${deliveryFee === 0 ? 'text-success' : 'text-foreground'}`}>
                    {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground font-medium">Platform Fee</span>
                  <span className="font-bold text-foreground">₹{platformFee}</span>
                </div>
              </div>
              <div className="flex justify-between items-center pt-4 mb-6">
                <span className="text-base font-black text-foreground">Total Pay</span>
                <span className="text-xl font-black text-primary">₹{finalAmount}</span>
              </div>

              <button 
                onClick={handlePlaceOrder}
                disabled={isPlacing}
                className={`w-full py-4 rounded-2xl font-black text-base shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 ${isPlacing ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-primary text-white hover:bg-primary/90 shadow-primary/20'}`}
              >
                {isPlacing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    Placing Order...
                  </>
                ) : (
                  <>
                    Place Order
                    <Icon name="ArrowRightIcon" size={18} />
                  </>
                )}
              </button>
              
              <div className="mt-4 p-3 bg-secondary/50 rounded-xl flex items-start gap-2">
                <Icon name="ShieldCheckIcon" size={16} className="text-primary mt-0.5" variant="solid" />
                <p className="text-[10px] font-bold text-primary/80 leading-relaxed uppercase tracking-wide">
                  Safe & Secure Payments. 100% Authentic products.
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Success Modal Overlay */}
      {showSuccess && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] w-full max-w-sm p-8 text-center animate-in zoom-in duration-300">
            <div className="w-24 h-24 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <div className="w-16 h-16 bg-success rounded-full flex items-center justify-center text-white shadow-lg shadow-success/30 animate-bounce">
                <Icon name="CheckIcon" size={32} strokeWidth={3} />
              </div>
            </div>
            <h2 className="text-2xl font-black text-foreground mb-2">Order Placed!</h2>
            <p className="text-sm text-muted-foreground font-medium mb-8">
              Your order #HJ-{Math.floor(Math.random()*10000)} has been placed successfully and will arrive in 10 minutes.
            </p>
            <div className="space-y-3">
              <button 
                onClick={() => navigate('/')}
                className="w-full py-4 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95"
              >
                Track Order
              </button>
              <button 
                onClick={() => navigate('/')}
                className="w-full py-4 bg-gray-50 text-foreground font-black rounded-2xl hover:bg-gray-100 transition-all active:scale-95"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="hidden md:block mt-12">
        <Footer />
      </div>
    </div>
  );
}

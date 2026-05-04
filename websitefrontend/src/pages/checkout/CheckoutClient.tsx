
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import Icon from '@/components/ui/AppIcon';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';

const paymentMethods = [
  { id: 'upi', name: 'UPI', description: 'Google Pay, PhonePe, Paytm', icon: 'BoltIcon', color: 'bg-primary/5', text: 'text-primary' },
  { id: 'card', name: 'Cards', description: 'Credit, Debit & ATM Cards', icon: 'CreditCardIcon', color: 'bg-primary/5', text: 'text-primary' },
  { id: 'cod', name: 'Cash on Delivery', description: 'Pay at your doorstep', icon: 'BanknotesIcon', color: 'bg-primary/5', text: 'text-primary' },
];

const addresses = [
  { id: 1, type: 'Home', address: 'B-12, Green Park, Koramangala, Bengaluru', landmark: 'Near Central Mall', pin: '560034', isDefault: true },
  { id: 2, type: 'Office', address: '4th Floor, Tech Hub, HSR Layout, Bengaluru', landmark: 'Opposite Metro Station', pin: '560102', isDefault: false },
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
  const discount = totalPrice > 500 ? 50 : 0;
  const finalAmount = totalPrice + deliveryFee + platformFee - discount;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handlePlaceOrder = () => {
    setIsPlacing(true);
    setTimeout(() => {
      setIsPlacing(false);
      setShowSuccess(true);
      clearCart();
    }, 2000);
  };

  if (items.length === 0 && !showSuccess) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-3xl font-semibold text-foreground mb-4">Your cart is empty</h2>
        <Link to="/" className="text-primary text-xl font-semibold hover:underline">Start Shopping</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F4F7]">
      <Header title="Checkout" showBack={true} />

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Left Column: Address & Payment */}
          <div className="flex-1 space-y-4 w-full">
            {/* Delivery Address */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Delivery Address</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                  <div 
                    key={addr.id}
                    onClick={() => setSelectedAddress(addr.id)}
                    className={`flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer ${selectedAddress === addr.id ? 'border-primary bg-primary/5' : 'border-gray-100 bg-white'}`}
                  >
                    <div className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedAddress === addr.id ? 'border-primary bg-primary' : 'border-gray-300'}`}>
                      {selectedAddress === addr.id && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Icon name={addr.type === 'Home' ? 'HomeIcon' : 'BuildingOfficeIcon'} size={16} className="text-gray-500" />
                        <span className="text-sm font-semibold text-gray-800">{addr.type}</span>
                      </div>
                      <p className="text-sm text-gray-600 leading-snug">{addr.address}, {addr.landmark}, {addr.pin}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 py-3 text-primary text-sm font-semibold border border-primary/20 rounded-xl hover:bg-primary/5 transition-colors">
                + Add New Address
              </button>
            </div>

            {/* Payment Methods */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Options</h2>
              <div className="space-y-2">
                {paymentMethods.map((pm) => (
                  <div 
                    key={pm.id}
                    onClick={() => setSelectedPayment(pm.id)}
                    className={`flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer ${selectedPayment === pm.id ? 'border-primary bg-primary/5' : 'border-gray-100 bg-white'}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 ${pm.color} rounded-lg flex items-center justify-center`}>
                        <Icon name={pm.icon as any} size={20} className={pm.text} />
                      </div>
                      <div>
                        <span className="block text-sm font-semibold text-gray-800">{pm.name}</span>
                        <span className="block text-xs text-gray-500">{pm.description}</span>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedPayment === pm.id ? 'border-primary bg-primary' : 'border-gray-300'}`}>
                      {selectedPayment === pm.id && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Bill Details (Sticky) */}
          <div className="w-full lg:w-[380px] space-y-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm sticky top-24">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Bill Details</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Item Total</span>
                  <span className="text-gray-800">₹{totalPrice}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span className={deliveryFee === 0 ? 'text-green-600' : 'text-gray-800'}>
                    {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Handling Fee</span>
                  <span className="text-gray-800">₹{platformFee}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600">Promo Discount</span>
                    <span className="text-green-600">-₹{discount}</span>
                  </div>
                )}
                <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-base font-semibold text-gray-900">Total Bill</span>
                  <span className="text-xl font-semibold text-gray-900">₹{finalAmount}</span>
                </div>
              </div>

              <div className="mt-6 hidden md:block">
                <button 
                  onClick={handlePlaceOrder}
                  disabled={isPlacing}
                  className={`w-full h-14 bg-primary text-white rounded-xl text-lg font-semibold transition-all active:scale-95 flex items-center justify-center gap-2 ${isPlacing ? 'opacity-70 cursor-not-allowed' : 'hover:bg-primary/90 shadow-lg shadow-primary/20'}`}
                >
                  {isPlacing ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      Pay ₹{finalAmount}
                      <Icon name="ArrowRightIcon" size={20} />
                    </>
                  )}
                </button>
              </div>

              {/* Safe Badge */}
              <div className="flex items-center justify-center gap-2 mt-4">
                <Icon name="ShieldCheckIcon" size={14} className="text-gray-400" />
                <span className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">100% Safe Payments</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-sm p-8 text-center animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Icon name="CheckIcon" size={40} className="text-green-600" strokeWidth={3} />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Order Confirmed!</h2>
            <p className="text-sm text-gray-500 mb-8">Your order will be delivered in 10 minutes.</p>
            <div className="space-y-3">
              <button onClick={() => navigate('/')} className="w-full py-4 bg-primary text-white font-semibold rounded-xl transition-all active:scale-95">
                Track Order
              </button>
              <button onClick={() => navigate('/')} className="w-full py-4 bg-gray-50 text-gray-700 font-semibold rounded-xl transition-all active:scale-95">
                Back to Home
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Sticky Pay Button */}
      {!showSuccess && (
        <div className="md:hidden fixed bottom-16 left-0 right-0 z-30 max-w-lg mx-auto px-4 pb-4 slide-up">
          <button 
            onClick={handlePlaceOrder}
            disabled={isPlacing}
            className={`w-full h-14 bg-primary text-white rounded-2xl text-lg font-bold shadow-lg shadow-primary/30 flex items-center justify-between px-6 transition-all active:scale-[0.98] ${isPlacing ? 'opacity-70' : ''}`}
          >
            <div className="flex flex-col items-start">
              <span className="text-[10px] text-white/70 uppercase tracking-widest leading-none mb-1">Total to Pay</span>
              <span className="text-xl leading-none">₹{finalAmount}</span>
            </div>
            <div className="flex items-center gap-2">
              {isPlacing ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Place Order</span>
                  <Icon name="ArrowRightIcon" size={20} />
                </>
              )}
            </div>
          </button>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden">
        <BottomNav active="cart" />
      </div>

      {/* Footer added back */}
      <Footer />
    </div>
  );
}

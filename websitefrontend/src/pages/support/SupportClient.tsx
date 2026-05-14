import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Icon from '@/components/ui/AppIcon';

export default function SupportClient() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header title="Help & Support" showBack />
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 md:px-8 py-8">
        
        <div className="bg-primary/5 rounded-3xl p-8 text-center mb-8 border border-primary/10">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-primary">
            <Icon name="ChatBubbleLeftRightIcon" size={32} />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-2">How can we help you?</h2>
          <p className="text-slate-500 text-sm max-w-md mx-auto">
            If you have an issue with an order or need help with your account, our support team is available 24/7.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
          <a href="tel:18001234567" className="bg-white border border-slate-100 hover:border-primary hover:shadow-md transition-all p-6 rounded-3xl flex flex-col items-center text-center group cursor-pointer">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Icon name="PhoneIcon" size={24} />
            </div>
            <h3 className="font-bold text-slate-800">Call Us</h3>
            <p className="text-xs text-slate-500 mt-1 mb-2">1800-123-4567</p>
            <span className="text-xs font-bold text-primary mt-auto">Available 24/7</span>
          </a>
          
          <a href="mailto:support@hommlieshop.com" className="bg-white border border-slate-100 hover:border-primary hover:shadow-md transition-all p-6 rounded-3xl flex flex-col items-center text-center group cursor-pointer">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Icon name="EnvelopeIcon" size={24} />
            </div>
            <h3 className="font-bold text-slate-800">Email Support</h3>
            <p className="text-xs text-slate-500 mt-1 mb-2">support@hommlieshop.com</p>
            <span className="text-xs font-bold text-primary mt-auto">Replies in 2 hrs</span>
          </a>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Icon name="QuestionMarkCircleIcon" size={20} className="text-primary" /> 
            Frequently Asked Questions
          </h3>
          <div className="space-y-4">
            <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50">
              <h4 className="font-semibold text-slate-800 text-sm mb-1">Where is my order?</h4>
              <p className="text-xs text-slate-600">You can track your order status in the "My Orders" section of your profile.</p>
            </div>
            <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50">
              <h4 className="font-semibold text-slate-800 text-sm mb-1">How do I return an item?</h4>
              <p className="text-xs text-slate-600">Items can be returned within 7 days of delivery if they are unopened and unused.</p>
            </div>
          </div>
        </div>

      </main>
      <Footer />
    </div>
  );
}

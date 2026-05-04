
import { useState } from 'react';
import Icon from './ui/AppIcon';
import AppLogo from './ui/AppLogo';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [phone, setPhone] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-sm md:max-w-2xl bg-white rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col md:flex-row animate-in zoom-in duration-300">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-[110] w-9 h-9 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white md:text-gray-500 transition-colors"
        >
          <Icon name="XMarkIcon" size={20} />
        </button>

        {/* Left Side: Brand & Input */}
        <div className="flex-1 bg-primary p-7 md:p-10 flex flex-col justify-center text-white relative overflow-hidden">
          {/* Vibrant background accents */}
          <div className="absolute -top-12 -left-12 w-48 h-48 bg-white/20 rounded-full blur-2xl animate-pulse" />
          <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-secondary/30 rounded-full blur-2xl animate-pulse delay-700" />

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
                <AppLogo size={24} />
              </div>
              <span className="text-xl font-black tracking-tight">Hommlie Shop</span>
            </div>

            <h2 className="text-2xl md:text-3xl font-black leading-tight mb-6">
              Shop Smarter <br />
              <span className="text-white/80 italic text-xl md:text-2xl">Save Bigger Every Day</span>
            </h2>

            <div className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-white/70 ml-1">Phone Number</label>
                <div className="flex items-center gap-3 bg-white rounded-2xl p-1.5 border border-white/20 focus-within:ring-4 focus-within:ring-white/30 transition-all">
                  <div className="flex items-center gap-1.5 px-3 py-2 border-r border-gray-100">
                    <span className="text-sm font-bold text-gray-900">+91</span>
                    <Icon name="ChevronDownIcon" size={12} className="text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    autoFocus
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="Enter 10 digit number"
                    style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
                    className="flex-1 bg-transparent text-gray-900 font-bold placeholder:text-gray-300 px-2"
                  />
                </div>
              </div>

              <button
                className={`w-full py-4 rounded-2xl font-black text-base transition-all active:scale-95 shadow-xl ${phone.length === 10 ? 'bg-white text-primary hover:bg-gray-100' : 'bg-white/20 text-white/50 cursor-not-allowed'}`}
                disabled={phone.length !== 10}
              >
                Get OTP
              </button>

              <p className="text-[9px] text-white/60 text-center leading-relaxed">
                By logging in, you agree to our <br />
                <span className="underline cursor-pointer font-bold">Terms</span> & <span className="underline cursor-pointer font-bold">Privacy</span>
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Visual Accent (Desktop only) */}
        <div className="hidden md:flex w-72 bg-gray-50 p-8 flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-secondary/30 pointer-events-none" />
          <div className="relative z-10">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-3xl mb-4 shadow-primary/20 shadow-lg">
              🚀
            </div>
            <h3 className="text-lg font-black text-gray-900 mb-1">Fastest Delivery</h3>
            <p className="text-[11px] text-gray-500 font-bold mb-6">to your doorstep</p>

            <div className="space-y-2">
              <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-border shadow-sm">
                <div className="w-6 h-6 bg-green-50 rounded-lg flex items-center justify-center">🥦</div>
                <div className="h-1.5 w-12 bg-gray-100 rounded-full" />
              </div>
              <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-border shadow-sm ml-4">
                <div className="w-6 h-6 bg-red-50 rounded-lg flex items-center justify-center">🍎</div>
                <div className="h-1.5 w-12 bg-gray-100 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

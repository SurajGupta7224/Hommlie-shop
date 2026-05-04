
import { useState, useEffect, useRef } from 'react';
import Icon from './ui/AppIcon';
import AppLogo from './ui/AppLogo';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(30);
  const [isLoading, setIsLoading] = useState(false);
  
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    let interval: any;
    if (step === 'otp' && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  useEffect(() => {
    if (!isOpen) {
      setStep('phone');
      setPhone('');
      setOtp(['', '', '', '', '', '']);
      setTimer(30);
    }
  }, [isOpen]);

  const handleGetOtp = () => {
    setIsLoading(true);
    // Mock API call
    setTimeout(() => {
      setIsLoading(false);
      setStep('otp');
      setTimer(30);
    }, 1000);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value[value.length - 1];
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  if (!isOpen) return null;

  const isOtpComplete = otp.every(digit => digit !== '');

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
          className="absolute top-4 right-4 z-[110] w-9 h-9 rounded-full bg-white/10 md:bg-white/20 hover:bg-black/5 md:hover:bg-white/40 flex items-center justify-center text-white md:text-gray-500 transition-colors"
        >
          <Icon name="XMarkIcon" size={20} />
        </button>

        {/* Left Side: Brand & Input */}
        <div className="flex-1 bg-primary pl-10 pr-8 md:pl-16 md:pr-12 py-10 flex flex-col justify-center text-white relative overflow-hidden">
          {/* Vibrant background accents */}
          <div className="absolute -top-12 -left-12 w-48 h-48 bg-white/20 rounded-full blur-2xl animate-pulse" />
          <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-secondary/30 rounded-full blur-2xl animate-pulse delay-700" />

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
                <AppLogo size={24} />
              </div>
              <span className="text-xl font-black tracking-tight">Hommlie Shop</span>
            </div>

            {step === 'phone' ? (
              <div className="animate-in fade-in duration-500">
                <h2 className="text-xl md:text-2xl font-black leading-tight mb-6">
                  Shop Smarter <br />
                  <span className="text-white/80 italic text-lg md:text-xl">Save Bigger Every Day</span>
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
                        className="flex-1 bg-transparent text-gray-900 font-bold placeholder:text-gray-300 px-2 outline-none border-none focus:ring-0"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleGetOtp}
                    disabled={phone.length !== 10 || isLoading}
                    className={`w-full py-4 rounded-2xl font-black text-base transition-all active:scale-95 shadow-xl flex items-center justify-center gap-2 ${phone.length === 10 ? 'bg-white text-primary hover:bg-gray-100' : 'bg-white/20 text-white/50 cursor-not-allowed'}`}
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    ) : (
                      'Get OTP'
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="animate-in fade-in duration-500">
                <button 
                  onClick={() => setStep('phone')}
                  className="flex items-center gap-1 text-xs font-bold text-white/70 hover:text-white mb-4 transition-colors"
                >
                  <Icon name="ArrowLeftIcon" size={14} />
                  Change Number (+91 {phone})
                </button>
                <h2 className="text-xl md:text-2xl font-black leading-tight mb-2">
                  Verify OTP
                </h2>
                <p className="text-sm text-white/70 mb-8 font-medium">Sent to +91 {phone}</p>

                <div className="space-y-6">
                  <div className="flex justify-between gap-2">
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        ref={el => { otpRefs.current[i] = el; }}
                        type="tel"
                        maxLength={1}
                        value={digit}
                        autoFocus={i === 0}
                        onChange={e => handleOtpChange(i, e.target.value)}
                        onKeyDown={e => handleKeyDown(i, e)}
                        className="w-10 h-12 md:w-12 md:h-14 bg-white/20 border border-white/30 rounded-xl text-center text-xl font-black text-white placeholder:text-white/30 outline-none focus:ring-2 focus:ring-white/50 transition-all"
                      />
                    ))}
                  </div>

                  <button
                    disabled={!isOtpComplete || isLoading}
                    className={`w-full py-4 rounded-2xl font-black text-base transition-all active:scale-95 shadow-xl flex items-center justify-center gap-2 ${isOtpComplete ? 'bg-white text-primary hover:bg-gray-100' : 'bg-white/20 text-white/50 cursor-not-allowed'}`}
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    ) : (
                      'Verify & Login'
                    )}
                  </button>

                  <div className="text-center">
                    {timer > 0 ? (
                      <p className="text-xs font-bold text-white/60">Resend OTP in <span className="text-white">0:{timer.toString().padStart(2, '0')}</span></p>
                    ) : (
                      <button onClick={handleGetOtp} className="text-xs font-black text-white hover:underline">Resend OTP</button>
                    )}
                  </div>
                </div>
              </div>
            )}

            <p className="mt-8 text-[9px] text-white/60 text-center leading-relaxed">
              By logging in, you agree to our <br />
              <span className="underline cursor-pointer font-bold">Terms</span> & <span className="underline cursor-pointer font-bold">Privacy</span>
            </p>
          </div>
        </div>

        {/* Right Side: Visual Accent (Desktop only) */}
        <div className="hidden md:flex w-72 bg-gray-50 p-8 flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-secondary/30 pointer-events-none" />
          <div className="relative z-10">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-3xl mb-4 shadow-primary/20 shadow-lg animate-bounce duration-1000">
              🚀
            </div>
            <h3 className="text-lg font-black text-gray-900 mb-1">Fastest Delivery</h3>
            <p className="text-[11px] text-gray-500 font-bold mb-6">to your doorstep</p>

            <div className="space-y-2">
              <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-border shadow-sm animate-in slide-in-from-right duration-500 delay-100">
                <div className="w-6 h-6 bg-green-50 rounded-lg flex items-center justify-center">🥦</div>
                <div className="h-1.5 w-12 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full w-2/3 bg-primary/40" />
                </div>
              </div>
              <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-border shadow-sm ml-4 animate-in slide-in-from-right duration-500 delay-300">
                <div className="w-6 h-6 bg-red-50 rounded-lg flex items-center justify-center">🍎</div>
                <div className="h-1.5 w-12 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full w-1/3 bg-primary/40" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

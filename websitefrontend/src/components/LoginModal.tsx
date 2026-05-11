
import { useState, useEffect } from 'react';
import Icon from './ui/AppIcon';
import AppLogo from './ui/AppLogo';
import api from '@/api';
import toast from 'react-hot-toast';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [step, setStep] = useState<'phone' | 'otp' | 'name'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [userId, setUserId] = useState<number | null>(null);
  const [timer, setTimer] = useState(30);
  const [isLoading, setIsLoading] = useState(false);

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
      setOtp('');
      setName('');
      setUserId(null);
      setTimer(30);
    }
  }, [isOpen]);

  const handleGetOtp = async () => {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/login', { mobile: phone });
      if (res.data.status === 1) {
        setStep('otp');
        setTimer(30);
        toast.success('OTP sent successfully');
      } else {
        toast.error(res.data.message || 'Failed to send OTP');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error sending OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (value: string) => {
    if (!/^\d*$/.test(value)) return;
    setOtp(value.slice(0, 4));
  };

  const handleVerifyOtp = async () => {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/verify-otp', { 
        mobile: phone, 
        otp: otp 
      });
      if (res.data.status === 1) {
        // Check if user is new (no name)
        if (!res.data.user_name) {
          setUserId(res.data.user_id);
          setStep('name');
          toast.success('OTP verified! Please enter your name');
        } else {
          // Existing user - complete login
          localStorage.setItem('token', res.data.token);
          localStorage.setItem('user', JSON.stringify({
            id: res.data.user_id,
            name: res.data.user_name,
            mobile: res.data.mobile
          }));
          onClose();
          window.location.reload();
        }
      } else {
        toast.error(res.data.message || 'Invalid OTP');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error verifying OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveName = async () => {
    if (!name.trim()) {
      toast.error('Please enter your name');
      return;
    }
    setIsLoading(true);
    try {
      const res = await api.post('/auth/update-profile', { 
        user_id: userId, 
        name: name.trim() 
      });
      if (res.data.status === 1) {
        toast.success('Login successful! Welcome to Hommlie Shop');
        // Refresh page to update auth state
        window.location.reload();
      } else {
        toast.error(res.data.message || 'Failed to update profile');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error updating profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/resend-otp', { mobile: phone });
      if (res.data.status === 1) {
        setTimer(30);
        toast.success('OTP resent successfully');
      } else {
        toast.error(res.data.message || 'Failed to resend OTP');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error resending OTP');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const isOtpComplete = otp.length === 4;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-50 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <Icon name="XMarkIcon" size={16} className="text-gray-600" />
        </button>

        <div className="flex flex-col md:flex-row">
          {/* Left Side: Brand */}
          <div className="hidden md:flex md:w-80 bg-primary p-8 flex-col justify-between text-white relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-purple-700" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <AppLogo size={24} />
                </div>
                <span className="text-xl font-bold tracking-tight">Hommlie Shop</span>
              </div>
              <h2 className="text-3xl font-bold leading-tight mb-4">
                Welcome Back
              </h2>
              <p className="text-white/70 text-sm leading-relaxed">
                Sign in to access your orders, saved addresses, and exclusive deals.
              </p>
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 text-sm text-white/60">
                <Icon name="ShieldCheckIcon" size={16} />
                <span>Secure & encrypted</span>
              </div>
            </div>
          </div>

          {/* Right Side: Form */}
          <div className="flex-1 p-8 md:p-10">
            <div className="md:hidden flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <AppLogo size={20} />
              </div>
              <span className="text-lg font-bold text-gray-900">Hommlie Shop</span>
            </div>

            {step === 'phone' && (
              <div className="animate-in fade-in duration-300">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Sign In</h3>
                <p className="text-sm text-gray-500 mb-6">Enter your phone number to continue</p>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <div className="flex items-center gap-0 border border-gray-300 rounded-xl px-4 py-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all bg-gray-50">
                      <span className="text-gray-700 font-semibold pr-3 border-r border-gray-300">+91</span>
                      <input
                        type="tel"
                        value={phone}
                        autoFocus
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        placeholder="Enter 10 digit number"
                        className="flex-1 bg-transparent text-gray-900 font-semibold placeholder:text-gray-400 pl-3 outline-none border-none focus:ring-0"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleGetOtp}
                    disabled={phone.length !== 10 || isLoading}
                    className={`w-full py-3.5 rounded-xl font-semibold text-base transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${phone.length === 10 ? 'bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/25' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      'Send OTP'
                    )}
                  </button>
                </div>
              </div>
            )}

            {step === 'otp' && (
              <div className="animate-in fade-in duration-300">
                <button 
                  onClick={() => setStep('phone')}
                  className="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-700 mb-4 transition-colors"
                >
                  <Icon name="ArrowLeftIcon" size={14} />
                  Back
                </button>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Verify OTP</h3>
                <p className="text-sm text-gray-500 mb-6">Code sent to <span className="font-semibold text-gray-700">+91 {phone}</span></p>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Enter OTP</label>
                    <input
                      type="tel"
                      maxLength={4}
                      value={otp}
                      autoFocus
                      onChange={e => handleOtpChange(e.target.value)}
                      placeholder="0000"
                      className="w-full border border-gray-300 rounded-xl px-4 py-3.5 text-center text-2xl font-bold text-gray-900 placeholder:text-gray-300 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all bg-gray-50 tracking-[0.5em]"
                    />
                  </div>

                  <button
                    onClick={handleVerifyOtp}
                    disabled={!isOtpComplete || isLoading}
                    className={`w-full py-3.5 rounded-xl font-semibold text-base transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${isOtpComplete ? 'bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/25' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      'Verify & Login'
                    )}
                  </button>

                  <div className="text-center pt-2">
                    {timer > 0 ? (
                      <p className="text-sm text-gray-500">Resend code in <span className="font-semibold text-gray-700">0:{timer.toString().padStart(2, '0')}</span></p>
                    ) : (
                      <button onClick={handleResendOtp} className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors">Resend OTP</button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {step === 'name' && (
              <div className="animate-in fade-in duration-300">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Almost Done</h3>
                <p className="text-sm text-gray-500 mb-6">Please enter your name to complete registration</p>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      autoFocus
                      onChange={e => setName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full border border-gray-300 rounded-xl px-4 py-3.5 text-lg font-semibold text-gray-900 placeholder:text-gray-300 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all bg-gray-50"
                    />
                  </div>

                  <button
                    onClick={handleSaveName}
                    disabled={!name.trim() || isLoading}
                    className={`w-full py-3.5 rounded-xl font-semibold text-base transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${name.trim() ? 'bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/25' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      'Complete Registration'
                    )}
                  </button>
                </div>
              </div>
            )}

            <p className="mt-6 text-xs text-gray-400 text-center">
              By continuing, you agree to our <span className="text-primary font-medium cursor-pointer">Terms of Service</span> and <span className="text-primary font-medium cursor-pointer">Privacy Policy</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

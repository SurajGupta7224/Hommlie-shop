import { useState } from 'react';
import { FiMail, FiArrowRight, FiCheck } from 'react-icons/fi';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email.trim()) { setSent(true); setEmail(''); }
  };

  return (
    <section
      id="newsletter"
      className="py-16 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, var(--primary) 0%, #9B8BFF 50%, var(--secondary) 100%)' }}
    >
      {/* Decorative blobs */}
      <div className="absolute top-0 left-0 w-64 h-64 rounded-full opacity-10"
        style={{ background: 'white', transform: 'translate(-40%, -40%)' }} />
      <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full opacity-10"
        style={{ background: 'white', transform: 'translate(30%, 40%)' }} />

      <div className="container-main relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Left */}
          <div className="text-white max-w-md">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">✉️</span>
              <span className="text-xs font-bold uppercase tracking-widest opacity-80">Newsletter</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-3 leading-tight">
              Join our newsletter for £10 offs
            </h2>
            <p className="text-sm opacity-80 leading-relaxed">
              Register now to get latest updates on promotions &amp; coupons.
              Don't worry, we not spam!
            </p>
          </div>

          {/* Right — form */}
          <div className="w-full md:w-auto md:min-w-[420px]">
            {sent ? (
              <div className="flex items-center gap-3 bg-white bg-opacity-20 rounded-2xl px-6 py-5 text-white">
                <div className="w-10 h-10 rounded-full bg-white bg-opacity-30 flex items-center justify-center">
                  <FiCheck size={20} className="text-white" />
                </div>
                <div>
                  <p className="font-bold">You're subscribed! 🎉</p>
                  <p className="text-xs opacity-80 mt-0.5">Check your inbox for your £10 coupon.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex gap-3" id="newsletter-form">
                <div className="flex-1 relative">
                  <FiMail
                    className="absolute left-4 top-1/2 -translate-y-1/2 opacity-50"
                    size={16}
                    color="white"
                  />
                  <input
                    id="newsletter-email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    required
                    className="w-full pl-11 pr-4 py-3.5 text-sm outline-none rounded-xl"
                    style={{
                      background: 'rgba(255,255,255,0.15)',
                      border: '1.5px solid rgba(255,255,255,0.3)',
                      color: 'white',
                      fontFamily: 'var(--font-family)',
                    }}
                  />
                </div>
                <button
                  type="submit"
                  id="newsletter-submit"
                  className="px-6 py-3.5 font-bold text-sm rounded-xl flex items-center gap-2 transition-all hover:scale-105 active:scale-95 shrink-0"
                  style={{ background: 'white', color: 'var(--primary)', fontFamily: 'var(--font-family)' }}
                >
                  SEND <FiArrowRight size={16} />
                </button>
              </form>
            )}
            <p className="text-[11px] mt-2.5 opacity-60 text-white text-center">
              By subscribing you agree to our{' '}
              <a href="#" className="underline">Terms &amp; Conditions</a> and{' '}
              <a href="#" className="underline">Privacy &amp; Cookies Policy</a>.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

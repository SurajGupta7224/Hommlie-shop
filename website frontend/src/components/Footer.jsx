import { FiPhone, FiMail, FiMapPin, FiFacebook, FiTwitter, FiInstagram, FiLinkedin } from 'react-icons/fi';

const footerLinks = {
  'Do You Need Help?': null, // handled separately
  'Make Money with Us': [
    'Sell on Grogin',
    'Sell Your Services on Grogin',
    'Sell on Grogin Business',
    'Sell Your Apps on Grogin',
    'Advertise Your Products',
    'Sell-Publish with Us',
    'Become a Blowwe Vendor',
  ],
  'Let Us Help You': [
    'Accessibility Statement',
    'Your Orders',
    'Returns & Replacements',
    'Shipping Rates & Policies',
    'Refund and Returns Policy',
    'Privacy Policy',
    'Terms and Conditions',
    'Cookie Settings',
    'Help Center',
  ],
  'Get to Know Us': [
    'Careers for Grogin',
    'About Grogin',
    'Investror Relations',
    'Grogin Devices',
    'Customer reviews',
    'Social Responsibility',
    'Store Locations',
  ],
};

const paymentIcons = ['💳', '🏦', '📱', '🔐', '💰'];

export default function Footer() {
  return (
    <footer id="footer" style={{ background: 'var(--text-primary)', color: 'white' }}>
      {/* Main footer grid */}
      <div className="container-main py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Column 1 — Help / Contact */}
          <div className="lg:col-span-1">
            <h4 className="font-bold text-sm mb-5 text-white">Do You Need Help?</h4>
            <p className="text-xs leading-relaxed mb-5" style={{ color: '#B2BEC3' }}>
              Our support team is available Monday – Friday, 8am – 9pm to assist you with any questions.
            </p>
            <div className="flex flex-col gap-4">
              <a
                href="tel:08003000353"
                id="footer-phone"
                className="flex items-center gap-3 group"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all group-hover:scale-110"
                  style={{ background: 'rgba(108,92,231,0.2)' }}
                >
                  <FiPhone size={16} style={{ color: 'var(--primary-light)' }} />
                </div>
                <div>
                  <p className="text-[10px]" style={{ color: '#B2BEC3' }}>Monday–Friday, 08am–9pm</p>
                  <p className="text-sm font-bold text-white">0 800 300-353</p>
                </div>
              </a>
              <a
                href="mailto:info@example.com"
                id="footer-email"
                className="flex items-center gap-3 group"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all group-hover:scale-110"
                  style={{ background: 'rgba(0,184,148,0.2)' }}
                >
                  <FiMail size={16} style={{ color: '#81ECEC' }} />
                </div>
                <div>
                  <p className="text-[10px]" style={{ color: '#B2BEC3' }}>Need help with your order?</p>
                  <p className="text-sm font-bold text-white">info@example.com</p>
                </div>
              </a>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks)
            .filter(([k]) => k !== 'Do You Need Help?')
            .map(([title, links]) => (
              <div key={title}>
                <h4 className="font-bold text-sm mb-5 text-white">{title}</h4>
                <ul className="flex flex-col gap-2.5">
                  {links.map(link => (
                    <li key={link}>
                      <a
                        href="#"
                        className="text-xs transition-all hover:pl-1"
                        style={{ color: '#B2BEC3' }}
                        onMouseEnter={e => (e.currentTarget.style.color = 'var(--primary-light)')}
                        onMouseLeave={e => (e.currentTarget.style.color = '#B2BEC3')}
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

          {/* Download app */}
          <div>
            <h4 className="font-bold text-sm mb-5 text-white">Download our app</h4>
            <div className="flex flex-col gap-3 mb-6">
              <a
                href="#"
                id="footer-google-play"
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all hover:scale-105"
                style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}
              >
                <span className="text-2xl">▶️</span>
                <div>
                  <p className="text-[9px]" style={{ color: '#B2BEC3' }}>Download App Get</p>
                  <p className="text-xs font-bold text-white">Google Play</p>
                  <p className="text-[9px]" style={{ color: 'var(--secondary)' }}>-10% Discount</p>
                </div>
              </a>
              <a
                href="#"
                id="footer-app-store"
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all hover:scale-105"
                style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}
              >
                <span className="text-2xl">🍎</span>
                <div>
                  <p className="text-[9px]" style={{ color: '#B2BEC3' }}>Download App Get</p>
                  <p className="text-xs font-bold text-white">App Store</p>
                  <p className="text-[9px]" style={{ color: 'var(--secondary)' }}>-20% Discount</p>
                </div>
              </a>
            </div>

            {/* Social */}
            <p className="text-xs font-bold mb-3 text-white">Follow us on social media:</p>
            <div className="flex gap-2">
              {[
                { icon: FiFacebook,  id: 'footer-facebook',  color: '#4267B2' },
                { icon: FiTwitter,   id: 'footer-twitter',   color: '#1DA1F2' },
                { icon: FiInstagram, id: 'footer-instagram', color: '#E1306C' },
                { icon: FiLinkedin,  id: 'footer-linkedin',  color: '#0077B5' },
              ].map(({ icon: Icon, id, color }) => (
                <a
                  key={id}
                  href="#"
                  id={id}
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-110 hover:-translate-y-1"
                  style={{ background: color + '22', border: `1px solid ${color}44` }}
                >
                  <Icon size={16} style={{ color }} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div
        className="border-t"
        style={{ borderColor: 'rgba(255,255,255,0.08)' }}
      >
        <div className="container-main py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs" style={{ color: '#636E72' }}>
            Copyright © 2025{' '}
            <a href="#" className="font-semibold hover:underline" style={{ color: 'var(--primary-light)' }}>
              Hommlie Shop
            </a>
            . All rights reserved.
          </p>

          {/* Footer nav */}
          <div className="flex items-center gap-4">
            {['Terms and Conditions', 'Privacy Policy', 'Order Tracking'].map(link => (
              <a
                key={link}
                href="#"
                className="text-xs transition-colors hover:underline"
                style={{ color: '#636E72' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--primary-light)')}
                onMouseLeave={e => (e.currentTarget.style.color = '#636E72')}
              >
                {link}
              </a>
            ))}
          </div>

          {/* Payment icons */}
          <div className="flex items-center gap-2">
            {['VISA', 'MC', 'PayPal', 'Skrill', 'Klarna'].map(p => (
              <span
                key={p}
                className="px-2 py-1 rounded text-[10px] font-bold"
                style={{ background: 'rgba(255,255,255,0.1)', color: '#B2BEC3' }}
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

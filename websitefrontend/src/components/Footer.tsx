

import { Link } from 'react-router-dom';
import AppLogo from '@/components/ui/AppLogo';
import Icon from '@/components/ui/AppIcon';

export default function Footer() {
  return (
    <footer className="bg-background mt-12 border-t border-blue-50">
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-10 pb-6">
        {/* Top row */}
        <div className="flex flex-col md:flex-row md:items-start gap-8 md:gap-12 mb-8">
          {/* Brand */}
          <div className="flex-shrink-0 md:w-56">
            <div className="mb-3">
              <AppLogo className="h-8 w-auto" />
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              Hommlie Shop delivered to your door in 10 minutes. Fresh, fast, and affordable.
            </p>
            <div className="flex items-center gap-1.5 mt-3">
              <span className="inline-flex items-center gap-1 bg-accent/20 text-accent text-xs font-semibold px-2.5 py-1 rounded-full">
                <Icon name="BoltIcon" size={11} className="text-accent" />
                10-min delivery
              </span>
            </div>
          </div>

          {/* Links */}
          <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-6">
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Shop</h4>
              <ul className="space-y-2">
                {[
                  { label: 'All Products', href: '/product-listing' },
                  { label: 'Best Sellers', href: '/product-listing' },
                  { label: 'Deals of the Day', href: '/product-listing' },
                  { label: 'Fresh Arrivals', href: '/product-listing' },
                ]?.map((item) => (
                  <li key={item?.label}>
                    <Link to={item?.href} className="text-sm text-gray-500 hover:text-foreground transition-colors">
                      {item?.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Company</h4>
              <ul className="space-y-2">
                {[
                  { label: 'About Us', href: '/' },
                  { label: 'Careers', href: '/' },
                  { label: 'Blog', href: '/' },
                  { label: 'Press', href: '/' },
                ]?.map((item) => (
                  <li key={item?.label}>
                    <Link to={item?.href} className="text-sm text-gray-500 hover:text-foreground transition-colors">
                      {item?.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Support</h4>
              <ul className="space-y-2">
                {[
                  { label: 'Help Center', href: '/' },
                  { label: 'Track Order', href: '/' },
                  { label: 'Returns', href: '/' },
                  { label: 'Contact Us', href: '/' },
                ]?.map((item) => (
                  <li key={item?.label}>
                    <Link to={item?.href} className="text-sm text-gray-500 hover:text-foreground transition-colors">
                      {item?.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* App download */}
          <div className="md:w-48 flex-shrink-0">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Get the App</h4>
            <div className="space-y-2">
              <button className="w-full flex items-center gap-2.5 bg-black hover:bg-gray-800 transition-colors rounded-xl px-3 py-2.5">
                <Icon name="DevicePhoneMobileIcon" size={20} className="text-white flex-shrink-0" />
                <div className="text-left">
                  <p className="text-[10px] text-white/50 leading-none">Download on the</p>
                  <p className="text-sm font-semibold text-white leading-tight">App Store</p>
                </div>
              </button>
              <button className="w-full flex items-center gap-2.5 bg-black hover:bg-gray-800 transition-colors rounded-xl px-3 py-2.5">
                <Icon name="DevicePhoneMobileIcon" size={20} className="text-white flex-shrink-0" />
                <div className="text-left">
                  <p className="text-[10px] text-white/50 leading-none">Get it on</p>
                  <p className="text-sm font-semibold text-white leading-tight">Google Play</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100 pt-5 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-400">© {new Date()?.getFullYear()} Hommlie Shop. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link to="/" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">Privacy Policy</Link>
            <Link to="/" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">Terms of Service</Link>
            <Link to="/" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

import { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import api, { IMAGE_BASE_URL } from '../api';
import {
  Users, UserCog, Key,
  Bell, LogOut, Menu,
  LayoutDashboard, UserCircle, Settings, ChevronDown, ChevronRight,
  Image as ImageIcon, Layers, MapPin, ShoppingBag
} from 'lucide-react';

const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userPermissions = user.permissions || [];

  const [openSections, setOpenSections] = useState({ access: true, master: false, catalog: true });
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const toggleSection = (section) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const hasAccess = (requiredPermissionString) => {
    if (!requiredPermissionString) return true;
    return userPermissions.includes(requiredPermissionString);
  };

  // Redefined menu to match Airowin style structure
  const sidebarItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard, isSubMenu: false },
    { name: 'Profile', path: '/profile', icon: UserCircle, isSubMenu: false, req: 'profile' },
    {
      id: 'catalog',
      title: 'Catalog',
      icon: ImageIcon,
      isSubMenu: true,
      items: [
        { name: 'Categories', path: '/categories', req: 'category_management' },
        { name: 'Sub-Categories', path: '/sub-categories', req: 'sub_category_management' },
        { name: 'Products', path: '/products', req: 'product_management' },
      ]
    },
    {
      id: 'warehouse',
      title: 'Warehouse',
      icon: MapPin,
      isSubMenu: true,
      items: [
        { name: 'Inventory Management', path: '/warehouse', req: 'warehouse_management' },
      ]
    },
    {
      id: 'order',
      title: 'Order Management',
      icon: ShoppingBag,
      isSubMenu: true,
      items: [
        { name: 'Manual Order Booking', path: '/order-booking', req: 'order_management' },
        { name: 'Order Processing', path: '/order-management', req: 'order_management' },
        { name: 'Payment Management', path: '/payment-management', req: 'order_management' },
      ]
    },
    {
      id: 'master',
      title: 'General Master',
      icon: Settings,
      isSubMenu: true,
      items: [
        { name: 'Users', path: '/users', req: 'user_management' },
        { name: 'Roles', path: '/roles', req: 'role_management' },
        { name: 'Permissions', path: '/permissions', req: 'permission' },
      ]
    }
  ];

  return (
    <div className="flex h-screen bg-[#f3f4f6] font-sans">
      {/* Sidebar - Airowin Dark Purple Style */}
      <div className={`bg-[#1e133c] text-white flex flex-col flex-shrink-0 shadow-xl z-20 transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-0 overflow-hidden'}`}>

        {/* Logo Area */}
        <div className="h-20 flex flex-col items-center justify-center border-b border-white/5 shrink-0 px-6 pt-4 pb-2">
          <h1 className="text-2xl font-bold tracking-tight text-white mb-0">Hommlie Shop</h1>
          <p className="text-[9px] uppercase tracking-widest text-blue-300 mt-0">Admin Panel</p>
        </div>

        {/* Current Role Pill */}
        <div className="px-6 py-4">
          <div className="bg-[#fde047] text-[#1e133c] font-bold text-xs uppercase tracking-widest py-2 rounded-full text-center flex justify-center items-center">
            <Users className="w-3 h-3 mr-2" /> {user.role?.role_name || 'ADMIN'}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-2 custom-scrollbar px-3 space-y-1">
          {sidebarItems.map((item) => {
            if (!item.isSubMenu) {
              if (item.req && !hasAccess(item.req)) return null;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center px-4 py-3 rounded-lg text-sm transition-all duration-200 ${isActive
                    ? 'text-white font-medium bg-white/10'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                >
                  <item.icon className={`w-4 h-4 mr-3 flex-shrink-0 opacity-80`} />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            } else {
              // Expandable section
              const filteredItems = item.items.filter(sub => hasAccess(sub.req));
              if (filteredItems.length === 0) return null;

              return (
                <div key={item.id} className="pt-2">
                  <button
                    onClick={() => toggleSection(item.id)}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center">
                      <item.icon className="w-4 h-4 mr-3 opacity-80" />
                      {item.title}
                    </div>
                    {openSections[item.id] ? <ChevronDown className="w-4 h-4 opacity-50" /> : <ChevronRight className="w-4 h-4 opacity-50" />}
                  </button>

                  {openSections[item.id] && (
                    <ul className="mt-1 space-y-1 px-4">
                      {filteredItems.map((sub) => {
                        const isActive = location.pathname === sub.path;
                        return (
                          <li key={sub.name}>
                            <Link
                              to={sub.path}
                              className={`flex items-center pl-7 py-2.5 rounded-lg text-sm transition-all duration-200 ${isActive
                                ? 'text-white font-medium bg-white/10'
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                                }`}
                            >
                              <span className="w-1.5 h-1.5 rounded-full mr-3 bg-current opacity-50"></span>
                              <span className="truncate">{sub.name}</span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              );
            }
          })}
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#f8f9fa]">

        {/* Top Header - White Style */}
        <header className="h-16 flex items-center justify-between px-6 bg-white border-b border-slate-200 shrink-0 shadow-sm z-10">
          <div className="flex items-center">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 -ml-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors">
              <Menu className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center space-x-6">
            <button className="relative text-slate-400 hover:text-slate-600 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>

            <div className="relative">
              <div
                className="flex items-center pl-6 border-l border-slate-200 cursor-pointer group"
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              >
                {user.profile_photo ? (
                  <img src={`${IMAGE_BASE_URL}/Profile_Photo/${user.profile_photo}`} alt="Profile" className="w-8 h-8 rounded-full object-cover shadow-sm border border-slate-200" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
                <div className="ml-3 hidden sm:block">
                  <p className="text-sm font-semibold text-slate-700 truncate group-hover:text-purple-700 flex items-center transition-colors">
                    {user.name} <ChevronDown className="w-3 h-3 ml-1 opacity-50" />
                  </p>
                </div>
              </div>

              {/* Profile Dropdown */}
              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-2 z-50">
                  <div className="px-4 py-2 border-b border-slate-50 mb-1">
                    <p className="text-sm font-bold text-slate-800 truncate">{user.name}</p>
                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                  </div>
                  {hasAccess('profile') && (
                    <Link to="/profile" className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center transition-colors" onClick={() => setIsProfileDropdownOpen(false)}>
                      <UserCircle className="w-4 h-4 mr-2 text-slate-400" /> Profile
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center transition-colors"
                  >
                    <LogOut className="w-4 h-4 mr-2" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Canvas */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

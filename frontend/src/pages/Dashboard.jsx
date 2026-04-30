import React, { useState, useEffect } from 'react';
import {
  ShoppingBag, DollarSign, Package, Users, Home, AlertTriangle,
  TrendingUp, Clock, CheckCircle, Truck, XCircle, Plus,
  Bell, Activity, RefreshCw
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart
} from 'recharts';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';

// --- COMPONENT HELPER ---
const StatusBadge = ({ status }) => {
  const styles = {
    'delivered': 'bg-green-100 text-green-700 border-green-200',
    'out_for_delivery': 'bg-blue-100 text-blue-700 border-blue-200',
    'packed': 'bg-purple-100 text-purple-700 border-purple-200',
    'confirmed': 'bg-indigo-100 text-indigo-700 border-indigo-200',
    'pending': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    'cancelled': 'bg-red-100 text-red-700 border-red-200',
  };

  const labels = {
    'delivered': 'Delivered',
    'out_for_delivery': 'Shipped',
    'packed': 'Packed',
    'confirmed': 'Confirmed',
    'pending': 'Pending',
    'cancelled': 'Cancelled'
  };

  return (
    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${styles[status] || 'bg-slate-100 text-slate-700'}`}>
      {labels[status] || status}
    </span>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.role?.role_name?.toLowerCase() === 'admin';

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/dashboard/stats');
        if (res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error("Error fetching dashboard stats:", err);
        toast.error("Failed to load dashboard metrics");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-[#7c3aed] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 text-sm font-medium animate-pulse">Synchronizing Dashboard...</p>
      </div>
    );
  }

  if (!data) return (
    <div className="h-[70vh] flex flex-col items-center justify-center space-y-4">
      <p className="text-slate-500">Failed to load data.</p>
      <button onClick={() => window.location.reload()} className="text-[#7c3aed] font-bold hover:underline">Retry</button>
    </div>
  );

  const { stats, pulse, recentOrders, lowStockItems, salesData, topProducts } = data;

  return (
    <div className="space-y-6">

      {/* HEADER & QUICK ACTIONS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dashboard Overview</h1>
          <p className="text-slate-500 text-sm">System snapshot and real-time metrics.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => navigate('/products')} className="flex items-center px-3 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 text-sm font-medium transition-colors shadow-sm">
            <Plus className="w-4 h-4 mr-1.5 text-blue-500" /> Add Product
          </button>
          
          {isAdmin && (
            <>
              <button onClick={() => navigate('/warehouse')} className="flex items-center px-3 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 text-sm font-medium transition-colors shadow-sm">
                <Plus className="w-4 h-4 mr-1.5 text-indigo-500" /> Add Warehouse
              </button>
              <button onClick={() => navigate('/users')} className="flex items-center px-3 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 text-sm font-medium transition-colors shadow-sm">
                <Plus className="w-4 h-4 mr-1.5 text-purple-500" /> Add Vendor
              </button>
              <button onClick={() => navigate('/users')} className="flex items-center px-3 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 text-sm font-medium transition-colors shadow-sm">
                <Users className="w-4 h-4 mr-1.5 text-orange-500" /> Vendors
              </button>
            </>
          )}

          <button onClick={() => navigate('/order-booking')} className="flex items-center px-4 py-2 bg-[#7c3aed] text-white rounded-lg hover:bg-purple-700 text-sm font-medium transition-colors shadow-sm">
            <Plus className="w-4 h-4 mr-1.5" /> Create Order
          </button>
        </div>
      </div>

      {/* 1. TOP SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center">
          <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center mr-4">
            <ShoppingBag className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Orders</p>
            <h3 className="text-2xl font-bold text-slate-800">{stats.totalOrders.toLocaleString()}</h3>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center">
          <div className="w-12 h-12 rounded-lg bg-emerald-50 flex items-center justify-center mr-4">
            <DollarSign className="w-6 h-6 text-emerald-500" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Revenue</p>
            <h3 className="text-2xl font-bold text-slate-800">₹{parseFloat(stats.totalRevenue).toLocaleString()}</h3>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center">
          <div className="w-12 h-12 rounded-lg bg-purple-50 flex items-center justify-center mr-4">
            <Package className="w-6 h-6 text-purple-500" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Products</p>
            <h3 className="text-2xl font-bold text-slate-800">{stats.totalProducts}</h3>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center">
          <div className="w-12 h-12 rounded-lg bg-orange-50 flex items-center justify-center mr-4">
            <Users className="w-6 h-6 text-orange-500" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Vendors</p>
            <h3 className="text-2xl font-bold text-slate-800">{stats.totalVendors}</h3>
          </div>
        </div>
      </div>

      {/* SECONDARY CARDS (Warehouses, Low Stock) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex justify-between items-center bg-gradient-to-r from-white to-slate-50">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mr-4">
              <Home className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Warehouses</p>
              <h3 className="text-xl font-bold text-slate-800">{stats.totalWarehouses} Facilities</h3>
            </div>
          </div>
          <Link to="/warehouse" className="text-sm font-medium text-blue-600 hover:underline">Manage</Link>
        </div>
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex justify-between items-center bg-gradient-to-r from-white to-red-50/30">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mr-4">
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider text-red-600/70">Low Stock Items</p>
              <h3 className="text-xl font-bold text-red-600">{stats.lowStockCount} Products</h3>
            </div>
          </div>
          <Link to="/warehouse" className="text-sm font-medium text-red-600 hover:underline">View All</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* 2 & 3. LIVE STATUS & ORDER STATUS OVERVIEW (Left Column) */}
        <div className="lg:col-span-1 space-y-6">
          {/* Today Live Status */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-bold text-slate-800">Today's Pulse</h2>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
            <div className="p-5 grid grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                <p className="text-[11px] font-semibold text-slate-500 uppercase mb-1">Today Orders</p>
                <p className="text-lg font-bold text-slate-800">{pulse.todayOrders}</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                <p className="text-[11px] font-semibold text-slate-500 uppercase mb-1">Today Revenue</p>
                <p className="text-lg font-bold text-emerald-600">₹{(pulse.todayRevenue / 1000).toFixed(1)}k</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                <p className="text-[11px] font-semibold text-slate-500 uppercase mb-1">Pending Orders</p>
                <p className="text-lg font-bold text-orange-600">{pulse.pendingOrders}</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                <p className="text-[11px] font-semibold text-slate-500 uppercase mb-1">Out for Delivery</p>
                <p className="text-lg font-bold text-blue-600">{pulse.activeDeliveries}</p>
              </div>
            </div>
          </div>

          {/* Order Status Breakdown */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="p-4 border-b border-slate-100">
              <h2 className="font-bold text-slate-800">Order Pipeline Overview</h2>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center text-slate-600"><Clock className="w-4 h-4 mr-2 text-yellow-500" /> Pending</div>
                <div className="font-semibold text-slate-800">{pulse.pendingOrders}</div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center text-slate-600"><RefreshCw className="w-4 h-4 mr-2 text-purple-500" /> Processing</div>
                <div className="font-semibold text-slate-800">{recentOrders.filter(o => o.status === 'confirmed' || o.status === 'packed').length}</div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center text-slate-600"><Truck className="w-4 h-4 mr-2 text-blue-500" /> Shipped</div>
                <div className="font-semibold text-slate-800">{pulse.activeDeliveries}</div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center text-slate-600"><CheckCircle className="w-4 h-4 mr-2 text-emerald-500" /> Delivered</div>
                <div className="font-semibold text-slate-800">{recentOrders.filter(o => o.status === 'delivered').length}</div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center text-slate-600"><XCircle className="w-4 h-4 mr-2 text-red-500" /> Cancelled</div>
                <div className="font-semibold text-slate-800">{recentOrders.filter(o => o.status === 'cancelled').length}</div>
              </div>
            </div>
          </div>
        </div>

        {/* 8. SALES GRAPH (Middle & Right Column) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-bold text-slate-800">Sales Overview (Last 7 Days)</h2>
            <select className="text-xs border border-slate-200 rounded px-2 py-1 bg-slate-50 outline-none text-slate-600">
              <option>Last 7 Days</option>
              <option>This Month</option>
            </select>
          </div>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dx={-10} tickFormatter={(val) => `₹${val / 1000}k`} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value) => [`₹${value.toLocaleString()}`, 'Sales']}
                />
                <Area type="monotone" dataKey="sales" stroke="#7c3aed" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* 4. RECENT ORDERS TABLE (Col Span 2) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center">
            <h2 className="font-bold text-slate-800">Recent Orders</h2>
            <Link to="/order-management" className="text-xs font-medium text-blue-600 hover:underline">View All</Link>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                  <th className="p-4">Order ID</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-slate-400 text-sm font-medium italic">No recent orders.</td>
                  </tr>
                ) : (
                  recentOrders.map((order, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => navigate('/order-management')}>
                      <td className="p-4 text-sm font-medium text-slate-800">{order.id}</td>
                      <td className="p-4 text-sm text-slate-600">{order.customer}</td>
                      <td className="p-4 text-sm text-slate-500">{order.date}</td>
                      <td className="p-4 text-sm font-semibold text-slate-800">{order.amount}</td>
                      <td className="p-4 text-sm"><StatusBadge status={order.status} /></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 9. NOTIFICATIONS PANEL (Col Span 1) - Reused for system feed */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center">
            <h2 className="font-bold text-slate-800">Live Activity</h2>
            <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Syncing</span>
          </div>
          <div className="p-2 space-y-1 overflow-y-auto flex-1 max-h-[350px] custom-scrollbar">
            {recentOrders.map(order => (
              <div key={order.id} className="p-3 hover:bg-slate-50 rounded-lg flex items-start transition-colors cursor-pointer">
                <div className={`mt-0.5 p-1.5 rounded-full mr-3 bg-indigo-50 text-indigo-600`}>
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">Order {order.status}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{order.id} for {order.customer}</p>
                  <p className="text-[10px] text-slate-400 mt-1">{order.date}</p>
                </div>
              </div>
            ))}
            {lowStockItems.map((item, idx) => (
              <div key={`low-${idx}`} className="p-3 hover:bg-slate-50 rounded-lg flex items-start transition-colors cursor-pointer">
                <div className={`mt-0.5 p-1.5 rounded-full mr-3 bg-red-50 text-red-600`}>
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">Low Stock Alert</p>
                  <p className="text-xs text-slate-500 mt-0.5">{item.name} ({item.variation}) is low: {item.stock} left</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* 5. LOW STOCK ALERT */}
        <div className="bg-white rounded-xl border border-red-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-red-100 bg-red-50/50 flex items-center justify-between">
            <div className="flex items-center text-red-700 font-bold">
              <AlertTriangle className="w-4 h-4 mr-2" /> Low Stock Alerts
            </div>
            <Link to="/warehouse" className="text-xs font-medium text-red-600 hover:underline">Inventory</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                  <th className="p-4">Product</th>
                  <th className="p-4">Variation</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4">Warehouse</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lowStockItems.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="p-8 text-center text-slate-400 text-sm font-medium italic">All items are well stocked.</td>
                  </tr>
                ) : (
                  lowStockItems.map((item, idx) => (
                    <tr key={idx} className="hover:bg-red-50/20 transition-colors">
                      <td className="p-4 text-sm font-medium text-slate-800">{item.name}</td>
                      <td className="p-4 text-sm text-slate-600">{item.variation}</td>
                      <td className="p-4 text-sm">
                        <span className={`font-bold ${item.stock === 0 ? 'text-red-600 bg-red-100 px-2 py-0.5 rounded' : 'text-orange-600'}`}>
                          {item.stock} Left
                        </span>
                      </td>
                      <td className="p-4 text-sm text-slate-500">{item.warehouse}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 6. TOP SELLING PRODUCTS */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center">
            <div className="flex items-center text-slate-800 font-bold">
              <TrendingUp className="w-4 h-4 mr-2 text-emerald-500" /> Top Selling Products
            </div>
          </div>
          <div className="p-2 space-y-1">
            {topProducts.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm font-medium italic">No sales data recorded yet.</div>
            ) : (
              topProducts.map((prod, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors border-b border-slate-50 last:border-0">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs mr-3">
                      #{idx + 1}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{prod.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{prod.sold} units sold</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-emerald-600">{prod.revenue}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* 10. SYSTEM HEALTH */}
      <div className="bg-slate-800 rounded-xl p-4 shadow-sm text-slate-300 flex flex-wrap items-center justify-between text-xs font-mono">
        <div className="flex items-center space-x-6">
          <div className="flex items-center"><Activity className="w-3 h-3 mr-1.5 text-emerald-400" /> System Health: Operational</div>
          <div className="hidden sm:block">Sync: <span className="text-emerald-400 font-bold">Live</span></div>
          <div className="hidden sm:block">Database Load: <span className="text-white font-bold">Optimal</span></div>
        </div>
        <div className="mt-2 sm:mt-0 text-slate-500">
          Last aggregation: {new Date().toLocaleTimeString()}
        </div>
      </div>

    </div>
  );
};

export default Dashboard;

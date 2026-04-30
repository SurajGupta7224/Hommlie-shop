import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Search, Filter, Eye, Package, Clock, CheckCircle,
  Truck, XCircle, ChevronRight, RefreshCw, ShoppingBag, Calendar, Warehouse
} from 'lucide-react';
import api from '../api';

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-700 border-blue-200', dot: 'bg-blue-500' },
  packed: { label: 'Packed', color: 'bg-indigo-100 text-indigo-700 border-indigo-200', dot: 'bg-indigo-500' },
  out_for_delivery: { label: 'Out for Delivery', color: 'bg-purple-100 text-purple-700 border-purple-200', dot: 'bg-purple-500' },
  delivered: { label: 'Delivered', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700 border-red-200', dot: 'bg-red-500' },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}></span>
      {cfg.label}
    </span>
  );
};

const STATUSES = ['', 'pending', 'confirmed', 'packed', 'out_for_delivery', 'delivered', 'cancelled'];

const OrderManagement = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterWarehouse, setFilterWarehouse] = useState('');
  const [warehouses, setWarehouses] = useState([]);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (search) params.set('search', search);
      if (filterStatus) params.set('status', filterStatus);
      if (filterDate) params.set('date', filterDate);
      if (filterWarehouse) params.set('warehouse_id', filterWarehouse);
      const res = await api.get(`/orders?${params}`);
      setOrders(res.data.orders);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [page, search, filterStatus, filterDate, filterWarehouse]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  useEffect(() => {
    api.get('/warehouses').then(r => setWarehouses(r.data.warehouses || r.data)).catch(() => { });
  }, []);

  const clearFilters = () => {
    setSearch(''); setFilterStatus(''); setFilterDate(''); setFilterWarehouse(''); setPage(1);
  };

  const statusCounts = STATUSES.slice(1).reduce((acc, s) => {
    acc[s] = orders.filter(o => o.status === s).length;
    return acc;
  }, {});

  return (
    <div className="py-6 px-0">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => navigate('/')} className="hover:text-purple-600 transition-colors text-slate-400">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-black text-slate-800">Order Management</h1>
        <span className="ml-auto bg-purple-100 text-purple-700 text-sm font-bold px-4 py-1.5 rounded-full">
          {total} Orders
        </span>
      </div>

      {/* Stats Strip */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-6">
        {STATUSES.slice(1).map(s => {
          const cfg = STATUS_CONFIG[s];
          return (
            <button
              key={s}
              onClick={() => { setFilterStatus(filterStatus === s ? '' : s); setPage(1); }}
              className={`rounded-2xl p-4 border-2 text-left transition-all ${filterStatus === s ? 'border-purple-600 bg-purple-50' : 'border-slate-100 bg-white hover:border-purple-200'}`}
            >
              <p className="text-2xl font-black text-slate-800">{statusCounts[s] || 0}</p>
              <p className={`text-[10px] font-bold uppercase tracking-wider mt-1 ${cfg.dot.replace('bg-', 'text-')}`}>{cfg.label}</p>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 mb-6 flex flex-wrap gap-3 items-center shadow-sm">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or mobile..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-purple-400 transition-colors"
          />
        </div>

        <select
          value={filterStatus}
          onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
          className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus:border-purple-400 bg-white"
        >
          <option value="">All Statuses</option>
          {STATUSES.slice(1).map(s => <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>)}
        </select>

        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="date"
            value={filterDate}
            onChange={e => { setFilterDate(e.target.value); setPage(1); }}
            className="pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-purple-400 bg-white"
          />
        </div>

        <select
          value={filterWarehouse}
          onChange={e => { setFilterWarehouse(e.target.value); setPage(1); }}
          className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus:border-purple-400 bg-white"
        >
          <option value="">All Warehouses</option>
          {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
        </select>

        <button onClick={clearFilters} className="text-slate-400 hover:text-red-500 transition-colors p-2 rounded-xl hover:bg-red-50">
          <XCircle className="w-5 h-5" />
        </button>
        <button onClick={fetchOrders} className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-colors">
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      <div className="bg-white border border-slate-300 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse table-fixed min-w-[1000px]">
            <thead>
              <tr className="bg-[#f8fafc] text-[11px] uppercase font-black text-slate-600 border-b-2 border-slate-300">
                <th className="border border-slate-300 text-left px-3 py-2 whitespace-nowrap relative group">
                  <div className="absolute left-0 top-0 w-1.5 h-1.5 border-l-2 border-t-2 border-slate-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="absolute right-0 bottom-0 w-1.5 h-1.5 border-r-2 border-b-2 border-slate-400 opacity-30 group-hover:opacity-100 transition-opacity"></div>
                  Order ID
                </th>
                <th className="border border-slate-300 text-left px-3 py-2 whitespace-nowrap relative group">
                  <div className="absolute left-0 top-0 w-1.5 h-1.5 border-l-2 border-t-2 border-slate-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="absolute right-0 bottom-0 w-1.5 h-1.5 border-r-2 border-b-2 border-slate-400 opacity-30 group-hover:opacity-100 transition-opacity"></div>
                  Customer
                </th>
                <th className="border border-slate-300 text-left px-3 py-2 whitespace-nowrap relative group">
                  <div className="absolute left-0 top-0 w-1.5 h-1.5 border-l-2 border-t-2 border-slate-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="absolute right-0 bottom-0 w-1.5 h-1.5 border-r-2 border-b-2 border-slate-400 opacity-30 group-hover:opacity-100 transition-opacity"></div>
                  Vendor
                </th>
                <th className="border border-slate-300 text-left px-3 py-2 whitespace-nowrap relative group">
                  <div className="absolute left-0 top-0 w-1.5 h-1.5 border-l-2 border-t-2 border-slate-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="absolute right-0 bottom-0 w-1.5 h-1.5 border-r-2 border-b-2 border-slate-400 opacity-30 group-hover:opacity-100 transition-opacity"></div>
                  Warehouse
                </th>
                <th className="border border-slate-300 text-left px-3 py-2 whitespace-nowrap relative group">
                  <div className="absolute left-0 top-0 w-1.5 h-1.5 border-l-2 border-t-2 border-slate-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="absolute right-0 bottom-0 w-1.5 h-1.5 border-r-2 border-b-2 border-slate-400 opacity-30 group-hover:opacity-100 transition-opacity"></div>
                  Items
                </th>
                <th className="border border-slate-300 text-left px-3 py-2 whitespace-nowrap relative group">
                  <div className="absolute left-0 top-0 w-1.5 h-1.5 border-l-2 border-t-2 border-slate-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="absolute right-0 bottom-0 w-1.5 h-1.5 border-r-2 border-b-2 border-slate-400 opacity-30 group-hover:opacity-100 transition-opacity"></div>
                  Amount
                </th>
                <th className="border border-slate-300 text-left px-3 py-2 whitespace-nowrap relative group">
                  <div className="absolute left-0 top-0 w-1.5 h-1.5 border-l-2 border-t-2 border-slate-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="absolute right-0 bottom-0 w-1.5 h-1.5 border-r-2 border-b-2 border-slate-400 opacity-30 group-hover:opacity-100 transition-opacity"></div>
                  Status
                </th>
                <th className="border border-slate-300 text-left px-3 py-2 whitespace-nowrap relative group">
                  <div className="absolute left-0 top-0 w-1.5 h-1.5 border-l-2 border-t-2 border-slate-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="absolute right-0 bottom-0 w-1.5 h-1.5 border-r-2 border-b-2 border-slate-400 opacity-30 group-hover:opacity-100 transition-opacity"></div>
                  Payment
                </th>
                <th className="border border-slate-300 text-left px-3 py-2 whitespace-nowrap relative group">
                  <div className="absolute left-0 top-0 w-1.5 h-1.5 border-l-2 border-t-2 border-slate-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="absolute right-0 bottom-0 w-1.5 h-1.5 border-r-2 border-b-2 border-slate-400 opacity-30 group-hover:opacity-100 transition-opacity"></div>
                  Date
                </th>
                <th className="border border-slate-300 px-3 py-2 bg-[#f8fafc]"></th>
              </tr>
            </thead>
            <tbody className="">
              {loading ? (
                Array(8).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array(10).fill(0).map((_, j) => (
                      <td key={j} className="border border-slate-100 px-4 py-3"><div className="h-4 bg-slate-100 rounded-full w-24"></div></td>
                    ))}
                  </tr>
                ))
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={10} className="border border-slate-200 text-center py-20 text-slate-400">
                    <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-slate-200" />
                    <p className="font-bold text-slate-500">No orders found</p>
                    <p className="text-sm mt-1">Try adjusting your filters</p>
                  </td>
                </tr>
              ) : orders.map(order => (
                <tr
                  key={order.id}
                  onClick={() => navigate(`/order-management/${order.id}`)}
                  className="hover:bg-slate-50 cursor-pointer transition-colors group"
                >
                  <td className="border border-slate-200 px-3 py-1.5 overflow-hidden">
                    <span className="font-bold text-purple-700 text-xs">{order.order_number}</span>
                    <span className="block text-[9px] text-slate-400 uppercase font-bold mt-0.5">{order.payment_method}</span>
                  </td>
                  <td className="border border-slate-200 px-3 py-1.5 overflow-hidden">
                    <p className="font-bold text-slate-800 text-xs">{order.customer?.name}</p>
                    <p className="text-[10px] text-slate-400 font-medium">{order.customer?.mobile}</p>
                  </td>
                  <td className="border border-slate-200 px-3 py-1.5 overflow-hidden">
                    {order.user ? (
                      <Link
                        to={`/vendor-profile/${order.user.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="block hover:underline"
                      >
                        <p className="font-bold text-violet-700 text-xs truncate max-w-[100px]">{order.user.name}</p>
                        <p className="text-[10px] text-slate-400 font-medium">{order.user.phone || '—'}</p>
                      </Link>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>
                  <td className="border border-slate-200 px-3 py-1.5 overflow-hidden">
                    <p className="text-xs font-medium text-slate-600 truncate">{order.warehouse?.name}</p>
                  </td>
                  <td className="border border-slate-200 px-3 py-1.5 overflow-hidden">
                    <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-1.5 py-0.5 rounded">
                      {order.items?.length || 0}
                    </span>
                  </td>
                  <td className="border border-slate-200 px-3 py-1.5 overflow-hidden">
                    <span className="font-black text-slate-800 text-xs">₹{parseFloat(order.final_amount).toFixed(2)}</span>
                  </td>
                  <td className="border border-slate-200 px-3 py-1.5 overflow-hidden"><StatusBadge status={order.status} /></td>
                  <td className="border border-slate-200 px-3 py-1.5 overflow-hidden">
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider ${order.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {order.payment_status === 'paid' ? 'Completed' : 'Pending'}
                    </span>
                  </td>
                  <td className="border border-slate-200 px-3 py-1.5 overflow-hidden">
                    <p className="text-[10px] text-slate-500 font-medium whitespace-nowrap">
                      {new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                  </td>
                  <td className="border border-slate-200 px-3 py-1.5 text-center overflow-hidden">
                    <ChevronRight className="w-3.5 h-3.5 text-blue-600 mx-auto" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50">
            <p className="text-sm text-slate-500 font-medium">{total} total orders</p>
            <div className="flex gap-2">
              {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-sm font-bold transition-colors ${page === p ? 'bg-purple-600 text-white' : 'bg-white text-slate-500 hover:bg-purple-50 border border-slate-200'}`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderManagement;

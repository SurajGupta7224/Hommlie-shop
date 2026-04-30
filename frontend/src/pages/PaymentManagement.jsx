import { useState, useEffect, useCallback } from 'react';
import api from '../api';
import toast from 'react-hot-toast';
import {
  CreditCard, Search, Filter, RefreshCw, Plus, X, Eye,
  CheckCircle, XCircle, AlertCircle, Clock, TrendingUp,
  DollarSign, ArrowDownCircle, Ban
} from 'lucide-react';

// ── Status helpers ────────────────────────────────────────────────────────────
const STATUS_META = {
  pending:  { label: 'Pending',  cls: 'bg-amber-100 text-amber-700 border border-amber-200',  icon: Clock },
  success:  { label: 'Success',  cls: 'bg-green-100 text-green-700 border border-green-200',  icon: CheckCircle },
  failed:   { label: 'Failed',   cls: 'bg-red-100 text-red-700 border border-red-200',         icon: XCircle },
  refunded: { label: 'Refunded', cls: 'bg-purple-100 text-purple-700 border border-purple-200', icon: ArrowDownCircle },
};

const METHOD_META = {
  COD:         { cls: 'bg-orange-100 text-orange-700' },
  UPI:         { cls: 'bg-blue-100 text-blue-700' },
  Card:        { cls: 'bg-indigo-100 text-indigo-700' },
  'Net Banking': { cls: 'bg-teal-100 text-teal-700' },
};

const Badge = ({ val, map }) => {
  const m = map[val] || { cls: 'bg-gray-100 text-gray-600', label: val };
  const Icon = m.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${m.cls}`}>
      {Icon && <Icon className="w-3 h-3" />} {m.label || val}
    </span>
  );
};

const fmt = (n) => `₹${parseFloat(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

// ── Add Payment Modal ─────────────────────────────────────────────────────────
const AddPaymentModal = ({ onClose, onSuccess }) => {
  const [form, setForm] = useState({ order_id: '', payment_method: 'COD', transaction_id: '', payment_gateway: '', amount: '', notes: '' });
  const [saving, setSaving] = useState(false);

  const handle = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/payments', form);
      toast.success('Payment added!');
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add payment');
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Plus className="w-5 h-5 text-indigo-600" /> Add Payment Details
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-500" /></button>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1">Order ID <span className="text-red-500">*</span></label>
              <input name="order_id" value={form.order_id} onChange={handle} required placeholder="e.g. 42" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Payment Method <span className="text-red-500">*</span></label>
              <select name="payment_method" value={form.payment_method} onChange={handle} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
                {['COD', 'UPI', 'Card', 'Net Banking'].map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Amount <span className="text-red-500">*</span></label>
              <input name="amount" value={form.amount} onChange={handle} required type="number" step="0.01" placeholder="0.00" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            </div>
            {form.payment_method !== 'COD' && <>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Transaction ID</label>
                <input name="transaction_id" value={form.transaction_id} onChange={handle} placeholder="TXN123..." className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Gateway</label>
                <input name="payment_gateway" value={form.payment_gateway} onChange={handle} placeholder="Razorpay, Paytm..." className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
              </div>
            </>}
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1">Notes</label>
              <textarea name="notes" value={form.notes} onChange={handle} rows={2} placeholder="Optional note..." className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50">
              {saving ? 'Saving...' : 'Add Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Payment Detail Modal ──────────────────────────────────────────────────────
const DetailModal = ({ paymentId, onClose, onRefresh }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionNote, setActionNote] = useState('');
  const [acting, setActing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await api.get(`/payments/${paymentId}`); setData(r.data.payment); }
    catch { toast.error('Failed to load payment'); }
    finally { setLoading(false); }
  }, [paymentId]);

  useEffect(() => { load(); }, [load]);

  const doAction = async (endpoint, label) => {
    setActing(true);
    try {
      await api.patch(`/payments/${paymentId}/${endpoint}`, { note: actionNote });
      toast.success(`${label} successful!`);
      setActionNote('');
      await load();
      onRefresh();
    } catch (err) { toast.error(err.response?.data?.message || `Failed: ${label}`); }
    finally { setActing(false); }
  };

  if (loading) return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-10 flex flex-col items-center gap-3">
        <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
        <p className="text-sm text-gray-500">Loading payment...</p>
      </div>
    </div>
  );

  if (!data) return null;
  const p = data;
  const isCOD = p.payment_method === 'COD';

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Payment Details</h2>
            <p className="text-xs text-gray-400 mt-0.5">Order #{p.order?.order_number}</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-500" /></button>
        </div>

        <div className="p-6 space-y-6">
          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-4">
            <InfoCard label="Customer" value={p.order?.customer?.name || '—'} sub={p.order?.customer?.mobile} />
            <InfoCard label="Amount" value={fmt(p.amount)} />
            <InfoCard label="Payment Method" value={p.payment_method} />
            <InfoCard label="Gateway" value={p.payment_gateway || '—'} />
            <InfoCard label="Transaction ID" value={p.transaction_id || '—'} />
            <InfoCard label="Payment Date" value={fmtDate(p.paid_at)} />
            <div className="col-span-2 flex items-center gap-4">
              <div>
                <p className="text-xs text-gray-400 mb-1">Status</p>
                <Badge val={p.status} map={STATUS_META} />
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Order Status</p>
                <span className="text-xs font-medium text-gray-700 bg-gray-100 px-2 py-0.5 rounded-full">{p.order?.status || '—'}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <h3 className="text-sm font-bold text-gray-700">Actions</h3>
            <input
              value={actionNote}
              onChange={e => setActionNote(e.target.value)}
              placeholder="Add a note (optional)..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
            <div className="flex flex-wrap gap-2">
              {isCOD && p.status === 'pending' && (
                <ActionBtn color="green" icon={CheckCircle} label="Mark as Paid" onClick={() => doAction('mark-paid', 'Mark Paid')} disabled={acting} />
              )}
              {!isCOD && p.status === 'pending' && (
                <ActionBtn color="blue" icon={CheckCircle} label="Verify Payment" onClick={() => doAction('verify', 'Verify')} disabled={acting} />
              )}
              {p.status !== 'failed' && p.status !== 'refunded' && (
                <ActionBtn color="red" icon={Ban} label="Mark as Failed" onClick={() => doAction('mark-failed', 'Mark Failed')} disabled={acting} />
              )}
              {!isCOD && p.status === 'success' && (
                <ActionBtn color="purple" icon={ArrowDownCircle} label="Initiate Refund" onClick={() => doAction('refund', 'Refund')} disabled={acting} />
              )}
            </div>
          </div>

          {/* History */}
          {p.logs?.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-gray-700 mb-3">Payment History</h3>
              <div className="space-y-2">
                {p.logs.map(log => (
                  <div key={log.id} className="flex items-start gap-3 bg-gray-50 rounded-lg p-3">
                    <div className="w-2 h-2 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-700">{log.action}</p>
                      {log.old_status && <p className="text-xs text-gray-400">{log.old_status} → {log.new_status}</p>}
                      {log.note && <p className="text-xs text-gray-500 mt-0.5 italic">"{log.note}"</p>}
                      <p className="text-xs text-gray-400 mt-0.5">{log.changedBy?.name || 'System'} · {fmtDate(log.created_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const InfoCard = ({ label, value, sub }) => (
  <div className="bg-gray-50 rounded-xl p-3">
    <p className="text-xs text-gray-400 mb-0.5">{label}</p>
    <p className="text-sm font-semibold text-gray-800 truncate">{value}</p>
    {sub && <p className="text-xs text-gray-500">{sub}</p>}
  </div>
);

const ActionBtn = ({ color, icon: Icon, label, onClick, disabled }) => {
  const colors = {
    green: 'bg-green-600 hover:bg-green-700', blue: 'bg-blue-600 hover:bg-blue-700',
    red: 'bg-red-500 hover:bg-red-600', purple: 'bg-purple-600 hover:bg-purple-700',
  };
  return (
    <button onClick={onClick} disabled={disabled} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-white transition-all disabled:opacity-50 ${colors[color]}`}>
      <Icon className="w-3.5 h-3.5" /> {label}
    </button>
  );
};

// ── Summary Cards ────────────────────────────────────────────────────────────
const SummaryCards = ({ summary }) => {
  if (!summary) return null;
  const cards = [
    { label: 'Total Revenue', value: fmt(summary.total_revenue), icon: TrendingUp, color: 'from-green-500 to-emerald-600' },
    { label: 'Failed Payments', value: `${summary.failed_payments?.count || 0} (${fmt(summary.failed_payments?.total)})`, icon: AlertCircle, color: 'from-red-500 to-rose-600' },
    { label: 'Refunded', value: `${summary.refund_amount?.count || 0} (${fmt(summary.refund_amount?.total)})`, icon: ArrowDownCircle, color: 'from-purple-500 to-violet-600' },
    { label: 'Pending COD', value: `${summary.pending_cod?.count || 0} (${fmt(summary.pending_cod?.total)})`, icon: Clock, color: 'from-amber-500 to-orange-600' },
  ];
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map(c => (
        <div key={c.label} className={`bg-gradient-to-br ${c.color} rounded-xl p-4 text-white shadow-sm`}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium opacity-80">{c.label}</p>
            <c.icon className="w-4 h-4 opacity-70" />
          </div>
          <p className="text-base font-bold leading-tight">{c.value}</p>
        </div>
      ))}
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
export default function PaymentManagement() {
  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const [selectedId, setSelectedId] = useState(null);
  const [showAdd, setShowAdd] = useState(false);

  const fetchSummary = async () => {
    try { const r = await api.get('/payments/reports/summary'); setSummary(r.data); }
    catch {}
  };

  const fetchPayments = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: p, limit: 15 });
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      if (methodFilter) params.append('method', methodFilter);
      if (dateFilter) params.append('date', dateFilter);
      const r = await api.get(`/payments?${params}`);
      setPayments(r.data.payments || []);
      setTotal(r.data.total || 0);
      setPages(r.data.pages || 1);
      setPage(r.data.currentPage || 1);
    } catch { toast.error('Failed to load payments'); }
    finally { setLoading(false); }
  }, [search, statusFilter, methodFilter, dateFilter]);

  useEffect(() => { fetchPayments(1); fetchSummary(); }, [fetchPayments]);

  const handleAddSuccess = () => { setShowAdd(false); fetchPayments(1); fetchSummary(); };
  const handleDetailRefresh = () => { fetchPayments(page); fetchSummary(); };

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-indigo-600" /> Payment Management
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">Track, verify, and manage all order payments</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <SummaryCards summary={summary} />

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-4 p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by Order ID..." className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-300">
            <option value="">All Statuses</option>
            {['pending', 'success', 'failed', 'refunded'].map(s => <option key={s} value={s}>{STATUS_META[s].label}</option>)}
          </select>
          <select value={methodFilter} onChange={e => setMethodFilter(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-300">
            <option value="">All Methods</option>
            {['COD', 'UPI', 'Card', 'Net Banking'].map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-300" />
          <button onClick={() => { setSearch(''); setStatusFilter(''); setMethodFilter(''); setDateFilter(''); }} className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-500 hover:bg-gray-50">
            <RefreshCw className="w-3.5 h-3.5" /> Reset
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
          <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" /> {total} Payments Found
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="w-7 h-7 text-indigo-400 animate-spin" />
          </div>
        ) : payments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <DollarSign className="w-12 h-12 mb-3 opacity-30" />
            <p className="text-sm font-medium">No payments found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                <tr>
                  {['Order ID', 'Customer', 'Amount', 'Method', 'Transaction ID', 'Status', 'Date', 'Action'].map(h => (
                    <th key={h} className="px-5 py-3 text-left whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {payments.map(p => (
                  <tr key={p.id} className="hover:bg-indigo-50/40 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-xs text-gray-600 font-semibold">
                      #{p.order?.order_number || p.order_id}
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-gray-800 truncate max-w-[120px]">{p.order?.customer?.name || '—'}</p>
                      <p className="text-xs text-gray-400">{p.order?.customer?.mobile || ''}</p>
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-gray-800">{fmt(p.amount)}</td>
                    <td className="px-5 py-3.5"><Badge val={p.payment_method} map={METHOD_META} /></td>
                    <td className="px-5 py-3.5 text-xs text-gray-500 font-mono truncate max-w-[120px]">{p.transaction_id || '—'}</td>
                    <td className="px-5 py-3.5"><Badge val={p.status} map={STATUS_META} /></td>
                    <td className="px-5 py-3.5 text-xs text-gray-500 whitespace-nowrap">{fmtDate(p.created_at)}</td>
                    <td className="px-5 py-3.5">
                      <button onClick={() => setSelectedId(p.id)} className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-semibold hover:bg-indigo-100 transition-colors">
                        <Eye className="w-3.5 h-3.5" /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-50">
            <p className="text-xs text-gray-500">Page {page} of {pages}</p>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => fetchPayments(page - 1)} className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40">Prev</button>
              <button disabled={page >= pages} onClick={() => fetchPayments(page + 1)} className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40">Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedId && <DetailModal paymentId={selectedId} onClose={() => setSelectedId(null)} onRefresh={handleDetailRefresh} />}
    </div>
  );
}

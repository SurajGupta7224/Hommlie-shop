import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, User, MapPin, Package, CreditCard, Clock,
  CheckCircle, Truck, XCircle, AlertCircle, ChevronRight,
  Phone, Building2, FileText, ShoppingBag, Plus, X
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api';

const STATUS_CONFIG = {
  pending:          { label: 'Pending',          color: 'bg-amber-100 text-amber-700 border-amber-200',     dot: 'bg-amber-500',   icon: Clock },
  confirmed:        { label: 'Confirmed',         color: 'bg-blue-100 text-blue-700 border-blue-200',       dot: 'bg-blue-500',    icon: CheckCircle },
  packed:           { label: 'Packed',            color: 'bg-indigo-100 text-indigo-700 border-indigo-200', dot: 'bg-indigo-500',  icon: Package },
  out_for_delivery: { label: 'Out for Delivery',  color: 'bg-purple-100 text-purple-700 border-purple-200', dot: 'bg-purple-500',  icon: Truck },
  delivered:        { label: 'Delivered',         color: 'bg-emerald-100 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500', icon: CheckCircle },
  cancelled:        { label: 'Cancelled',         color: 'bg-red-100 text-red-700 border-red-200',          dot: 'bg-red-500',     icon: XCircle },
};

// Lifecycle flow — what button appears for each status
const NEXT_ACTIONS = {
  pending:          { label: 'Confirm Order',       next: 'confirmed',        btnColor: 'bg-blue-600 hover:bg-blue-700' },
  confirmed:        { label: 'Mark as Packed',      next: 'packed',           btnColor: 'bg-indigo-600 hover:bg-indigo-700' },
  packed:           { label: 'Out for Delivery',    next: 'out_for_delivery', btnColor: 'bg-purple-600 hover:bg-purple-700' },
  out_for_delivery: { label: 'Mark Delivered',      next: 'delivered',        btnColor: 'bg-emerald-600 hover:bg-emerald-700' },
  delivered:        null,
  cancelled:        null,
};

const TIMELINE_STEPS = ['pending', 'confirmed', 'packed', 'out_for_delivery', 'delivered'];

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${cfg.color}`}>
      <Icon className="w-3.5 h-3.5" />
      {cfg.label}
    </span>
  );
};

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelNote, setCancelNote] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentForm, setPaymentForm] = useState({ payment_method: 'COD', transaction_id: '', payment_gateway: '', notes: '' });
  const [savingPayment, setSavingPayment] = useState(false);

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/orders/${id}`);
      setOrder(res.data.order);
    } catch {
      toast.error('Failed to load order');
      navigate('/order-management');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrder(); }, [id]);

  const updateStatus = async (status, note = '') => {
    setUpdating(true);
    try {
      await api.patch(`/orders/${id}/status`, { status, note });
      toast.success(`Order ${STATUS_CONFIG[status]?.label}!`);
      fetchOrder();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdating(false);
      setShowCancelModal(false);
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setSavingPayment(true);
    try {
      await api.post('/payments', {
        order_id: order.id,
        amount: order.final_amount,
        ...paymentForm
      });
      toast.success('Payment added successfully!');
      setShowPaymentModal(false);
      fetchOrder();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add payment');
    } finally {
      setSavingPayment(false);
    }
  };

  if (loading) return (
    <div className="py-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-6 h-6 bg-slate-200 rounded-full animate-pulse"></div>
        <div className="h-7 w-48 bg-slate-200 rounded-xl animate-pulse"></div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[1,2,3,4,5].map(i => <div key={i} className="h-40 bg-slate-100 rounded-3xl animate-pulse"></div>)}
      </div>
    </div>
  );

  if (!order) return null;

  const nextAction = NEXT_ACTIONS[order.status];
  const isCancellable = !['delivered', 'cancelled'].includes(order.status);
  const currentStepIdx = TIMELINE_STEPS.indexOf(order.status);

  return (
    <div className="py-6 px-0">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => navigate('/order-management')} className="hover:text-purple-600 transition-colors text-slate-400">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-2xl font-black text-slate-800">{order.order_number}</h1>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <StatusBadge status={order.status} />
          {isCancellable && (
            <button
              onClick={() => setShowCancelModal(true)}
              className="text-xs font-bold text-red-500 hover:text-red-700 border border-red-200 hover:bg-red-50 px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <XCircle className="w-3.5 h-3.5" /> Cancel Order
            </button>
          )}
          {nextAction && (
            <button
              onClick={() => updateStatus(nextAction.next)}
              disabled={updating}
              className={`text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 shadow-md ${nextAction.btnColor} disabled:opacity-60`}
            >
              {updating ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <ChevronRight className="w-4 h-4" />}
              {nextAction.label}
            </button>
          )}
        </div>
      </div>

      {/* Order Timeline */}
      {order.status !== 'cancelled' && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 mb-6">
          <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-6">Order Progress</h3>
          <div className="flex items-center justify-between">
            {TIMELINE_STEPS.map((step, idx) => {
              const cfg = STATUS_CONFIG[step];
              const Icon = cfg.icon;
              const isDone = currentStepIdx > idx;
              const isActive = currentStepIdx === idx;
              return (
                <React.Fragment key={step}>
                  <div className="flex flex-col items-center gap-2">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      isDone ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200' :
                      isActive ? 'bg-purple-600 text-white shadow-lg shadow-purple-200 ring-4 ring-purple-100' :
                      'bg-slate-100 text-slate-400'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wide text-center max-w-[70px] leading-tight ${
                      isDone ? 'text-emerald-600' : isActive ? 'text-purple-700' : 'text-slate-400'
                    }`}>{cfg.label}</span>
                  </div>
                  {idx < TIMELINE_STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 transition-colors ${isDone ? 'bg-emerald-400' : 'bg-slate-100'}`}></div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">

          {/* Order Items */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-5">
              <ShoppingBag className="w-5 h-5 text-purple-600" />
              <h3 className="font-black text-slate-800">Order Items</h3>
              <span className="ml-auto bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1 rounded-full">
                {order.items?.length} item{order.items?.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="space-y-3">
              {order.items?.map(item => (
                <div key={item.id} className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-2xl p-4 hover:border-purple-200 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-xs font-black text-slate-600 shadow-sm">
                      {item.quantity}x
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{item.product?.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5 uppercase tracking-wide font-bold">
                        {item.variation?.variation_name} {item.variation?.unit && `• ${item.variation.unit}`}
                        {item.variation?.sku && <span className="ml-2 font-mono text-slate-400">SKU: {item.variation.sku}</span>}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-slate-800">₹{(item.unit_price * item.quantity).toFixed(2)}</p>
                    <p className="text-xs text-slate-400">₹{item.unit_price} × {item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="mt-5 pt-5 border-t border-slate-100 space-y-2">
              <div className="flex justify-between text-sm text-slate-500"><span>Items Total</span><span className="font-bold text-slate-700">₹{parseFloat(order.items_total).toFixed(2)}</span></div>
              <div className="flex justify-between text-sm text-slate-500"><span>Delivery Charge</span><span className="font-bold text-slate-700">₹{parseFloat(order.delivery_charge).toFixed(2)}</span></div>
              <div className="flex justify-between text-sm text-slate-500"><span>Taxes</span><span className="font-bold text-slate-700">₹{parseFloat(order.tax_total).toFixed(2)}</span></div>
              <div className="flex justify-between pt-3 border-t border-slate-50">
                <span className="font-black text-slate-800 text-sm uppercase tracking-wide">Total Payable</span>
                <span className="font-black text-purple-600 text-xl">₹{parseFloat(order.final_amount).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Status History */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-5">
              <Clock className="w-5 h-5 text-purple-600" />
              <h3 className="font-black text-slate-800">Status History</h3>
            </div>
            {!order.statusLogs?.length ? (
              <p className="text-slate-400 text-sm text-center py-4">No status changes yet</p>
            ) : (
              <div className="relative pl-4">
                <div className="absolute left-2 top-2 bottom-2 w-px bg-slate-100"></div>
                <div className="space-y-5">
                  {[...order.statusLogs].reverse().map((log, idx) => {
                    const cfg = STATUS_CONFIG[log.new_status] || STATUS_CONFIG.pending;
                    return (
                      <div key={log.id} className="flex items-start gap-4 relative">
                        <div className={`w-3 h-3 rounded-full -ml-5 mt-1.5 ring-2 ring-white ${cfg.dot} flex-shrink-0`}></div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <StatusBadge status={log.new_status} />
                            {log.old_status && (
                              <span className="text-[10px] text-slate-400 font-medium">from <StatusBadge status={log.old_status} /></span>
                            )}
                          </div>
                          {log.note && <p className="text-xs text-slate-500 mt-1 italic">{log.note}</p>}
                          <p className="text-[10px] text-slate-400 mt-1">
                            {log.changedBy?.name || 'System'} • {new Date(log.created_at).toLocaleString('en-IN')}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Payment History Card (New) */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-purple-600" />
                <h3 className="font-black text-slate-800">Payment History</h3>
              </div>
              {order.payment_status !== 'paid' && (
                <button
                  onClick={() => setShowPaymentModal(true)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-bold hover:bg-purple-700 transition-colors shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Payment
                </button>
              )}
            </div>
            
            {!order.payments?.length ? (
              <div className="text-center py-6 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
                <p className="text-sm font-medium text-slate-400">No payment records found.</p>
                <p className="text-xs text-slate-400 mt-1">Payments recorded for this order will appear here.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {order.payments.map(p => (
                  <div key={p.id} className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-100 hover:border-purple-200 transition-colors gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg ${p.status === 'success' ? 'bg-emerald-100 text-emerald-600' : p.status === 'failed' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                        {p.payment_method === 'COD' ? '💵' : '💳'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800 text-sm">{p.payment_method}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${p.status === 'success' ? 'bg-emerald-100 text-emerald-700' : p.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                            {p.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          {new Date(p.created_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute:'2-digit' })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-slate-800 text-lg">₹{parseFloat(p.amount).toFixed(2)}</span>
                      {(p.transaction_id || p.payment_gateway) && (
                        <p className="text-[10px] text-slate-400 font-mono mt-1">
                          {p.payment_gateway && `${p.payment_gateway} `}{p.transaction_id && `• ${p.transaction_id}`}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-5">
              <User className="w-5 h-5 text-purple-600" />
              <h3 className="font-black text-slate-800">Customer</h3>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Name</p>
                <p className="font-bold text-slate-800 mt-1">{order.customer?.name}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Mobile</p>
                <a href={`tel:${order.customer?.mobile}`} className="font-bold text-purple-600 mt-1 flex items-center gap-1.5 hover:underline">
                  <Phone className="w-3.5 h-3.5" /> {order.customer?.mobile}
                </a>
              </div>
              {order.customer?.email && (
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Email</p>
                  <p className="font-medium text-slate-600 mt-1 text-sm">{order.customer.email}</p>
                </div>
              )}
            </div>
          </div>

          {/* Delivery Address */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-5">
              <MapPin className="w-5 h-5 text-purple-600" />
              <h3 className="font-black text-slate-800">Delivery Address</h3>
            </div>
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
              <p className="font-bold text-slate-800 text-sm leading-relaxed">{order.address?.address_line}</p>
              {order.address?.landmark && <p className="text-xs text-slate-500 mt-1">Near: {order.address.landmark}</p>}
              <p className="text-xs text-slate-500 mt-2 font-medium">
                {order.address?.city}, {order.address?.state} - <span className="font-black text-slate-700">{order.address?.pincode}</span>
              </p>
            </div>
          </div>

          {/* Fulfilment Warehouse */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-5">
              <Building2 className="w-5 h-5 text-purple-600" />
              <h3 className="font-black text-slate-800">Fulfilment Centre</h3>
            </div>
            <div className="space-y-2">
              <p className="font-bold text-slate-800">{order.warehouse?.name}</p>
              {order.warehouse?.contact_person && (
                <p className="text-xs text-slate-500">Contact: {order.warehouse.contact_person}</p>
              )}
              {order.warehouse?.contact_phone && (
                <a href={`tel:${order.warehouse.contact_phone}`} className="text-xs text-purple-600 font-bold flex items-center gap-1 hover:underline">
                  <Phone className="w-3 h-3" /> {order.warehouse.contact_phone}
                </a>
              )}
            </div>
          </div>

          {/* Payment & Meta */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-5">
              <CreditCard className="w-5 h-5 text-purple-600" />
              <h3 className="font-black text-slate-800">Payment & Meta</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Method</span>
                <span className="font-bold text-slate-800">{order.payment_method}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Payment Status</span>
                <span className={`font-bold capitalize ${order.payment_status === 'paid' ? 'text-emerald-600' : 'text-amber-600'}`}>{order.payment_status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Source</span>
                <span className="font-bold capitalize text-slate-800">{order.order_source}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Booked by</span>
                <span className="font-bold text-slate-800">{order.createdBy?.name || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date</span>
                <span className="font-bold text-slate-800">{new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
              </div>


            </div>
          </div>
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">
            <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mb-5">
              <AlertCircle className="w-7 h-7 text-red-600" />
            </div>
            <h2 className="text-xl font-black text-slate-800 mb-1">Cancel Order?</h2>
            <p className="text-sm text-slate-500 mb-6">This will cancel <strong>{order.order_number}</strong> and restore stock to the warehouse.</p>
            <textarea
              rows={3}
              placeholder="Reason for cancellation (optional)"
              value={cancelNote}
              onChange={e => setCancelNote(e.target.value)}
              className="w-full border-2 border-slate-200 rounded-2xl px-4 py-3 text-sm font-medium outline-none focus:border-red-400 resize-none mb-5"
            />
            <div className="flex gap-3">
              <button onClick={() => setShowCancelModal(false)} className="flex-1 py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors">
                Keep Order
              </button>
              <button
                onClick={() => updateStatus('cancelled', cancelNote)}
                disabled={updating}
                className="flex-1 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {updating ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : null}
                Cancel Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-purple-600" /> Record Payment
              </h2>
              <button onClick={() => setShowPaymentModal(false)} className="p-1.5 hover:bg-slate-100 rounded-xl transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handlePaymentSubmit} className="p-6 space-y-4">
              <div className="bg-slate-50 rounded-xl p-4 flex justify-between items-center border border-slate-100">
                <span className="text-sm font-bold text-slate-600">Amount Due</span>
                <span className="text-xl font-black text-purple-600">₹{parseFloat(order.final_amount).toFixed(2)}</span>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Payment Method <span className="text-red-500">*</span></label>
                <select 
                  value={paymentForm.payment_method} 
                  onChange={e => setPaymentForm(p => ({ ...p, payment_method: e.target.value }))}
                  className="w-full border-2 border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:border-purple-400 outline-none"
                >
                  {['COD', 'UPI', 'Card', 'Net Banking'].map(m => <option key={m}>{m}</option>)}
                </select>
              </div>

              {paymentForm.payment_method !== 'COD' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Gateway</label>
                    <input 
                      placeholder="e.g. Razorpay" 
                      value={paymentForm.payment_gateway}
                      onChange={e => setPaymentForm(p => ({ ...p, payment_gateway: e.target.value }))}
                      className="w-full border-2 border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:border-purple-400 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Transaction ID</label>
                    <input 
                      placeholder="TXN123..." 
                      value={paymentForm.transaction_id}
                      onChange={e => setPaymentForm(p => ({ ...p, transaction_id: e.target.value }))}
                      className="w-full border-2 border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:border-purple-400 outline-none"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Notes</label>
                <textarea 
                  rows={2}
                  placeholder="Optional note..."
                  value={paymentForm.notes}
                  onChange={e => setPaymentForm(p => ({ ...p, notes: e.target.value }))}
                  className="w-full border-2 border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:border-purple-400 outline-none resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowPaymentModal(false)} className="flex-1 py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={savingPayment} className="flex-1 py-3 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                  {savingPayment ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : null}
                  Confirm Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetails;

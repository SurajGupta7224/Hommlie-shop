import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Icon from '@/components/ui/AppIcon';
import api from '@/api';
import { useAuth } from '@/context/AuthContext';
import ConfirmationModal from '@/components/ui/ConfirmationModal';

export default function OrderDetailsClient() {
  const { orderNumber } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { isLoggedIn } = useAuth();
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  useEffect(() => {
    const fetchOrderDetail = async () => {
      if (!isLoggedIn) return;
      try {
        const res = await api.get(`/orders/detail/${orderNumber}`);
        if (res.data.status === 1) {
          setOrder(res.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch order details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrderDetail();
  }, [orderNumber, isLoggedIn]);

  const handleCancelOrder = async () => {
    try {
      const res = await api.post('/orders/cancel', { order_number: order.order_number });
      if (res.data.status === 1) {
        // Refresh order details
        const res2 = await api.get(`/orders/detail/${orderNumber}`);
        if (res2.data.status === 1) setOrder(res2.data.data);
      } else {
        alert(res.data.message || "Failed to cancel order");
      }
    } catch (error) {
      console.error("Cancel error:", error);
      alert("An error occurred while cancelling the order");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header title="Order Details" showBack />
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header title="Order Details" showBack />
        <div className="flex-grow flex flex-col items-center justify-center p-8 text-center">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-300">
            <Icon name="ExclamationTriangleIcon" size={40} />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Order Not Found</h2>
          <p className="text-slate-500 mb-6">We couldn't find the order details you're looking for.</p>
          <button onClick={() => navigate('/my-orders')} className="bg-primary text-white px-6 py-2 rounded-lg font-bold">
            Back to My Orders
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const isPaid = order.payment_status?.toLowerCase() === 'paid' || order.payment_status?.toLowerCase() === 'completed' || order.payment_status?.toLowerCase() === 'success';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header title={`Order #${order.parent_order_number}`} showBack />

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 md:px-8 py-6">

        {/* Success Banner */}
        <div className={`${isPaid ? 'bg-emerald-50 border-emerald-100' : 'bg-blue-50 border-blue-100'} rounded-lg p-4 flex items-center gap-3 mb-6 border`}>
          <div className={`w-6 h-6 ${isPaid ? 'bg-emerald-500' : 'bg-blue-500'} rounded-full flex items-center justify-center text-white`}>
            <Icon name={isPaid ? "CheckIcon" : "ClipboardDocumentCheckIcon"} size={14} strokeWidth={3} />
          </div>
          <div>
            <h3 className={`text-sm font-bold ${isPaid ? 'text-emerald-900' : 'text-blue-900'}`}>
              {isPaid ? 'Payment Successful' : 'Order Confirmed'}
            </h3>
            <p className={`text-xs ${isPaid ? 'text-emerald-700' : 'text-blue-700'}`}>
              {isPaid
                ? 'All set. Your order is being processed.'
                : order.payment_method === 'COD'
                  ? `Pay ₹${parseFloat(order.final_amount).toLocaleString('en-IN')} on delivery via Cash.`
                  : 'Your order is confirmed and being processed.'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Column: Order Content & Tracking */}
          <div className="lg:col-span-2 space-y-6">

            {/* Products List Card */}
            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
              <div className="p-4 md:p-6 border-b border-slate-100">
                <h2 className="font-bold text-slate-800">Order Items</h2>
              </div>
              <div className="divide-y divide-slate-100">
                {(order.items || []).map((item: any, idx: number) => (
                  <div key={idx} className="p-4 md:p-6 flex gap-4 md:gap-6">
                    <div className="w-20 h-20 md:w-24 md:h-24 flex-shrink-0">
                      {item.product?.thumbnail ? (
                        <img src={item.product.thumbnail} alt={item.product.name} className="w-full h-full object-contain" />
                      ) : (
                        <div className="w-full h-full bg-slate-50 rounded flex items-center justify-center text-slate-300">
                          <Icon name="PhotoIcon" size={32} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-slate-900 text-sm md:text-base mb-1">{item.product?.name}</h3>
                      {(item.variation?.variation_name || item.variation?.label) && (
                        <p className="text-xs text-slate-500">Variation: <span className="text-slate-700">{item.variation?.variation_name || item.variation?.label}</span></p>
                      )}
                      <p className="text-xs text-slate-500 mb-1">Qty: <span className="text-slate-700 font-bold">{item.quantity}</span></p>
                      <p className="text-sm font-bold text-slate-900">₹ {parseFloat(item.total_price).toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                ))}
              </div>
              {/* Tracking Timeline (Vertical - All Statuses) */}
              <div className="p-6 md:p-8 border-t border-slate-100">
                <div className="relative pl-8 space-y-8">
                  {/* Vertical Line Background */}
                  <div className="absolute left-3 top-2 bottom-2 w-[2px] bg-slate-100"></div>
                  
                  {[
                    { key: 'pending', label: 'Order Pending', desc: 'We have received your order' },
                    { key: 'confirmed', label: 'Order Confirmed', desc: 'Your order has been accepted' },
                    { key: 'packed', label: 'Order Packed', desc: 'Your item is being prepared for shipment' },
                    { key: 'out_for_delivery', label: 'Out for Delivery', desc: 'Your order is on its way to you' },
                    { key: 'delivered', label: 'Delivered', desc: 'Order has been successfully delivered' }
                  ].map((step, index) => {
                    const statuses = ['pending', 'confirmed', 'packed', 'out_for_delivery', 'delivered'];
                    const currentStatusIndex = statuses.indexOf(order.status?.toLowerCase() || 'pending');
                    const isCompleted = index <= currentStatusIndex;
                    
                    return (
                      <div key={step.key} className="relative">
                        {/* Status Dot */}
                        <div className={`absolute -left-[25px] top-1 w-4 h-4 rounded-full flex items-center justify-center ring-4 ring-white z-10 transition-colors duration-300 ${
                          isCompleted ? 'bg-emerald-500' : 'bg-slate-200'
                        }`}>
                          {isCompleted && <Icon name="CheckIcon" size={10} strokeWidth={4} className="text-white" />}
                        </div>
                        
                        {/* Connection Line (Progress) */}
                        {index < currentStatusIndex && (
                          <div className="absolute -left-[23px] top-5 h-10 w-[2px] bg-emerald-500 -z-0"></div>
                        )}

                        <div className="flex flex-col">
                          <h4 className={`text-sm font-bold transition-colors ${isCompleted ? 'text-slate-900' : 'text-slate-400'}`}>
                            {step.label}
                          </h4>
                          <p className={`text-xs transition-colors ${isCompleted ? 'text-slate-500' : 'text-slate-400'}`}>
                            {isCompleted 
                              ? `${new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} - ${step.desc}`
                              : step.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}

                  <div className="pt-2">
                    <button className="text-primary text-xs font-bold hover:underline flex items-center gap-1">
                      See All Updates <Icon name="ChevronRightIcon" size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Address & Pricing */}
          <div className="space-y-6">

            {/* Delivery Address Card */}
            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Delivery Details</h3>
              </div>
              <div className="p-4 space-y-4">
                <div className="flex gap-3">
                  <Icon name="MapPinIcon" size={18} className="text-slate-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-slate-800 mb-1">{order.address?.landmark || 'Home'}</p>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {order.address?.address_line}<br />
                      {order.address?.city}, {order.address?.state} - {order.address?.pincode}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 border-t border-slate-50 pt-4">
                  <Icon name="UserIcon" size={18} className="text-slate-400 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-slate-800">{order.address?.name || order.customer?.name || 'Customer'}</p>
                    <p className="text-xs text-slate-500">{order.address?.phone || order.customer?.mobile || 'No phone provided'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Price Details Card */}
            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Price Details</h3>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Items Total</span>
                  <span className="text-slate-800 font-medium">₹ {parseFloat(order.items_total).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Delivery Charges</span>
                  <span className="text-emerald-600 font-medium">
                    {parseFloat(order.delivery_charge) > 0 ? `₹ ${parseFloat(order.delivery_charge)}` : 'FREE'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Taxes & Fees</span>
                  <span className="text-slate-800 font-medium">₹ {(parseFloat(order.tax_total) + parseFloat(order.handling_total)).toFixed(2)}</span>
                </div>
                <div className="border-t border-dashed border-slate-200 pt-3 flex justify-between">
                  <span className="font-bold text-slate-900">Total Amount</span>
                  <span className="font-bold text-slate-900">₹ {parseFloat(order.final_amount).toLocaleString('en-IN')}</span>
                </div>
              </div>
              <div className="bg-slate-50 p-4 border-t border-slate-100 flex items-center justify-between">
                <p className="text-xs text-slate-500">Paid by {order.payment_method}</p>
                <div className="px-2 py-1 bg-white border border-slate-200 rounded text-[10px] font-bold uppercase">{order.payment_method}</div>
              </div>
              <div className="p-4">
                <button className="w-full flex items-center justify-center gap-2 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
                  <Icon name="ArrowDownTrayIcon" size={16} />
                  Download Invoice
                </button>
                {order.status === 'pending' && (
                  <button
                    onClick={() => setIsCancelModalOpen(true)}
                    className="w-full mt-3 flex items-center justify-center gap-2 py-2 border border-red-100 rounded-lg text-sm font-bold text-red-600 hover:bg-red-50 transition-colors shadow-sm"
                  >
                    <Icon name="XMarkIcon" size={16} />
                    Cancel Order
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>

      </main>

      <ConfirmationModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleCancelOrder}
        title="Cancel Order?"
        message="Are you sure you want to cancel this order? This action cannot be undone and the items will be returned to stock."
        confirmText="YES, CANCEL"
        cancelText="NO, KEEP"
        type="danger"
      />

      <Footer />
    </div>
  );
}

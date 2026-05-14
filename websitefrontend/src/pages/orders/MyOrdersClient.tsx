import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Icon from '@/components/ui/AppIcon';
import api from '@/api';
import { useAuth } from '@/context/AuthContext';
import { Link } from 'react-router-dom';


export default function MyOrdersClient() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    const fetchOrders = async () => {
      if (!isLoggedIn) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get('/orders/my');
        if (res.data.status === 1) {
          setOrders(res.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [isLoggedIn]);
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header title="My Orders" showBack />
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 md:px-8 py-8">
        
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 border border-slate-100 shadow-sm text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                <Icon name="ShoppingBagIcon" size={40} />
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">No orders yet</h2>
              <p className="text-slate-500 mb-6">Looks like you haven't placed any orders yet.</p>
              <Link to="/product-listing" className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary/90 transition-all inline-block">
                Start Shopping
              </Link>
            </div>
          ) : (
            orders.flatMap((group: any) => {
              const allItems = group.sub_orders.flatMap((so: any) => 
                (so.items || []).map((item: any) => ({
                  ...item,
                  sub_order_number: so.order_number,
                  order_status: so.status,
                  order_created_at: so.created_at
                }))
              );
              
              const getStatusStyles = (status: string) => {
                const s = status?.toLowerCase();
                if (s === 'delivered') return { text: "text-green-600", dot: "bg-green-500" };
                if (s === 'pending') return { text: "text-amber-600", dot: "bg-amber-500" };
                if (s === 'shipped' || s === 'out_for_delivery') return { text: "text-blue-600", dot: "bg-blue-500" };
                if (s === 'cancelled') return { text: "text-red-600", dot: "bg-red-500" };
                if (s === 'confirmed' || s === 'processing') return { text: "text-indigo-600", dot: "bg-indigo-500" };
                return { text: "text-slate-500", dot: "bg-slate-400" };
              };

              return allItems.map((item: any) => {
                const styles = getStatusStyles(item.order_status);
                return (
                <Link key={`${group.parent_order_number}-${item.id}`} to={`/order-details/${item.sub_order_number}`} className="bg-white border-b md:border border-slate-100 md:border-slate-200 md:rounded-lg p-3 md:p-4 flex items-center md:items-start gap-4 hover:bg-slate-50 transition-colors cursor-pointer">
                  {/* Left: Product Image */}
                  <div className="w-14 h-14 md:w-20 md:h-20 flex-shrink-0">
                    {item.product?.thumbnail ? (
                      <img src={item.product.thumbnail} alt={item.product.name} className="w-full h-full object-contain" />
                    ) : (
                      <div className="w-full h-full bg-slate-50 rounded flex items-center justify-center text-slate-300">
                        <Icon name="PhotoIcon" size={24} />
                      </div>
                    )}
                  </div>

                  {/* Middle: Info & Desktop Status */}
                  <div className="flex-1 min-w-0 flex flex-col md:flex-row md:gap-6">
                    <div className="flex-1 min-w-0">
                      {/* Product Name */}
                      <h3 className="text-[13px] md:text-base font-medium text-slate-500 md:text-slate-900 line-clamp-1 mb-1">
                        {item.product?.name}
                      </h3>

                      {/* Variation & Qty */}
                      <div className="space-y-0.5 mt-0.5">
                        {(item.variation?.variation_name || item.variation?.label) && (
                          <p className="text-[10px] md:text-xs text-slate-500 leading-none">
                            Variation: <span className="text-slate-700">{item.variation?.variation_name || item.variation?.label}</span>
                          </p>
                        )}
                        <p className="text-[10px] md:text-xs text-slate-500 leading-none">
                          Qty: <span className="text-slate-700 font-bold">{item.quantity}</span>
                        </p>
                      </div>
                    </div>

                    {/* Desktop Status & Price */}
                    <div className="hidden md:flex md:w-64 flex-col items-start gap-1">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${styles.dot}`}></div>
                        <p className={`font-bold text-sm ${styles.text}`}>
                          {item.order_status === 'delivered' ? `Delivered on ${new Date(item.order_created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}` : item.order_status.charAt(0).toUpperCase() + item.order_status.slice(1)}
                        </p>
                      </div>
                      <p className="text-xs text-slate-500 mb-2">
                        Your item has been {item.order_status.toLowerCase()}
                      </p>
                      <p className="font-bold text-slate-900 text-lg">
                        ₹ {parseFloat(item.total_price || item.unit_price || 0).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>

                  {/* Right: Status, Price & Chevron (Mobile Only) */}
                  <div className="flex items-center gap-3 md:hidden">
                    <div className="text-right">
                      <p className={`font-bold text-[11px] mb-0.5 ${styles.text}`}>
                        {item.order_status === 'delivered' ? `Delivered` : item.order_status.charAt(0).toUpperCase() + item.order_status.slice(1)}
                      </p>
                      <p className="font-bold text-slate-900 text-sm">
                        ₹ {parseFloat(item.total_price || item.unit_price || 0).toLocaleString('en-IN')}
                      </p>
                    </div>
                    <Icon name="ChevronRightIcon" size={16} className="text-slate-400" />
                  </div>
                </Link>
              );
              });
            })
          )}
        </div>

      </main>
      <Footer />
    </div>
  );
}

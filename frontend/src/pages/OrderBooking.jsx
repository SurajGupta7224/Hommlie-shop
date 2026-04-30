import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Search, Plus, MapPin, CheckCircle, AlertCircle, ShoppingCart,
  CreditCard, FileText, ChevronRight, ArrowLeft, Check, Package, X
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api';

const OrderBooking = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => `sess_${Math.random().toString(36).substring(2, 15)}`);

  // Order State
  const [customer, setCustomer] = useState(null);
  const [cart, setCart] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [warehouse, setWarehouse] = useState(null);
  const [orderTotals, setOrderTotals] = useState({ items: 0, delivery: 0, tax: 0, final: 0 });
  const [placedOrder, setPlacedOrder] = useState(null);
  const [selectedCartIds, setSelectedCartIds] = useState([]);
  const [stockStatus, setStockStatus] = useState([]);

  // --- STEP 1: Customer Selection ---
  const [mobile, setMobile] = useState('');
  const [showRegForm, setShowRegForm] = useState(false);
  const [regData, setRegData] = useState({ name: '', email: '' });
  const [pincodeToSearch, setPincodeToSearch] = useState('');
  const [isServiceable, setIsServiceable] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const handleCheckCustomer = async (mobileNumber = mobile) => {
    if (mobileNumber.length !== 10) return;
    setLoading(true);
    try {
      const res = await api.get(`/customers/check?mobile=${mobileNumber}`);
      if (res.data.found) {
        setCustomer(res.data.customer);
        if (res.data.customer.addresses) {
          setAddresses(res.data.customer.addresses);
        }
        setShowRegForm(false);
        toast.success(`Customer found: ${res.data.customer.name}`);
      } else {
        setCustomer(null);
        setShowRegForm(true);
        toast.info("Customer not found. Please enter details.");
      }
    } catch (err) {
      toast.error("Failed to check customer");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mobile.length === 10) {
      handleCheckCustomer(mobile);
    } else {
      setCustomer(null);
      setShowRegForm(false);
    }
  }, [mobile]);

  useEffect(() => {
    if (customer) {
      fetchCart();
    }
  }, [customer]);

  const handleRegisterCustomer = async (e) => {
    e.preventDefault();
    if (!regData.name) return toast.error("Name is required");
    setLoading(true);
    try {
      const res = await api.post('/customers', { ...regData, mobile });
      setCustomer(res.data.customer);
      setAddresses([]);
      toast.success("Customer registered successfully");
      // Don't auto advance, just let them see the profile and click continue
      setShowRegForm(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  // --- STEP 2: Product Selection (Simplified for MVP) ---
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [subCategories, setSubCategories] = useState([]);
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (step === 2) {
      fetchCategories();
      fetchCart();
    }
  }, [step]);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories?limit=100&status=1');
      setCategories(res.data.categories || []);
    } catch (err) { }
  };

  useEffect(() => {
    if (selectedCategory) {
      setSelectedSubCategory('');
      setSubCategories([]);
      setProducts([]);
      api.get(`/sub-categories?category_id=${selectedCategory}&limit=100&status=1`)
        .then(res => setSubCategories(res.data.subCategories || []));
    } else {
      setSubCategories([]);
      setProducts([]);
    }
  }, [selectedCategory]);

  useEffect(() => {
    if (selectedSubCategory) {
      setProducts([]);
      api.get(`/products?subcategory_id=${selectedSubCategory}&limit=100&status=1`)
        .then(res => setProducts(res.data.products || []));
    } else {
      setProducts([]);
    }
  }, [selectedSubCategory]);

  const fetchCart = async () => {
    try {
      const url = customer ? `/cart?customer_id=${customer.id}` : `/cart?session_id=${sessionId}`;
      const res = await api.get(url);
      const items = res.data.items || [];
      setCart(items);
      // Auto-select all items if none are selected yet
      if (selectedCartIds.length === 0 && items.length > 0) {
        setSelectedCartIds(items.map(i => i.id));
      }
    } catch (err) { }
  };

  const addToCart = async (variationId, productId) => {
    try {
      const res = await api.post('/cart', {
        session_id: sessionId,
        product_id: productId,
        variation_id: variationId,
        quantity: 1,
        customer_id: customer?.id
      });
      toast.success("Added to cart");
      fetchCart();
      // If a new item is added, select it
      if (res.data.item) {
        setSelectedCartIds(prev => [...new Set([...prev, res.data.item.id])]);
      }
    } catch (err) {
      toast.error("Failed to add to cart");
    }
  };

  const toggleItemSelection = (id) => {
    setSelectedCartIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // --- STEP 3: Address Selection ---
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({ address_line: '', landmark: '', pincode: '', city: '', state: '', country: '', pincode_id: '' });

  const handlePincodeChange = async (e) => {
    const code = e.target.value;
    setNewAddress(prev => ({ ...prev, pincode: code }));
    if (code.length === 6) {
      try {
        const res = await api.get(`/locations/pincode/${code}`);
        if (res.data.results && res.data.results.length > 0) {
          const loc = res.data.results[0];
          setNewAddress(prev => ({
            ...prev,
            city: loc.city?.city_name || '',
            state: loc.state?.state_name || '',
            country: loc.country?.country_name || '',
            pincode_id: loc.id
          }));
          toast.success("Pincode verified");
        }
      } catch (err) {
        toast.error("Invalid Pincode");
      }
    }
  };

  const handleSaveAddress = async () => {
    if (!newAddress.address_line || !newAddress.pincode) return toast.error("Address and Pincode required");
    try {
      const res = await api.post(`/customers/${customer.id}/addresses`, newAddress);
      setAddresses([res.data.address, ...addresses]);
      setShowAddAddress(false);
      setSelectedAddress(res.data.address);
      toast.success("Address saved");
    } catch (err) {
      toast.error("Failed to save address");
    }
  };

  // --- STEP 4: Serviceability & Address Logic ---
  const handlePincodeSearch = async () => {
    if (pincodeToSearch.length !== 6) return toast.error("Enter 6-digit pincode");
    setLoading(true);
    try {
      const res = await api.get(`/orders/serviceability?pincode=${pincodeToSearch}`);
      if (res.data.available) {
        setWarehouse({ id: res.data.warehouse_id, name: res.data.warehouse_name });
        setIsServiceable(true);
        // Clear selected address if it doesn't match new pincode
        if (selectedAddress?.pincode !== pincodeToSearch) setSelectedAddress(null);
        toast.success(`Serviceable from ${res.data.warehouse_name}`);
      } else {
        toast.error(res.data.message || "Not serviceable in this area");
        setIsServiceable(false);
      }
    } catch (err) {
      toast.error("Failed to check serviceability");
    } finally {
      setLoading(false);
    }
  };

  const checkStockAndContinue = async () => {
    if (!selectedAddress) return toast.error("Please select an address");
    const selectedItems = cart.filter(item => selectedCartIds.includes(item.id));

    setLoading(true);
    try {
      // 2. Stock Check
      const stockItems = selectedItems.map(c => ({ variation_id: c.variation_id, quantity: c.quantity }));
      const stkRes = await api.post('/orders/check-stock', { warehouse_id: warehouse.id, items: stockItems });

      setStockStatus(stkRes.data.results);

      if (!stkRes.data.allOk) {
        const outOfStockItems = stkRes.data.results
          .filter(r => !r.ok)
          .map(r => {
            const item = selectedItems.find(si => si.variation_id === r.variation_id);
            const alternates = r.alternateWarehouses?.length > 0 ? ` (Available in: ${r.alternateWarehouses.join(', ')})` : ' (Not in any warehouse)';
            return `${item?.product?.name || 'Item'}${alternates}`;
          });
        toast.error(`Stock Error in ${warehouse.name}: ${outOfStockItems.join(' | ')}`, { duration: 8000 });
        setLoading(false);
        return;
      }

      setStockStatus(stkRes.data.results);

      // 3. Calculate Totals
      let itemsTotal = 0, delCharge = 0, taxTotal = 0;
      stkRes.data.results.forEach(res => {
        const cItem = selectedItems.find(c => c.variation_id === res.variation_id);
        if (cItem) {
          itemsTotal += (res.price * cItem.quantity);
          delCharge = Math.max(delCharge, res.delivery_charge);
          taxTotal += ((res.price * cItem.quantity) * res.tax_percent) / 100;
        }
      });

      setOrderTotals({
        items: itemsTotal,
        delivery: delCharge,
        tax: taxTotal,
        final: itemsTotal + delCharge + taxTotal
      });

      setStep(4);
      setTimeout(() => {
        setStep(5);
      }, 1200);
    } catch (err) {
      toast.error("Validation failed");
    } finally {
      setLoading(false);
    }
  };

  // --- STEP 9: Place Order ---
  const placeOrder = async () => {
    setLoading(true);
    const selectedItems = cart.filter(item => selectedCartIds.includes(item.id));
    try {
      const payload = {
        session_id: sessionId,
        customer_id: customer.id,
        warehouse_id: warehouse.id,
        address_id: selectedAddress.id,
        payment_method: 'COD',
        cart_item_ids: selectedCartIds,
        items: selectedItems.map(c => {
          return {
            product_id: c.product_id,
            variation_id: c.variation_id,
            quantity: c.quantity,
            unit_price: c.unit_price,
            delivery_charge: c.delivery_charge,
            tax_percent: c.tax_percent
          }
        })
      };

      const res = await api.post('/orders', payload);
      setPlacedOrder(res.data);
      setOrderPlaced(true);
      toast.success("Order placed successfully!");

      setTimeout(() => {
        setStep(10);
      }, 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };


  // --- RENDER HELPERS ---
  const renderStepIndicator = () => (
    <div className="flex items-center justify-between mb-8 overflow-x-auto pb-4 hide-scrollbar">
      {['Customer', 'Cart', 'Address', 'Validate', 'Payment', 'Done'].map((s, i) => {
        const stepNum = i + 1; // 1, 2, 3, 4, 5, 6
        const isActive = step === stepNum || (i === 5 && step === 10);
        const isPast = step > stepNum;
        return (
          <div key={s} className="flex items-center flex-shrink-0">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${isActive ? 'bg-purple-600 text-white shadow-lg shadow-purple-200' :
                isPast ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-400'
              }`}>
              {isPast ? <Check className="w-4 h-4" /> : i + 1}
            </div>
            <span className={`ml-2 text-xs font-bold uppercase tracking-wider ${isActive ? 'text-purple-700' : isPast ? 'text-green-600' : 'text-slate-400'}`}>
              {s}
            </span>
            {i < 5 && <div className="w-8 h-px bg-slate-200 mx-4"></div>}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="py-6 px-0">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => navigate('/')} className="hover:text-purple-600 transition-colors text-slate-400">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-black text-slate-800">Manual Order Booking</h1>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 py-8 px-8">
        {renderStepIndicator()}

        {/* STEP 1: Customer (Split Panel) */}
        {step === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-8">
            {/* Left Panel: Input */}
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 flex flex-col justify-center h-full">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-6">
                <User className="w-8 h-8 text-purple-600" />
              </div>
              <h2 className="text-2xl font-black text-slate-800 mb-2">Identify Customer</h2>
              <p className="text-slate-500 mb-8 leading-relaxed">Enter the customer's 10-digit mobile number. We will automatically fetch their details if they exist in the system.</p>

              <div className="relative">
                <input
                  type="text"
                  placeholder="Enter 10-digit mobile number"
                  className={`w-full bg-white border-2 px-5 py-4 rounded-2xl outline-none text-slate-800 font-bold text-lg shadow-sm transition-all
                    ${mobile.length === 10 ? 'border-green-500 focus:border-green-500' : 'border-slate-200 focus:border-purple-500'}`}
                  value={mobile}
                  onChange={e => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  autoFocus
                />
                {loading && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
                {mobile.length === 10 && !loading && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  </div>
                )}
              </div>
            </div>

            {/* Right Panel: Result / Form */}
            <div className="flex flex-col justify-center">
              {!customer && !showRegForm && (
                <div className="text-center p-8 border-2 border-dashed border-slate-200 rounded-3xl h-full flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <Search className="w-6 h-6 text-slate-400" />
                  </div>
                  <p className="text-slate-500 font-medium">Awaiting mobile number...</p>
                </div>
              )}

              {customer && !showRegForm && (
                <div className="bg-white border-2 border-purple-100 rounded-3xl p-8 shadow-lg shadow-purple-50 h-full flex flex-col animate-fadeIn relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-bl-full -z-10"></div>

                  <div className="flex items-center gap-6 mb-8">
                    {customer.profile_photo ? (
                      <img src={`${IMAGE_BASE_URL}/Profile_Photo/${customer.profile_photo}`} alt="Profile" className="w-20 h-20 rounded-full object-cover shadow-md border-4 border-white" />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-2xl shadow-md border-4 border-white">
                        {customer.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h3 className="text-2xl font-black text-slate-800">{customer.name}</h3>
                      <p className="text-purple-600 font-bold">{customer.mobile}</p>
                      {customer.email && <p className="text-sm text-slate-500 mt-1">{customer.email}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-slate-50 p-4 rounded-2xl">
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Saved Addresses</p>
                      <p className="text-lg font-black text-slate-700">{addresses.length}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl">
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Status</p>
                      <p className="text-sm font-bold text-green-600 flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" /> Active
                      </p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl">
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Created At</p>
                      <p className="text-sm font-bold text-slate-700">{new Date(customer.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl">
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Updated At</p>
                      <p className="text-sm font-bold text-slate-700">{new Date(customer.updated_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setStep(2)}
                    className="w-full mt-auto bg-purple-600 text-white py-4 rounded-2xl font-black text-lg hover:bg-purple-700 transition-all shadow-xl shadow-purple-200 flex items-center justify-center gap-2"
                  >
                    Continue to Products <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}

              {showRegForm && (
                <div className="bg-white border-2 border-slate-100 rounded-3xl p-8 shadow-xl shadow-slate-200/50 h-full flex flex-col animate-fadeIn">
                  <div className="mb-6">
                    <h3 className="text-xl font-black text-slate-800">New Customer</h3>
                    <p className="text-sm text-slate-500 mt-1">This number is not registered. Add details below.</p>
                  </div>

                  <form onSubmit={handleRegisterCustomer} className="flex flex-col flex-1 space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Mobile Number</label>
                      <input
                        type="text" disabled value={mobile}
                        className="w-full bg-slate-50 border border-slate-200 px-5 py-3 rounded-xl text-slate-500 font-medium cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Full Name *</label>
                      <input
                        type="text" placeholder="Enter customer name" required
                        className="w-full bg-white border-2 border-slate-200 focus:border-purple-500 px-5 py-3 rounded-xl outline-none font-medium text-slate-800 transition-colors"
                        value={regData.name} onChange={e => setRegData({ ...regData, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address (Optional)</label>
                      <input
                        type="email" placeholder="customer@example.com"
                        className="w-full bg-white border-2 border-slate-200 focus:border-purple-500 px-5 py-3 rounded-xl outline-none font-medium text-slate-800 transition-colors"
                        value={regData.email} onChange={e => setRegData({ ...regData, email: e.target.value })}
                      />
                    </div>

                    <button
                      type="submit" disabled={loading}
                      className="w-full mt-auto bg-slate-800 text-white py-4 rounded-2xl font-black hover:bg-slate-900 transition-all shadow-lg flex items-center justify-center gap-2"
                    >
                      {loading ? 'Registering...' : 'Register & Continue'} <ChevronRight className="w-5 h-5" />
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 2: Products & Cart */}
        {step === 2 && (
          <div className="animate-fadeIn">
            <div className="flex items-center gap-3 mb-8">
              <button onClick={() => setStep(1)} className="hover:text-purple-600 transition-colors text-slate-400">
                <ArrowLeft className="w-6 h-6" />
              </button>
              <h2 className="text-2xl font-black text-slate-800">Select Products</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-slate-500 italic">Finding items for <span className="font-bold text-purple-600 underline">{customer?.name}</span></p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <select
                    className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none"
                    value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}
                  >
                    <option value="">Select Category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <select
                    className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none"
                    value={selectedSubCategory} onChange={e => setSelectedSubCategory(e.target.value)}
                  >
                    <option value="">Select Sub-Category</option>
                    {subCategories.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-1 gap-4 mt-6">
                  {!selectedSubCategory && (
                    <div className="col-span-2 text-center py-12 text-slate-400 text-sm font-medium bg-slate-50 rounded-2xl border border-slate-100">
                      Select a category and sub-category to load products
                    </div>
                  )}
                  {selectedSubCategory && products.length === 0 && (
                    <div className="col-span-2 text-center py-12 text-slate-400 text-sm font-medium bg-slate-50 rounded-2xl border border-slate-100">
                      No products found in this sub-category
                    </div>
                  )}
                  {products.map(p => (
                    <div key={p.id} className="border border-slate-200 rounded-2xl p-5 hover:border-purple-300 hover:shadow-md transition-all bg-white">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-slate-800 text-base">{p.name}</h3>
                        <span className="text-xs font-medium text-slate-400 bg-slate-100 px-3 py-1 rounded-full">{p.variations?.length || 0} variant{p.variations?.length !== 1 ? 's' : ''}</span>
                      </div>
                      <div className="space-y-2">
                        {p.variations?.map(v => (
                          <div key={v.id} className="flex items-center justify-between bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl hover:bg-purple-50 hover:border-purple-200 transition-all group">
                            <div className="flex items-center gap-4">
                              <span className="text-sm font-bold text-slate-700">{v.variation_name}</span>
                              {v.unit && <span className="text-xs text-slate-400 bg-white border border-slate-200 px-2 py-0.5 rounded-md">{v.unit}</span>}
                              {v.weight && <span className="text-xs text-slate-400">{v.weight}g</span>}
                              {v.sku && <span className="text-[10px] text-slate-300 font-mono">SKU: {v.sku}</span>}
                            </div>
                            <button
                              onClick={() => addToCart(v.id, p.id)}
                              className="bg-white border border-slate-200 group-hover:bg-purple-600 group-hover:text-white group-hover:border-purple-600 text-slate-700 px-5 py-1.5 rounded-lg text-xs font-bold transition-all"
                            >
                              + Add
                            </button>
                          </div>
                        ))}
                        {(!p.variations || p.variations.length === 0) && (
                          <div className="text-xs text-red-400 bg-red-50 border border-red-100 px-4 py-3 rounded-xl">No variations added for this product</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 h-fit sticky top-6">
                <h3 className="font-black text-slate-800 uppercase tracking-tight mb-4 flex items-center">
                  <ShoppingCart className="w-5 h-5 mr-2 text-purple-600" /> Current Cart
                </h3>
                {cart.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-sm font-medium">Cart is empty</div>
                ) : (
                  <div className="space-y-4 mb-6">
                    {cart.map(item => (
                      <div key={item.id} className="flex items-start bg-white p-3 rounded-xl border border-slate-100 gap-3">
                        <input
                          type="checkbox"
                          checked={selectedCartIds.includes(item.id)}
                          onChange={() => toggleItemSelection(item.id)}
                          className="mt-1 w-4 h-4 rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-bold text-slate-800 leading-tight">{item.product?.name}</p>
                          <p className="text-[10px] text-slate-500 mt-1 uppercase">{item.variation?.variation_name}</p>
                          <p className="text-xs font-bold text-purple-600 mt-1">₹{item.unit_price} x {item.quantity}</p>
                        </div>
                        <button
                          onClick={() => {
                            api.delete(`/cart/${item.id}`).then(() => {
                              setSelectedCartIds(prev => prev.filter(id => id !== item.id));
                              fetchCart();
                            });
                          }}
                          className="text-slate-400 hover:text-red-500"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <button
                  onClick={() => setStep(3)} disabled={selectedCartIds.length === 0}
                  className="w-full bg-slate-800 text-white py-3 rounded-xl font-bold hover:bg-slate-700 transition-colors disabled:opacity-50"
                >
                  Proceed to Address ({selectedCartIds.length} items)
                </button>
              </div>
            </div>
          </div>
        )}
        {/* STEP 3: Address Selection (Split Panel) */}
        {step === 3 && (
          <div className="animate-fadeIn">
            <div className="flex items-center gap-3 mb-8">
              <button onClick={() => { setStep(2); setIsServiceable(false); }} className="hover:text-purple-600 transition-colors text-slate-400">
                <ArrowLeft className="w-6 h-6" />
              </button>
              <h2 className="text-2xl font-black text-slate-800">Delivery Details</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 py-2">
              {/* Left Panel: Serviceability Search */}
              <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 flex flex-col justify-between min-h-[400px]">
                <div>
                  <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-purple-100">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>

                  <h2 className="text-xl font-bold text-slate-800 mb-2">Check Area</h2>
                  <p className="text-slate-500 mb-8 leading-relaxed text-sm">Enter the delivery pincode to verify serviceability and warehouse availability.</p>

                  <div className="space-y-4">
                    <div className="relative">
                      <input
                        type="text" placeholder="6-digit pincode" maxLength="6"
                        className={`w-full bg-white border-2 px-5 py-3.5 rounded-xl outline-none text-slate-800 font-bold text-xl shadow-sm transition-all
                             ${pincodeToSearch.length === 6 ? 'border-purple-200' : 'border-slate-100 focus:border-purple-500'}`}
                        value={pincodeToSearch} onChange={e => setPincodeToSearch(e.target.value.replace(/\D/g, ''))}
                      />
                    </div>

                    <button
                      onClick={handlePincodeSearch} disabled={loading || pincodeToSearch.length !== 6}
                      className="bg-slate-800 text-white px-8 py-3.5 rounded-xl font-bold text-sm hover:bg-slate-900 transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {loading ? 'Verifying...' : 'Check Serviceability'} <ChevronRight className="w-4 h-4" />
                    </button>

                    {isServiceable && (
                      <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-2xl animate-fadeIn mt-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm">
                            <CheckCircle className="w-4 h-4 text-emerald-600" />
                          </div>
                          <div>
                            <p className="text-emerald-800 font-bold text-sm">Serviceable Area</p>
                            <p className="text-emerald-600/80 text-[10px] font-black uppercase tracking-tighter">Warehouse: {warehouse?.name}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Panel: Address List / Form */}
              <div className="flex flex-col h-full bg-white border border-slate-100 rounded-3xl p-8 shadow-sm">
                {!isServiceable ? (
                  <div className="text-center p-12 border-2 border-dashed border-slate-100 rounded-2xl h-full flex flex-col items-center justify-center bg-slate-50/20">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                      <Search className="w-6 h-6 text-slate-300" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-400">Awaiting Pincode</h3>
                    <p className="text-slate-300 text-xs mt-1">Verify serviceability on the left to see addresses.</p>
                  </div>
                ) : (
                  <div className="flex flex-col h-full space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-slate-800">Choose Address</h3>
                      <button
                        onClick={() => {
                          setShowAddAddress(!showAddAddress);
                          setNewAddress({ ...newAddress, pincode: pincodeToSearch });
                        }}
                        className="p-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-600 hover:text-white transition-all"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {showAddAddress ? (
                      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 animate-fadeIn">
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div className="bg-white px-4 py-2.5 rounded-lg border border-slate-100 flex flex-col">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Pincode</span>
                            <span className="font-bold text-slate-800 text-sm">{pincodeToSearch}</span>
                          </div>
                          <div className="bg-white px-4 py-2.5 rounded-lg border border-slate-100 flex flex-col">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">City/State</span>
                            <span className="font-bold text-slate-800 text-sm">Auto-fetched</span>
                          </div>
                        </div>
                        <input
                          type="text" placeholder="Address Line (House/Street) *"
                          className="w-full bg-white border border-slate-100 focus:border-purple-500 px-4 py-3 rounded-xl outline-none font-medium text-slate-800 text-sm transition-all mb-3"
                          value={newAddress.address_line} onChange={e => setNewAddress({ ...newAddress, address_line: e.target.value })}
                        />
                        <input
                          type="text" placeholder="Landmark"
                          className="w-full bg-white border border-slate-100 focus:border-purple-500 px-4 py-3 rounded-xl outline-none font-medium text-slate-800 text-sm transition-all mb-6"
                          value={newAddress.landmark} onChange={e => setNewAddress({ ...newAddress, landmark: e.target.value })}
                        />
                        <div className="flex gap-3">
                          <button onClick={() => setShowAddAddress(false)} className="flex-1 py-2.5 text-sm font-bold text-slate-400 hover:text-slate-600">Cancel</button>
                          <button onClick={handleSaveAddress} className="flex-[2] bg-purple-600 text-white py-2.5 rounded-xl font-bold text-sm shadow-md shadow-purple-50">Save & Select</button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                        {addresses.filter(a => a.pincode === pincodeToSearch).length === 0 ? (
                          <div className="text-center py-10 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-100">
                            <p className="text-slate-400 font-bold text-sm">No addresses found</p>
                            <p className="text-slate-300 text-[10px]">Add a new one for this pincode above.</p>
                          </div>
                        ) : (
                          addresses.filter(a => a.pincode === pincodeToSearch).map(addr => (
                            <div
                              key={addr.id}
                              onClick={() => setSelectedAddress(addr)}
                              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-4 ${selectedAddress?.id === addr.id ? 'border-purple-600 bg-purple-50/50' : 'border-slate-50 bg-slate-50 hover:border-slate-200'}`}
                            >
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${selectedAddress?.id === addr.id ? 'border-purple-600 bg-white' : 'border-slate-200'}`}>
                                {selectedAddress?.id === addr.id && <div className="w-2.5 h-2.5 bg-purple-600 rounded-full"></div>}
                              </div>
                              <div className="flex-1">
                                <p className="font-bold text-slate-800 text-sm leading-tight">{addr.address_line}</p>
                                <p className="text-[10px] text-slate-500 mt-1">{addr.city}, {addr.state} - {addr.pincode}</p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    <div className="mt-auto pt-6">
                      <button
                        onClick={checkStockAndContinue}
                        disabled={!selectedAddress || loading}
                        className="w-full bg-slate-800 text-white py-3.5 rounded-xl font-bold text-sm hover:bg-slate-900 transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {loading ? 'Processing...' : 'Confirm Delivery'} <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Validation / Processing */}
        {step === 4 && (
          <div className="flex flex-col items-center justify-center py-20 animate-fadeIn">
            <div className="w-24 h-24 border-4 border-purple-100 border-t-purple-600 rounded-full animate-spin mb-8"></div>
            <h2 className="text-2xl font-black text-slate-800 mb-2">Validating Details</h2>
            <p className="text-slate-500 font-medium text-center max-w-sm">Please wait while we verify stock availability and calculate delivery charges...</p>
          </div>
        )}

        {/* STEP 5: Payment Method */}
        {step === 5 && (
          <div className="animate-fadeIn">
            <div className="flex items-center gap-3 mb-8">
              <button onClick={() => setStep(3)} className="hover:text-purple-600 transition-colors text-slate-400">
                <ArrowLeft className="w-6 h-6" />
              </button>
              <h2 className="text-2xl font-black text-slate-800">Select Payment</h2>
            </div>

            <div className="w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div
                  onClick={() => setStep(6)}
                  className="bg-white border-2 border-purple-600 p-6 rounded-2xl cursor-pointer hover:shadow-lg transition-all flex items-center gap-4 group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-12 h-12 bg-purple-50 rounded-bl-full -z-0"></div>
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center relative z-10">
                    <CreditCard className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="flex-1 relative z-10">
                    <h3 className="text-base font-bold text-slate-800 leading-tight">Cash on Delivery</h3>
                    <p className="text-[10px] text-slate-500 mt-1">Pay on arrival</p>
                  </div>
                  <div className="w-6 h-6 rounded-full border-4 border-purple-600 bg-white relative z-10"></div>
                </div>

                <div className="bg-slate-50 border-2 border-slate-100 p-6 rounded-2xl opacity-60 cursor-not-allowed flex items-center gap-4 grayscale">
                  <div className="w-12 h-12 bg-slate-200 rounded-xl flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-slate-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-slate-500 leading-tight">Online Payment</h3>
                    <p className="text-[10px] text-slate-400 mt-1">Coming Soon</p>
                  </div>
                </div>
              </div>

              <div className="mt-10 flex justify-center">
                <button onClick={() => setStep(6)} className="bg-slate-800 text-white px-10 py-3.5 rounded-xl font-bold text-sm hover:bg-slate-900 transition-all shadow-md flex items-center gap-2">
                  Continue to Review <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 6: Done (Final Review & Book) */}
        {step === 6 && (
          <div className="animate-fadeIn">
            <div className="flex items-center gap-3 mb-8">
              <button onClick={() => setStep(5)} className="hover:text-purple-600 transition-colors text-slate-400">
                <ArrowLeft className="w-6 h-6" />
              </button>
              <h2 className="text-2xl font-black text-slate-800">Final Review</h2>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-center mb-8">
              <CheckCircle className="w-6 h-6 mr-3 text-emerald-600" />
              <div>
                <p className="font-bold text-sm">Serviceability & Stock Confirmed!</p>
                <p className="text-xs mt-0.5">Fulfilling from: <strong>{warehouse?.name}</strong></p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="w-5 h-5 text-purple-600" />
                  <h3 className="text-lg font-bold text-slate-800">Ordered Items</h3>
                </div>
                <div className="space-y-3 mb-8 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {cart.filter(item => selectedCartIds.includes(item.id)).map(item => (
                    <div key={item.id} className="flex justify-between items-center bg-white border border-slate-100 p-4 rounded-xl shadow-sm group hover:border-purple-200 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-[10px] font-black text-slate-400 group-hover:bg-purple-50 group-hover:text-purple-600 transition-all">
                          {item.quantity}x
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-sm leading-tight">{item.product?.name}</p>
                          <p className="text-[9px] text-slate-400 uppercase tracking-wider font-bold mt-0.5">{item.variation?.variation_name}</p>
                        </div>
                      </div>
                      <p className="font-bold text-slate-700 text-sm">₹{(item.unit_price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 shadow-inner">
                  <div className="space-y-4 mb-8 pb-8 border-b border-slate-200">
                    <div className="flex justify-between text-sm"><span className="text-slate-500 font-medium">Items Total</span><span className="font-bold text-slate-800">₹{orderTotals.items.toFixed(2)}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-slate-500 font-medium">Delivery Charge</span><span className="font-bold text-slate-800">₹{orderTotals.delivery.toFixed(2)}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-slate-500 font-medium">Estimated Tax</span><span className="font-bold text-slate-800">₹{orderTotals.tax.toFixed(2)}</span></div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Payable Amount</span>
                    <span className="text-3xl font-black text-purple-600">₹{orderTotals.final.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-4">Payment Method</h3>
                <div className="border-2 border-purple-600 bg-purple-50/50 rounded-2xl p-4 flex items-center">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mr-4 shadow-sm">
                    <CreditCard className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">Cash on Delivery (COD)</p>
                    <p className="text-xs text-slate-500 mt-1">Payment to be collected upon delivery</p>
                  </div>
                  <div className="ml-auto w-5 h-5 rounded-full border-4 border-purple-600 bg-white"></div>
                </div>
              </div>
            </div>

            <div className="mt-10 flex justify-end">
              <button
                onClick={placeOrder}
                disabled={loading || orderPlaced}
                className={`px-10 py-4 rounded-2xl font-black text-lg shadow-xl transition-all flex items-center justify-center gap-3 min-w-[240px]
                    ${orderPlaced ? 'bg-emerald-500 text-white shadow-emerald-200' : 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-200'}
                    disabled:opacity-70`}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Booking...
                  </>
                ) : orderPlaced ? (
                  <>
                    <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center animate-bounce">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    Booked!
                  </>
                ) : (
                  <>
                    Book Order <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 10: Success */}
        {step === 10 && (
          <div className="py-4 animate-fadeIn">
            <div className="flex items-center gap-3 mb-8">
              <button onClick={() => setStep(6)} className="hover:text-purple-600 transition-colors text-slate-400">
                <ArrowLeft className="w-6 h-6" />
              </button>
              <h2 className="text-2xl font-black text-slate-800">Order Placed!</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
              <div className="space-y-6">
                {/* Status Card */}
                <div className="flex items-center gap-6 bg-green-50 p-6 rounded-3xl border border-green-100">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <div>
                    <p className="text-slate-700 font-bold text-lg">Order Confirmed</p>
                    <p className="text-slate-500 text-sm">Created: {new Date(placedOrder?.created_at).toLocaleString()}</p>
                  </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Customer Details</p>
                    <p className="font-bold text-slate-800">{customer?.name}</p>
                    <p className="text-sm text-slate-500 mt-1">{customer?.mobile}</p>
                  </div>
                  <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Fulfillment Center</p>
                    <p className="font-bold text-slate-800">{warehouse?.name || 'Default Warehouse'}</p>
                    <p className="text-[10px] text-green-600 font-bold flex items-center mt-1 uppercase tracking-tighter">
                      <Package className="w-3 h-3 mr-1" /> Stock Verified
                    </p>
                  </div>
                </div>

                {/* Address Card */}
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Delivery Address</p>
                  <p className="text-sm font-bold text-slate-700 leading-relaxed">{selectedAddress?.address_line}</p>
                  <p className="text-xs text-slate-500 mt-2">{selectedAddress?.landmark && `${selectedAddress.landmark}, `}{selectedAddress?.city}, {selectedAddress?.state} - {selectedAddress?.pincode}</p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Order Summary Card */}
                <div className="bg-white border-2 border-slate-100 rounded-3xl p-8 shadow-sm">
                  <div className="flex justify-between items-center mb-6 pb-6 border-b border-slate-100">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Order Number</p>
                      <p className="text-xl font-black text-slate-800 font-mono">{placedOrder?.order_number}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Items Selected</p>
                      <p className="text-xl font-black text-purple-600">{cart.filter(item => selectedCartIds.includes(item.id)).length}</p>
                    </div>
                  </div>

                  <div className="space-y-4 mb-8">
                    {cart.filter(item => selectedCartIds.includes(item.id)).map(item => {
                      const stockInfo = stockStatus.find(s => s.variation_id === item.variation_id);
                      return (
                        <div key={item.id} className="flex justify-between items-center text-sm">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 text-[10px] font-bold">{item.quantity}x</div>
                            <div>
                              <p className="font-bold text-slate-800">{item.product?.name}</p>
                              <div className="flex items-center gap-2">
                                <p className="text-[10px] text-slate-400 uppercase">{item.variation?.variation_name}</p>
                                {stockInfo && (
                                  <span className="text-[9px] font-bold bg-green-50 text-green-600 px-1.5 py-0.5 rounded border border-green-100">
                                    {stockInfo.available_stock} Left
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <p className="font-bold text-slate-700">₹{(item.unit_price * item.quantity).toFixed(2)}</p>
                        </div>
                      );
                    })}
                  </div>

                  <div className="space-y-3 pt-6 border-t border-slate-100 mb-8">
                    <div className="flex justify-between text-sm text-slate-500"><span>Items Total</span><span>₹{orderTotals.items.toFixed(2)}</span></div>
                    <div className="flex justify-between text-sm text-slate-500"><span>Delivery Charge</span><span>₹{orderTotals.delivery.toFixed(2)}</span></div>
                    <div className="flex justify-between text-sm text-slate-500"><span>Taxes (Estimated)</span><span>₹{orderTotals.tax.toFixed(2)}</span></div>
                    <div className="flex justify-between pt-3 text-lg font-black text-slate-800 border-t border-slate-50 mt-2">
                      <span>Total to Collect</span>
                      <span className="text-purple-600 text-2xl font-black">₹{placedOrder?.final_amount || orderTotals.final.toFixed(2)}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => window.location.reload()}
                    className="bg-slate-800 text-white px-8 py-4 rounded-2xl font-black text-lg hover:bg-slate-900 transition-all w-full shadow-lg flex items-center justify-center gap-2"
                  >
                    Book Another Order <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderBooking;

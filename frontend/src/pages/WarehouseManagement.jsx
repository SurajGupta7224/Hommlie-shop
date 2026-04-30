import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Plus, Edit2, Trash2, Search, MapPin, Package, AlertTriangle, X, Check, CheckCircle, FileText, Building2, RefreshCw, RotateCcw
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api';
import ConfirmModal from '../components/ConfirmModal';

const SuggestionInput = ({ label, name, value, onChange, placeholder, light = false }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (value.length < 1) {
        setSuggestions([]);
        return;
      }
      setLoading(true);
      try {
        const res = await api.get('/locations/suggestions', { params: { field: name, query: value } });
        setSuggestions(res.data.suggestions);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timer);
  }, [value, name]);

  return (
    <div className="flex flex-col gap-1.5 relative group">
      <label className={`text-[10px] font-black uppercase tracking-tight ${light ? 'text-slate-400' : 'text-slate-500'}`}>{label}</label>
      <div className="relative">
        <Search className={`absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 transition-colors ${light ? 'text-slate-300' : 'text-slate-400'}`} />
        <input 
          type="text" 
          name={name}
          placeholder={placeholder} 
          value={value}
          autoComplete="off"
          onChange={onChange}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          className={`w-full rounded-lg py-2 pl-8 pr-3 text-xs outline-none focus:ring-2 focus:ring-violet-200 text-black transition-all ${
            light 
            ? 'bg-white border border-slate-200 focus:border-violet-300' 
            : 'bg-white border-2 border-slate-300 focus:border-violet-400'
          }`}
        />
        {loading && <div className="absolute right-2.5 top-1/2 -translate-y-1/2"><div className="w-3 h-3 border-2 border-violet-600/20 border-t-violet-600 rounded-full animate-spin"></div></div>}
      </div>
      
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 w-full bg-white border border-slate-200 rounded-xl shadow-2xl z-[9999] overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200 min-w-[150px]">
          {suggestions.map((s, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                onChange({ target: { name, value: s } });
                setShowSuggestions(false);
              }}
              className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-violet-50 hover:text-violet-700 transition-colors border-b border-slate-50 last:border-none"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const MappingReport = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [mappings, setMappings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({ warehouse_id: '', pincode: '', area: '', city: '', district: '', state: '' });

  useEffect(() => {
    api.get('/warehouses', { params: { limit: 100, status: 1 } }).then(res => setWarehouses(res.data.warehouses));
  }, []);

  useEffect(() => {
    fetchReport();
  }, [page, filters]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await api.get('/warehouses/mappings/report', { params: { ...filters, page, limit: 10 } });
      setMappings(res.data.mappings);
      setTotalPages(res.data.pages);
    } catch { toast.error("Failed to fetch report"); }
    finally { setLoading(false); }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPage(1);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <div className="mb-8">
        <h3 className="font-black text-slate-800 text-lg mb-6 flex items-center gap-2"><FileText className="w-5 h-5 text-violet-600" />Global Mapping Report</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 bg-slate-50 p-6 rounded-2xl border border-slate-100">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black uppercase text-slate-400">Warehouse</label>
            <select name="warehouse_id" value={filters.warehouse_id} onChange={handleFilterChange} className="bg-white border border-slate-200 rounded-lg py-2 px-3 text-xs outline-none focus:ring-2 focus:ring-violet-200 font-bold">
              <option value="">All Warehouses</option>{warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>
          {['pincode', 'area', 'city', 'region', 'district', 'state'].map(f => (
            <SuggestionInput 
              key={f}
              label={f}
              name={f}
              placeholder="Search..."
              value={filters[f]}
              onChange={handleFilterChange}
              light={true}
            />
          ))}
        </div>
      </div>
      <div className="overflow-x-auto border-2 border-slate-200 rounded-2xl mb-6 relative min-h-[300px] shadow-sm">
        {loading && <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] z-10 flex items-center justify-center"><div className="w-8 h-8 border-4 border-violet-600/20 border-t-violet-600 rounded-full animate-spin"></div></div>}
        <table className={`w-full text-left border-collapse ${loading ? 'opacity-30' : ''}`}>
          <thead>
            <tr className="bg-slate-100/50 text-[11px] uppercase font-black text-slate-500 border-b-2 border-slate-200">
              <th className="p-4 border-r border-slate-200">Warehouse</th><th className="p-4 border-r border-slate-200">Pincode</th><th className="p-4 border-r border-slate-200">Area</th><th className="p-4 border-r border-slate-200">City</th><th className="p-4 border-r border-slate-200">District</th><th className="p-4 border-r border-slate-200">State</th><th className="p-4">Country</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {mappings.length === 0 && !loading ? <tr><td colSpan="7" className="p-20 text-center text-slate-400 font-medium">No mappings found matching these filters.</td></tr> : mappings.map(m => (
              <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                <td className="py-4 px-4 text-sm font-black text-violet-700 border-r border-slate-200">{m.warehouse?.name}</td>
                <td className="py-4 px-4 text-sm text-black font-mono border-r border-slate-200">{m.pincode?.pincode}</td>
                <td className="py-4 px-4 text-sm text-black border-r border-slate-200">{m.pincode?.city?.area}</td>
                <td className="py-4 px-4 text-sm text-slate-900 border-r border-slate-200">{m.pincode?.city?.city_name}</td>
                <td className="py-4 px-4 text-sm text-slate-800 border-r border-slate-200">{m.pincode?.city?.district}</td>
                <td className="py-4 px-4 text-sm text-black border-r border-slate-200">{m.pincode?.state?.state_name}</td>
                <td className="py-4 px-4 text-sm text-slate-900">{m.pincode?.country?.country_name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-between items-center">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Showing page {page} of {totalPages}</div>
        <div className="flex items-center gap-2">
          <button disabled={page === 1} onClick={() => setPage(page - 1)} className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-30 text-xs font-bold">Previous</button>
          <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-30 text-xs font-bold">Next</button>
        </div>
      </div>
    </div>
  );
};

const WarehouseManagement = () => {
  const [activeTab, setActiveTab] = useState('setup'); // setup, pincodes, report, allocation, update

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Warehouse & Inventory</h1>
          <p className="text-slate-500 text-sm mt-1">Manage locations, pincode mapping, and variation stock.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm mb-6">
        <div className="flex border-b border-slate-200 overflow-x-auto custom-scrollbar">
          <button onClick={() => setActiveTab('setup')} className={`px-6 py-4 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'setup' ? 'border-violet-600 text-violet-600 bg-violet-50' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}>Warehouse Setup</button>
          <button onClick={() => setActiveTab('pincodes')} className={`px-6 py-4 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'pincodes' ? 'border-violet-600 text-violet-600 bg-violet-50' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}>Pincode Mapping</button>
          <button onClick={() => setActiveTab('report')} className={`px-6 py-4 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'report' ? 'border-violet-600 text-violet-600 bg-violet-50' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}>Mapping Reports</button>
          <button onClick={() => setActiveTab('allocation')} className={`px-6 py-4 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'allocation' ? 'border-violet-600 text-violet-600 bg-violet-50' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}>Product Allocation</button>
          <button onClick={() => setActiveTab('update')} className={`px-6 py-4 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'update' ? 'border-violet-600 text-violet-600 bg-violet-50' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}>Stock Updates & Alerts</button>
        </div>
      </div>

      {activeTab === 'setup' && <WarehouseSetup />}
      {activeTab === 'pincodes' && <PincodeMapping />}
      {activeTab === 'report' && <MappingReport />}
      {activeTab === 'allocation' && <ProductAllocation />}
      {activeTab === 'update' && <StockUpdate />}

    </div>
  );
};

// --- TAB 1: SETUP ---
const WarehouseSetup = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.role?.role_name?.toLowerCase() === 'admin';

  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', code: '', pincode: '', country_id: '', state_id: '', city_id: '', address: '', contact_person: '', contact_phone: '', email: '', status: 1 });
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  
  const [pincodeSuggestions, setPincodeSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  useEffect(() => { fetchWarehouses(); fetchCountries(); }, []);
  useEffect(() => { if (formData.country_id) fetchStates(formData.country_id); else setStates([]); }, [formData.country_id]);
  useEffect(() => { if (formData.state_id) fetchCities(formData.state_id); else setCities([]); }, [formData.state_id]);

  const fetchWarehouses = async () => {
    setLoading(true);
    try {
      const res = await api.get('/warehouses', { params: { limit: 100 } });
      setWarehouses(res.data.warehouses);
    } catch { toast.error("Failed to load warehouses"); }
    finally { setLoading(false); }
  };
  const fetchCountries = async () => {
    try { const res = await api.get('/locations/countries'); setCountries(res.data.countries); } catch {}
  };
  const fetchStates = async (cid) => {
    try { const res = await api.get(`/locations/states/${cid}`); setStates(res.data.states); } catch {}
  };
  const fetchCities = async (sid) => {
    try { const res = await api.get(`/locations/cities/${sid}`); setCities(res.data.cities); } catch {}
  };

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const resetForm = () => {
    setFormData({ name: '', code: '', pincode: '', country_id: '', state_id: '', city_id: '', address: '', contact_person: '', contact_phone: '', email: '', status: 1 });
    setIsEditMode(false);
    setSelectedId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditMode) {
        await api.put(`/warehouses/${selectedId}`, formData);
        toast.success("Warehouse updated");
      } else {
        await api.post('/warehouses', formData);
        toast.success("Warehouse created");
      }
      fetchWarehouses();
      setIsFormOpen(false);
      resetForm();
    } catch (err) { toast.error(err.response?.data?.message || "Failed to save warehouse"); }
  };

  const editWarehouse = (w) => {
    setFormData({
      name: w.name, code: w.code, pincode: w.pincode || '', country_id: w.country_id || '', state_id: w.state_id || '', city_id: w.city_id || '',
      address: w.address || '', contact_person: w.contact_person || '', contact_phone: w.contact_phone || '', email: w.email || '', status: w.status
    });
    setSelectedId(w.id);
    setIsEditMode(true);
    setIsFormOpen(true);
  };

  const toggleStatus = async (w) => {
    try {
      await api.patch(`/warehouses/${w.id}/status`, { status: w.status === 1 ? 0 : 1 });
      toast.success("Status updated");
      fetchWarehouses();
    } catch { toast.error("Failed to update status"); }
  };

  const handlePincodeChange = async (e) => {
    const code = e.target.value;
    setFormData(prev => ({ ...prev, pincode: code }));
    
    if (code.length >= 6) {
      try {
        const res = await api.get(`/locations/pincode/${code}`);
        if (res.data.results && res.data.results.length > 0) {
          setPincodeSuggestions(res.data.results);
          setShowSuggestions(true);
        }
      } catch {
        toast.error("Invalid pincode or not found");
        setPincodeSuggestions([]);
        setShowSuggestions(false);
      }
    } else {
      setPincodeSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const selectPincodeResult = (data) => {
    setFormData(prev => ({
      ...prev,
      country_id: data.country?.id || prev.country_id,
      state_id: data.state?.id || prev.state_id,
      city_id: data.city?.id || prev.city_id
    }));
    setShowSuggestions(false);
  };

  return (
    <div>
      {isFormOpen ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-800">{isEditMode ? 'Edit Warehouse' : 'Add New Warehouse'}</h2>
            <button onClick={() => { setIsFormOpen(false); resetForm(); }} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50"><X className="w-5 h-5"/></button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div><label className="block text-xs font-bold text-slate-500 mb-2">Name *</label><input required type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm outline-none focus:ring-2 focus:ring-violet-200" /></div>
            <div><label className="block text-xs font-bold text-slate-500 mb-2">Code (Unique) *</label><input required type="text" name="code" value={formData.code} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm outline-none focus:ring-2 focus:ring-violet-200 font-mono uppercase" /></div>
            <div className="relative">
              <label className="block text-xs font-bold text-slate-500 mb-2">Pincode</label>
              <input type="text" name="pincode" value={formData.pincode} onChange={handlePincodeChange} placeholder="Enter 6 digit pincode" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm outline-none focus:ring-2 focus:ring-violet-200 font-mono" />
              {showSuggestions && pincodeSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-60 overflow-y-auto custom-scrollbar">
                  {pincodeSuggestions.map((res, idx) => (
                    <div 
                      key={idx} 
                      className="px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-b-0"
                      onClick={() => selectPincodeResult(res)}
                    >
                      <div className="text-[13px] font-bold text-slate-800 leading-snug">
                        {res.pincode} - {res.city?.area}, {res.city?.city_name}, {res.city?.district}, {res.city?.region}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1 uppercase tracking-wide">
                        {res.state?.state_name} &bull; {res.country?.country_name}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div><label className="block text-xs font-bold text-slate-500 mb-2">Country</label>
              <select name="country_id" value={formData.country_id} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm outline-none focus:ring-2 focus:ring-violet-200">
                <option value="">Select Country</option>
                {countries.map(c => <option key={c.id} value={c.id}>{c.country_name}</option>)}
              </select>
            </div>
            <div><label className="block text-xs font-bold text-slate-500 mb-2">State</label>
              <select name="state_id" value={formData.state_id} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm outline-none focus:ring-2 focus:ring-violet-200">
                <option value="">Select State</option>
                {states.map(s => <option key={s.id} value={s.id}>{s.state_name}</option>)}
              </select>
            </div>
            <div><label className="block text-xs font-bold text-slate-500 mb-2">City</label>
              <select name="city_id" value={formData.city_id} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm outline-none focus:ring-2 focus:ring-violet-200">
                <option value="">Select City</option>
                {cities.map(c => <option key={c.id} value={c.id}>{c.city_name}</option>)}
              </select>
            </div>
            <div><label className="block text-xs font-bold text-slate-500 mb-2">Contact Person</label><input type="text" name="contact_person" value={formData.contact_person} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm outline-none focus:ring-2 focus:ring-violet-200" /></div>
            <div><label className="block text-xs font-bold text-slate-500 mb-2">Phone</label><input type="text" name="contact_phone" value={formData.contact_phone} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm outline-none focus:ring-2 focus:ring-violet-200" /></div>
            <div><label className="block text-xs font-bold text-slate-500 mb-2">Email</label><input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm outline-none focus:ring-2 focus:ring-violet-200" /></div>
            <div><label className="block text-xs font-bold text-slate-500 mb-2">Status</label>
              <select name="status" value={formData.status} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm outline-none focus:ring-2 focus:ring-violet-200">
                <option value={1}>Active</option><option value={0}>Inactive</option>
              </select>
            </div>
            <div className="md:col-span-3">
              <label className="block text-xs font-bold text-slate-500 mb-2">Full Address</label>
              <textarea name="address" value={formData.address} onChange={handleInputChange} rows="2" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm outline-none focus:ring-2 focus:ring-violet-200"></textarea>
            </div>
            <div className="md:col-span-3 flex justify-end space-x-4">
              <button type="button" onClick={() => setIsFormOpen(false)} className="px-6 py-2 rounded-xl font-bold bg-slate-100 text-slate-600">Cancel</button>
              <button type="submit" className="px-8 py-2 rounded-xl font-bold bg-violet-600 text-white">Save Warehouse</button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden relative min-h-[200px]">
          {loading && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-4 border-violet-600/20 border-t-violet-600 rounded-full animate-spin"></div>
              </div>
            </div>
          )}
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <h2 className="font-bold text-slate-700">Existing Warehouses</h2>
            <button onClick={() => setIsFormOpen(true)} className="flex items-center text-xs font-bold bg-violet-600 text-white px-4 py-2 rounded-lg"><Plus className="w-4 h-4 mr-1"/> Add Warehouse</button>
          </div>
          <table className={`w-full text-left transition-opacity ${loading ? 'opacity-30' : 'opacity-100'} border-collapse`}>
            <thead>
              <tr className="bg-[#f8fafc] text-[11px] uppercase font-black text-slate-600 border-b-2 border-slate-300">
                <th className="p-4 border-r border-slate-300 whitespace-nowrap relative group">
                  <div className="absolute left-0 top-0 w-2 h-2 border-l-2 border-t-2 border-slate-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="absolute right-0 bottom-0 w-2 h-2 border-r-2 border-b-2 border-slate-400 opacity-30 group-hover:opacity-100 transition-opacity"></div>
                  Name & Code
                </th>
                {isAdmin && (
                  <th className="p-4 border-r border-slate-300 whitespace-nowrap relative group">
                    <div className="absolute left-0 top-0 w-2 h-2 border-l-2 border-t-2 border-slate-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="absolute right-0 bottom-0 w-2 h-2 border-r-2 border-b-2 border-slate-400 opacity-30 group-hover:opacity-100 transition-opacity"></div>
                    Vendor
                  </th>
                )}
                <th className="p-4 border-r border-slate-300 whitespace-nowrap relative group">
                  <div className="absolute left-0 top-0 w-2 h-2 border-l-2 border-t-2 border-slate-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="absolute right-0 bottom-0 w-2 h-2 border-r-2 border-b-2 border-slate-400 opacity-30 group-hover:opacity-100 transition-opacity"></div>
                  Location
                </th>
                <th className="p-4 border-r border-slate-300 whitespace-nowrap relative group">
                  <div className="absolute left-0 top-0 w-2 h-2 border-l-2 border-t-2 border-slate-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="absolute right-0 bottom-0 w-2 h-2 border-r-2 border-b-2 border-slate-400 opacity-30 group-hover:opacity-100 transition-opacity"></div>
                  Contact
                </th>
                <th className="p-4 border-r border-slate-300 whitespace-nowrap relative group">
                  <div className="absolute left-0 top-0 w-2 h-2 border-l-2 border-t-2 border-slate-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="absolute right-0 bottom-0 w-2 h-2 border-r-2 border-b-2 border-slate-400 opacity-30 group-hover:opacity-100 transition-opacity"></div>
                  Status
                </th>
                <th className="p-4 text-right whitespace-nowrap relative group">
                  <div className="absolute left-0 top-0 w-2 h-2 border-l-2 border-t-2 border-slate-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="absolute right-0 bottom-0 w-2 h-2 border-r-2 border-b-2 border-slate-400 opacity-30 group-hover:opacity-100 transition-opacity"></div>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {warehouses.length === 0 && !loading ? <tr><td colSpan={isAdmin ? "6" : "5"} className="p-4 text-center">No warehouses found.</td></tr> : warehouses.map(w => (
                <tr key={w.id} className="hover:bg-slate-50">
                  <td className="p-4 border-r border-slate-100"><p className="font-bold text-slate-800 text-sm whitespace-nowrap">{w.name}</p><p className="font-mono text-xs text-slate-400">{w.code}</p></td>
                  {isAdmin && (
                    <td className="p-4 border-r border-slate-100">
                      <Link 
                        to={`/vendor-profile/${w.user_id}`}
                        className="font-bold text-violet-700 text-xs hover:underline block whitespace-nowrap"
                      >
                        {w.user?.name || '-'}
                      </Link>
                      <p className="text-[10px] text-slate-400 font-medium">{w.user?.phone || '-'}</p>
                    </td>
                  )}
                  <td className="p-4 text-xs text-slate-600 border-r border-slate-100 whitespace-nowrap">{w.city?.city_name || '-'}, {w.state?.state_name || '-'}</td>
                  <td className="p-4 text-xs text-slate-600 border-r border-slate-100 whitespace-nowrap">{w.contact_person || '-'}<br/>{w.contact_phone}</td>
                  <td className="p-4 border-r border-slate-100"><button onClick={() => toggleStatus(w)} className={`px-2 py-1 rounded-full text-[10px] font-bold ${w.status===1 ? 'bg-emerald-50 text-emerald-600':'bg-slate-100 text-slate-500'} whitespace-nowrap`}>{w.status===1 ? 'Active':'Inactive'}</button></td>
                  <td className="p-4 text-right space-x-2">
                    <button onClick={() => editWarehouse(w)} className="p-2 text-slate-400 hover:text-blue-600 rounded bg-slate-50 hover:bg-blue-50"><Edit2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// --- TAB 2: PINCODE MAPPING ---
const PincodeMapping = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState('');
  const [selectedIds, setSelectedIds] = useState([]); // Array of IDs
  const [submitting, setSubmitting] = useState(false);

  const [pincodes, setPincodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mappingsLoading, setMappingsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    pincode: '',
    area: '',
    city: '',
    region: '',
    district: '',
    state: ''
  });

  useEffect(() => {
    api.get('/warehouses', { params: { limit: 100, status: 1 } }).then(res => setWarehouses(res.data.warehouses));
  }, []);

  useEffect(() => {
    fetchPincodes();
  }, [page, filters]);

  useEffect(() => {
    if (selectedWarehouseId) {
      setMappingsLoading(true);
      api.get(`/warehouses/${selectedWarehouseId}/pincodes`)
        .then(res => {
          setSelectedIds(res.data.mappings.map(m => m.pincode_id));
        })
        .finally(() => setMappingsLoading(false));
    } else {
      setSelectedIds([]);
      setMappingsLoading(false);
    }
  }, [selectedWarehouseId]);

  const fetchPincodes = async () => {
    setLoading(true);
    try {
      const res = await api.get('/locations/pincodes', { 
        params: { page, limit: 10, ...filters } 
      });
      setPincodes(res.data.pincodes);
      setTotalPages(res.data.pages);
    } catch {
      toast.error("Failed to fetch pincodes");
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id) => {
    if (selectedIds.includes(id)) setSelectedIds(selectedIds.filter(i => i !== id));
    else setSelectedIds([...selectedIds, id]);
  };

  const toggleSelectAllPage = () => {
    const pageIds = pincodes.map(p => p.id);
    const allSelected = pageIds.every(id => selectedIds.includes(id));
    if (allSelected) setSelectedIds(selectedIds.filter(id => !pageIds.includes(id)));
    else setSelectedIds([...new Set([...selectedIds, ...pageIds])]);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPage(1);
  };

  const resetFilters = () => {
    setFilters({
      pincode: '',
      area: '',
      city: '',
      region: '',
      district: '',
      state: ''
    });
    setPage(1);
  };

  const handleSave = async () => {
    if (!selectedWarehouseId) return toast.error("Select a warehouse");
    setSubmitting(true);
    try {
      await api.post(`/warehouses/${selectedWarehouseId}/pincodes`, { pincode_ids: selectedIds });
      toast.success("Delivery area mapping updated successfully");
    } catch {
      toast.error("Failed to update mapping");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <div className="mb-8">
        <label className="block text-[11px] font-medium text-slate-500 uppercase tracking-widest mb-4">1. Select Warehouse *</label>
        <select 
          value={selectedWarehouseId} 
          onChange={(e) => setSelectedWarehouseId(e.target.value)} 
          className="w-full md:w-1/3 bg-slate-50 border-2 border-slate-300 rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-violet-200 text-black"
        >
          <option value="">-- Choose Warehouse --</option>
          {warehouses.map(w => <option key={w.id} value={w.id}>{w.name} ({w.code})</option>)}
        </select>
      </div>

      <div className="mb-8 p-6 bg-slate-50 rounded-2xl border-2 border-slate-200">
        <div className="flex justify-between items-center mb-6">
          <label className="block text-[11px] font-medium text-slate-500 uppercase tracking-widest">2. Advanced Filters</label>
          <button 
            onClick={resetFilters}
            className="flex items-center gap-2 text-xs font-medium text-violet-600 hover:text-violet-700 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Filters
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: 'Pincode', name: 'pincode' },
            { label: 'Area', name: 'area' },
            { label: 'City', name: 'city' },
            { label: 'Region', name: 'region' },
            { label: 'District', name: 'district' },
            { label: 'State', name: 'state' },
          ].map(f => (
            <SuggestionInput 
              key={f.name}
              label={f.label}
              name={f.name}
              placeholder="Search..."
              value={filters[f.name]}
              onChange={handleFilterChange}
            />
          ))}
        </div>
      </div>

      <div className="mb-4 flex justify-between items-center">
        <h3 className="font-bold text-slate-800">Map Pincodes to Warehouse</h3>
        <div className="text-xs font-bold bg-violet-50 text-violet-600 px-3 py-1 rounded-full border border-violet-100">
          {selectedIds.length} Total Selected
        </div>
      </div>

      <div className="overflow-x-auto border-2 border-slate-200 rounded-2xl mb-6 relative min-h-[300px] shadow-sm">
        {(loading || mappingsLoading) && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] z-10 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 border-4 border-violet-600/20 border-t-violet-600 rounded-full animate-spin"></div>
              <span className="text-[10px] font-black text-violet-600 uppercase tracking-[0.2em]">Syncing Data</span>
            </div>
          </div>
        )}
        <table className={`w-full text-left border-collapse transition-opacity ${loading || mappingsLoading ? 'opacity-30' : 'opacity-100'}`}>
          <thead>
            <tr className="bg-slate-100/50 text-[11px] uppercase font-black text-slate-500 border-b-2 border-slate-200">
              <th className="p-4 w-10 border-r border-slate-200">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500 cursor-pointer"
                  checked={pincodes.length > 0 && pincodes.every(p => selectedIds.includes(p.id))}
                  onChange={toggleSelectAllPage}
                  disabled={loading || mappingsLoading}
                />
              </th>
              <th className="p-4 border-r border-slate-200">Pincode</th>
              <th className="p-4 border-r border-slate-200">Area</th>
              <th className="p-4 border-r border-slate-200">City</th>
              <th className="p-4 border-r border-slate-200">Region</th>
              <th className="p-4 border-r border-slate-200">District</th>
              <th className="p-4 border-r border-slate-200">State</th>
              <th className="p-4">Country</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {pincodes.length === 0 && !loading ? (
              <tr><td colSpan="8" className="p-20 text-center text-slate-400 font-medium">No results found.</td></tr>
            ) : pincodes.map(p => (
              <tr key={p.id} className={`hover:bg-violet-50/50 transition-colors group ${selectedIds.includes(p.id) ? 'bg-violet-50/40' : ''}`}>
                <td className="p-4 border-r border-slate-200">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded border-slate-400 text-violet-600 focus:ring-violet-500 cursor-pointer"
                    checked={selectedIds.includes(p.id)}
                    onChange={() => toggleSelect(p.id)}
                    disabled={loading || mappingsLoading}
                  />
                </td>
                <td className="py-5 px-4 text-sm text-black font-mono tracking-tighter border-r border-slate-200">{p.pincode}</td>
                <td className="py-5 px-4 text-sm text-black border-r border-slate-200">{p.city?.area}</td>
                <td className="py-5 px-4 text-sm text-slate-900 border-r border-slate-200">{p.city?.city_name}</td>
                <td className="py-5 px-4 text-sm text-slate-800 border-r border-slate-200">{p.city?.region}</td>
                <td className="py-5 px-4 text-sm text-slate-800 border-r border-slate-200">{p.city?.district}</td>
                <td className="py-5 px-4 text-sm text-black border-r border-slate-200">{p.state?.state_name}</td>
                <td className="py-5 px-4 text-sm text-slate-900">{p.country?.country_name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <button 
            disabled={page === 1} 
            onClick={() => setPage(page - 1)}
            className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-30"
          >
            Prev
          </button>
          <span className="text-sm font-bold text-slate-600 px-4">
            Page {page} of {totalPages}
          </span>
          <button 
            disabled={page === totalPages} 
            onClick={() => setPage(page + 1)}
            className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-30"
          >
            Next
          </button>
        </div>

        <button 
          onClick={handleSave} 
          disabled={submitting || !selectedWarehouseId} 
          className="px-8 py-3 rounded-xl font-black bg-slate-900 text-white hover:bg-violet-600 disabled:opacity-20 shadow-xl shadow-slate-900/10 transition-all active:scale-95 flex items-center gap-2"
        >
          {submitting ? 'Saving...' : (
            <>
              <Check className="w-4 h-4" />
              Save Mapping Changes
            </>
          )}
        </button>
      </div>
    </div>
  );
};

// --- TAB 3: PRODUCT ALLOCATION ---
const ProductAllocation = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [variations, setVariations] = useState([]);
  const [inventory, setInventory] = useState([]);
  
  const [formData, setFormData] = useState({ warehouse_id: '', product_id: '', variation_id: '', stock: 0, price: '', discount_price: '', tax_percent: 0, delivery_charge: 0, handling_charge: 0, status: 1 });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get('/warehouses', { params: { limit: 100, status: 1 } }).then(res => setWarehouses(res.data.warehouses));
    api.get('/products', { params: { limit: 500, status: 1 } }).then(res => setProducts(res.data.products));
    fetchInventory();
  }, []);

  useEffect(() => {
    if (formData.product_id) {
      api.get(`/products/${formData.product_id}/variations`).then(res => setVariations(res.data.variations));
    } else { setVariations([]); }
  }, [formData.product_id]);

  const fetchInventory = async () => {
    const res = await api.get('/warehouse-inventory', { params: { limit: 100 } });
    setInventory(res.data.inventory);
  };

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/warehouse-inventory', formData);
      toast.success("Product allocated to warehouse successfully");
      setFormData({ ...formData, stock: 0, price: '', discount_price: '' }); // keep WH and Product selected for fast entry
      fetchInventory();
    } catch (err) { toast.error(err.response?.data?.message || "Failed to allocate"); }
    finally { setSubmitting(false); }
  };

  return (
    <div>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
        <h2 className="text-xl font-bold text-slate-800 mb-6">Allocate Product to Warehouse</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div><label className="block text-xs font-bold text-slate-500 mb-2">Warehouse *</label>
            <select required name="warehouse_id" value={formData.warehouse_id} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm outline-none focus:ring-2 focus:ring-violet-200">
              <option value="">Select Warehouse</option>{warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>
          <div><label className="block text-xs font-bold text-slate-500 mb-2">Product *</label>
            <select required name="product_id" value={formData.product_id} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm outline-none focus:ring-2 focus:ring-violet-200">
              <option value="">Select Product</option>{products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="md:col-span-2"><label className="block text-xs font-bold text-slate-500 mb-2">Variation *</label>
            <select required name="variation_id" value={formData.variation_id} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm outline-none focus:ring-2 focus:ring-violet-200">
              <option value="">Select Variation</option>{variations.map(v => <option key={v.id} value={v.id}>{v.variation_name} (SKU: {v.sku})</option>)}
            </select>
          </div>
          
          <div><label className="block text-xs font-bold text-slate-500 mb-2">Initial Stock</label><input required type="number" name="stock" value={formData.stock} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm outline-none focus:ring-2 focus:ring-violet-200" /></div>
          <div><label className="block text-xs font-bold text-slate-500 mb-2">Price (₹) *</label><input required type="number" step="0.01" name="price" value={formData.price} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm outline-none focus:ring-2 focus:ring-violet-200" /></div>
          <div><label className="block text-xs font-bold text-slate-500 mb-2">Discount Price (₹)</label><input type="number" step="0.01" name="discount_price" value={formData.discount_price} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm outline-none focus:ring-2 focus:ring-violet-200" /></div>
          <div><label className="block text-xs font-bold text-slate-500 mb-2">Tax (%)</label><input type="number" step="0.01" name="tax_percent" value={formData.tax_percent} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm outline-none focus:ring-2 focus:ring-violet-200" /></div>
          
          <div className="md:col-span-4 flex justify-end"><button type="submit" disabled={submitting} className="px-8 py-2 rounded-xl font-bold bg-violet-600 text-white disabled:opacity-50">Allocate Product</button></div>
        </form>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50"><h2 className="font-bold text-slate-700">Allocated Inventory Overview</h2></div>
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 text-[10px] uppercase font-black text-slate-400">
              <th className="p-4">Warehouse</th><th className="p-4">Product</th><th className="p-4">Variation / SKU</th><th className="p-4 text-right">Stock</th><th className="p-4 text-right">Price</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {inventory.map(inv => (
              <tr key={inv.id} className="hover:bg-slate-50">
                <td className="p-4 text-sm font-bold text-slate-700">{inv.warehouse?.name}</td>
                <td className="p-4 text-sm text-slate-600">{inv.product?.name}</td>
                <td className="p-4"><p className="text-sm text-slate-600">{inv.variation?.variation_name}</p><p className="text-xs text-slate-400 font-mono">{inv.variation?.sku}</p></td>
                <td className="p-4 text-right font-mono font-bold text-slate-800">{inv.stock}</td>
                <td className="p-4 text-right font-mono text-slate-800">₹{inv.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- TAB 4: STOCK UPDATE & ALERTS ---
const StockUpdate = () => {
  const [inventory, setInventory] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [adjustments, setAdjustments] = useState({});

  useEffect(() => {
    fetchInventory();
    fetchAlerts();
  }, []);

  const fetchInventory = async () => {
    const res = await api.get('/warehouse-inventory', { params: { limit: 100 } });
    setInventory(res.data.inventory);
  };

  const fetchAlerts = async () => {
    const res = await api.get('/warehouse-inventory', { params: { limit: 50, alert_only: 'true' } });
    setAlerts(res.data.inventory);
  };

  const handleAdjustmentChange = (id, value) => setAdjustments({ ...adjustments, [id]: value });

  const submitAdjustment = async (id) => {
    const adj = adjustments[id];
    if (!adj) return toast.error("Enter an adjustment value (+ or -)");
    try {
      await api.patch(`/warehouse-inventory/${id}/stock`, { adjustment: adj });
      toast.success("Stock updated successfully");
      setAdjustments({ ...adjustments, [id]: '' });
      fetchInventory();
      fetchAlerts();
    } catch (err) { toast.error(err.response?.data?.message || "Failed to update stock"); }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50"><h2 className="font-bold text-slate-700">Quick Stock Update</h2></div>
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 text-[10px] uppercase font-black text-slate-400">
              <th className="p-4">Item</th><th className="p-4">Warehouse</th><th className="p-4 text-center">Current</th><th className="p-4 text-right">Adjust (+/-)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {inventory.map(inv => (
              <tr key={inv.id} className="hover:bg-slate-50">
                <td className="p-4"><p className="text-sm font-bold text-slate-700">{inv.product?.name}</p><p className="text-xs text-slate-500">{inv.variation?.variation_name}</p></td>
                <td className="p-4 text-xs text-slate-600">{inv.warehouse?.name}</td>
                <td className="p-4 text-center font-mono font-bold text-slate-800">{inv.stock}</td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2">
                    <input type="number" placeholder="e.g. 5 or -2" value={adjustments[inv.id] || ''} onChange={(e) => handleAdjustmentChange(inv.id, e.target.value)} className="w-24 bg-white border border-slate-200 rounded-lg py-1 px-2 text-sm text-center outline-none focus:border-violet-400" />
                    <button onClick={() => submitAdjustment(inv.id)} className="bg-violet-100 text-violet-700 px-3 py-1 rounded-lg font-bold text-xs hover:bg-violet-200">Save</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-red-50 rounded-2xl border border-red-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-red-100 flex items-center bg-red-100/50">
          <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
          <h2 className="font-bold text-red-800">Low Stock Alerts (&lt; 10)</h2>
        </div>
        <div className="p-4 space-y-3">
          {alerts.length === 0 ? <p className="text-sm text-red-600/70 text-center py-4">No low stock alerts. Everything is fully stocked!</p> : alerts.map(inv => (
            <div key={inv.id} className="bg-white p-3 rounded-xl border border-red-100 shadow-sm flex justify-between items-center">
              <div><p className="text-xs font-bold text-slate-800">{inv.product?.name}</p><p className="text-[10px] text-slate-500">{inv.variation?.variation_name} @ {inv.warehouse?.name}</p></div>
              <div className="bg-red-100 text-red-700 px-3 py-1 rounded-full font-mono font-black text-sm">{inv.stock}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WarehouseManagement;

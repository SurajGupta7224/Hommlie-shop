import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, User, Mail, Phone, Briefcase, MapPin, 
  Calendar, FileText, Image as ImageIcon, ShieldCheck,
  CheckCircle, XCircle
} from 'lucide-react';
import api from '../api';
import toast from 'react-hot-toast';

const IMAGE_BASE_URL = 'http://localhost:5000';

const getImageUrl = (filename, type) => {
  if (!filename) return null;
  if (filename.startsWith('http') || filename.startsWith('data:')) return filename;
  
  // Clean up existing paths if any
  const cleanName = filename.replace('/uploads/Profile_Photo/', '')
                            .replace('/uploads/Pan_Card/', '')
                            .replace('/uploads/Aadhaar_Card/', '')
                            .replace('/uploads/GST/', '')
                            .replace(/^\/+/, '');
                            
  switch(type) {
    case 'profile': return `${IMAGE_BASE_URL}/uploads/Profile_Photo/${cleanName}`;
    case 'pan': return `${IMAGE_BASE_URL}/uploads/Pan_Card/${cleanName}`;
    case 'aadhaar': return `${IMAGE_BASE_URL}/uploads/Aadhaar_Card/${cleanName}`;
    case 'gst': return `${IMAGE_BASE_URL}/uploads/GST/${cleanName}`;
    default: return `${IMAGE_BASE_URL}/uploads/${cleanName}`;
  }
};

const VendorProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    const fetchVendor = async () => {
      try {
        const res = await api.get(`/users/${id}`);
        setVendor(res.data.user);
      } catch (err) {
        console.error("Error fetching vendor profile:", err);
        toast.error("Failed to load vendor profile");
      } finally {
        setLoading(false);
      }
    };
    fetchVendor();
  }, [id]);

  if (loading) {
    return (
      <div className="py-8 px-4 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="py-8 px-4 text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Vendor Not Found</h2>
        <p className="text-slate-500 mb-6">The vendor you are looking for does not exist or you don't have access.</p>
        <button 
          onClick={() => navigate('/order-management')}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-xl font-bold transition-colors"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  const DocumentCard = ({ title, filename, type }) => {
    const url = getImageUrl(filename, type);
    return (
      <div className="border border-slate-200 rounded-xl p-3 bg-white hover:border-purple-300 hover:shadow-md transition-all group flex items-center gap-3">
        {url ? (
          <div 
            className="w-14 h-14 bg-slate-50 rounded-lg border border-slate-200 overflow-hidden cursor-zoom-in relative flex-shrink-0"
            onClick={() => setPreviewImage(url)}
            title="Click to view full size"
          >
            <img src={url} alt={title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
              <ImageIcon className="text-white opacity-0 group-hover:opacity-100 w-5 h-5 drop-shadow-md" />
            </div>
          </div>
        ) : (
          <div className="w-14 h-14 bg-slate-50 rounded-lg border border-dashed border-slate-300 flex items-center justify-center flex-shrink-0 text-slate-400">
            <FileText className="w-5 h-5 opacity-50" />
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-slate-800 text-xs truncate mb-1">{title}</h4>
          {url ? (
            <span className="inline-block bg-emerald-50 text-emerald-600 border border-emerald-100 px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider">Uploaded</span>
          ) : (
            <span className="inline-block bg-slate-100 text-slate-500 border border-slate-200 px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider">Missing</span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="py-6 px-2">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-2xl font-black text-slate-800 leading-tight">Vendor Profile</h1>
          <p className="text-slate-500 text-sm font-medium mt-0.5">View comprehensive details about this vendor</p>
        </div>
        
        <div className="ml-auto flex items-center gap-3">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
            vendor.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
          }`}>
            {vendor.status === 'active' ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
            {vendor.status === 'active' ? 'Active Account' : 'Inactive Account'}
          </span>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
            vendor.profile_status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 
            vendor.profile_status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
          }`}>
            <ShieldCheck className="w-3.5 h-3.5" />
            Profile {vendor.profile_status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - Core Info */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Profile Card */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-purple-500 to-indigo-600"></div>
            
            <div className="relative pt-6 text-center">
              <div className="w-24 h-24 mx-auto bg-white p-1 rounded-full shadow-md mb-4 relative">
                {vendor.profile_photo ? (
                  <img 
                    src={getImageUrl(vendor.profile_photo, 'profile')} 
                    alt={vendor.name} 
                    className="w-full h-full rounded-full object-cover cursor-pointer"
                    onClick={() => setPreviewImage(getImageUrl(vendor.profile_photo, 'profile'))}
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-black text-3xl">
                    {vendor.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-white ${vendor.status === 'active' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
              </div>
              
              <h2 className="text-xl font-black text-slate-800">{vendor.name}</h2>
              <p className="text-purple-600 font-bold text-sm mt-1">{vendor.role?.role_name || 'Vendor'}</p>
              
              <div className="mt-6 flex flex-col gap-3">
                <div className="flex items-center justify-center gap-2 text-slate-600 text-sm bg-slate-50 py-2 px-4 rounded-xl border border-slate-100">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span className="font-medium">{vendor.email}</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-slate-600 text-sm bg-slate-50 py-2 px-4 rounded-xl border border-slate-100">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span className="font-medium">{vendor.phone || 'No phone provided'}</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-slate-600 text-sm bg-slate-50 py-2 px-4 rounded-xl border border-slate-100">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span className="font-medium">Joined {new Date(vendor.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column - Details & Documents */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Business Information */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <h3 className="text-lg font-black text-slate-800 flex items-center gap-2 mb-6">
              <Briefcase className="w-5 h-5 text-purple-600" />
              Business Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Trade Name</p>
                <p className="font-bold text-slate-800">{vendor.trade_name || '—'}</p>
              </div>
              
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Company Type</p>
                <p className="font-bold text-slate-800">{vendor.company_type || '—'}</p>
              </div>
              
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">PAN Number</p>
                <p className="font-bold text-slate-800 uppercase tracking-wide">{vendor.pan_number || '—'}</p>
              </div>
              
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Aadhaar Number</p>
                <p className="font-bold text-slate-800 tracking-widest">{vendor.aadhaar_number || '—'}</p>
              </div>
              
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 md:col-span-2">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">GST Number</p>
                <p className="font-bold text-slate-800 uppercase tracking-wide">{vendor.gst_number || '—'}</p>
              </div>
            </div>
          </div>

          {/* Location Context */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <h3 className="text-lg font-black text-slate-800 flex items-center gap-2 mb-6">
              <MapPin className="w-5 h-5 text-purple-600" />
              Location Context
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Country</p>
                <p className="font-bold text-slate-800">{vendor.country?.country_name || '—'}</p>
              </div>
              
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">State</p>
                <p className="font-bold text-slate-800">{vendor.state?.state_name || '—'}</p>
              </div>
              
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">City</p>
                <p className="font-bold text-slate-800">{vendor.city?.city_name || '—'}</p>
              </div>
            </div>
          </div>

          {/* Documents & Images */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <h3 className="text-lg font-black text-slate-800 flex items-center gap-2 mb-6">
              <FileText className="w-5 h-5 text-purple-600" />
              Documents & Images
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-3">
              <DocumentCard title="Aadhaar Card" filename={vendor.aadhaar_card_file} type="aadhaar" />
              <DocumentCard title="PAN Card" filename={vendor.pan_card_file} type="pan" />
              <DocumentCard title="GST Certificate" filename={vendor.gst_file} type="gst" />
              <DocumentCard title="Profile Photo" filename={vendor.profile_photo} type="profile" />
            </div>
          </div>

        </div>
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm cursor-zoom-out"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-5xl w-full h-full flex flex-col items-center justify-center">
            <button 
              className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full backdrop-blur-md transition-all"
              onClick={() => setPreviewImage(null)}
            >
              <XCircle className="w-8 h-8" />
            </button>
            <img 
              src={previewImage} 
              alt="Document Preview" 
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl" 
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorProfile;

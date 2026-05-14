import { useState, useCallback, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, Autocomplete } from '@react-google-maps/api';
import Icon from './ui/AppIcon';
import { addAddress, updateAddress } from '@/api';
import toast from 'react-hot-toast';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editAddress?: any;
}

const defaultCenter = {
  lat: 12.9716,
  lng: 77.5946
};

export default function AddressModal({ isOpen, onClose, onSuccess, editAddress }: AddressModalProps) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: ['places']
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markerPosition, setMarkerPosition] = useState(defaultCenter);
  const [formData, setFormData] = useState({
    address_line: '',
    landmark: '',
    city: '',
    state: '',
    country: 'India',
    pincode: '',
    type: 'Home',
    is_default: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    if (editAddress) {
      setFormData({
        address_line: editAddress.address_line,
        landmark: editAddress.landmark || '',
        city: editAddress.city || '',
        state: editAddress.state || '',
        country: editAddress.country || 'India',
        pincode: editAddress.pincode,
        type: editAddress.type || 'Home',
        is_default: editAddress.is_default || 0
      });
      if (editAddress.lat && editAddress.lng) {
        setMarkerPosition({
          lat: parseFloat(editAddress.lat),
          lng: parseFloat(editAddress.lng)
        });
      }
    } else {
      setFormData({
        address_line: '',
        landmark: '',
        city: '',
        state: '',
        country: 'India',
        pincode: '',
        type: 'Home',
        is_default: 0
      });
      getCurrentLocation();
    }
  }, [editAddress, isOpen]);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setMarkerPosition(pos);
          map?.panTo(pos);
          reverseGeocode(pos.lat, pos.lng);
          setIsLocating(false);
        },
        () => {
          setIsLocating(false);
          toast.error("Could not get your location");
        }
      );
    }
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    if (!isLoaded) return;
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === 'OK' && results?.[0]) {
        const address = results[0];
        let city = '';
        let state = '';
        let pincode = '';

        address.address_components.forEach(comp => {
          if (comp.types.includes('locality')) city = comp.long_name;
          if (comp.types.includes('administrative_area_level_1')) state = comp.long_name;
          if (comp.types.includes('postal_code')) pincode = comp.long_name;
        });

        setFormData(prev => ({
          ...prev,
          address_line: address.formatted_address,
          city,
          state,
          pincode
        }));
      }
    });
  };

  const onPlaceChanged = () => {
    if (autocomplete) {
      const place = autocomplete.getPlace();
      if (place.geometry?.location) {
        const pos = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        };
        setMarkerPosition(pos);
        map?.panTo(pos);
        
        let city = '';
        let state = '';
        let pincode = '';

        place.address_components?.forEach(comp => {
          if (comp.types.includes('locality')) city = comp.long_name;
          if (comp.types.includes('administrative_area_level_1')) state = comp.long_name;
          if (comp.types.includes('postal_code')) pincode = comp.long_name;
        });

        setFormData(prev => ({
          ...prev,
          address_line: place.formatted_address || '',
          city,
          state,
          pincode
        }));
      }
    }
  };

  const onMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const pos = { lat: e.latLng.lat(), lng: e.latLng.lng() };
      setMarkerPosition(pos);
      reverseGeocode(pos.lat, pos.lng);
    }
  }, [isLoaded]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.address_line || !formData.pincode) {
      toast.error("Please fill required fields");
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        ...formData,
        lat: markerPosition.lat,
        lng: markerPosition.lng
      };

      if (editAddress) {
        await updateAddress(editAddress.id, payload);
        toast.success("Address updated");
      } else {
        await addAddress(payload);
        toast.success("Address added");
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white rounded-[2rem] w-full max-w-3xl overflow-hidden shadow-[0_40px_80px_-15px_rgba(0,0,0,0.3)] flex flex-col md:flex-row h-[85vh] md:h-[520px] animate-in zoom-in-95 duration-500">
        
        {/* Left Side: Map Selection */}
        <div className="w-full md:w-[40%] relative h-[240px] md:h-full border-b md:border-b-0 md:border-r border-gray-100 shrink-0">
          {isLoaded ? (
            <GoogleMap
              mapContainerStyle={{ width: '100%', height: '100%' }}
              center={markerPosition}
              zoom={16}
              onLoad={setMap}
              onClick={onMapClick}
              options={{
                disableDefaultUI: true,
                zoomControl: false,
                styles: [
                  {
                    featureType: "poi",
                    stylers: [{ visibility: "off" }]
                  },
                  {
                    featureType: "transit",
                    stylers: [{ visibility: "off" }]
                  }
                ]
              }}
            >
              <Marker 
                position={markerPosition}
                animation={google.maps.Animation.DROP}
              />
            </GoogleMap>
          ) : (
            <div className="w-full h-full bg-gray-50 flex items-center justify-center">
              <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
          )}

          {/* Search Box */}
          <div className="absolute top-4 left-4 right-4 z-10 md:top-6 md:left-6 md:right-6">
            {isLoaded && (
              <Autocomplete
                onLoad={setAutocomplete}
                onPlaceChanged={onPlaceChanged}
              >
                <div className="relative group">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <Icon name="MagnifyingGlassIcon" size={18} className="text-gray-400 group-focus-within:text-primary transition-colors" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search area..."
                    className="w-full pl-11 pr-4 py-3 bg-white border border-gray-100 rounded-xl shadow-xl focus:ring-4 focus:ring-primary/10 focus:border-primary/30 transition-all text-sm font-bold placeholder:text-gray-300"
                  />
                </div>
              </Autocomplete>
            )}
          </div>

          {/* Map Overlays */}
          <div className="absolute bottom-4 left-4 right-4 flex flex-col gap-2 md:bottom-6 md:left-6 md:right-6 md:gap-3">
            {/* Selected Address Preview */}
            <div className="bg-white/90 backdrop-blur shadow-xl p-3 rounded-xl border border-white/20 hidden md:block">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <p className="text-[10px] font-black text-gray-900 uppercase tracking-[0.2em]">Current Location</p>
              </div>
              <p className="text-xs text-gray-700 mt-1 font-bold truncate leading-tight">{formData.address_line || 'Click on map to pick location'}</p>
            </div>

            {/* Locate Me Button */}
            <button 
              onClick={getCurrentLocation}
              className="self-end flex items-center gap-2 p-3 bg-white rounded-xl shadow-2xl border border-gray-100 hover:bg-gray-50 active:scale-90 transition-all group"
            >
              <span className="text-[9px] font-black text-primary uppercase tracking-widest px-1 hidden md:block">Use Current Location</span>
              <div className="w-6 h-6 flex items-center justify-center">
                <Icon name="MapPinIcon" size={20} className={isLocating ? 'text-primary animate-bounce' : 'text-primary group-hover:scale-110 transition-transform'} />
              </div>
            </button>
          </div>
        </div>

        {/* Right Side: Address Details */}
        <div className="w-full md:w-[60%] flex flex-col min-h-0 bg-white">
          <div className="p-5 pb-1 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-gray-900 tracking-tighter">{editAddress ? 'Edit Address' : 'New Address'}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="w-5 h-1 bg-primary rounded-full" />
                <p className="text-[8px] font-bold text-gray-400 uppercase tracking-[0.2em]">Delivery details</p>
              </div>
            </div>
            <button onClick={onClose} className="p-3 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-all active:scale-95">
              <Icon name="XMarkIcon" size={22} className="text-gray-400" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-2 custom-scrollbar">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Type Selector */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Save As</label>
                <div className="flex gap-3">
                  {[
                    { id: 'Home', icon: 'HomeIcon' },
                    { id: 'Office', icon: 'BuildingOfficeIcon' },
                    { id: 'Other', icon: 'MapPinIcon' }
                  ].map(type => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, type: type.id }))}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all border-2 font-bold text-xs ${formData.type === type.id ? 'border-primary bg-primary/5 text-primary shadow-lg shadow-primary/10' : 'border-gray-50 bg-gray-50/50 text-gray-400 hover:border-gray-100'}`}
                    >
                      <Icon name={type.icon as any} size={16} />
                      {type.id}
                    </button>
                  ))}
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <div className="relative group">
                  <div className="absolute -top-2.5 left-3 px-2 bg-white text-[9px] font-bold text-gray-400 uppercase tracking-widest group-focus-within:text-primary transition-colors z-10">Complete Address</div>
                  <textarea
                    required
                    value={formData.address_line}
                    onChange={e => setFormData(prev => ({ ...prev, address_line: e.target.value }))}
                    className="w-full p-4 rounded-xl border-2 border-gray-100 bg-white focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all resize-none h-24 text-xs font-bold text-gray-800"
                    placeholder="House No., Building, Street..."
                  />
                </div>

                <div className="relative group">
                  <div className="absolute -top-2.5 left-3 px-2 bg-white text-[9px] font-bold text-gray-400 uppercase tracking-widest group-focus-within:text-primary transition-colors z-10">Landmark (Optional)</div>
                  <input
                    type="text"
                    value={formData.landmark}
                    onChange={e => setFormData(prev => ({ ...prev, landmark: e.target.value }))}
                    className="w-full p-4 rounded-xl border-2 border-gray-100 bg-white focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all text-xs font-bold text-gray-800"
                    placeholder="e.g. Near Central Park"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="relative group">
                    <div className="absolute -top-2.5 left-3 px-2 bg-white text-[9px] font-bold text-gray-400 uppercase tracking-widest group-focus-within:text-primary transition-colors z-10">City</div>
                    <input
                      required
                      type="text"
                      value={formData.city}
                      onChange={e => setFormData(prev => ({ ...prev, city: e.target.value }))}
                      className="w-full p-4 rounded-xl border-2 border-gray-100 bg-white focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all text-xs font-bold text-gray-800"
                    />
                  </div>
                  <div className="relative group">
                    <div className="absolute -top-2.5 left-3 px-2 bg-white text-[9px] font-bold text-gray-400 uppercase tracking-widest group-focus-within:text-primary transition-colors z-10">Pincode</div>
                    <input
                      required
                      type="text"
                      value={formData.pincode}
                      onChange={e => setFormData(prev => ({ ...prev, pincode: e.target.value }))}
                      className="w-full p-4 rounded-xl border-2 border-gray-100 bg-white focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all text-xs font-bold text-gray-800"
                    />
                  </div>
                </div>
              </div>

              {/* Default Toggle */}
              <div 
                onClick={() => setFormData(prev => ({ ...prev, is_default: prev.is_default === 1 ? 0 : 1 }))}
                className="flex items-center gap-3 p-3 rounded-xl bg-gray-50/50 cursor-pointer group hover:bg-gray-50 transition-all"
              >
                <div className={`w-12 h-6 rounded-full p-1 transition-all ${formData.is_default === 1 ? 'bg-primary' : 'bg-gray-200'}`}>
                  <div className={`w-4 h-4 bg-white rounded-full shadow-md transition-all ${formData.is_default === 1 ? 'translate-x-6' : 'translate-x-0'}`} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-900 uppercase tracking-widest leading-none">Set as default</p>
                </div>
              </div>
            </form>
          </div>

          {/* Footer Action */}
          <div className="p-6 border-t border-gray-50">
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className={`w-full py-4 bg-primary text-white rounded-2xl font-black text-base shadow-[0_20px_40px_-10px_rgba(103,58,243,0.4)] transition-all active:scale-[0.98] ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-primary/90'}`}
            >
              {isLoading ? (
                <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto" />
              ) : (
                editAddress ? 'Update Address' : 'Confirm & Save'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

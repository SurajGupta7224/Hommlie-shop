import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Icon from '@/components/ui/AppIcon';
import api from '@/api';
import { useAuth } from '@/context/AuthContext';
import AddressModal from '@/components/AddressModal';

export default function AddressesClient() {
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [addressToEdit, setAddressToEdit] = useState<any>(null);
  const { isLoggedIn } = useAuth();

  const fetchAddresses = async () => {
    if (!isLoggedIn) {
      setLoading(false);
      return;
    }
    try {
      const res = await api.get('/addresses');
      if (res.data.status === 1) {
        setAddresses(res.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch addresses:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, [isLoggedIn]);

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this address?")) {
      try {
        const res = await api.post(`/addresses/delete/${id}`);
        if (res.data.status === 1) {
          fetchAddresses();
        }
      } catch (error) {
        console.error("Failed to delete address:", error);
      }
    }
  };

  const handleSetDefault = async (id: number) => {
    try {
      const res = await api.post(`/addresses/set-default/${id}`);
      if (res.data.status === 1) {
        fetchAddresses();
      }
    } catch (error) {
      console.error("Failed to set default address:", error);
    }
  };

  const handleAddClick = () => {
    setAddressToEdit(null);
    setIsAddressModalOpen(true);
  };

  const handleEditClick = (address: any) => {
    setAddressToEdit(address);
    setIsAddressModalOpen(true);
  };

  // Temporarily referencing these to satisfy TS as they are used in commented-out code
  console.log(handleDelete, handleSetDefault, handleEditClick);
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header title="Your Addresses" showBack />
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 md:px-8 py-8">
        
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Saved Addresses</h2>
            <p className="text-sm text-slate-500">Manage where we deliver your orders.</p>
          </div>
          <button onClick={handleAddClick} className="bg-primary/10 text-primary font-bold px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-primary/20 transition-colors">
            <Icon name="PlusIcon" size={18} />
            <span className="hidden sm:inline">Add New</span>
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : addresses.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 border border-slate-100 shadow-sm text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
              <Icon name="MapPinIcon" size={40} />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">No addresses found</h2>
            <p className="text-slate-500 mb-6">Add an address so we know where to deliver your orders.</p>
            <button onClick={handleAddClick} className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary/90 transition-all inline-block">
              Add New Address
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {addresses.map((address: any) => {
              const isDefault = address.is_default == 1;
              const typeLabel = address.address_line.toLowerCase().includes('office') ? 'Office' : 'Home';
              const typeIcon = typeLabel === 'Office' ? 'BriefcaseIcon' : 'HomeIcon';
              
              return (
                <div key={address.id} className={`bg-white border-2 ${isDefault ? 'border-primary' : 'border-slate-200 hover:border-primary/50'} rounded-3xl p-6 relative shadow-sm transition-colors`}>
                  {isDefault && <div className="absolute top-4 right-4 bg-primary text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">Default</div>}
                  <div className="flex items-center gap-2 mb-3 text-slate-800">
                    <Icon name={typeIcon} size={20} className={isDefault ? "text-primary" : "text-slate-400"} />
                    <h3 className="font-bold text-lg">{address.landmark || typeLabel}</h3>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed mb-4">
                    {address.address_line}<br />
                    {address.city && address.state ? `${address.city}, ${address.state} - ` : ''}
                    {address.pincode}
                  </p>
                  {/* Actions hidden for now as per request */}
                  {/* <div className="flex items-center gap-3 border-t border-slate-100 pt-4">
                    <button onClick={() => handleEditClick(address)} className="text-sm font-semibold text-primary hover:underline">Edit</button>
                    <div className="w-px h-4 bg-slate-200"></div>
                    <button onClick={() => handleDelete(address.id)} className="text-sm font-semibold text-red-500 hover:underline">Delete</button>
                    {!isDefault && (
                      <>
                        <div className="w-px h-4 bg-slate-200"></div>
                        <button onClick={() => handleSetDefault(address.id)} className="text-sm font-semibold text-slate-500 hover:text-primary transition-colors">Set as Default</button>
                      </>
                    )}
                  </div> */}
                </div>
              );
            })}
          </div>
        )}

      </main>
      <Footer />
      {isAddressModalOpen && (
        <AddressModal 
          isOpen={isAddressModalOpen}
          onClose={() => setIsAddressModalOpen(false)}
          onSuccess={fetchAddresses}
          editAddress={addressToEdit}
        />
      )}
    </div>
  );
}

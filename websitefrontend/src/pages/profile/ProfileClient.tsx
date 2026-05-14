import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Icon from '@/components/ui/AppIcon';
import { useAuth } from '@/context/AuthContext';
import api from '@/api';

export default function ProfileClient() {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPreviewUrl(user.profile_pic || null);
    }
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfilePic(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const formData = new FormData();
      formData.append('user_id', user.id.toString());
      formData.append('name', name);
      formData.append('email', email);
      if (profilePic) {
        formData.append('profile_pic', profilePic);
      }

      const res = await api.post('/auth/update-profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
 
      if (res.data.status === 1) {
        updateUser({ 
          name, 
          email, 
          profile_pic: res.data.profile_pic 
        });
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
      } else {
        setMessage({ type: 'error', text: res.data.message || 'Failed to update profile' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'An error occurred' });
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header title="Edit Profile" showBack />
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 md:px-8 py-8">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 md:p-8">
          <h2 className="text-xl font-bold text-slate-800 mb-2">Personal Information</h2>
          <p className="text-sm text-slate-500 mb-8">Update your account details and preferences.</p>
          
          {message.text && (
            <div className={`mb-6 p-4 rounded-xl text-sm font-semibold ${message.type === 'success' ? 'bg-success/10 text-success' : 'bg-red-50 text-red-600'}`}>
              {message.text}
            </div>
          )}

          <div className="flex flex-col items-center mb-8">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md bg-slate-100 flex items-center justify-center">
                {previewUrl ? (
                  <img src={previewUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-slate-300 text-3xl font-bold">
                    {name ? name.charAt(0).toUpperCase() : '?'}
                  </div>
                )}
              </div>
              <label className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full cursor-pointer shadow-lg hover:bg-primary/90 transition-all">
                <Icon name="CameraIcon" size={16} />
                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
              </label>
            </div>
            <p className="text-xs text-slate-400 mt-3 font-medium">Click the camera to upload a new profile picture</p>
          </div>

          <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Full Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" 
                  placeholder="Enter your name"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Email Address</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" 
                  placeholder="Enter your email"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Phone Number</label>
              <input 
                type="tel" 
                className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed outline-none" 
                value={user?.mobile || ''} 
                disabled 
              />
              <p className="text-xs text-slate-400 mt-1.5">Phone number cannot be changed as it is used for login.</p>
            </div>
            <div className="pt-4 border-t border-slate-100">
              <button 
                type="submit" 
                disabled={loading}
                className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-primary/90 transition-all active:scale-95 shadow-sm disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : null}
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { User, Mail, Phone, Lock, Camera, Save, Plane, Heart } from 'lucide-react';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const { isDark } = useTheme();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState('profile');
  const [form, setForm] = useState({ name: '', phone: '', favorite_style: '', bio: '', profile_image: '' });
  const [pwdForm, setPwdForm] = useState({ current_password: '', new_password: '', confirm: '' });

  useEffect(() => {
    api.get('/users/profile').then(r => {
      const p = r.data.data;
      setProfile(p);
      setForm({ name: p.name || '', phone: p.phone || '', favorite_style: p.favorite_style || '', bio: p.bio || '', profile_image: p.profile_image || '' });
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/users/profile', form);
      updateUser(form);
      toast.success('Profile updated!');
    } catch (err) { toast.error(err.response?.data?.message || 'Error saving profile'); }
    finally { setSaving(false); }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (pwdForm.new_password !== pwdForm.confirm) { toast.error('Passwords do not match'); return; }
    setSaving(true);
    try {
      await api.put('/users/change-password', { current_password: pwdForm.current_password, new_password: pwdForm.new_password });
      toast.success('Password changed!');
      setPwdForm({ current_password: '', new_password: '', confirm: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Error changing password'); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className={`min-h-screen ${isDark ? 'bg-dark-950' : 'bg-gray-50'} py-8`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className={`card p-6 mb-6 ${isDark ? '' : 'card-light'}`}>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center text-white text-4xl font-bold overflow-hidden">
                {profile?.profile_image ? <img src={profile.profile_image} alt={profile.name} className="w-full h-full object-cover" /> : profile?.name?.[0]?.toUpperCase()}
              </div>
            </div>
            <div className="text-center sm:text-left">
              <h1 className={`text-2xl font-bold font-display ${isDark ? 'text-white' : 'text-dark-900'}`}>{profile?.name}</h1>
              <p className={isDark ? 'text-dark-400' : 'text-dark-500'}>{profile?.email}</p>
              <div className="flex items-center justify-center sm:justify-start gap-4 mt-3 text-sm">
                <span className="flex items-center gap-1.5 text-primary-400"><Plane className="w-4 h-4" />{profile?.total_trips || 0} Trips</span>
                <span className="flex items-center gap-1.5 text-pink-400"><Heart className="w-4 h-4" />{profile?.saved_destinations || 0} Saved</span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${profile?.role === 'admin' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-primary-500/20 text-primary-400 border border-primary-500/30'}`}>
                  {profile?.role}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className={`flex gap-1 p-1 rounded-2xl mb-6 w-fit ${isDark ? 'bg-dark-800' : 'bg-gray-100'}`}>
          {['profile', 'password'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-xl text-sm font-medium capitalize transition-all ${tab === t ? 'bg-primary-500 text-white' : isDark ? 'text-dark-400 hover:text-white' : 'text-dark-500 hover:text-dark-900'}`}>
              {t === 'profile' ? '👤 Profile' : '🔒 Password'}
            </button>
          ))}
        </div>

        {tab === 'profile' && (
          <form onSubmit={saveProfile} className={`card p-6 space-y-5 ${isDark ? '' : 'card-light'}`}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {[
                { key: 'name', label: 'Full Name', icon: User, type: 'text', placeholder: 'Your name' },
                { key: 'phone', label: 'Phone', icon: Phone, type: 'tel', placeholder: '+91 98765 43210' },
              ].map(({ key, label, icon: Icon, type, placeholder }) => (
                <div key={key}>
                  <label className="label">{label}</label>
                  <div className="relative">
                    <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                    <input type={type} className="input pl-10" placeholder={placeholder} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
                  </div>
                </div>
              ))}
            </div>
            <div>
              <label className="label">Favorite Travel Style</label>
              <select className="input" value={form.favorite_style} onChange={e => setForm(f => ({ ...f, favorite_style: e.target.value }))}>
                <option value="">Select style</option>
                {['Budget', 'Standard', 'Luxury', 'Adventure', 'Cultural', 'Beach', 'Mountains'].map(s => <option key={s} value={s.toLowerCase()}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Profile Image URL</label>
              <div className="relative">
                <Camera className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                <input className="input pl-10" placeholder="https://..." value={form.profile_image} onChange={e => setForm(f => ({ ...f, profile_image: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="label">Bio</label>
              <textarea className="input min-h-[100px] resize-none" placeholder="Tell us about yourself..." value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} />
            </div>
            <button type="submit" disabled={saving} className="btn btn-gradient">
              {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
              Save Changes
            </button>
          </form>
        )}

        {tab === 'password' && (
          <form onSubmit={changePassword} className={`card p-6 space-y-4 max-w-md ${isDark ? '' : 'card-light'}`}>
            {[['current_password','Current Password'],['new_password','New Password'],['confirm','Confirm New Password']].map(([key, label]) => (
              <div key={key}>
                <label className="label">{label}</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                  <input type="password" className="input pl-10" placeholder="••••••••" value={pwdForm[key]} onChange={e => setPwdForm(f => ({ ...f, [key]: e.target.value }))} />
                </div>
              </div>
            ))}
            <button type="submit" disabled={saving} className="btn btn-gradient">
              {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Lock className="w-4 h-4" />}
              Change Password
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

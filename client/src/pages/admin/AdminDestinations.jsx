import { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Search, Plus, Trash2, Edit2, Star, MapPin, X } from 'lucide-react';

export default function AdminDestinations() {
  const { isDark } = useTheme();
  const [dests, setDests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editDest, setEditDest] = useState(null);
  const [form, setForm] = useState({ name: '', country: '', state: '', category: 'Nature', description: '', average_budget: '', rating: 4.0, best_time: '', image: '', latitude: '', longitude: '', is_featured: false });

  const fetchDests = async () => {
    setLoading(true);
    try {
      const params = search ? { search } : {};
      const res = await api.get('/destinations', { params: { ...params, limit: 50 } });
      setDests(res.data.data || []);
    } catch { toast.error('Error loading destinations'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchDests(); }, [search]);

  const openAdd = () => { setEditDest(null); setForm({ name: '', country: '', state: '', category: 'Nature', description: '', average_budget: '', rating: 4.0, best_time: '', image: '', latitude: '', longitude: '', is_featured: false }); setShowForm(true); };
  const openEdit = (d) => { setEditDest(d); setForm({ name: d.name, country: d.country, state: d.state || '', category: d.category, description: d.description, average_budget: d.average_budget, rating: d.rating, best_time: d.best_time || '', image: d.image || '', latitude: d.latitude || '', longitude: d.longitude || '', is_featured: d.is_featured }); setShowForm(true); };

  const submit = async (e) => {
    e.preventDefault();
    try {
      if (editDest) { await api.put(`/destinations/${editDest.id}`, form); toast.success('Destination updated!'); }
      else { await api.post('/destinations', form); toast.success('Destination added!'); }
      setShowForm(false); fetchDests();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const deleteDest = async (id) => {
    if (!window.confirm('Delete this destination?')) return;
    try { await api.delete(`/destinations/${id}`); toast.success('Deleted!'); fetchDests(); }
    catch { toast.error('Error deleting'); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-dark-900'}`}>Manage Destinations</h1>
        <button onClick={openAdd} className="btn btn-gradient btn-sm"><Plus className="w-4 h-4" />Add Destination</button>
      </div>

      <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border ${isDark ? 'bg-dark-800 border-dark-600' : 'bg-white border-gray-200'}`}>
        <Search className="w-4 h-4 text-dark-400" />
        <input className={`flex-1 bg-transparent text-sm outline-none ${isDark ? 'text-white placeholder-dark-400' : 'text-dark-900 placeholder-gray-400'}`}
          placeholder="Search destinations..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? <div className="skeleton h-64 rounded-2xl" /> : (
        <div className={`card overflow-hidden ${isDark ? '' : 'card-light'}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className={`border-b ${isDark ? 'border-dark-700 bg-dark-800/50' : 'border-gray-200 bg-gray-50'}`}>
                <tr>{['Destination', 'Category', 'Country', 'Budget', 'Rating', 'Actions'].map(h => (
                  <th key={h} className={`px-4 py-3 text-left font-semibold text-xs uppercase ${isDark ? 'text-dark-400' : 'text-dark-500'}`}>{h}</th>
                ))}</tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-dark-700' : 'divide-gray-100'}`}>
                {dests.map(d => (
                  <tr key={d.id} className={`transition-colors ${isDark ? 'hover:bg-dark-700/50' : 'hover:bg-gray-50'}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={d.image} alt={d.name} className="w-10 h-10 rounded-xl object-cover flex-shrink-0" onError={e => e.target.style.display='none'} />
                        <div>
                          <p className={`font-semibold ${isDark ? 'text-white' : 'text-dark-900'}`}>{d.name}</p>
                          {d.is_featured && <span className="text-xs text-yellow-400">★ Featured</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3"><span className="badge badge-primary text-xs">{d.category}</span></td>
                    <td className={`px-4 py-3 text-xs ${isDark ? 'text-dark-300' : 'text-dark-600'}`}>{d.country}</td>
                    <td className={`px-4 py-3 text-xs ${isDark ? 'text-dark-300' : 'text-dark-600'}`}>₹{Number(d.average_budget || 0).toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 text-xs text-yellow-400 flex items-center gap-1"><Star className="w-3 h-3 fill-current" />{d.rating}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(d)} className="p-1.5 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => deleteDest(d.id)} className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!dests.length && <p className="text-center py-10 text-dark-400">No destinations found</p>}
          </div>
        </div>
      )}

      {/* Add/Edit modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`w-full max-w-xl rounded-2xl p-6 max-h-[90vh] overflow-y-auto ${isDark ? 'bg-dark-800 border border-dark-600' : 'bg-white'}`}>
            <div className="flex items-center justify-between mb-5">
              <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-dark-900'}`}>{editDest ? 'Edit Destination' : 'Add Destination'}</h3>
              <button onClick={() => setShowForm(false)} className="text-dark-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={submit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">Name *</label><input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required /></div>
                <div><label className="label">Country *</label><input className="input" value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))} required /></div>
                <div><label className="label">State/Region</label><input className="input" value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))} /></div>
                <div>
                  <label className="label">Category</label>
                  <select className="input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                    {['Nature','Mountains','Beach','Adventure','Historical','Romantic','Family','City','Luxury','Wildlife'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div><label className="label">Budget (₹)</label><input type="number" className="input" value={form.average_budget} onChange={e => setForm(f => ({ ...f, average_budget: e.target.value }))} /></div>
                <div><label className="label">Rating</label><input type="number" step="0.1" min="1" max="5" className="input" value={form.rating} onChange={e => setForm(f => ({ ...f, rating: e.target.value }))} /></div>
                <div><label className="label">Latitude</label><input type="number" className="input" value={form.latitude} onChange={e => setForm(f => ({ ...f, latitude: e.target.value }))} /></div>
                <div><label className="label">Longitude</label><input type="number" className="input" value={form.longitude} onChange={e => setForm(f => ({ ...f, longitude: e.target.value }))} /></div>
              </div>
              <div><label className="label">Image URL</label><input className="input" placeholder="https://..." value={form.image} onChange={e => setForm(f => ({ ...f, image: e.target.value }))} /></div>
              <div><label className="label">Best Time to Visit</label><input className="input" placeholder="e.g. October to March" value={form.best_time} onChange={e => setForm(f => ({ ...f, best_time: e.target.value }))} /></div>
              <div><label className="label">Description</label><textarea className="input min-h-[80px]" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="featured" checked={form.is_featured} onChange={e => setForm(f => ({ ...f, is_featured: e.target.checked }))} className="w-4 h-4 rounded" />
                <label htmlFor="featured" className="label mb-0 cursor-pointer">Featured Destination</label>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowForm(false)} className="btn btn-ghost flex-1">Cancel</button>
                <button type="submit" className="btn btn-gradient flex-1">{editDest ? 'Update' : 'Add'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

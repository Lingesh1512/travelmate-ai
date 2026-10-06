import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import {
  Calendar, Users, MapPin, IndianRupee, Clock, Plus, Trash2, Edit2,
  Check, X, Package, BarChart2, List, ChevronDown, ChevronUp
} from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from 'recharts';

const EXPENSE_CATS = ['transportation','hotels','food','activities','shopping','miscellaneous'];
const BUDGET_COLORS = ['#3b82f6','#22c55e','#f97316','#a855f7','#ec4899','#6b7280'];
const ACTIVITY_COLORS = { food:'#f97316', attraction:'#3b82f6', adventure:'#22c55e', shopping:'#ec4899', transport:'#a855f7', cultural:'#f59e0b', relaxation:'#06b6d4', general:'#6b7280' };

export default function TripDetail() {
  const { id } = useParams();
  const { isDark } = useTheme();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('itinerary');
  const [selectedDay, setSelectedDay] = useState(1);

  // Expense form
  const [expForm, setExpForm] = useState({ category: 'food', description: '', amount: '', expense_date: new Date().toISOString().split('T')[0], notes: '' });
  const [addingExp, setAddingExp] = useState(false);

  // Packing
  const [newItem, setNewItem] = useState('');
  const [addingItem, setAddingItem] = useState(false);

  const fetchTrip = async () => {
    try {
      const res = await api.get(`/trips/${id}`);
      setTrip(res.data.data);
    } catch { toast.error('Error loading trip'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchTrip(); }, [id]);

  const addExpense = async (e) => {
    e.preventDefault();
    if (!expForm.description || !expForm.amount) return;
    setAddingExp(true);
    try {
      await api.post('/expenses', { ...expForm, trip_id: id, amount: Number(expForm.amount) });
      toast.success('Expense added!');
      fetchTrip();
      setExpForm({ category: 'food', description: '', amount: '', expense_date: new Date().toISOString().split('T')[0], notes: '' });
    } catch { toast.error('Error adding expense'); }
    finally { setAddingExp(false); }
  };

  const deleteExpense = async (eid) => {
    try { await api.delete(`/expenses/${eid}`); toast.success('Expense deleted'); fetchTrip(); }
    catch { toast.error('Error'); }
  };

  const togglePacking = async (itemId, val) => {
    try { await api.put(`/packing/${itemId}`, { is_completed: val }); fetchTrip(); }
    catch { toast.error('Error'); }
  };

  const addPackingItem = async () => {
    if (!newItem.trim()) return;
    setAddingItem(true);
    try {
      await api.post('/packing', { trip_id: id, item: newItem.trim(), category: 'General' });
      toast.success('Item added!'); setNewItem(''); fetchTrip();
    } catch { toast.error('Error'); }
    finally { setAddingItem(false); }
  };

  const deletePacking = async (pid) => {
    try { await api.delete(`/packing/${pid}`); fetchTrip(); }
    catch { toast.error('Error'); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!trip) return <div className="text-center py-20 text-dark-400">Trip not found. <Link to="/my-trips" className="text-primary-400">Back to trips</Link></div>;

  const days = trip.itinerary?.length ? Math.max(...trip.itinerary.map(i => i.day_number)) : 1;
  const dayItems = trip.itinerary?.filter(i => i.day_number === selectedDay) || [];
  const totalExpenses = trip.expenses?.reduce((s, e) => s + Number(e.amount), 0) || 0;
  const expByCategory = EXPENSE_CATS.map((cat, i) => ({
    name: cat, value: trip.expenses?.filter(e => e.category === cat).reduce((s, e) => s + Number(e.amount), 0) || 0, color: BUDGET_COLORS[i]
  })).filter(d => d.value > 0);

  const tabs = ['itinerary', 'budget', 'expenses', 'packing'];

  return (
    <div className={`min-h-screen ${isDark ? 'bg-dark-950' : 'bg-gray-50'}`}>
      {/* Hero */}
      <div className="relative h-48 overflow-hidden">
        <img src={trip.cover_image || trip.destination_image || 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200'}
          alt={trip.trip_name} className="w-full h-full object-cover"
          onError={e => e.target.src = 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200'} />
        <div className="absolute inset-0 bg-gradient-to-r from-dark-950/90 to-dark-950/50" />
        <div className="absolute inset-0 flex flex-col justify-end p-6 max-w-6xl mx-auto">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-primary-400 text-sm font-semibold mb-1">
                <span className={`badge ${
                  trip.status === 'upcoming' ? 'status-upcoming' : trip.status === 'ongoing' ? 'status-ongoing' :
                  trip.status === 'completed' ? 'status-completed' : 'status-planning'
                } mr-2`}>{trip.status}</span>
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold text-white font-display">{trip.trip_name}</h1>
              <div className="flex items-center gap-4 text-white/70 text-sm mt-1">
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{trip.destination_name}</span>
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{format(new Date(trip.start_date), 'dd MMM')} – {format(new Date(trip.end_date), 'dd MMM yyyy')}</span>
                <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{trip.travelers} pax</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tabs */}
        <div className={`flex gap-1 p-1 rounded-2xl mb-6 w-fit ${isDark ? 'bg-dark-800' : 'bg-gray-100'}`}>
          {tabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-xl text-sm font-medium capitalize transition-all
                ${activeTab === tab ? 'bg-primary-500 text-white shadow-lg' : isDark ? 'text-dark-400 hover:text-white' : 'text-dark-500 hover:text-dark-900'}`}>
              {tab === 'itinerary' ? '📅 Itinerary' : tab === 'budget' ? '💰 Budget' : tab === 'expenses' ? '🧾 Expenses' : '🎒 Packing'}
            </button>
          ))}
        </div>

        {/* ITINERARY TAB */}
        {activeTab === 'itinerary' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 mb-4">
                {[...Array(days)].map((_, i) => (
                  <button key={i} onClick={() => setSelectedDay(i + 1)}
                    className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${selectedDay === i + 1 ? 'bg-primary-500 text-white' : isDark ? 'bg-dark-800 text-dark-300 hover:bg-dark-700' : 'bg-white text-dark-600 border border-gray-200'}`}>
                    Day {i + 1}
                  </button>
                ))}
              </div>
              <div className={`card p-5 ${isDark ? '' : 'card-light'}`}>
                {dayItems.length ? (
                  <div className="space-y-3">
                    {dayItems.map((item, idx) => {
                      const color = ACTIVITY_COLORS[item.activity_type] || ACTIVITY_COLORS.general;
                      return (
                        <div key={item.id} className="flex gap-3">
                          <div className="flex flex-col items-center">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ backgroundColor: color + '25', border: `2px solid ${color}` }}>
                              {item.start_time?.slice(0,5) || '•'}
                            </div>
                            {idx < dayItems.length - 1 && <div className="w-0.5 flex-1 mt-1" style={{ backgroundColor: color + '40', minHeight: '20px' }} />}
                          </div>
                          <div className={`flex-1 p-3 rounded-xl mb-1 ${isDark ? 'bg-dark-700' : 'bg-gray-50'}`}>
                            <div className="flex items-start justify-between gap-2">
                              <p className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-dark-900'}`}>{item.activity_name}</p>
                              {item.estimated_cost > 0 && <span className="text-xs text-green-400 font-bold flex-shrink-0">₹{Number(item.estimated_cost).toLocaleString('en-IN')}</span>}
                            </div>
                            {item.description && <p className={`text-xs mt-1 ${isDark ? 'text-dark-400' : 'text-dark-500'}`}>{item.description}</p>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : <p className={`text-center py-8 ${isDark ? 'text-dark-400' : 'text-dark-500'}`}>No activities for Day {selectedDay}</p>}
              </div>
            </div>
            <div className={`card p-5 h-fit ${isDark ? '' : 'card-light'}`}>
              <h3 className={`font-bold mb-4 ${isDark ? 'text-white' : 'text-dark-900'}`}>Trip Details</h3>
              <div className="space-y-3 text-sm">
                {[['Destination', trip.destination_name], ['Start', trip.start_date ? format(new Date(trip.start_date),'dd MMM yyyy') : '–'], ['End', trip.end_date ? format(new Date(trip.end_date),'dd MMM yyyy') : '–'],
                  ['Duration', `${days} Days`], ['Travelers', trip.travelers], ['Style', trip.travel_style], ['Pace', trip.travel_pace], ['Budget', trip.budget ? `₹${Number(trip.budget).toLocaleString('en-IN')}` : '–']
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between">
                    <span className={isDark ? 'text-dark-400' : 'text-dark-500'}>{k}</span>
                    <span className={`font-semibold capitalize ${isDark ? 'text-white' : 'text-dark-900'}`}>{v || '–'}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* BUDGET TAB */}
        {activeTab === 'budget' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`card p-6 ${isDark ? '' : 'card-light'}`}>
              <h3 className={`font-bold mb-4 ${isDark ? 'text-white' : 'text-dark-900'}`}>Budget Plan</h3>
              {trip.budget ? (
                <>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={EXPENSE_CATS.map((cat, i) => ({ name: cat, value: trip.budget ? (trip.budget * [0.25,0.35,0.20,0.12,0.05,0.03][i]) : 0 })).filter(d => d.value > 0)}
                        cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                        {BUDGET_COLORS.map((color, i) => <Cell key={i} fill={color} />)}
                      </Pie>
                      <Tooltip formatter={v => `₹${Number(v).toLocaleString('en-IN')}`} contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9', fontSize: '12px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2">
                    {EXPENSE_CATS.map((cat, i) => (
                      <div key={cat} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: BUDGET_COLORS[i] }} />
                          <span className={`capitalize ${isDark ? 'text-dark-300' : 'text-dark-600'}`}>{cat}</span>
                        </div>
                        <span className={`font-semibold ${isDark ? 'text-white' : 'text-dark-900'}`}>₹{Number(trip.budget * [0.25,0.35,0.20,0.12,0.05,0.03][i]).toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                    <div className={`flex items-center justify-between font-bold pt-2 border-t ${isDark ? 'border-dark-600 text-white' : 'border-gray-200 text-dark-900'}`}>
                      <span>Total</span><span className="text-primary-400">₹{Number(trip.budget).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </>
              ) : <p className={isDark ? 'text-dark-400' : 'text-dark-500'}>No budget set for this trip.</p>}
            </div>
            <div className={`card p-6 ${isDark ? '' : 'card-light'}`}>
              <h3 className={`font-bold mb-4 ${isDark ? 'text-white' : 'text-dark-900'}`}>Budget vs Spent</h3>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className={isDark ? 'text-dark-400' : 'text-dark-500'}>Total Budget</span>
                  <span className={`font-bold ${isDark ? 'text-white' : 'text-dark-900'}`}>₹{Number(trip.budget || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className={isDark ? 'text-dark-400' : 'text-dark-500'}>Total Spent</span>
                  <span className="font-bold text-red-400">₹{totalExpenses.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className={isDark ? 'text-dark-400' : 'text-dark-500'}>Remaining</span>
                  <span className={`font-bold ${totalExpenses <= (trip.budget || 0) ? 'text-green-400' : 'text-red-400'}`}>
                    ₹{(Number(trip.budget || 0) - totalExpenses).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span className={isDark ? 'text-dark-400' : 'text-dark-500'}>Spent</span>
                    <span className={isDark ? 'text-dark-400' : 'text-dark-500'}>{trip.budget ? Math.round((totalExpenses / trip.budget) * 100) : 0}%</span>
                  </div>
                  <div className={`h-3 rounded-full ${isDark ? 'bg-dark-700' : 'bg-gray-200'}`}>
                    <div className={`h-3 rounded-full transition-all ${totalExpenses > (trip.budget || 0) ? 'bg-red-500' : 'bg-green-500'}`}
                      style={{ width: `${Math.min(100, trip.budget ? (totalExpenses / trip.budget) * 100 : 0)}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* EXPENSES TAB */}
        {activeTab === 'expenses' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className={`card p-5 mb-5 ${isDark ? '' : 'card-light'}`}>
                <h3 className={`font-bold mb-4 ${isDark ? 'text-white' : 'text-dark-900'}`}>Add Expense</h3>
                <form onSubmit={addExpense} className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <select className="input text-sm" value={expForm.category} onChange={e => setExpForm(f => ({ ...f, category: e.target.value }))}>
                    {EXPENSE_CATS.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
                  </select>
                  <input className="input text-sm" placeholder="Description" value={expForm.description} onChange={e => setExpForm(f => ({ ...f, description: e.target.value }))} required />
                  <input type="number" className="input text-sm" placeholder="Amount (₹)" value={expForm.amount} onChange={e => setExpForm(f => ({ ...f, amount: e.target.value }))} required />
                  <input type="date" className="input text-sm" value={expForm.expense_date} onChange={e => setExpForm(f => ({ ...f, expense_date: e.target.value }))} />
                  <button type="submit" disabled={addingExp} className="btn btn-gradient btn-sm col-span-2 sm:col-span-1">
                    {addingExp ? '...' : <><Plus className="w-4 h-4" /> Add</>}
                  </button>
                </form>
              </div>
              <div className="space-y-2">
                {trip.expenses?.length ? trip.expenses.map(exp => (
                  <div key={exp.id} className={`flex items-center gap-4 p-4 rounded-xl ${isDark ? 'bg-dark-800 border border-dark-700' : 'bg-white border border-gray-200'}`}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0" style={{ backgroundColor: BUDGET_COLORS[EXPENSE_CATS.indexOf(exp.category)] + '20' }}>
                      {['🚗','🏨','🍜','🎡','🛍️','📦'][EXPENSE_CATS.indexOf(exp.category)] || '📦'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-dark-900'}`}>{exp.description}</p>
                      <p className={`text-xs capitalize ${isDark ? 'text-dark-400' : 'text-dark-500'}`}>{exp.category} · {format(new Date(exp.expense_date), 'dd MMM yyyy')}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-red-400">₹{Number(exp.amount).toLocaleString('en-IN')}</span>
                      <button onClick={() => deleteExpense(exp.id)} className="p-1.5 text-dark-500 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                )) : <p className={`text-center py-10 ${isDark ? 'text-dark-400' : 'text-dark-500'}`}>No expenses recorded yet</p>}
              </div>
            </div>
            <div className={`card p-5 h-fit ${isDark ? '' : 'card-light'}`}>
              <h3 className={`font-bold mb-3 ${isDark ? 'text-white' : 'text-dark-900'}`}>Expense Summary</h3>
              <div className="text-center py-4">
                <p className={`text-sm ${isDark ? 'text-dark-400' : 'text-dark-500'}`}>Total Spent</p>
                <p className="text-3xl font-bold text-red-400">₹{totalExpenses.toLocaleString('en-IN')}</p>
                {trip.budget && <p className={`text-xs mt-1 ${isDark ? 'text-dark-400' : 'text-dark-500'}`}>of ₹{Number(trip.budget).toLocaleString('en-IN')} budget</p>}
              </div>
              {expByCategory.length > 0 && (
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={expByCategory} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value">
                      {expByCategory.map((d, i) => <Cell key={i} fill={d.color} />)}
                    </Pie>
                    <Tooltip formatter={v => `₹${Number(v).toLocaleString('en-IN')}`} contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '11px', color: '#f1f5f9' }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        )}

        {/* PACKING TAB */}
        {activeTab === 'packing' && (
          <div className="max-w-2xl">
            <div className={`card p-5 mb-5 ${isDark ? '' : 'card-light'}`}>
              <h3 className={`font-bold mb-4 ${isDark ? 'text-white' : 'text-dark-900'}`}>Add Packing Item</h3>
              <div className="flex gap-3">
                <input className="input flex-1" placeholder="e.g. Sunscreen, Camera, Passport..." value={newItem} onChange={e => setNewItem(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addPackingItem())} />
                <button onClick={addPackingItem} disabled={addingItem || !newItem.trim()} className="btn btn-gradient px-6">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className={`card p-5 ${isDark ? '' : 'card-light'}`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`font-bold ${isDark ? 'text-white' : 'text-dark-900'}`}>Packing List</h3>
                <span className={`text-sm ${isDark ? 'text-dark-400' : 'text-dark-500'}`}>
                  {trip.packing?.filter(p => p.is_completed).length}/{trip.packing?.length || 0} packed
                </span>
              </div>
              {trip.packing?.length ? (
                <div className="space-y-2">
                  {trip.packing.map(item => (
                    <div key={item.id} className={`flex items-center gap-3 p-3 rounded-xl transition-all ${item.is_completed ? isDark ? 'bg-green-500/10' : 'bg-green-50' : isDark ? 'bg-dark-700' : 'bg-gray-50'}`}>
                      <button onClick={() => togglePacking(item.id, !item.is_completed)}
                        className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all
                          ${item.is_completed ? 'bg-green-500 border-green-500 text-white' : isDark ? 'border-dark-500 hover:border-green-500' : 'border-gray-300 hover:border-green-500'}`}>
                        {item.is_completed && <Check className="w-3.5 h-3.5" />}
                      </button>
                      <span className={`flex-1 text-sm ${item.is_completed ? 'line-through text-dark-500' : isDark ? 'text-white' : 'text-dark-900'}`}>{item.item}</span>
                      <button onClick={() => deletePacking(item.id)} className="p-1 text-dark-500 hover:text-red-400 transition-colors"><X className="w-3.5 h-3.5" /></button>
                    </div>
                  ))}
                </div>
              ) : <p className={`text-center py-8 ${isDark ? 'text-dark-400' : 'text-dark-500'}`}>No packing items yet. Add some above!</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

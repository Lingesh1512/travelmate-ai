import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  Sparkles, MapPin, Calendar, Users, IndianRupee, ArrowRight,
  Check, Loader2, Save, Clock, Utensils, Mountain, Camera,
  ShoppingBag, Music, Leaf, BookOpen, Sunrise
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const INTERESTS = [
  { id: 'nature', label: 'Nature', icon: Leaf },
  { id: 'food', label: 'Food', icon: Utensils },
  { id: 'adventure', label: 'Adventure', icon: Mountain },
  { id: 'photography', label: 'Photography', icon: Camera },
  { id: 'history', label: 'History', icon: BookOpen },
  { id: 'shopping', label: 'Shopping', icon: ShoppingBag },
  { id: 'nightlife', label: 'Nightlife', icon: Music },
  { id: 'relaxation', label: 'Relaxation', icon: Sunrise },
];

const ACTIVITY_COLORS = { food: '#f97316', attraction: '#3b82f6', adventure: '#22c55e', shopping: '#ec4899', transport: '#a855f7', cultural: '#f59e0b', relaxation: '#06b6d4', photography: '#8b5cf6', general: '#6b7280' };
const BUDGET_COLORS = ['#3b82f6','#22c55e','#f97316','#a855f7','#ec4899','#6b7280'];

export default function AiPlanner() {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [step, setStep] = useState('form'); // form | loading | result
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState(null);
  const [selectedDay, setSelectedDay] = useState(1);

  const [form, setForm] = useState({
    destination: searchParams.get('destination') || '',
    starting_location: '',
    start_date: '',
    end_date: '',
    travelers: 2,
    budget: '',
    travel_style: 'standard',
    travel_pace: 'balanced',
    interests: ['nature', 'food'],
  });

  const setF = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const toggleInterest = (id) => setF('interests', form.interests.includes(id) ? form.interests.filter(i => i !== id) : [...form.interests, id]);

  const generate = async (e) => {
    e.preventDefault();
    if (!form.destination || !form.start_date || !form.end_date) { toast.error('Please fill destination and dates'); return; }
    if (new Date(form.end_date) < new Date(form.start_date)) { toast.error('End date must be after start date'); return; }
    setStep('loading');
    try {
      const res = await api.post('/planner/generate', { ...form, budget: form.budget ? Number(form.budget) : undefined });
      setResult(res.data.data);
      setStep('result');
      setSelectedDay(1);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error generating trip');
      setStep('form');
    }
  };

  const saveTrip = async () => {
    if (!user) { toast.error('Please login to save trip'); navigate('/login'); return; }
    setSaving(true);
    try {
      const res = await api.post('/planner/save', result);
      toast.success('Trip saved! 🎉');
      navigate(`/trips/${res.data.data.id}`);
    } catch (err) { toast.error(err.response?.data?.message || 'Error saving trip'); }
    finally { setSaving(false); }
  };

  const days = result ? Math.max(...result.itinerary.map(i => i.day_number)) : 0;
  const dayItems = result?.itinerary.filter(i => i.day_number === selectedDay) || [];

  const budgetChartData = result ? [
    { name: 'Transport', value: result.budget_breakdown.transportation },
    { name: 'Hotels', value: result.budget_breakdown.hotels },
    { name: 'Food', value: result.budget_breakdown.food },
    { name: 'Activities', value: result.budget_breakdown.activities },
    { name: 'Shopping', value: result.budget_breakdown.shopping },
    { name: 'Other', value: result.budget_breakdown.miscellaneous },
  ] : [];

  // ─── FORM ──────────────────────────────────────────────
  if (step === 'form') return (
    <div className={`min-h-screen ${isDark ? 'bg-dark-950' : 'bg-gray-50'} py-10`}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-primary-500/10 border border-primary-500/30 rounded-full px-4 py-2 mb-4">
            <Sparkles className="w-4 h-4 text-primary-400" />
            <span className="text-primary-400 text-sm font-medium">AI-Powered</span>
          </div>
          <h1 className="section-title text-4xl mb-2">Build Your Perfect Journey</h1>
          <p className="section-subtitle">Tell us your preferences and we'll craft a personalized itinerary</p>
        </div>

        <form onSubmit={generate} className={`card p-8 space-y-6 ${isDark ? '' : 'card-light'}`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="label">Destination *</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                <input className="input pl-10" placeholder="e.g. Ooty, Bali, Paris" value={form.destination} onChange={e => setF('destination', e.target.value)} required />
              </div>
            </div>
            <div>
              <label className="label">Starting Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                <input className="input pl-10" placeholder="e.g. Chennai, Mumbai" value={form.starting_location} onChange={e => setF('starting_location', e.target.value)} />
              </div>
            </div>
            <div>
              <label className="label">Start Date *</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                <input type="date" className="input pl-10" value={form.start_date} onChange={e => setF('start_date', e.target.value)} min={new Date().toISOString().split('T')[0]} required />
              </div>
            </div>
            <div>
              <label className="label">End Date *</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                <input type="date" className="input pl-10" value={form.end_date} onChange={e => setF('end_date', e.target.value)} min={form.start_date || new Date().toISOString().split('T')[0]} required />
              </div>
            </div>
            <div>
              <label className="label">Travelers</label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                <input type="number" min="1" max="20" className="input pl-10" value={form.travelers} onChange={e => setF('travelers', Number(e.target.value))} />
              </div>
            </div>
            <div>
              <label className="label">Total Budget (₹)</label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                <input type="number" className="input pl-10" placeholder="e.g. 20000" value={form.budget} onChange={e => setF('budget', e.target.value)} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="label">Travel Style</label>
              <div className="grid grid-cols-3 gap-2">
                {[['budget','🎒 Budget'],['standard','🏨 Standard'],['luxury','💎 Luxury']].map(([v, l]) => (
                  <button type="button" key={v} onClick={() => setF('travel_style', v)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all ${form.travel_style === v ? 'bg-primary-500/20 border-primary-500 text-primary-400' : isDark ? 'border-dark-600 text-dark-400 hover:border-dark-500' : 'border-gray-200 text-dark-500 hover:border-gray-300'}`}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="label">Travel Pace</label>
              <div className="grid grid-cols-3 gap-2">
                {[['relaxed','😌 Relaxed'],['balanced','⚖️ Balanced'],['packed','⚡ Packed']].map(([v, l]) => (
                  <button type="button" key={v} onClick={() => setF('travel_pace', v)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all ${form.travel_pace === v ? 'bg-primary-500/20 border-primary-500 text-primary-400' : isDark ? 'border-dark-600 text-dark-400 hover:border-dark-500' : 'border-gray-200 text-dark-500 hover:border-gray-300'}`}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="label">Interests (select all that apply)</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {INTERESTS.map(({ id, label, icon: Icon }) => (
                <button type="button" key={id} onClick={() => toggleInterest(id)}
                  className={`flex items-center gap-2.5 py-3 px-4 rounded-xl border text-sm font-medium transition-all
                    ${form.interests.includes(id) ? 'bg-primary-500/20 border-primary-500 text-primary-400' : isDark ? 'border-dark-600 text-dark-400 hover:border-dark-500 hover:text-white' : 'border-gray-200 text-dark-500 hover:border-gray-300'}`}>
                  <Icon className="w-4 h-4" />
                  {label}
                  {form.interests.includes(id) && <Check className="w-3.5 h-3.5 ml-auto" />}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" className="btn btn-gradient w-full py-4 text-base">
            <Sparkles className="w-5 h-5" />
            Generate My Trip
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );

  // ─── LOADING ───────────────────────────────────────────
  if (step === 'loading') return (
    <div className="min-h-screen flex items-center justify-center bg-dark-950">
      <div className="text-center max-w-sm mx-auto px-4">
        <div className="relative w-24 h-24 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full border-4 border-primary-500/20" />
          <div className="absolute inset-0 rounded-full border-4 border-t-primary-500 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-primary-400 animate-pulse" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">Planning your adventure...</h2>
        <p className="text-dark-400">Our AI is crafting a personalized itinerary just for you</p>
        <div className="flex justify-center gap-1 mt-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="w-2 h-2 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />
          ))}
        </div>
      </div>
    </div>
  );

  // ─── RESULT ───────────────────────────────────────────
  return (
    <div className={`min-h-screen ${isDark ? 'bg-dark-950' : 'bg-gray-50'} pb-16`}>
      {/* Hero */}
      <div className="relative h-48 overflow-hidden">
        {result?.destination_info?.image && (
          <img src={result.destination_info.image} alt="" className="w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-dark-950/90 to-dark-950/60" />
        <div className="absolute inset-0 flex items-center px-4 sm:px-8 max-w-6xl mx-auto">
          <div>
            <p className="text-primary-400 text-sm font-semibold mb-1">✨ AI-Generated Itinerary</p>
            <h1 className="text-3xl font-bold text-white font-display">{result?.trip_info?.trip_name}</h1>
            <p className="text-white/70 text-sm mt-1">{result?.trip_info?.destination} · {result?.trip_info?.days} Days · {result?.trip_info?.travelers} Travelers</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between mb-6">
          <button onClick={() => { setStep('form'); setResult(null); }} className="btn btn-outline btn-sm">
            ← Modify Plan
          </button>
          <div className="flex gap-3">
            <button onClick={saveTrip} disabled={saving} className="btn btn-gradient">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Saving...' : 'Save Trip'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Itinerary */}
          <div className="lg:col-span-2">
            {/* Day tabs */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 mb-4">
              {[...Array(days)].map((_, i) => (
                <button key={i} onClick={() => setSelectedDay(i + 1)}
                  className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${selectedDay === i + 1 ? 'bg-primary-500 text-white' : isDark ? 'bg-dark-800 text-dark-300 hover:bg-dark-700' : 'bg-white text-dark-600 hover:bg-gray-100 border border-gray-200'}`}>
                  Day {i + 1}
                </button>
              ))}
            </div>

            {/* Day header */}
            <div className={`card p-4 mb-4 flex items-center gap-3 ${isDark ? '' : 'card-light'}`}>
              <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center text-primary-400 font-bold">
                {selectedDay}
              </div>
              <div>
                <h3 className={`font-bold ${isDark ? 'text-white' : 'text-dark-900'}`}>Day {selectedDay}</h3>
                {result?.trip_info?.start_date && (
                  <p className={`text-xs ${isDark ? 'text-dark-400' : 'text-dark-500'}`}>
                    {format(new Date(new Date(result.trip_info.start_date).getTime() + (selectedDay - 1) * 86400000), 'EEEE, dd MMM yyyy')}
                  </p>
                )}
              </div>
            </div>

            {/* Timeline */}
            <div className={`card p-6 ${isDark ? '' : 'card-light'}`}>
              <div className="space-y-4">
                {dayItems.map((item, idx) => {
                  const color = ACTIVITY_COLORS[item.activity_type] || ACTIVITY_COLORS.general;
                  return (
                    <div key={item.id || idx} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ backgroundColor: color + '33', border: `2px solid ${color}` }}>
                          {item.start_time?.slice(0, 5) || '—'}
                        </div>
                        {idx < dayItems.length - 1 && <div className="w-0.5 flex-1 mt-2" style={{ backgroundColor: color + '40' }} />}
                      </div>
                      <div className={`flex-1 pb-4 rounded-xl p-4 ${isDark ? 'bg-dark-700' : 'bg-gray-50'}`}>
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-dark-900'}`}>{item.activity_name}</h4>
                          {item.estimated_cost > 0 && (
                            <span className="text-xs text-green-400 font-semibold flex-shrink-0">₹{Number(item.estimated_cost).toLocaleString('en-IN')}</span>
                          )}
                        </div>
                        {item.description && <p className={`text-xs leading-relaxed ${isDark ? 'text-dark-400' : 'text-dark-500'}`}>{item.description}</p>}
                        <div className="flex items-center gap-3 mt-2 text-xs">
                          {item.start_time && item.end_time && (
                            <span className={`flex items-center gap-1 ${isDark ? 'text-dark-400' : 'text-dark-500'}`}>
                              <Clock className="w-3 h-3" />{item.start_time?.slice(0,5)} – {item.end_time?.slice(0,5)}
                            </span>
                          )}
                          {item.location_name && (
                            <span className={`flex items-center gap-1 ${isDark ? 'text-dark-400' : 'text-dark-500'}`}>
                              <MapPin className="w-3 h-3" />{item.location_name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Trip summary */}
            <div className={`card p-5 ${isDark ? '' : 'card-light'}`}>
              <h3 className={`font-bold mb-4 ${isDark ? 'text-white' : 'text-dark-900'}`}>Trip Summary</h3>
              <div className="space-y-3 text-sm">
                {[
                  ['Destination', result?.trip_info?.destination],
                  ['Dates', result?.trip_info?.start_date && result?.trip_info?.end_date ? `${format(new Date(result.trip_info.start_date), 'dd MMM')} – ${format(new Date(result.trip_info.end_date), 'dd MMM yyyy')}` : '–'],
                  ['Duration', `${result?.trip_info?.days} Days`],
                  ['Travelers', result?.trip_info?.travelers],
                  ['Style', result?.trip_info?.travel_style],
                  ['Pace', result?.trip_info?.travel_pace],
                  ['Total Budget', result?.budget_breakdown?.total ? `₹${Number(result.budget_breakdown.total).toLocaleString('en-IN')}` : '–'],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between">
                    <span className={isDark ? 'text-dark-400' : 'text-dark-500'}>{k}</span>
                    <span className={`font-semibold capitalize ${isDark ? 'text-white' : 'text-dark-900'}`}>{v || '–'}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Budget chart */}
            {budgetChartData.length > 0 && (
              <div className={`card p-5 ${isDark ? '' : 'card-light'}`}>
                <h3 className={`font-bold mb-4 ${isDark ? 'text-white' : 'text-dark-900'}`}>Budget Breakdown</h3>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={budgetChartData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                      {budgetChartData.map((_, i) => <Cell key={i} fill={BUDGET_COLORS[i % BUDGET_COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v) => `₹${Number(v).toLocaleString('en-IN')}`} contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9', fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1.5 mt-2">
                  {budgetChartData.map((item, i) => (
                    <div key={item.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: BUDGET_COLORS[i] }} />
                        <span className={isDark ? 'text-dark-300' : 'text-dark-600'}>{item.name}</span>
                      </div>
                      <span className={`font-semibold ${isDark ? 'text-white' : 'text-dark-900'}`}>₹{Number(item.value).toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Packing */}
            {result?.packing_suggestions?.length > 0 && (
              <div className={`card p-5 ${isDark ? '' : 'card-light'}`}>
                <h3 className={`font-bold mb-3 ${isDark ? 'text-white' : 'text-dark-900'}`}>🎒 Pack This</h3>
                <div className="flex flex-wrap gap-2">
                  {result.packing_suggestions.map(item => (
                    <span key={item} className={`text-xs px-2.5 py-1 rounded-full border ${isDark ? 'bg-dark-700 border-dark-600 text-dark-300' : 'bg-gray-100 border-gray-200 text-dark-600'}`}>
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

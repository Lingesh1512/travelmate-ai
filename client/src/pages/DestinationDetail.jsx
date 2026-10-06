import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, MapPin, Heart, Clock, IndianRupee, Thermometer, Plane, ChevronLeft, Globe2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function DestinationDetail() {
  const { id } = useParams();
  const { isDark } = useTheme();
  const { user } = useAuth();
  const [dest, setDest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFav, setIsFav] = useState(false);
  const [favLoading, setFavLoading] = useState(false);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    setLoading(true);
    api.get(`/destinations/${id}`).then(r => {
      setDest(r.data.data);
      if (user) {
        api.get(`/favorites/check/${id}`).then(fr => setIsFav(fr.data.data.isFavorite)).catch(() => {});
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, [id, user]);

  const toggleFav = async () => {
    if (!user) { toast.error('Please login to save favorites'); return; }
    setFavLoading(true);
    try {
      if (isFav) { await api.delete(`/favorites/${id}`); setIsFav(false); toast.success('Removed from favorites'); }
      else { await api.post('/favorites', { destination_id: id }); setIsFav(true); toast.success('Added to favorites! ❤️'); }
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setFavLoading(false); }
  };

  if (loading) return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="skeleton h-80 rounded-2xl mb-8" />
      <div className="skeleton h-8 w-1/3 rounded mb-4" />
      <div className="skeleton h-4 w-full rounded mb-2" />
      <div className="skeleton h-4 w-2/3 rounded" />
    </div>
  );

  if (!dest) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Globe2 className="w-16 h-16 text-dark-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Destination not found</h2>
        <Link to="/explore" className="btn btn-primary">Back to Explore</Link>
      </div>
    </div>
  );

  const images = [dest.image, ...(dest.gallery ? JSON.parse(dest.gallery) : [])].filter(Boolean);
  const weather = { temp: dest.climate?.includes('cold') || dest.climate?.includes('alpine') ? '10–22°C' : '25–35°C', condition: 'Pleasant', humidity: '65%' };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-dark-950' : 'bg-gray-50'}`}>
      {/* Back */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2">
        <Link to="/explore" className={`inline-flex items-center gap-2 text-sm hover:text-primary-400 transition-colors ${isDark ? 'text-dark-400' : 'text-dark-500'}`}>
          <ChevronLeft className="w-4 h-4" /> Back to Explore
        </Link>
      </div>

      {/* Hero image */}
      <div className="relative h-72 sm:h-96 overflow-hidden mb-6">
        <img src={images[activeImg] || dest.image} alt={dest.name}
          className="w-full h-full object-cover"
          onError={e => e.target.src = 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200'} />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-950/80 via-transparent to-transparent" />
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {images.slice(0, 5).map((_, i) => (
              <button key={i} onClick={() => setActiveImg(i)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${i === activeImg ? 'bg-white w-6' : 'bg-white/50'}`} />
            ))}
          </div>
        )}
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className={`text-4xl font-bold font-display mb-2 ${isDark ? 'text-white' : 'text-dark-900'}`}>{dest.name}</h1>
                <div className={`flex items-center gap-2 text-sm ${isDark ? 'text-dark-400' : 'text-dark-500'}`}>
                  <MapPin className="w-4 h-4 text-primary-400" />
                  <span>{[dest.state, dest.country].filter(Boolean).join(', ')}</span>
                  <span className={`badge badge-primary ml-2`}>{dest.category}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-yellow-500/20 border border-yellow-500/30 rounded-xl px-3 py-2">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-yellow-400 font-bold">{dest.rating}</span>
                </div>
                <button onClick={toggleFav} disabled={favLoading}
                  className={`p-3 rounded-xl border transition-all ${isFav ? 'bg-red-500/20 border-red-500/50 text-red-400' : isDark ? 'bg-dark-800 border-dark-600 text-dark-400 hover:text-white' : 'bg-white border-gray-200 text-dark-400 hover:text-red-500'}`}>
                  <Heart className={`w-5 h-5 ${isFav ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>

            {/* Description */}
            <div className={`card p-6 mb-6 ${isDark ? '' : 'card-light'}`}>
              <h3 className={`font-bold mb-3 ${isDark ? 'text-white' : 'text-dark-900'}`}>About {dest.name}</h3>
              <p className={`text-sm leading-relaxed ${isDark ? 'text-dark-300' : 'text-dark-600'}`}>
                {dest.long_description || dest.description}
              </p>
            </div>

            {/* Info grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
              {[
                { icon: Clock, label: 'Best Time', value: dest.best_time?.split('(')[0] || 'Year round' },
                { icon: IndianRupee, label: 'Avg Budget', value: dest.average_budget ? `₹${Number(dest.average_budget).toLocaleString('en-IN')}` : 'Varies' },
                { icon: Globe2, label: 'Language', value: dest.language || 'Local' },
                { icon: Thermometer, label: 'Climate', value: dest.climate?.split(',')[0] || 'Tropical' },
                { icon: Globe2, label: 'Currency', value: dest.currency || 'Local currency' },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className={`card p-4 ${isDark ? '' : 'card-light'}`}>
                  <Icon className="w-5 h-5 text-primary-400 mb-2" />
                  <p className={`text-xs mb-0.5 ${isDark ? 'text-dark-400' : 'text-dark-500'}`}>{label}</p>
                  <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-dark-900'}`}>{value}</p>
                </div>
              ))}
            </div>

            {/* Attractions */}
            {dest.attractions?.length > 0 && (
              <div className={`card p-6 mb-6 ${isDark ? '' : 'card-light'}`}>
                <h3 className={`font-bold mb-4 ${isDark ? 'text-white' : 'text-dark-900'}`}>Popular Attractions</h3>
                <div className="space-y-3">
                  {dest.attractions.map(a => (
                    <div key={a.id} className={`flex items-center gap-4 p-3 rounded-xl ${isDark ? 'bg-dark-700' : 'bg-gray-50'}`}>
                      {a.image && <img src={a.image} alt={a.name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" onError={e => e.target.style.display='none'} />}
                      <div className="flex-1 min-w-0">
                        <p className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-dark-900'}`}>{a.name}</p>
                        <p className={`text-xs truncate-2 ${isDark ? 'text-dark-400' : 'text-dark-500'}`}>{a.description}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs">
                          <span className="flex items-center gap-1 text-yellow-400"><Star className="w-3 h-3 fill-current" />{a.rating}</span>
                          {a.entry_fee > 0 && <span className={isDark ? 'text-dark-400' : 'text-dark-500'}>₹{a.entry_fee} entry</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Travel tips */}
            {dest.travel_tips && (
              <div className={`card p-6 mb-6 ${isDark ? '' : 'card-light'}`}>
                <h3 className={`font-bold mb-3 ${isDark ? 'text-white' : 'text-dark-900'}`}>Travel Tips</h3>
                <ul className="space-y-2">
                  {dest.travel_tips.split('.').filter(t => t.trim()).map((tip, i) => (
                    <li key={i} className={`flex items-start gap-2 text-sm ${isDark ? 'text-dark-300' : 'text-dark-600'}`}>
                      <span className="text-primary-400 mt-0.5">•</span> {tip.trim()}.
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Safety */}
            {dest.safety_tips && (
              <div className="card p-6 border border-yellow-500/30 bg-yellow-500/5">
                <h3 className="font-bold text-yellow-400 mb-3">🛡️ Safety Information</h3>
                <p className={`text-sm ${isDark ? 'text-dark-300' : 'text-dark-600'}`}>{dest.safety_tips}</p>
                {dest.emergency_numbers && (
                  <div className="mt-3 pt-3 border-t border-yellow-500/20">
                    <p className="text-xs text-yellow-400 font-semibold">Emergency Numbers:</p>
                    <p className={`text-sm mt-1 ${isDark ? 'text-dark-300' : 'text-dark-600'}`}>{dest.emergency_numbers}</p>
                  </div>
                )}
                <p className="text-xs text-yellow-500/70 mt-3">⚠️ Always verify information with official local sources before traveling.</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Plan trip CTA */}
            <div className="card p-6 bg-gradient-to-br from-primary-600 to-purple-600 border-0">
              <h3 className="text-white font-bold text-lg mb-2">Ready to visit {dest.name}?</h3>
              <p className="text-white/70 text-sm mb-4">Let AI plan your perfect trip in seconds</p>
              <Link to={`/ai-planner?destination=${encodeURIComponent(dest.name)}`} className="btn bg-white text-primary-700 hover:bg-white/90 w-full justify-center">
                <Plane className="w-4 h-4" /> Plan Trip Here
              </Link>
            </div>

            {/* Weather */}
            <div className={`card p-6 ${isDark ? '' : 'card-light'}`}>
              <h3 className={`font-bold mb-4 ${isDark ? 'text-white' : 'text-dark-900'}`}>🌤️ Weather</h3>
              <div className="space-y-2 text-sm">
                {[['Temperature', weather.temp], ['Humidity', weather.humidity], ['Best Season', dest.best_time?.split('(')[0] || 'Oct – Mar']].map(([k, v]) => (
                  <div key={k} className="flex justify-between">
                    <span className={isDark ? 'text-dark-400' : 'text-dark-500'}>{k}</span>
                    <span className={`font-semibold ${isDark ? 'text-white' : 'text-dark-900'}`}>{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Local food */}
            {dest.local_food && (
              <div className={`card p-6 ${isDark ? '' : 'card-light'}`}>
                <h3 className={`font-bold mb-3 ${isDark ? 'text-white' : 'text-dark-900'}`}>🍽️ Local Food</h3>
                <div className="flex flex-wrap gap-2">
                  {dest.local_food.split(',').map(f => (
                    <span key={f} className={`text-xs px-2.5 py-1 rounded-full border ${isDark ? 'bg-dark-700 border-dark-600 text-dark-300' : 'bg-gray-100 border-gray-200 text-dark-600'}`}>
                      {f.trim()}
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

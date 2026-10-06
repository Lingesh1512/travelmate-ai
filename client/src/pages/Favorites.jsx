import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { Heart, MapPin, Star, IndianRupee, Plane, Trash2 } from 'lucide-react';

export default function Favorites() {
  const { isDark } = useTheme();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/favorites').then(r => setFavorites(r.data.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const remove = async (destId) => {
    try {
      await api.delete(`/favorites/${destId}`);
      setFavorites(f => f.filter(d => d.id !== destId));
      toast.success('Removed from favorites');
    } catch { toast.error('Error'); }
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-dark-950' : 'bg-gray-50'} py-8`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className={`text-3xl font-bold font-display mb-1 ${isDark ? 'text-white' : 'text-dark-900'}`}>My Favorites</h1>
          <p className={isDark ? 'text-dark-400' : 'text-dark-500'}>{favorites.length} saved destination{favorites.length !== 1 ? 's' : ''}</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-64 rounded-2xl" />)}
          </div>
        ) : favorites.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {favorites.map(dest => (
              <div key={dest.id} className={`card overflow-hidden group ${isDark ? '' : 'card-light'}`}>
                <div className="relative h-44 overflow-hidden">
                  <img src={dest.image} alt={dest.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={e => e.target.src = 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600'} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <button onClick={() => remove(dest.id)}
                    className="absolute top-3 right-3 w-9 h-9 rounded-full bg-red-500/80 backdrop-blur-sm flex items-center justify-center text-white hover:bg-red-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/40 backdrop-blur-sm rounded-full px-2 py-1">
                    <Star className="w-3 h-3 text-yellow-400 fill-current" />
                    <span className="text-white text-xs font-semibold">{dest.rating}</span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className={`font-bold mb-1 ${isDark ? 'text-white' : 'text-dark-900'}`}>{dest.name}</h3>
                  <div className={`flex items-center gap-1 text-xs mb-3 ${isDark ? 'text-dark-400' : 'text-dark-500'}`}>
                    <MapPin className="w-3.5 h-3.5" />{[dest.state, dest.country].filter(Boolean).join(', ')}
                  </div>
                  <div className={`flex items-center justify-between text-xs mb-4 ${isDark ? 'text-dark-400' : 'text-dark-500'}`}>
                    <span className="flex items-center gap-1"><IndianRupee className="w-3.5 h-3.5 text-green-400" />From ₹{Number(dest.average_budget).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex gap-2">
                    <Link to={`/destinations/${dest.id}`} className="btn btn-outline btn-sm flex-1 justify-center text-xs">View</Link>
                    <Link to={`/ai-planner?destination=${encodeURIComponent(dest.name)}`} className="btn btn-gradient btn-sm flex-1 justify-center text-xs">
                      <Plane className="w-3 h-3" /> Plan Trip
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Heart className="w-16 h-16 text-dark-600 mx-auto mb-4" />
            <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-dark-900'}`}>No favorites yet</h3>
            <p className={`mb-6 ${isDark ? 'text-dark-400' : 'text-dark-500'}`}>Save destinations you love to find them here</p>
            <Link to="/explore" className="btn btn-gradient">Explore Destinations</Link>
          </div>
        )}
      </div>
    </div>
  );
}

import { Star, Heart, MapPin, Clock, IndianRupee } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';

const categoryColors = {
  Adventure: 'from-orange-500 to-red-500',
  Beach: 'from-cyan-500 to-blue-500',
  Mountains: 'from-green-500 to-emerald-500',
  Nature: 'from-green-400 to-teal-500',
  Historical: 'from-amber-500 to-yellow-500',
  Romantic: 'from-pink-500 to-rose-500',
  Family: 'from-purple-500 to-violet-500',
  City: 'from-slate-500 to-gray-600',
  Luxury: 'from-yellow-400 to-amber-500',
  Wildlife: 'from-lime-500 to-green-600',
};

export default function DestinationCard({ destination, onFavoriteToggle, isFavorited = false }) {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [favd, setFavd] = useState(isFavorited);
  const [loading, setLoading] = useState(false);

  const handleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { toast.error('Please login to save favorites'); return; }
    setLoading(true);
    try {
      if (favd) {
        await api.delete(`/favorites/${destination.id}`);
        setFavd(false);
        toast.success('Removed from favorites');
      } else {
        await api.post('/favorites', { destination_id: destination.id });
        setFavd(true);
        toast.success('Added to favorites! ❤️');
      }
      onFavoriteToggle?.(destination.id, !favd);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error updating favorites');
    } finally {
      setLoading(false);
    }
  };

  const gradientClass = categoryColors[destination.category] || 'from-primary-500 to-purple-500';
  const budget = destination.average_budget;
  const budgetStr = budget >= 100000 ? `₹${(budget / 1000).toFixed(0)}K` : `₹${budget?.toLocaleString('en-IN')}`;

  return (
    <Link to={`/destinations/${destination.id}`} className="destination-card block group">
      {/* Image */}
      <div className="relative h-52 overflow-hidden">
        <img
          src={destination.image || `https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600`}
          alt={destination.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600'; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

        {/* Category badge */}
        <div className={`absolute top-3 left-3 bg-gradient-to-r ${gradientClass} text-white text-xs font-semibold px-2.5 py-1 rounded-full`}>
          {destination.category}
        </div>

        {/* Favorite button */}
        <button
          onClick={handleFavorite}
          disabled={loading}
          className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-sm transition-all duration-200
            ${favd ? 'bg-red-500 text-white scale-110' : 'bg-black/30 text-white hover:bg-black/50'}`}>
          <Heart className={`w-4 h-4 ${favd ? 'fill-current' : ''}`} />
        </button>

        {/* Rating */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/40 backdrop-blur-sm rounded-full px-2.5 py-1">
          <Star className="w-3.5 h-3.5 text-yellow-400 fill-current" />
          <span className="text-white text-xs font-semibold">{destination.rating}</span>
        </div>
      </div>

      {/* Content */}
      <div className={`p-4 ${isDark ? 'bg-dark-800' : 'bg-white'}`}>
        <div className="flex items-start justify-between mb-1">
          <h3 className={`font-bold text-base group-hover:text-primary-400 transition-colors ${isDark ? 'text-white' : 'text-dark-900'}`}>
            {destination.name}
          </h3>
        </div>

        <div className={`flex items-center gap-1 text-xs mb-2 ${isDark ? 'text-dark-400' : 'text-dark-500'}`}>
          <MapPin className="w-3.5 h-3.5" />
          <span>{[destination.state, destination.country].filter(Boolean).join(', ')}</span>
        </div>

        <p className={`text-xs leading-relaxed truncate-2 mb-3 ${isDark ? 'text-dark-400' : 'text-dark-500'}`}>
          {destination.description}
        </p>

        <div className={`flex items-center justify-between pt-3 border-t text-xs ${isDark ? 'border-dark-700 text-dark-400' : 'border-gray-100 text-dark-500'}`}>
          <div className="flex items-center gap-1">
            <IndianRupee className="w-3.5 h-3.5 text-green-400" />
            <span>From <span className="text-green-400 font-semibold">{budgetStr}</span></span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span className="truncate max-w-[120px]">{destination.best_time?.split('(')[0]?.trim()}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

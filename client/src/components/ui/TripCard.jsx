import { Calendar, Users, IndianRupee, MapPin, Edit, Trash2, Copy, Eye, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { useTheme } from '../../context/ThemeContext';

const statusConfig = {
  planning: { label: 'Planning', class: 'status-planning' },
  upcoming: { label: 'Upcoming', class: 'status-upcoming' },
  ongoing: { label: 'Ongoing', class: 'status-ongoing' },
  completed: { label: 'Completed', class: 'status-completed' },
  cancelled: { label: 'Cancelled', class: 'status-cancelled' },
};

export default function TripCard({ trip, onDelete, onDuplicate }) {
  const { isDark } = useTheme();
  const status = statusConfig[trip.status] || statusConfig.planning;

  const formatDate = (d) => {
    try { return format(new Date(d), 'dd MMM'); } catch { return d; }
  };

  return (
    <div className={`card overflow-hidden group ${isDark ? '' : 'card-light'}`}>
      {/* Cover image */}
      <div className="relative h-44 overflow-hidden">
        <img
          src={trip.cover_image || trip.destination_image || 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600'}
          alt={trip.trip_name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600'; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <span className={`absolute top-3 left-3 badge text-xs ${status.class}`}>{status.label}</span>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className={`font-bold text-base mb-1 truncate group-hover:text-primary-400 transition-colors ${isDark ? 'text-white' : 'text-dark-900'}`}>
          {trip.trip_name}
        </h3>

        <div className={`flex items-center gap-1 text-xs mb-3 ${isDark ? 'text-dark-400' : 'text-dark-500'}`}>
          <MapPin className="w-3.5 h-3.5" />
          <span>{trip.destination_name || trip.destination_full_name}</span>
        </div>

        <div className={`grid grid-cols-2 gap-2 text-xs mb-4 ${isDark ? 'text-dark-400' : 'text-dark-500'}`}>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-primary-500" />
            <span>{formatDate(trip.start_date)} – {formatDate(trip.end_date)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-purple-400" />
            <span>{trip.duration || '–'} Days</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-green-400" />
            <span>{trip.travelers} Traveler{trip.travelers !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <IndianRupee className="w-3.5 h-3.5 text-yellow-400" />
            <span>{trip.budget ? `₹${Number(trip.budget).toLocaleString('en-IN')}` : '–'}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Link to={`/trips/${trip.id}`}
            className="btn btn-gradient btn-sm flex-1 justify-center text-xs">
            <Eye className="w-3.5 h-3.5" />
            View
          </Link>
          <button onClick={() => onDuplicate?.(trip.id)}
            className={`p-2 rounded-xl transition-colors ${isDark ? 'text-dark-400 hover:text-white hover:bg-dark-600' : 'text-dark-400 hover:text-dark-900 hover:bg-gray-100'}`}
            title="Duplicate Trip">
            <Copy className="w-4 h-4" />
          </button>
          <button onClick={() => onDelete?.(trip.id)}
            className="p-2 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
            title="Delete Trip">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

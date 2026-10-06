import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Heart, TrendingUp, Plus, ArrowRight, Clock, Users, IndianRupee, Plane } from 'lucide-react';
import api from '../services/api';
import { format } from 'date-fns';

const statusConfig = {
  planning: { label: 'Planning', class: 'status-planning' },
  upcoming: { label: 'Upcoming', class: 'status-upcoming' },
  ongoing: { label: 'Ongoing', class: 'status-ongoing' },
  completed: { label: 'Completed', class: 'status-completed' },
};

export default function Dashboard() {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/trips/dashboard').then(r => setStats(r.data.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: 'Upcoming Trips', value: stats?.upcoming_trips ?? '–', icon: Plane, color: 'from-blue-500 to-cyan-500', bg: 'bg-blue-500/10' },
    { label: 'Completed Trips', value: stats?.completed_trips ?? '–', icon: TrendingUp, color: 'from-green-500 to-emerald-500', bg: 'bg-green-500/10' },
    { label: 'Saved Destinations', value: stats?.saved_destinations ?? '–', icon: Heart, color: 'from-red-500 to-pink-500', bg: 'bg-red-500/10' },
    { label: 'Total Budget', value: stats?.total_budget ? `₹${Number(stats.total_budget).toLocaleString('en-IN')}` : '₹0', icon: IndianRupee, color: 'from-yellow-500 to-orange-500', bg: 'bg-yellow-500/10' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className={`text-3xl font-bold font-display mb-1 ${isDark ? 'text-white' : 'text-dark-900'}`}>
            Welcome back, <span className="text-gradient">{user?.name?.split(' ')[0]}!</span> 👋
          </h1>
          <p className={isDark ? 'text-dark-400' : 'text-dark-500'}>Here's what's happening with your travels</p>
        </div>
        <Link to="/ai-planner" className="btn btn-gradient">
          <Plus className="w-4 h-4" /> Plan New Trip
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className={`card p-5 ${isDark ? '' : 'card-light'}`}>
            <div className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center mb-3`}>
              <div className={`w-6 h-6 bg-gradient-to-br ${color} rounded-lg flex items-center justify-center`}>
                <Icon className="w-3.5 h-3.5 text-white" />
              </div>
            </div>
            {loading ? <div className="skeleton h-8 w-20 rounded mb-1" /> : (
              <div className={`text-2xl font-bold font-display mb-0.5 ${isDark ? 'text-white' : 'text-dark-900'}`}>{value}</div>
            )}
            <div className={`text-xs ${isDark ? 'text-dark-400' : 'text-dark-500'}`}>{label}</div>
          </div>
        ))}
      </div>

      {/* Recent trips */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-dark-900'}`}>Recent Trips</h2>
            <Link to="/my-trips" className="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="space-y-3">
            {loading ? [...Array(3)].map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />) :
              stats?.recent_trips?.length ? stats.recent_trips.map(trip => (
                <Link key={trip.id} to={`/trips/${trip.id}`}
                  className={`flex items-center gap-4 p-4 rounded-2xl border transition-all hover:border-primary-500/50 ${isDark ? 'bg-dark-800 border-dark-700 hover:bg-dark-750' : 'bg-white border-gray-200'}`}>
                  <img
                    src={trip.destination_image || 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=200'}
                    alt={trip.trip_name} className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                    onError={e => e.target.src = 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=200'}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className={`font-semibold truncate ${isDark ? 'text-white' : 'text-dark-900'}`}>{trip.trip_name}</h3>
                      <span className={`badge text-xs flex-shrink-0 ${statusConfig[trip.status]?.class || 'status-planning'}`}>
                        {statusConfig[trip.status]?.label}
                      </span>
                    </div>
                    <div className={`flex items-center gap-3 text-xs mt-1 ${isDark ? 'text-dark-400' : 'text-dark-500'}`}>
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{trip.start_date ? format(new Date(trip.start_date), 'dd MMM yyyy') : '–'}</span>
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" />{trip.travelers} pax</span>
                      {trip.budget && <span className="flex items-center gap-1"><IndianRupee className="w-3 h-3" />₹{Number(trip.budget).toLocaleString('en-IN')}</span>}
                    </div>
                  </div>
                </Link>
              )) : (
                <div className={`text-center py-12 rounded-2xl border ${isDark ? 'border-dark-700 bg-dark-800' : 'border-gray-200 bg-white'}`}>
                  <Plane className="w-10 h-10 text-dark-500 mx-auto mb-3" />
                  <p className={`font-medium mb-1 ${isDark ? 'text-dark-300' : 'text-dark-600'}`}>No trips yet</p>
                  <p className={`text-sm mb-4 ${isDark ? 'text-dark-500' : 'text-dark-400'}`}>Start planning your first adventure!</p>
                  <Link to="/ai-planner" className="btn btn-gradient btn-sm">Plan a Trip</Link>
                </div>
              )}
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-dark-900'}`}>Quick Actions</h2>
          <div className="space-y-3">
            {[
              { to: '/ai-planner', label: 'Generate AI Trip', icon: '✨', desc: 'Let AI plan your perfect trip', color: 'from-purple-500 to-pink-500' },
              { to: '/explore', label: 'Explore Destinations', icon: '🌍', desc: 'Browse 500+ destinations', color: 'from-blue-500 to-cyan-500' },
              { to: '/map', label: 'Open Map', icon: '🗺️', desc: 'View destinations on map', color: 'from-green-500 to-emerald-500' },
              { to: '/favorites', label: 'My Favorites', icon: '❤️', desc: `${stats?.saved_destinations || 0} saved places`, color: 'from-red-500 to-pink-500' },
            ].map(({ to, label, icon, desc, color }) => (
              <Link key={to} to={to}
                className={`flex items-center gap-3 p-4 rounded-2xl border transition-all hover:border-primary-500/50 hover:-translate-y-0.5 ${isDark ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-200'}`}>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-xl flex-shrink-0`}>
                  {icon}
                </div>
                <div>
                  <p className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-dark-900'}`}>{label}</p>
                  <p className={`text-xs ${isDark ? 'text-dark-400' : 'text-dark-500'}`}>{desc}</p>
                </div>
                <ArrowRight className={`w-4 h-4 ml-auto flex-shrink-0 ${isDark ? 'text-dark-500' : 'text-dark-300'}`} />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

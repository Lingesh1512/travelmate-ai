import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import TripCard from '../components/ui/TripCard';
import { Plus, Plane, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';

const STATUSES = ['', 'planning', 'upcoming', 'ongoing', 'completed'];

export default function MyTrips() {
  const { isDark } = useTheme();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchTrips = async () => {
    setLoading(true);
    try {
      const params = statusFilter ? { status: statusFilter } : {};
      const res = await api.get('/trips', { params });
      setTrips(res.data.data || []);
    } catch { toast.error('Error loading trips'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchTrips(); }, [statusFilter]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this trip?')) return;
    try {
      await api.delete(`/trips/${id}`);
      toast.success('Trip deleted');
      fetchTrips();
    } catch { toast.error('Error deleting trip'); }
  };

  const handleDuplicate = async (id) => {
    try {
      const res = await api.post(`/trips/${id}/duplicate`);
      toast.success('Trip duplicated!');
      fetchTrips();
    } catch { toast.error('Error duplicating trip'); }
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-dark-950' : 'bg-gray-50'} py-8`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className={`text-3xl font-bold font-display mb-1 ${isDark ? 'text-white' : 'text-dark-900'}`}>My Trips</h1>
            <p className={isDark ? 'text-dark-400' : 'text-dark-500'}>{trips.length} trip{trips.length !== 1 ? 's' : ''} found</p>
          </div>
          <Link to="/ai-planner" className="btn btn-gradient"><Plus className="w-4 h-4" />Plan New Trip</Link>
        </div>

        {/* Status filter */}
        <div className="flex gap-2 flex-wrap mb-6">
          {STATUSES.map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-all
                ${statusFilter === s ? 'bg-primary-500 text-white' : isDark ? 'bg-dark-800 text-dark-300 hover:bg-dark-700' : 'bg-white text-dark-600 border border-gray-200 hover:bg-gray-50'}`}>
              {s || 'All Trips'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-72 rounded-2xl" />)}
          </div>
        ) : trips.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {trips.map(trip => <TripCard key={trip.id} trip={trip} onDelete={handleDelete} onDuplicate={handleDuplicate} />)}
          </div>
        ) : (
          <div className="text-center py-20">
            <Plane className="w-16 h-16 text-dark-600 mx-auto mb-4" />
            <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-dark-900'}`}>
              {statusFilter ? `No ${statusFilter} trips` : 'No trips yet'}
            </h3>
            <p className={`mb-6 ${isDark ? 'text-dark-400' : 'text-dark-500'}`}>Start planning your first adventure!</p>
            <Link to="/ai-planner" className="btn btn-gradient">Plan a Trip</Link>
          </div>
        )}
      </div>
    </div>
  );
}

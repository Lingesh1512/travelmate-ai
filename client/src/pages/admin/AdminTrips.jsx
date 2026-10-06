import { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import api from '../../services/api';
import { Search, Calendar, Users, IndianRupee } from 'lucide-react';
import { format } from 'date-fns';

const STATUS_LIST = ['', 'planning', 'upcoming', 'ongoing', 'completed', 'cancelled'];

export default function AdminTrips() {
  const { isDark } = useTheme();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    if (status) params.status = status;
    api.get('/admin/trips', { params }).then(r => setTrips(r.data.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, [search, status]);

  return (
    <div className="space-y-5">
      <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-dark-900'}`}>All Trips</h1>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className={`flex-1 flex items-center gap-2 px-4 py-3 rounded-xl border ${isDark ? 'bg-dark-800 border-dark-600' : 'bg-white border-gray-200'}`}>
          <Search className="w-4 h-4 text-dark-400" />
          <input className={`flex-1 bg-transparent text-sm outline-none ${isDark ? 'text-white placeholder-dark-400' : 'text-dark-900 placeholder-gray-400'}`}
            placeholder="Search trips..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className={`input w-40 text-sm ${isDark ? '' : 'input-light'}`} value={status} onChange={e => setStatus(e.target.value)}>
          {STATUS_LIST.map(s => <option key={s} value={s}>{s || 'All Status'}</option>)}
        </select>
      </div>

      {loading ? <div className="skeleton h-64 rounded-2xl" /> : (
        <div className={`card overflow-hidden ${isDark ? '' : 'card-light'}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className={`border-b ${isDark ? 'border-dark-700 bg-dark-800/50' : 'border-gray-200 bg-gray-50'}`}>
                <tr>{['Trip', 'User', 'Dates', 'Travelers', 'Budget', 'Status'].map(h => (
                  <th key={h} className={`px-4 py-3 text-left font-semibold text-xs uppercase ${isDark ? 'text-dark-400' : 'text-dark-500'}`}>{h}</th>
                ))}</tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-dark-700' : 'divide-gray-100'}`}>
                {trips.map(t => (
                  <tr key={t.id} className={`transition-colors ${isDark ? 'hover:bg-dark-700/50' : 'hover:bg-gray-50'}`}>
                    <td className="px-4 py-3">
                      <p className={`font-semibold ${isDark ? 'text-white' : 'text-dark-900'}`}>{t.trip_name}</p>
                      <p className={`text-xs ${isDark ? 'text-dark-400' : 'text-dark-500'}`}>{t.destination_name}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className={`text-sm ${isDark ? 'text-dark-300' : 'text-dark-600'}`}>{t.user_name}</p>
                      <p className={`text-xs ${isDark ? 'text-dark-400' : 'text-dark-500'}`}>{t.user_email}</p>
                    </td>
                    <td className={`px-4 py-3 text-xs ${isDark ? 'text-dark-300' : 'text-dark-600'}`}>
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />
                        {format(new Date(t.start_date), 'dd MMM')} – {format(new Date(t.end_date), 'dd MMM yyyy')}
                      </span>
                    </td>
                    <td className={`px-4 py-3 text-xs ${isDark ? 'text-dark-300' : 'text-dark-600'}`}>
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" />{t.travelers}</span>
                    </td>
                    <td className={`px-4 py-3 text-xs ${isDark ? 'text-dark-300' : 'text-dark-600'}`}>
                      {t.budget ? <span className="flex items-center gap-0.5"><IndianRupee className="w-3 h-3" />{Number(t.budget).toLocaleString('en-IN')}</span> : '–'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge text-xs status-${t.status}`}>{t.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!trips.length && <p className="text-center py-10 text-dark-400">No trips found</p>}
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import api from '../../services/api';
import { Users, Plane, MapPin, TrendingUp, IndianRupee, BarChart2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#3b82f6','#22c55e','#f97316','#a855f7','#ec4899','#06b6d4'];

export default function AdminDashboard() {
  const { isDark } = useTheme();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard').then(r => setData(r.data.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>;

  const statCards = [
    { label: 'Total Users', value: data?.stats?.users || 0, icon: Users, color: 'from-blue-500 to-cyan-500' },
    { label: 'Total Trips', value: data?.stats?.trips || 0, icon: Plane, color: 'from-green-500 to-emerald-500' },
    { label: 'Destinations', value: data?.stats?.destinations || 0, icon: MapPin, color: 'from-orange-500 to-red-500' },
    { label: 'Total Budget', value: `₹${Number(data?.stats?.total_budget || 0).toLocaleString('en-IN')}`, icon: IndianRupee, color: 'from-purple-500 to-pink-500' },
  ];

  return (
    <div className="space-y-6">
      <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-dark-900'}`}>Admin Dashboard</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className={`card p-5 ${isDark ? '' : 'card-light'}`}>
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-3`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div className={`text-2xl font-bold font-display mb-0.5 ${isDark ? 'text-white' : 'text-dark-900'}`}>{value}</div>
            <div className={`text-xs ${isDark ? 'text-dark-400' : 'text-dark-500'}`}>{label}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly trips */}
        {data?.monthly_trips?.length > 0 && (
          <div className={`card p-5 ${isDark ? '' : 'card-light'}`}>
            <h3 className={`font-bold mb-4 ${isDark ? 'text-white' : 'text-dark-900'}`}>Monthly Trips</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.monthly_trips}>
                <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9', fontSize: '12px' }} />
                <Bar dataKey="count" fill="#3b82f6" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Popular destinations */}
        {data?.popular_destinations?.length > 0 && (
          <div className={`card p-5 ${isDark ? '' : 'card-light'}`}>
            <h3 className={`font-bold mb-4 ${isDark ? 'text-white' : 'text-dark-900'}`}>Popular Destinations</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.popular_destinations} layout="vertical">
                <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis dataKey="name" type="category" tick={{ fill: '#94a3b8', fontSize: 11 }} width={70} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9', fontSize: '12px' }} />
                <Bar dataKey="trip_count" fill="#22c55e" radius={[0,4,4,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Recent users & trips */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`card p-5 ${isDark ? '' : 'card-light'}`}>
          <h3 className={`font-bold mb-4 ${isDark ? 'text-white' : 'text-dark-900'}`}>Recent Users</h3>
          <div className="space-y-3">
            {data?.recent_users?.map(u => (
              <div key={u.id} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {u.name?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold truncate ${isDark ? 'text-white' : 'text-dark-900'}`}>{u.name}</p>
                  <p className={`text-xs truncate ${isDark ? 'text-dark-400' : 'text-dark-500'}`}>{u.email}</p>
                </div>
                <span className={`badge text-xs ${u.role === 'admin' ? 'badge-primary' : 'badge-success'}`}>{u.role}</span>
              </div>
            ))}
          </div>
        </div>
        <div className={`card p-5 ${isDark ? '' : 'card-light'}`}>
          <h3 className={`font-bold mb-4 ${isDark ? 'text-white' : 'text-dark-900'}`}>Recent Trips</h3>
          <div className="space-y-3">
            {data?.recent_trips?.map(t => (
              <div key={t.id} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary-500/20 flex items-center justify-center flex-shrink-0">
                  <Plane className="w-5 h-5 text-primary-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold truncate ${isDark ? 'text-white' : 'text-dark-900'}`}>{t.trip_name}</p>
                  <p className={`text-xs ${isDark ? 'text-dark-400' : 'text-dark-500'}`}>{t.user_name} · {t.destination_name}</p>
                </div>
                <span className={`badge text-xs status-${t.status}`}>{t.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

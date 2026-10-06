import { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Search, Trash2, Shield, UserCheck, UserX } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminUsers() {
  const { isDark } = useTheme();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = search ? { search } : {};
      const res = await api.get('/admin/users', { params });
      setUsers(res.data.data || []);
    } catch { toast.error('Error loading users'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, [search]);

  const toggleRole = async (user) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    try {
      await api.put(`/admin/users/${user.id}`, { role: newRole });
      toast.success(`Role changed to ${newRole}`);
      fetchUsers();
    } catch { toast.error('Error changing role'); }
  };

  const toggleActive = async (user) => {
    try {
      await api.put(`/admin/users/${user.id}`, { is_active: !user.is_active });
      toast.success(user.is_active ? 'User deactivated' : 'User activated');
      fetchUsers();
    } catch { toast.error('Error'); }
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Delete this user and all their data?')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      toast.success('User deleted');
      fetchUsers();
    } catch { toast.error('Error deleting user'); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-dark-900'}`}>Manage Users</h1>
        <span className={`text-sm ${isDark ? 'text-dark-400' : 'text-dark-500'}`}>{users.length} users</span>
      </div>

      {/* Search */}
      <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border ${isDark ? 'bg-dark-800 border-dark-600' : 'bg-white border-gray-200'}`}>
        <Search className="w-4 h-4 text-dark-400" />
        <input className={`flex-1 bg-transparent text-sm outline-none ${isDark ? 'text-white placeholder-dark-400' : 'text-dark-900 placeholder-gray-400'}`}
          placeholder="Search users by name or email..."
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? <div className="skeleton h-64 rounded-2xl" /> : (
        <div className={`card overflow-hidden ${isDark ? '' : 'card-light'}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className={`border-b ${isDark ? 'border-dark-700 bg-dark-800/50' : 'border-gray-200 bg-gray-50'}`}>
                <tr>
                  {['User', 'Role', 'Trips', 'Status', 'Joined', 'Actions'].map(h => (
                    <th key={h} className={`px-5 py-4 text-left font-semibold text-xs uppercase tracking-wide ${isDark ? 'text-dark-400' : 'text-dark-500'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-dark-700' : 'divide-gray-100'}`}>
                {users.map(u => (
                  <tr key={u.id} className={`transition-colors ${isDark ? 'hover:bg-dark-700/50' : 'hover:bg-gray-50'}`}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                          {u.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className={`font-semibold ${isDark ? 'text-white' : 'text-dark-900'}`}>{u.name}</p>
                          <p className={`text-xs ${isDark ? 'text-dark-400' : 'text-dark-500'}`}>{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`badge text-xs ${u.role === 'admin' ? 'badge-primary' : 'badge-success'}`}>{u.role}</span>
                    </td>
                    <td className={`px-5 py-4 ${isDark ? 'text-dark-300' : 'text-dark-600'}`}>{u.trip_count || 0}</td>
                    <td className="px-5 py-4">
                      <span className={`badge text-xs ${u.is_active ? 'badge-success' : 'badge-danger'}`}>{u.is_active ? 'Active' : 'Inactive'}</span>
                    </td>
                    <td className={`px-5 py-4 text-xs ${isDark ? 'text-dark-400' : 'text-dark-500'}`}>
                      {format(new Date(u.created_at), 'dd MMM yyyy')}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => toggleRole(u)} title={`Change to ${u.role === 'admin' ? 'user' : 'admin'}`}
                          className="p-1.5 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 rounded-lg transition-colors">
                          <Shield className="w-4 h-4" />
                        </button>
                        <button onClick={() => toggleActive(u)} title={u.is_active ? 'Deactivate' : 'Activate'}
                          className={`p-1.5 rounded-lg transition-colors ${u.is_active ? 'text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10' : 'text-green-400 hover:text-green-300 hover:bg-green-500/10'}`}>
                          {u.is_active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        </button>
                        <button onClick={() => deleteUser(u.id)} className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!users.length && <div className="text-center py-12 text-dark-400">No users found</div>}
          </div>
        </div>
      )}
    </div>
  );
}

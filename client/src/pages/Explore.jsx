import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X, ChevronDown, Globe2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import DestinationCard from '../components/ui/DestinationCard';

const CATEGORIES = ['Adventure','Beach','Mountains','Nature','Historical','Romantic','Family','Wildlife','City','Luxury'];
const COUNTRIES = ['India','Indonesia','UAE','Singapore','Japan','France','United Kingdom','Maldives','Switzerland'];
const SORT_OPTIONS = [
  { value: '', label: 'Featured' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'budget_low', label: 'Budget: Low to High' },
  { value: 'budget_high', label: 'Budget: High to Low' },
  { value: 'popular', label: 'Most Popular' },
];

export default function Explore() {
  const { isDark } = useTheme();
  const [searchParams, setSearchParams] = useSearchParams();
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    country: searchParams.get('country') || '',
    minBudget: '',
    maxBudget: '',
    minRating: '',
    sort: '',
  });

  const fetchDestinations = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 12, ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)) };
      const res = await api.get('/destinations', { params });
      setDestinations(res.data.data || []);
      setPagination(res.data.pagination || {});
    } catch { setDestinations([]); }
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { fetchDestinations(); }, [fetchDestinations]);

  const setFilter = (k, v) => setFilters(f => ({ ...f, [k]: v }));
  const clearFilters = () => setFilters({ search: '', category: '', country: '', minBudget: '', maxBudget: '', minRating: '', sort: '' });

  const activeCount = Object.values(filters).filter(v => v).length;

  return (
    <div className={`min-h-screen ${isDark ? 'bg-dark-950' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className={`py-10 px-4 text-center ${isDark ? 'bg-dark-900' : 'bg-white'} border-b ${isDark ? 'border-dark-700' : 'border-gray-200'}`}>
        <p className={`text-sm font-semibold uppercase tracking-widest mb-2 ${isDark ? 'text-primary-400' : 'text-primary-600'}`}>✦ Destinations</p>
        <h1 className="section-title text-4xl mb-2">Explore the World</h1>
        <p className="section-subtitle">Discover breathtaking destinations across India and beyond</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search & Filter bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className={`flex-1 flex items-center gap-2 rounded-xl px-4 py-3 border ${isDark ? 'bg-dark-800 border-dark-600' : 'bg-white border-gray-200'}`}>
            <Search className="w-4 h-4 text-dark-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search destinations..."
              className={`flex-1 bg-transparent text-sm outline-none ${isDark ? 'text-white placeholder-dark-400' : 'text-dark-900 placeholder-gray-400'}`}
              value={filters.search}
              onChange={e => setFilter('search', e.target.value)}
            />
            {filters.search && <button onClick={() => setFilter('search', '')}><X className="w-4 h-4 text-dark-400" /></button>}
          </div>

          <select
            className={`px-4 py-3 rounded-xl border text-sm outline-none ${isDark ? 'bg-dark-800 border-dark-600 text-white' : 'bg-white border-gray-200 text-dark-900'}`}
            value={filters.sort} onChange={e => setFilter('sort', e.target.value)}>
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>

          <button
            onClick={() => setFiltersOpen(p => !p)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-colors
              ${filtersOpen || activeCount > 0
                ? 'bg-primary-500/20 border-primary-500/50 text-primary-400'
                : isDark ? 'bg-dark-800 border-dark-600 text-dark-300 hover:text-white' : 'bg-white border-gray-200 text-dark-600'}`}>
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {activeCount > 0 && <span className="w-5 h-5 rounded-full bg-primary-500 text-white text-xs flex items-center justify-center">{activeCount}</span>}
          </button>

          {activeCount > 0 && (
            <button onClick={clearFilters} className="flex items-center gap-1.5 px-4 py-3 rounded-xl text-sm text-red-400 hover:text-red-300 border border-red-500/30 hover:bg-red-500/10 transition-colors">
              <X className="w-4 h-4" /> Clear
            </button>
          )}
        </div>

        {/* Expanded filters */}
        {filtersOpen && (
          <div className={`card p-5 mb-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 ${isDark ? '' : 'card-light'}`}>
            <div>
              <label className="label text-xs">Category</label>
              <select className="input text-sm" value={filters.category} onChange={e => setFilter('category', e.target.value)}>
                <option value="">All</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label text-xs">Country</label>
              <select className="input text-sm" value={filters.country} onChange={e => setFilter('country', e.target.value)}>
                <option value="">All</option>
                {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label text-xs">Min Budget (₹)</label>
              <input type="number" className="input text-sm" placeholder="0" value={filters.minBudget} onChange={e => setFilter('minBudget', e.target.value)} />
            </div>
            <div>
              <label className="label text-xs">Max Budget (₹)</label>
              <input type="number" className="input text-sm" placeholder="500000" value={filters.maxBudget} onChange={e => setFilter('maxBudget', e.target.value)} />
            </div>
            <div>
              <label className="label text-xs">Min Rating</label>
              <select className="input text-sm" value={filters.minRating} onChange={e => setFilter('minRating', e.target.value)}>
                <option value="">Any</option>
                {[3,3.5,4,4.5].map(r => <option key={r} value={r}>{r}★+</option>)}
              </select>
            </div>
          </div>
        )}

        {/* Category pills */}
        <div className="flex gap-2 flex-wrap mb-6">
          <button
            onClick={() => setFilter('category', '')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${!filters.category ? 'bg-primary-500 text-white' : isDark ? 'bg-dark-800 text-dark-300 hover:bg-dark-700' : 'bg-white text-dark-600 hover:bg-gray-100 border border-gray-200'}`}>
            All
          </button>
          {CATEGORIES.map(cat => (
            <button key={cat}
              onClick={() => setFilter('category', filters.category === cat ? '' : cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filters.category === cat ? 'bg-primary-500 text-white' : isDark ? 'bg-dark-800 text-dark-300 hover:bg-dark-700' : 'bg-white text-dark-600 hover:bg-gray-100 border border-gray-200'}`}>
              {cat}
            </button>
          ))}
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between mb-5">
          <p className={`text-sm ${isDark ? 'text-dark-400' : 'text-dark-500'}`}>
            {loading ? 'Loading...' : `${pagination.total || destinations.length} destinations found`}
          </p>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden">
                <div className="skeleton h-52" />
                <div className={`p-4 ${isDark ? 'bg-dark-800' : 'bg-white'}`}>
                  <div className="skeleton h-4 w-2/3 mb-2 rounded" /><div className="skeleton h-3 w-1/2 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : destinations.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {destinations.map(d => <DestinationCard key={d.id} destination={d} />)}
          </div>
        ) : (
          <div className="text-center py-20">
            <Globe2 className="w-16 h-16 text-dark-600 mx-auto mb-4" />
            <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-dark-900'}`}>No destinations found</h3>
            <p className={isDark ? 'text-dark-400' : 'text-dark-500'}>Try different search terms or clear filters</p>
            <button onClick={clearFilters} className="btn btn-outline mt-4">Clear All Filters</button>
          </div>
        )}
      </div>
    </div>
  );
}

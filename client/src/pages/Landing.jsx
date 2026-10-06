import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search, MapPin, Calendar, Users, ArrowRight, Star, Compass,
  Zap, Shield, Globe, ChevronRight, Play, Sparkles
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import DestinationCard from '../components/ui/DestinationCard';

const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=85',
  'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1920&q=85',
  'https://images.unsplash.com/photo-1482192505345-5852718df90b?w=1920&q=85',
  'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1920&q=85',
];

const features = [
  {
    icon: Zap, title: 'AI-Powered Planning',
    desc: 'Our smart algorithm generates personalized itineraries based on your preferences, budget, and travel style.',
    color: 'from-yellow-400 to-orange-500',
  },
  {
    icon: MapPin, title: 'Interactive Maps',
    desc: 'Explore destinations visually with our Leaflet-powered interactive maps showing attractions and routes.',
    color: 'from-blue-400 to-cyan-500',
  },
  {
    icon: Shield, title: 'Budget Tracking',
    desc: 'Keep your travel spending in check with real-time expense tracking and visual budget breakdowns.',
    color: 'from-green-400 to-emerald-500',
  },
  {
    icon: Globe, title: 'Smart Packing',
    desc: 'Never forget essentials again. Our packing list adapts to your destination, weather, and activities.',
    color: 'from-purple-400 to-pink-500',
  },
];

const stats = [
  { label: 'Destinations', value: '500+' },
  { label: 'Happy Travelers', value: '50K+' },
  { label: 'Trips Planned', value: '100K+' },
  { label: 'Countries', value: '60+' },
];

export default function Landing() {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [heroIdx, setHeroIdx] = useState(0);
  const [featuredDests, setFeaturedDests] = useState([]);
  const [searchForm, setSearchForm] = useState({ destination: '', dates: '', travelers: '2' });
  const [loadingDests, setLoadingDests] = useState(true);

  // Hero image rotation
  useEffect(() => {
    const t = setInterval(() => setHeroIdx(i => (i + 1) % HERO_IMAGES.length), 5000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    api.get('/destinations/featured').then(res => {
      setFeaturedDests(res.data.data || []);
    }).catch(() => {}).finally(() => setLoadingDests(false));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchForm.destination) params.set('search', searchForm.destination);
    navigate(`/explore?${params.toString()}`);
  };

  return (
    <div className={isDark ? '' : 'bg-gray-50'}>
      {/* ─── HERO ─────────────────────────────────────────── */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden -mt-16">
        {/* Background images with crossfade */}
        {HERO_IMAGES.map((img, i) => (
          <div key={img} className={`absolute inset-0 transition-opacity duration-1000 ${i === heroIdx ? 'opacity-100' : 'opacity-0'}`}>
            <img src={img} alt="" className="w-full h-full object-cover" />
          </div>
        ))}
        {/* Overlays */}
        <div className="absolute inset-0 bg-black/55" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-dark-950/80" />

        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div key={i}
              className="absolute w-2 h-2 rounded-full bg-white/20 float-slow"
              style={{
                left: `${15 + i * 15}%`,
                top: `${20 + (i % 3) * 25}%`,
                animationDelay: `${i * 0.8}s`,
                animationDuration: `${4 + i}s`
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6 animate-fade-in">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span className="text-white/90 text-sm font-medium">AI-Powered Travel Planning</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold font-display text-white leading-tight mb-6 animate-slide-up">
              Your Next<br />
              <span className="text-gradient">Adventure</span><br />
              Starts Here
            </h1>

            <p className="text-lg text-white/80 mb-8 max-w-xl leading-relaxed animate-slide-up" style={{ animationDelay: '0.1s' }}>
              Discover destinations, build intelligent itineraries and plan your entire journey in one place.
            </p>

            <div className="flex flex-wrap gap-4 mb-12 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <Link to="/ai-planner" className="btn btn-gradient btn-lg group">
                <Zap className="w-5 h-5" />
                Start Planning
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/explore" className="btn bg-white/10 backdrop-blur-sm border border-white/30 text-white hover:bg-white/20 btn-lg">
                <Compass className="w-5 h-5" />
                Explore Destinations
              </Link>
            </div>
          </div>

          {/* Floating Search Bar */}
          <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="glass-strong rounded-2xl p-4 max-w-3xl">
              <p className="text-white/70 text-sm font-medium mb-3">Where do you want to go?</p>
              <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 flex items-center gap-2 bg-white/10 rounded-xl px-4 py-3 border border-white/20 focus-within:border-primary-400 transition-colors">
                  <MapPin className="w-4 h-4 text-white/60 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Destination (e.g. Ooty, Bali, Paris)"
                    className="bg-transparent text-white placeholder-white/40 text-sm flex-1 outline-none"
                    value={searchForm.destination}
                    onChange={e => setSearchForm(f => ({ ...f, destination: e.target.value }))}
                  />
                </div>
                <div className="flex items-center gap-2 bg-white/10 rounded-xl px-4 py-3 border border-white/20 min-w-[130px]">
                  <Users className="w-4 h-4 text-white/60 flex-shrink-0" />
                  <select
                    className="bg-transparent text-white text-sm outline-none cursor-pointer flex-1"
                    value={searchForm.travelers}
                    onChange={e => setSearchForm(f => ({ ...f, travelers: e.target.value }))}>
                    {[1,2,3,4,5,6,'6+'].map(n => <option key={n} value={n} className="bg-dark-800">{n} {n===1?'Person':'People'}</option>)}
                  </select>
                </div>
                <button type="submit" className="btn btn-orange px-8">
                  <Search className="w-4 h-4" />
                  Search
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Hero indicator dots */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {HERO_IMAGES.map((_, i) => (
            <button key={i} onClick={() => setHeroIdx(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === heroIdx ? 'w-6 bg-white' : 'w-1.5 bg-white/40'}`}
            />
          ))}
        </div>
      </section>

      {/* ─── STATS ─────────────────────────────────────────── */}
      <section className={`py-10 border-b ${isDark ? 'bg-dark-900 border-dark-700' : 'bg-white border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map(({ label, value }) => (
              <div key={label} className="text-center">
                <div className="text-3xl lg:text-4xl font-bold font-display text-gradient mb-1">{value}</div>
                <div className={`text-sm ${isDark ? 'text-dark-400' : 'text-dark-500'}`}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURED DESTINATIONS ─────────────────────────── */}
      <section className={`py-16 ${isDark ? 'bg-dark-950' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className={`text-sm font-semibold uppercase tracking-widest mb-2 ${isDark ? 'text-primary-400' : 'text-primary-600'}`}>
                ✦ Featured
              </p>
              <h2 className="section-title">Popular Destinations</h2>
              <p className="section-subtitle">Handpicked destinations for your next unforgettable journey</p>
            </div>
            <Link to="/explore" className={`hidden sm:flex items-center gap-1.5 text-sm font-medium hover:text-primary-400 transition-colors ${isDark ? 'text-dark-300' : 'text-dark-600'}`}>
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {loadingDests ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="rounded-2xl overflow-hidden">
                  <div className="skeleton h-52" />
                  <div className={`p-4 ${isDark ? 'bg-dark-800' : 'bg-white'}`}>
                    <div className="skeleton h-4 w-2/3 mb-2 rounded" />
                    <div className="skeleton h-3 w-1/2 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {featuredDests.slice(0, 8).map(dest => (
                <DestinationCard key={dest.id} destination={dest} />
              ))}
            </div>
          )}

          <div className="text-center mt-8">
            <Link to="/explore" className="btn btn-outline">
              Explore All Destinations
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── FEATURES ──────────────────────────────────────── */}
      <section className={`py-16 ${isDark ? 'bg-dark-900' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className={`text-sm font-semibold uppercase tracking-widest mb-2 ${isDark ? 'text-primary-400' : 'text-primary-600'}`}>
              ✦ Why TravelMate AI
            </p>
            <h2 className="section-title">Everything You Need to Travel Smart</h2>
            <p className="section-subtitle">From planning to packing — we've got you covered</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className={`card p-6 group ${isDark ? '' : 'card-light'}`}>
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className={`font-bold text-base mb-2 ${isDark ? 'text-white' : 'text-dark-900'}`}>{title}</h3>
                <p className={`text-sm leading-relaxed ${isDark ? 'text-dark-400' : 'text-dark-500'}`}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA BANNER ─────────────────────────────────────── */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200"
              alt="Travel"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-dark-950/90 via-dark-950/70 to-transparent" />
            <div className="relative z-10 p-10 lg:p-16 max-w-xl">
              <h2 className="text-3xl lg:text-4xl font-bold font-display text-white mb-4 leading-tight">
                Ready to Plan Your Dream Trip?
              </h2>
              <p className="text-white/70 mb-8 text-lg">
                Let our AI create a personalized itinerary just for you — in seconds.
              </p>
              <Link to="/ai-planner" className="btn btn-gradient btn-lg group">
                <Sparkles className="w-5 h-5" />
                Generate My Itinerary
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

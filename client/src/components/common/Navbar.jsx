import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Globe, Menu, X, Sun, Moon, Bell, User, ChevronDown,
  LayoutDashboard, Settings, LogOut, Heart, Map, Plane, Compass
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const navLinks = [
  { to: '/', label: 'Home', end: true },
  { to: '/explore', label: 'Explore' },
  { to: '/ai-planner', label: 'Plan Trip' },
  { to: '/my-trips', label: 'My Trips' },
  { to: '/favorites', label: 'Favorites' },
  { to: '/map', label: 'Map' },
  { to: '/about', label: 'About' },
];

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { isDark, toggle } = useTheme();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    setProfileOpen(false);
    await logout();
    navigate('/');
  };

  const navLinkClass = ({ isActive }) =>
    `text-sm font-medium transition-all duration-200 px-1 py-0.5 relative group
    ${isActive
      ? 'text-primary-400'
      : isDark ? 'text-dark-300 hover:text-white' : 'text-dark-600 hover:text-dark-900'}`;

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300
        ${scrolled
          ? isDark
            ? 'bg-dark-950/90 backdrop-blur-xl border-b border-dark-700/50 shadow-2xl'
            : 'bg-white/90 backdrop-blur-xl border-b border-gray-200/50 shadow-lg'
          : 'bg-transparent'
        }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg font-display hidden sm:block">
                <span className="text-gradient">TravelMate</span>
                <span className={isDark ? 'text-white' : 'text-dark-900'}> AI</span>
              </span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden lg:flex items-center gap-6">
              {navLinks.map(({ to, label, end }) => (
                <NavLink key={to} to={to} end={end} className={navLinkClass}>
                  {label}
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-center rounded-full" />
                </NavLink>
              ))}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2">
              {/* Theme toggle */}
              <button
                onClick={toggle}
                id="theme-toggle"
                className={`p-2 rounded-xl transition-all duration-200
                  ${isDark ? 'text-dark-400 hover:text-white hover:bg-dark-700' : 'text-dark-500 hover:text-dark-900 hover:bg-gray-100'}`}
                title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {user ? (
                <>
                  {/* Notifications */}
                  <button className={`p-2 rounded-xl transition-all duration-200 hidden sm:block
                    ${isDark ? 'text-dark-400 hover:text-white hover:bg-dark-700' : 'text-dark-500 hover:text-dark-900 hover:bg-gray-100'}`}>
                    <Bell className="w-5 h-5" />
                  </button>

                  {/* Profile dropdown */}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      id="profile-menu-btn"
                      onClick={() => setProfileOpen(p => !p)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200
                        ${isDark ? 'hover:bg-dark-700' : 'hover:bg-gray-100'}`}>
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                        {user.profile_image
                          ? <img src={user.profile_image} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                          : user.name?.[0]?.toUpperCase()}
                      </div>
                      <span className={`text-sm font-medium hidden sm:block ${isDark ? 'text-dark-200' : 'text-dark-700'}`}>
                        {user.name?.split(' ')[0]}
                      </span>
                      <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isDark ? 'text-dark-400' : 'text-dark-500'} ${profileOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {profileOpen && (
                      <div className={`absolute right-0 mt-2 w-52 rounded-2xl shadow-2xl border py-2 animate-slide-down
                        ${isDark ? 'bg-dark-800 border-dark-600' : 'bg-white border-gray-200'}`}>
                        <div className={`px-4 py-2 border-b mb-1 ${isDark ? 'border-dark-700' : 'border-gray-100'}`}>
                          <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-dark-900'}`}>{user.name}</p>
                          <p className={`text-xs truncate ${isDark ? 'text-dark-400' : 'text-dark-500'}`}>{user.email}</p>
                        </div>

                        {[
                          { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
                          { to: '/profile', icon: Settings, label: 'Settings' },
                          ...(isAdmin ? [{ to: '/admin', icon: Globe, label: 'Admin Panel' }] : []),
                        ].map(({ to, icon: Icon, label }) => (
                          <Link key={to} to={to} onClick={() => setProfileOpen(false)}
                            className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors
                              ${isDark ? 'text-dark-300 hover:text-white hover:bg-dark-700' : 'text-dark-600 hover:text-dark-900 hover:bg-gray-50'}`}>
                            <Icon className="w-4 h-4" />
                            {label}
                          </Link>
                        ))}

                        <div className={`border-t mt-1 pt-1 ${isDark ? 'border-dark-700' : 'border-gray-100'}`}>
                          <button onClick={handleLogout}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors w-full">
                            <LogOut className="w-4 h-4" />
                            Logout
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <Link to="/login" className={`btn btn-ghost text-sm ${isDark ? '' : 'text-dark-700 hover:bg-gray-100'}`}>
                    Login
                  </Link>
                  <Link to="/register" className="btn btn-gradient text-sm">
                    Get Started
                  </Link>
                </div>
              )}

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileOpen(p => !p)}
                className={`lg:hidden p-2 rounded-xl transition-colors
                  ${isDark ? 'text-dark-400 hover:text-white hover:bg-dark-700' : 'text-dark-500 hover:text-dark-900 hover:bg-gray-100'}`}>
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className={`lg:hidden border-t animate-slide-down
            ${isDark ? 'bg-dark-900/95 backdrop-blur-xl border-dark-700' : 'bg-white/95 backdrop-blur-xl border-gray-200'}`}>
            <div className="px-4 py-4 space-y-1">
              {navLinks.map(({ to, label, end }) => (
                <NavLink key={to} to={to} end={end} onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-colors
                    ${isActive
                      ? 'bg-primary-500/20 text-primary-400'
                      : isDark ? 'text-dark-300 hover:text-white hover:bg-dark-700' : 'text-dark-600 hover:text-dark-900 hover:bg-gray-50'}`
                  }>
                  {label}
                </NavLink>
              ))}

              {!user && (
                <div className="pt-3 flex flex-col gap-2 border-t border-dark-700 mt-2">
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="btn btn-outline w-full">Login</Link>
                  <Link to="/register" onClick={() => setMobileOpen(false)} className="btn btn-gradient w-full">Get Started</Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Spacer for fixed navbar on non-hero pages */}
      <div className="h-16" />
    </>
  );
}

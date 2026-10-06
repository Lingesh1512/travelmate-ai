import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import { MapPin, Star, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

// Fix Leaflet default icon issue with Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const createIcon = (color = '#3b82f6') => L.divIcon({
  html: `<div style="width:30px;height:30px;background:${color};border:3px solid white;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 3px 10px rgba(0,0,0,0.4)"></div>`,
  iconSize: [30, 30], iconAnchor: [15, 30], popupAnchor: [0, -30], className: ''
});

export default function MapPage() {
  const { isDark } = useTheme();
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    api.get('/destinations', { params: { limit: 50 } }).then(r => setDestinations(r.data.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? destinations : destinations.filter(d => d.country === (filter === 'india' ? 'India' : 'International'));
  const withCoords = filtered.filter(d => d.latitude && d.longitude);

  return (
    <div className={`min-h-screen flex flex-col ${isDark ? 'bg-dark-950' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <h1 className={`text-3xl font-bold font-display mb-1 ${isDark ? 'text-white' : 'text-dark-900'}`}>Interactive Map</h1>
            <p className={isDark ? 'text-dark-400' : 'text-dark-500'}>Explore {withCoords.length} destinations worldwide</p>
          </div>
          <div className="flex gap-2">
            {[['all','All'],['india','India'],['international','International']].map(([v, l]) => (
              <button key={v} onClick={() => setFilter(v)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filter === v ? 'bg-primary-500 text-white' : isDark ? 'bg-dark-800 text-dark-300 hover:bg-dark-700' : 'bg-white text-dark-600 border border-gray-200'}`}>
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 mx-4 sm:mx-6 lg:mx-8 mb-8 rounded-2xl overflow-hidden shadow-2xl" style={{ minHeight: '500px' }}>
        {loading ? (
          <div className="w-full h-full min-h-[500px] skeleton flex items-center justify-center">
            <p className="text-dark-400">Loading map...</p>
          </div>
        ) : (
          <MapContainer center={[20, 78]} zoom={4} style={{ height: '600px', width: '100%' }} className="z-0">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {withCoords.map(dest => (
              <Marker key={dest.id} position={[dest.latitude, dest.longitude]} icon={createIcon(dest.country === 'India' ? '#3b82f6' : '#f97316')}
                eventHandlers={{ click: () => setSelected(dest) }}>
                <Popup maxWidth={280}>
                  <div className="p-1">
                    {dest.image && (
                      <img src={dest.image} alt={dest.name} className="w-full h-28 object-cover rounded-lg mb-2"
                        onError={e => e.target.style.display = 'none'} />
                    )}
                    <h3 className="font-bold text-dark-900 text-sm mb-0.5">{dest.name}</h3>
                    <p className="text-dark-500 text-xs flex items-center gap-1 mb-1">
                      <MapPin className="w-3 h-3" />{[dest.state, dest.country].filter(Boolean).join(', ')}
                    </p>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="flex items-center gap-1 text-xs"><Star className="w-3 h-3 text-yellow-500 fill-current" />{dest.rating}</span>
                      <span className="text-xs text-green-600 font-semibold">₹{Number(dest.average_budget).toLocaleString('en-IN')}</span>
                    </div>
                    <a href={`/destinations/${dest.id}`} className="block text-center bg-blue-600 text-white text-xs py-1.5 rounded-lg hover:bg-blue-700 transition-colors">
                      View Details
                    </a>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </div>

      {/* Destination list below map */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 w-full">
        <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-dark-900'}`}>Destinations on Map</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {withCoords.slice(0, 12).map(dest => (
            <Link key={dest.id} to={`/destinations/${dest.id}`}
              className={`card overflow-hidden group text-center ${isDark ? '' : 'card-light'}`}>
              <div className="h-20 overflow-hidden">
                <img src={dest.image} alt={dest.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={e => e.target.src = 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=200'} />
              </div>
              <div className="p-2">
                <p className={`font-semibold text-xs truncate ${isDark ? 'text-white' : 'text-dark-900'}`}>{dest.name}</p>
                <p className={`text-xs ${isDark ? 'text-dark-400' : 'text-dark-500'}`}>{dest.country}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

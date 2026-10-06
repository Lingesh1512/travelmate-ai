import { Globe, Zap, Users, Heart } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { Link } from 'react-router-dom';

export default function About() {
  const { isDark } = useTheme();
  return (
    <div className={`min-h-screen ${isDark ? 'bg-dark-950' : 'bg-gray-50'}`}>
      <div className="relative h-64 overflow-hidden">
        <img src="https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1200" alt="About" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-dark-950/70" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-4xl font-bold text-white font-display mb-3">About TravelMate AI</h1>
          <p className="text-white/70 text-lg max-w-xl">Your intelligent companion for unforgettable journeys</p>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {[
            { icon: Globe, title: 'Our Mission', text: 'We believe travel should be accessible, enjoyable, and stress-free for everyone. TravelMate AI uses intelligent algorithms to help you plan the perfect trip.', color: 'from-blue-500 to-cyan-500' },
            { icon: Zap, title: 'AI-Powered Planning', text: 'Our smart rule-based engine generates personalized itineraries based on your destination, budget, interests, and travel style — in seconds.', color: 'from-yellow-500 to-orange-500' },
            { icon: Users, title: 'Community Driven', text: 'Built with feedback from thousands of travelers worldwide. Our platform evolves with every journey planned and every destination discovered.', color: 'from-purple-500 to-pink-500' },
            { icon: Heart, title: 'Travel with Love', text: 'We are passionate travelers ourselves. Every feature is designed with care, ensuring your travel experience is nothing short of extraordinary.', color: 'from-red-500 to-pink-500' },
          ].map(({ icon: Icon, title, text, color }) => (
            <div key={title} className={`card p-6 ${isDark ? '' : 'card-light'}`}>
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-4`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className={`font-bold text-lg mb-2 ${isDark ? 'text-white' : 'text-dark-900'}`}>{title}</h3>
              <p className={`text-sm leading-relaxed ${isDark ? 'text-dark-400' : 'text-dark-500'}`}>{text}</p>
            </div>
          ))}
        </div>
        <div className="text-center">
          <h2 className="section-title text-3xl mb-4">Ready to Start Your Journey?</h2>
          <p className="section-subtitle mb-8">Join thousands of travelers who plan smarter with TravelMate AI</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="btn btn-gradient btn-lg">Get Started Free</Link>
            <Link to="/explore" className="btn btn-outline btn-lg">Explore Destinations</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

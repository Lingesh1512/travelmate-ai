import { Link } from 'react-router-dom';
import { Globe, Compass, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="relative w-32 h-32 mx-auto mb-8">
          <div className="absolute inset-0 rounded-full bg-primary-500/10 animate-ping" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Globe className="w-20 h-20 text-primary-400 animate-spin-slow" />
          </div>
        </div>
        <h1 className="text-8xl font-bold font-display text-gradient mb-4">404</h1>
        <h2 className="text-2xl font-bold text-white mb-3">Page Not Found</h2>
        <p className="text-dark-400 mb-8">Looks like this destination doesn't exist on our map. Let's get you back on track!</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/" className="btn btn-gradient btn-lg"><Home className="w-5 h-5" />Back to Home</Link>
          <Link to="/explore" className="btn btn-outline btn-lg"><Compass className="w-5 h-5" />Explore Destinations</Link>
        </div>
      </div>
    </div>
  );
}

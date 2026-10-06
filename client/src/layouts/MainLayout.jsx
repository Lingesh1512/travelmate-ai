import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { useTheme } from '../context/ThemeContext';

export default function MainLayout() {
  const { isDark } = useTheme();
  return (
    <div className={`min-h-screen flex flex-col ${isDark ? 'bg-dark-950 text-white' : 'bg-gray-50 text-dark-900'}`}>
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

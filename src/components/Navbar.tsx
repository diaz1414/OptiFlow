import { Link, useLocation } from 'react-router-dom';
import logo from '../assets/logo.png';

const Navbar = () => {
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center p-6">
      <div className="glass px-8 py-4 rounded-full flex items-center gap-8 animate-float shadow-2xl border border-white/10">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="bg-white/5 p-1 rounded-full overflow-hidden shadow-lg border border-white/10 group-hover:rotate-12 transition-transform duration-500">
            <img src={logo} alt="OptiFlow Logo" className="w-8 h-8 object-cover" />
          </div>
          <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-white/80 to-indigo-300 bg-clip-text text-transparent">
            OptiFlow
          </span>
        </Link>

        {/* Separator */}
        <div className="h-6 w-px bg-white/10 rounded-full" />

        {/* Links */}
        <div className="flex items-center gap-6">
          <Link 
            to="/" 
            className={`text-sm font-bold uppercase tracking-widest transition-all
              ${location.pathname === '/' ? 'text-indigo-400' : 'text-slate-500 hover:text-white'}`}
          >
            Optimizer
          </Link>
          <Link 
            to="/converter" 
            className={`text-sm font-bold uppercase tracking-widest transition-all
              ${location.pathname === '/converter' ? 'text-indigo-400' : 'text-slate-500 hover:text-white'}`}
          >
            Converter
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

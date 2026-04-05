import { Link, useLocation } from 'react-router-dom';
import logo from '../assets/logo.png';

const Navbar = () => {
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center p-4 md:p-6">
      <div className="glass px-4 md:px-8 py-3 md:py-4 rounded-full flex items-center gap-4 md:gap-8 animate-float shadow-2xl border border-white/10">
        <Link to="/" className="flex items-center gap-3 md:gap-4 group">
          <div className="w-9 h-9 md:w-12 md:h-12 rounded-full overflow-hidden shadow-2xl border-2 border-indigo-500/50 group-hover:rotate-[360deg] transition-all duration-700 bg-white/5">
            <img src={logo} alt="OptiFlow Logo" className="w-full h-full object-cover scale-110" />
          </div>
          <span className="hidden sm:block text-xl md:text-2xl font-black tracking-tighter bg-gradient-to-r from-white via-white to-indigo-400 bg-clip-text text-transparent">
            OptiFlow
          </span>
        </Link>

        {/* Separator */}
        <div className="h-6 w-px bg-white/10 rounded-full" />

        {/* Links */}
        <div className="flex items-center gap-4 md:gap-6">
          <Link 
            to="/" 
            className={`text-[10px] md:text-sm font-bold uppercase tracking-widest transition-all
              ${location.pathname === '/' ? 'text-indigo-400' : 'text-slate-500 hover:text-white'}`}
          >
            Optimizer
          </Link>
          <Link 
            to="/converter" 
            className={`text-[10px] md:text-sm font-bold uppercase tracking-widest transition-all
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

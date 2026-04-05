import logo from '../assets/logo.png';

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center p-6">
      <div className="glass px-8 py-4 rounded-full flex items-center gap-3 animate-float shadow-2xl border border-white/10">
        <div className="bg-white/5 p-1 rounded-full overflow-hidden shadow-lg border border-white/10">
          <img src={logo} alt="OptiFlow Logo" className="w-8 h-8 object-cover" />
        </div>
        <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-white/80 to-indigo-300 bg-clip-text text-transparent">
          OptiFlow
        </span>
      </div>
    </nav>
  );
};

export default Navbar;

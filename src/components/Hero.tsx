import { Sparkles, ArrowRight } from 'lucide-react';

const Hero = () => {
  return (
    <div className="pt-40 pb-20 px-6 text-center">
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6 animate-pulse">
        <Sparkles className="w-4 h-4 text-indigo-400" />
        <span className="text-sm font-medium text-indigo-200">New: High-Speed WebAssembly Video Compression</span>
      </div>
      
      <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1]">
        Optimize Your Media <br />
        <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          Without Logic Limits
        </span>
      </h1>
      
      <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-400 font-medium mb-10">
        Professional-grade image and video optimizer. 
        Reduce file size by up to 90% while maintaining stunning visual clarity. 
        100% Secure, 100% Local.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <button 
          onClick={() => document.getElementById('upload-zone')?.scrollIntoView({ behavior: 'smooth' })}
          className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold transition-all shadow-xl shadow-indigo-500/20 flex items-center gap-2 group"
        >
          Start Optimizing <ArrowRight className="group-hover:translate-x-1 transition-transform" />
        </button>
        <button 
          onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
          className="px-8 py-4 glass hover:bg-white/5 text-white rounded-2xl font-bold transition-all transition-all"
        >
          How it Works
        </button>
      </div>
    </div>
  );
};

export default Hero;

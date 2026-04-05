import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const Hero = () => {
  return (
    <div className="pt-48 pb-20 px-6 text-center">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full glass border-indigo-500/30 mb-12 shadow-2xl shadow-indigo-500/20 group hover:scale-105 transition-all cursor-default"
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
        </span>
        <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] text-indigo-300">
          Oprimizer <span className="text-white/40 ml-1 font-medium">[V1]</span>
        </span>
      </motion.div>

      <h1 className="text-6xl md:text-8xl font-black mb-10 tracking-tighter leading-[0.9]">
        Universal <br />
        <span className="bg-gradient-to-r from-white via-indigo-200 to-indigo-500 bg-clip-text text-transparent italic">
          Media Tools
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

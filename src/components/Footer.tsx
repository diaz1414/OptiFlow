import { useState } from 'react';
import { ShieldCheck, Scale, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../assets/logo.png';

const Footer = () => {
  const [modalType, setModalType] = useState<'privacy' | 'terms' | null>(null);

  const Modal = ({ type }: { type: 'privacy' | 'terms' }) => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm"
      onClick={() => setModalType(null)}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="glass-card w-full max-w-2xl max-h-[80vh] overflow-y-auto p-10 rounded-[2rem] space-y-6"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-indigo-500/10 rounded-xl">
            {type === 'privacy' ? <ShieldCheck className="text-indigo-400" /> : <Scale className="text-indigo-400" />}
          </div>
          <h2 className="text-3xl font-bold capitalize">{type} Policy</h2>
        </div>

        <div className="space-y-4 text-slate-400 text-sm leading-relaxed">
          {type === 'privacy' ? (
            <>
              <p className="font-bold text-white">Your Privacy is Our Priority.</p>
              <p>OptiFlow processes all files locally in your browser using WebAssembly. This means your images and videos never leave your device.</p>
              <p>We do not collect, store, or transmit any personally identifiable information (PII) or user media. Our application is stateless and focused entirely on client-side optimization.</p>
            </>
          ) : (
            <>
              <p className="font-bold text-white">Terms of Service.</p>
              <p>By using OptiFlow, you agree that processing happens entirely on your machine. We are not responsible for any data loss or output quality variations.</p>
              <p>The tool is provided "as is" without warranty of any kind. You retain all ownership and copyright of the media you process through this platform.</p>
            </>
          )}
          <button
            onClick={() => setModalType(null)}
            className="w-full py-4 mt-8 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all border border-white/10"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );

  return (
    <footer className="py-20 px-6 border-t border-white/5 bg-[#030014]">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
        <div className="space-y-4 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <div className="bg-white/5 p-1 rounded-full overflow-hidden shadow-lg border border-white/10">
              <img src={logo} alt="OptiFlow Logo" className="w-6 h-6 object-cover" />
            </div>
            <span className="font-bold text-xl tracking-tight">OptiFlow</span>
          </div>
          <p className="text-slate-500 text-sm max-w-sm">
            The world's most private and fastest client-side media optimizer.
            Crafted for creators who value quality and privacy.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-8 text-sm font-medium text-slate-400">
          <button onClick={() => setModalType('privacy')} className="hover:text-white transition-colors">Privacy Policy</button>
          <button onClick={() => setModalType('terms')} className="hover:text-white transition-colors">Terms of Service</button>
          <a href="#" className="hover:text-white transition-colors">Github</a>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-600 font-bold uppercase tracking-widest">
          <Globe className="w-3 h-3" />
          <span>Distributed Edge Processing</span>
        </div>
      </div>

      <div className="mt-20 text-center text-[10px] text-slate-700 font-bold uppercase tracking-[0.3em]">
        © 2026 OptiFlow Labs • All Rights Reserved
      </div>

      <AnimatePresence>
        {modalType && <Modal type={modalType} />}
      </AnimatePresence>
    </footer>
  );
};

export default Footer;

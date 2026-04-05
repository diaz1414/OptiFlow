import { Upload, Settings, Zap, Download } from 'lucide-react';
import { motion } from 'framer-motion';

const steps = [
  {
    icon: <Upload className="w-8 h-8 text-indigo-400" />,
    title: "INPUT",
    description: "Multi-format ingest. Drop your videos, images, or documents.",
    label: "Step 01"
  },
  {
    icon: <Settings className="w-8 h-8 text-purple-400" />,
    title: "PROCESS",
    description: "Neural optimization. Smart quality scaling and container swap.",
    label: "Step 02"
  },
  {
    icon: <Zap className="w-8 h-8 text-blue-400" />,
    title: "RENDER",
    description: "Local WASM engine. Blazing fast processing without cloud.",
    label: "Step 03"
  },
  {
    icon: <Download className="w-8 h-8 text-emerald-400" />,
    title: "OUTPUT",
    description: "Instant delivery. Download your optimized results directly.",
    label: "Step 04"
  }
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-40 px-6 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto relative">
        <div className="text-center mb-24">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-6 transition-all hover:bg-indigo-500/20 group">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-300">Operational Flow</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-black mb-8 tracking-tighter">
            How <span className="text-indigo-400">OptiFlow</span> Works
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto text-lg font-medium leading-relaxed">
            A high-performance pipeline designed for speed and privacy. 
            No cloud delays. No data compromise.
          </p>
        </div>

        <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Connecting Line (Desktop) */}
          <div className="hidden lg:block absolute top-[110px] left-[15%] right-[15%] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent -z-10" />

          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.8, ease: "circOut" }}
              viewport={{ once: true }}
              className="glass p-8 rounded-[3rem] border-white/5 hover:border-indigo-500/30 transition-all duration-500 group relative overflow-hidden h-full"
            >
              <div className="absolute top-0 right-0 p-8 text-5xl font-black text-white/[0.03] select-none group-hover:text-indigo-500/[0.05] transition-colors">
                {index + 1}
              </div>
              
              <div className="mb-10 w-20 h-20 rounded-[1.5rem] bg-indigo-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 border border-indigo-500/20 group-hover:shadow-[0_0_30px_-5px_rgba(99,102,241,0.3)] bg-gradient-to-br from-indigo-500/5 to-purple-500/5">
                {step.icon}
              </div>

              <div className="space-y-4">
                <div className="inline-block px-3 py-1 rounded-full bg-white/[0.03] border border-white/5 text-[10px] font-black tracking-widest text-indigo-400 uppercase">
                  {step.label}
                </div>
                <h3 className="text-2xl font-black tracking-tight text-white group-hover:text-indigo-300 transition-colors">
                  {step.title}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed font-medium">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;

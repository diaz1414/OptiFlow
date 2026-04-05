import { Upload, Settings, Zap, Download } from 'lucide-react';
import { motion } from 'framer-motion';

const steps = [
  {
    icon: <Upload className="w-6 h-6 text-blue-400" />,
    title: "Upload Media",
    description: "Drag and drop your images or videos. We support JPG, PNG, WEBP, and MP4 formats.",
    color: "blue"
  },
  {
    icon: <Settings className="w-6 h-6 text-purple-400" />,
    title: "Fine-tune Quality",
    description: "Adjust the quality slider to find the perfect balance between file size and visual clarity.",
    color: "purple"
  },
  {
    icon: <Zap className="w-6 h-6 text-indigo-400" />,
    title: "Instant Processing",
    description: "Our high-speed WebAssembly engine optimizes your files locally in milliseconds.",
    color: "indigo"
  },
  {
    icon: <Download className="w-6 h-6 text-emerald-400" />,
    title: "Download & Save",
    description: "Get your optimized results immediately. 100% private, your files never leave your device.",
    color: "emerald"
  }
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">How it Works</h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            Experience professional-grade optimization without the complexity. 
            Four simple steps to faster, leaner media.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="glass-card p-8 rounded-[2rem] relative group hover:border-white/20 transition-all"
            >
              <div className={`w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                {step.icon}
              </div>
              <div className="absolute top-8 right-8 text-4xl font-black text-white/5 pointer-events-none">
                0{index + 1}
              </div>
              <h3 className="text-xl font-bold mb-4">{step.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Decorative connecting line (Desktop only) */}
        <div className="hidden lg:block absolute left-1/2 -translate-x-1/2 w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-white/10 to-transparent -z-10 mt-[-100px]" />
      </div>
    </section>
  );
};

export default HowItWorks;

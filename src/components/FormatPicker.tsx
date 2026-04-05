import { useState, useMemo } from 'react';
import { Search, Image as ImageIcon, Film, FileText, Package, Check, X, Music } from 'lucide-react';
import { motion } from 'framer-motion';

const FORMAT_CATEGORIES = [
  {
    id: 'video',
    name: 'Video',
    icon: <Film className="w-4 h-4" />,
    formats: ['mp4', 'mov', 'webm', 'mkv', 'avi', 'flv', 'gif']
  },
  {
    id: 'audio',
    name: 'Audio',
    icon: <Music className="w-4 h-4" />,
    formats: ['mp3', 'wav', 'aac', 'ogg', 'm4a']
  },
  {
    id: 'image',
    name: 'Image',
    icon: <ImageIcon className="w-4 h-4" />,
    formats: ['png', 'jpg', 'webp', 'bmp', 'svg']
  },
  {
    id: 'document',
    name: 'Document',
    icon: <FileText className="w-4 h-4" />,
    formats: ['pdf', 'docx', 'xlsx', 'html', 'txt', 'csv', 'json']
  },
  {
    id: 'archive',
    name: 'Archive',
    icon: <Package className="w-4 h-4" />,
    formats: ['zip']
  }
];

interface FormatPickerProps {
  currentFormat: string;
  onSelect: (format: string) => void;
  onClose: () => void;
  allowedCategories?: string[];
}

const FormatPicker = ({ currentFormat, onSelect, onClose, allowedCategories }: FormatPickerProps) => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState(allowedCategories?.[0] || 'video');

  const filteredCategories = useMemo(() => {
    return FORMAT_CATEGORIES.filter(cat => 
      !allowedCategories || allowedCategories.includes(cat.id)
    ).map(cat => ({
      ...cat,
      formats: cat.formats.filter(f => f.toLowerCase().includes(search.toLowerCase()))
    })).filter(cat => cat.formats.length > 0);
  }, [search, allowedCategories]);

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] md:hidden" 
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, y: '100%' }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed inset-x-0 bottom-0 md:inset-auto md:absolute md:top-full md:right-0 mt-4 md:w-[480px] glass-card rounded-t-[2.5rem] md:rounded-[2.5rem] shadow-2xl z-[100] border border-white/20 overflow-hidden"
      >
        <div className="p-4 md:p-8 space-y-6 bg-[#0E0A24]/98 md:bg-[#0D0B21]/95 backdrop-blur-xl md:backdrop-blur-2xl max-h-[85vh] md:h-auto overflow-y-auto custom-scrollbar">
          {/* Mobile Handle */}
          <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-4 md:hidden" />
          
          {/* Search Header */}
          <div className="flex items-center gap-4">
            <div className="flex-1 flex items-center gap-4 px-6 py-4 bg-white/5 rounded-[2rem] border border-white/10 focus-within:border-indigo-500/50 focus-within:bg-white/[0.08] transition-all duration-300 group">
              <Search className="w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 group-focus-within:scale-110 transition-all" />
              <input
                autoFocus
                type="text"
                placeholder="Search Format..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent border-none outline-none text-sm md:text-base w-full placeholder:text-slate-600 focus:ring-0 text-white font-medium"
              />
            </div>
            <button 
              onClick={onClose}
              className="md:hidden p-3 bg-white/5 rounded-xl text-slate-400"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-6 md:gap-10">
            {/* Categories: Horizontal Scroll on Mobile, Sidebar on Desktop */}
            {!search && (
              <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 md:w-36 md:border-r md:border-white/10 md:pr-10 custom-scrollbar-hide">
                {filteredCategories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`flex-shrink-0 flex flex-row md:flex-col items-center justify-center gap-2 md:gap-3 px-6 py-3 md:h-28 rounded-[2rem] transition-all duration-500
                      ${activeCategory === cat.id ? 'bg-indigo-600/20 text-white border border-indigo-500/50 shadow-lg shadow-indigo-500/10' : 'text-slate-500 hover:text-white hover:bg-white/5 border border-transparent'}`}
                  >
                    <div className={`${activeCategory === cat.id ? 'scale-125' : 'scale-100'} transition-transform duration-500 text-indigo-400`}>
                      {cat.icon}
                    </div>
                    <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] whitespace-nowrap">{cat.name}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Formats Grid */}
            <div className="flex-1 min-h-[300px]">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {filteredCategories
                  .filter(cat => search || cat.id === activeCategory)
                  .flatMap(cat => cat.formats)
                  .map(fmt => (
                    <button
                      key={fmt}
                      onClick={() => { onSelect(fmt); onClose(); }}
                      className={`h-14 rounded-2xl text-[11px] md:text-sm font-black uppercase tracking-[0.2em] flex items-center justify-center transition-all duration-500 active:scale-95 group relative
                        ${currentFormat === fmt ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-600/50 border border-indigo-400/50' : 'glass border-white/5 text-slate-400 hover:text-white hover:border-white/20 hover:bg-white/[0.03]'}`}
                    >
                      <span>{fmt}</span>
                      {currentFormat === fmt && (
                        <motion.div 
                          initial={{ scale: 0, opacity: 0 }} 
                          animate={{ scale: 1, opacity: 1 }}
                          className="absolute top-2 right-2 bg-white/20 backdrop-blur-md rounded-full p-0.5"
                        >
                          <Check className="w-3 h-3 text-white" />
                        </motion.div>
                      )}
                    </button>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default FormatPicker;

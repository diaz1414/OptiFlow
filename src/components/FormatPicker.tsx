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
    formats: ['pdf', 'png', 'jpg'] // PDF can be converted to images
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
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 10 }}
        className="fixed inset-x-6 top-20 bottom-20 md:absolute md:inset-auto md:top-full md:right-0 mt-4 md:w-96 glass-card rounded-[2rem] shadow-2xl z-[100] border border-white/20 overflow-hidden"
      >
        <div className="p-6 space-y-6 bg-[#0E0A24]/98 md:bg-transparent backdrop-blur-xl md:backdrop-blur-none h-full md:h-auto overflow-y-auto">
          {/* Search Header */}
          <div className="flex items-center gap-4">
            <div className="flex-1 flex items-center gap-2 px-4 py-3 bg-white/5 rounded-2xl border border-white/10 focus-within:border-indigo-500 transition-all">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                autoFocus
                type="text"
                placeholder="Search Format..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent border-none outline-none text-sm w-full placeholder:text-slate-600"
              />
            </div>
            <button 
              onClick={onClose}
              className="md:hidden p-3 bg-white/5 rounded-xl hover:bg-rose-500/20 text-slate-400 hover:text-rose-400"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          {search && (
            <button onClick={() => setSearch('')}>
              <X className="w-3 h-3 text-slate-500" />
            </button>
          )}
        </div>

        <div className="flex gap-4 min-h-[300px]">
          {/* Sidebar Categories */}
          {!search && (
            <div className="w-24 border-r border-white/10 pr-4 space-y-2">
              {filteredCategories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`w-full p-3 rounded-xl flex flex-col items-center gap-1 transition-all
                    ${activeCategory === cat.id ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                >
                  {cat.icon}
                  <span className="text-[10px] font-bold uppercase tracking-tighter">{cat.name}</span>
                </button>
              ))}
            </div>
          )}

          {/* Formats Grid */}
          <div className="flex-1 max-h-[350px] overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-2 gap-2">
              {filteredCategories
                .filter(cat => search || cat.id === activeCategory)
                .flatMap(cat => cat.formats)
                .map(fmt => (
                  <button
                    key={fmt}
                    onClick={() => { onSelect(fmt); onClose(); }}
                    className={`p-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-between transition-all
                      ${currentFormat === fmt ? 'bg-indigo-600 text-white' : 'glass border-white/5 text-slate-400 hover:text-white hover:border-white/20'}`}
                  >
                    {fmt}
                    {currentFormat === fmt && <Check className="w-3 h-3" />}
                  </button>
                ))}
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default FormatPicker;

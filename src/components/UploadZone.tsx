import { useState, useRef } from 'react';
import { Upload, X, FileImage, FileVideo, Download, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { compressImage, compressVideo } from '../utils/media';

const UploadZone = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [quality, setQuality] = useState(80); // 1-100

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/quicktime'];
    if (!validTypes.includes(file.type)) {
      setError('Unsupported file type. Please use JPG, PNG, WEBP, or MP4.');
      return;
    }
    setError(null);
    setFile(file);
    setResult(null);
  };

  const handleOptimize = async () => {
    if (!file) return;
    setIsProcessing(true);
    setProgress(0);

    try {
      if (file.type.startsWith('image/')) {
        const compressed = await compressImage(file, { quality: quality / 100 });
        setResult(compressed as File);
      } else {
        const compressed = await compressVideo(file, { quality: quality > 70 ? 'high' : 'normal' }, setProgress);
        setResult(compressed);
      }
    } catch (err) {
      console.error('Optimization error:', err);
      setError('Processing failed. Please try a smaller file or different format.');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadFile = () => {
    if (!result) return;
    const url = URL.createObjectURL(result);
    const link = document.createElement('a');
    link.href = url;
    link.download = `optimizedByOptiFlow_${result.name}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div id="upload-zone" className="max-w-4xl mx-auto px-6 mb-20">
      <div className="glass-card rounded-[2.5rem] p-10 overflow-hidden relative">
        {/* Background Glow */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-500/10 blur-[100px] rounded-full" />

        <AnimatePresence mode="wait">
          {!file ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`border-2 border-dashed rounded-3xl p-12 transition-all flex flex-col items-center justify-center cursor-pointer
                ${isDragging ? 'border-indigo-500 bg-indigo-500/5' : 'border-white/10 hover:border-white/20'}`}
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleChange}
                className="hidden"
                accept="image/*,video/*"
              />
              <div className="bg-indigo-500/10 p-5 rounded-2xl mb-6">
                <Upload className="w-10 h-10 text-indigo-400" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Select or Drag Media</h3>
              <p className="text-slate-400 text-center mb-8">
                Drop your image or video here to begin compression.<br />
                Works on desktop and mobile.
              </p>
              <div className="flex gap-4 text-xs font-semibold uppercase tracking-widest text-slate-500">
                <span className="px-3 py-1 bg-white/5 rounded-md border border-white/5">JPG</span>
                <span className="px-3 py-1 bg-white/5 rounded-md border border-white/5">PNG</span>
                <span className="px-3 py-1 bg-white/5 rounded-md border border-white/5">WEBP</span>
                <span className="px-3 py-1 bg-white/5 rounded-md border border-white/5">MP4</span>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-8"
            >
              <div className="flex items-center justify-between gap-4 p-4 glass rounded-2xl">
                <div className="flex items-center gap-4">
                  <div className="bg-white/5 p-3 rounded-xl">
                    {file.type.startsWith('image/') ? <FileImage className="text-blue-400" /> : <FileVideo className="text-purple-400" />}
                  </div>
                  <div>
                    <p className="font-semibold truncate max-w-[200px] sm:max-w-md">{file.name}</p>
                    <p className="text-sm text-slate-400">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                </div>
                <button onClick={() => setFile(null)} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              {/* Controls */}
              {!result && !isProcessing && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm">
                      <label className="text-slate-300 font-medium">Quality Strength</label>
                      <span className="text-indigo-400 font-bold bg-indigo-400/10 px-3 py-1 rounded-lg">{quality}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={quality}
                      onChange={(e) => setQuality(parseInt(e.target.value))}
                      className="w-full h-2 bg-white/5 rounded-lg appearance-none cursor-pointer accent-indigo-500 border border-white/10"
                    />
                    <div className="flex justify-between text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                      <span>Max Compression</span>
                      <span>Best Quality</span>
                    </div>
                  </div>

                  <button
                    onClick={handleOptimize}
                    className="w-full py-5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-2xl font-bold transition-all shadow-xl shadow-indigo-500/20 active:scale-[0.98]"
                  >
                    Optimize & Compress
                  </button>
                </div>
              )}

              {/* Processing/Result State */}
              <AnimatePresence>
                {isProcessing && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center py-10 space-y-6"
                  >
                    <div className="relative">
                      <Loader2 className="w-16 h-16 text-indigo-500 animate-spin" />
                      {progress > 0 && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xs font-bold">{progress}%</span>
                        </div>
                      )}
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-xl mb-1">Optimizing Media...</p>
                      <p className="text-slate-400 text-sm">Our WebAssembly core is processing your file locally.</p>
                    </div>
                  </motion.div>
                )}

                {result && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <div className="p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-3xl flex flex-col sm:flex-row items-center gap-6">
                      <div className="flex-1 w-full">
                        <div className="flex justify-between items-end mb-2">
                          <p className="text-sm text-slate-400 font-medium lowercase">Original Size</p>
                          <p className="font-bold text-slate-300">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                        </div>
                        <div className="flex justify-between items-end">
                          <p className="text-sm font-medium text-emerald-400 underline underline-offset-4">New Size</p>
                          <p className="text-2xl font-black text-emerald-400">{(result.size / (1024 * 1024)).toFixed(2)} MB</p>
                        </div>
                      </div>
                      <div className="h-px sm:h-12 w-full sm:w-px bg-white/10" />
                      <div className="text-center sm:text-left">
                        <p className="text-3xl font-black text-white">-{Math.round((1 - result.size / file.size) * 100)}%</p>
                        <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-emerald-400">Saving</p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                      <button
                        onClick={downloadFile}
                        className="flex-1 py-5 bg-white text-black hover:bg-slate-200 rounded-2xl font-bold transition-all flex items-center justify-center gap-2"
                      >
                        <Download className="w-5 h-5" /> Download Result
                      </button>
                      <button
                        onClick={() => { setFile(null); setResult(null); }}
                        className="px-8 py-5 glass hover:bg-white/5 text-white rounded-2xl font-bold transition-all"
                      >
                        Optimize Another
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {error && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm font-medium text-center">
                  {error}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <p className="mt-8 text-center text-slate-500 text-sm">
        Maximum recommended video file size: 100MB for optimal browser performance.
      </p>
    </div>
  );
};

export default UploadZone;

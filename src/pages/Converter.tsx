import { useState, useRef, useMemo } from 'react';
import type { ChangeEvent } from 'react';
import {
  X, FileImage, FileVideo, FileText, Package,
  Download, Loader2, ArrowRight, ChevronDown,
  FileCheck, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import JSZip from 'jszip';
import FormatPicker from '../components/FormatPicker';
import { convertVideo, videoToGif, imagesToPdf, pdfToImages, extractAudio, docxToHtml, xlsxToHtml, xlsxToCsv, pdfToHtml } from '../utils/media';

const convertToImage = async (file: File, targetFormat: string): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas conversion failed'));
      }, `image/${targetFormat === 'jpg' ? 'jpeg' : targetFormat}`);
    };
    img.onerror = () => reject(new Error('Image load failed'));
    img.src = URL.createObjectURL(file);
  });
};

const Converter = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<Blob | File | null>(null);
  const [targetFormat, setTargetFormat] = useState('png');
  const [showPicker, setShowPicker] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
      setResult(null);
      setError(null);

      const firstFile = e.target.files[0];
      if (firstFile.type.startsWith('video/')) setTargetFormat('mp4');
      else if (firstFile.type.includes('pdf')) setTargetFormat('png');
      else if (firstFile.type.startsWith('image/')) setTargetFormat('jpg');
      else if (firstFile.name.endsWith('.docx')) setTargetFormat('html');
      else if (firstFile.name.endsWith('.xlsx')) setTargetFormat('html');
      else setTargetFormat('zip');
    }
  };

  const detectedCategory = useMemo(() => {
    if (files.length === 0) return 'none';
    if (files.every(f => f.type.startsWith('image/'))) return 'image';
    if (files.every(f => f.type.startsWith('video/'))) return 'video';
    if (files.every(f => f.type.includes('pdf'))) return 'pdf';
    if (files.every(f => f.name.endsWith('.docx') || f.name.endsWith('.doc'))) return 'document';
    if (files.every(f => f.name.endsWith('.xlsx') || f.name.endsWith('.xls'))) return 'document';
    return 'archive';
  }, [files]);

  const allowedCategories = useMemo(() => {
    if (detectedCategory === 'video') return ['video', 'audio', 'image', 'archive'];
    if (detectedCategory === 'pdf') return ['image', 'archive', 'document'];
    if (detectedCategory === 'image') return ['image', 'document', 'archive'];
    if (detectedCategory === 'document') return ['document', 'archive'];
    return ['archive'];
  }, [detectedCategory]);

  const handleConvert = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    setProgress(0);
    setError(null);

    try {
      if (targetFormat === 'zip') {
        const zip = new JSZip();
        files.forEach(f => zip.file(f.name, f));
        const content = await zip.generateAsync({ type: 'blob' });
        setResult(content);
      } else if (detectedCategory === 'pdf' && ['png', 'jpg', 'webp'].includes(targetFormat)) {
        const images = await pdfToImages(files[0], targetFormat, setProgress);
        if (images.length > 1) {
          const zip = new JSZip();
          images.forEach(img => zip.file(img.name, img));
          const content = await zip.generateAsync({ type: 'blob' });
          setResult(content);
        } else {
          setResult(images[0]);
        }
      } else if (detectedCategory === 'pdf' && targetFormat === 'html') {
        const htmlBlob = await pdfToHtml(files[0]);
        setResult(htmlBlob);
      } else if (detectedCategory === 'document' && targetFormat === 'html') {
        const firstFile = files[0];
        if (firstFile.name.endsWith('.docx')) {
          const htmlBlob = await docxToHtml(firstFile);
          setResult(htmlBlob);
        } else if (firstFile.name.endsWith('.xlsx')) {
          const htmlBlob = await xlsxToHtml(firstFile);
          setResult(htmlBlob);
        }
      } else if (detectedCategory === 'document' && targetFormat === 'csv') {
        const csvBlob = await xlsxToCsv(files[0]);
        setResult(csvBlob);
      } else if (detectedCategory === 'video' && ['mp3', 'wav', 'aac', 'ogg', 'm4a'].includes(targetFormat)) {
        const audioFile = await extractAudio(files[0], targetFormat, setProgress);
        setResult(audioFile);
      } else if (targetFormat === 'pdf' && detectedCategory === 'image') {
        const pdfBlob = await imagesToPdf(files);
        setResult(pdfBlob);
      } else if (detectedCategory === 'video') {
        if (targetFormat === 'gif') {
          const gifFile = await videoToGif(files[0], setProgress);
          setResult(gifFile);
        } else {
          const converted = await convertVideo(files[0], targetFormat, setProgress);
          setResult(converted);
        }
      } else if (detectedCategory === 'image') {
        if (files.length > 1) {
          const zip = new JSZip();
          for (const f of files) {
            const blob = await convertToImage(f, targetFormat);
            const newName = f.name.replace(/\.[^/.]+$/, "") + `.${targetFormat}`;
            zip.file(newName, blob);
          }
          const content = await zip.generateAsync({ type: 'blob' });
          setResult(content);
        } else {
          const blob = await convertToImage(files[0], targetFormat);
          setResult(blob);
        }
      } else {
        setError('Conversion path not supported yet.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Conversion failed. Check browser security settings.');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadResult = () => {
    if (!result) return;
    const url = URL.createObjectURL(result);
    const link = document.body.appendChild(document.createElement('a'));
    link.href = url;

    // Extract original filename without extension
    const originalName = files[0]?.name.replace(/\.[^/.]+$/, "") || "converted";
    const isZip = result.type.includes('zip') || (files.length > 1 && !result.type.includes('pdf'));
    const extension = isZip ? 'zip' : targetFormat;

    link.download = `[OptiFlow] - ${originalName}.${extension}`;
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-40 pb-20 px-6 max-w-6xl mx-auto">
      <div className="flex flex-col items-center text-center mb-16">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="inline-flex items-center gap-3 px-5 py-2 rounded-full glass border-indigo-500/30 mb-8 shadow-xl shadow-indigo-500/10 group hover:scale-105 transition-all"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </span>
          <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-indigo-300">
            PRO EDITION <span className="text-white/40 ml-1 font-medium">[SMART]</span>
          </span>
        </motion.div>
        <h1 className="text-6xl md:text-8xl font-black mb-8 tracking-tighter leading-[0.85]">
          Universal <br/>
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-600 bg-clip-text text-transparent">File Converter</span>
        </h1>
        <p className="text-slate-400 text-lg md:text-xl max-w-3xl font-medium leading-relaxed">
          Switch between any video, audio, or document format in seconds. <br className="hidden md:block" />
          High-quality results with <span className="text-indigo-400">total privacy</span>—your files never leave your device.
        </p>
      </div>

      <div className="glass-card rounded-[3rem] p-1 shadow-2xl bg-white/5 border border-white/10">
        <div className="bg-[#0D0B21]/90 rounded-[2.9rem] p-8 md:p-12 relative min-h-[500px]">
          <AnimatePresence mode="wait">
            {files.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => fileInputRef.current?.click()}
                className="group border-2 border-dashed border-white/5 hover:border-indigo-500/50 p-10 md:p-20 rounded-[2rem] flex flex-col items-center justify-center cursor-pointer transition-all bg-white/[0.02]"
              >
                <input type="file" multiple ref={fileInputRef} onChange={handleFiles} className="hidden" />
                <div className="w-16 h-16 md:w-20 md:h-20 bg-indigo-500/10 rounded-2xl md:rounded-3xl flex items-center justify-center mb-6 md:mb-8 group-hover:scale-110 transition-transform shadow-xl shadow-indigo-500/5">
                  <ArrowRight className="w-8 h-8 md:w-10 md:h-10 text-indigo-400 rotate-90" />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold mb-3 text-white">Choose Files</h3>
                <p className="text-sm md:text-base text-slate-500 max-w-sm text-center font-bold px-4">
                  Drag and drop any files here or <span className="text-indigo-400">browse</span> from your device.
                </p>
              </motion.div>
            ) : (
              <motion.div key="active" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-white/5">
                  <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 text-center md:text-left">
                    <div className="flex -space-x-3 md:-space-x-4">
                      {files.slice(0, 3).map((f, i) => (
                        <div key={i} className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-indigo-600 border-2 border-[#0A0A1F] flex items-center justify-center shadow-lg">
                          {f.type.startsWith('image/') ? <FileImage className="w-4 h-4 md:w-5 md:h-5 text-white" /> :
                            f.type.startsWith('video/') ? <FileVideo className="w-4 h-4 md:w-5 md:h-5 text-white" /> :
                              f.type.includes('pdf') ? <FileText className="w-4 h-4 md:w-5 md:h-5 text-white" /> :
                                <Package className="w-4 h-4 md:w-5 md:h-5 text-white" />}
                        </div>
                      ))}
                    </div>
                    <div>
                      <h4 className="text-lg md:text-xl font-bold text-white tracking-tight">{files.length} Files Selected</h4>
                      <p className="text-[10px] md:text-sm text-slate-500 uppercase tracking-widest font-bold">Category: {detectedCategory}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-500 uppercase">Output:</span>
                      <div className="relative">
                        <button
                          onClick={() => setShowPicker(!showPicker)}
                          className="flex items-center gap-3 px-6 py-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400 font-black uppercase text-sm hover:bg-indigo-500/20 transition-all min-w-[120px] justify-between"
                        >
                          {targetFormat}
                          <ChevronDown className={`w-4 h-4 transition-transform ${showPicker ? 'rotate-180' : ''}`} />
                        </button>
                        <AnimatePresence>
                          {showPicker && (
                            <FormatPicker
                              currentFormat={targetFormat}
                              onSelect={setTargetFormat}
                              onClose={() => setShowPicker(false)}
                              allowedCategories={allowedCategories}
                            />
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                    <button onClick={() => setFiles([])} className="p-3 hover:bg-rose-500/10 rounded-xl transition-colors group">
                      <X className="w-6 h-6 text-slate-500 group-hover:text-rose-500" />
                    </button>
                  </div>
                </div>

                {!result && !isProcessing && (
                  <div className="flex justify-center pt-4">
                    <button onClick={handleConvert} className="group relative px-16 py-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[2rem] font-black text-xl transition-all shadow-2xl shadow-indigo-500/40 overflow-hidden flex items-center gap-3">
                      Convert Now <ArrowRight className="group-hover:translate-x-2 transition-transform" />
                    </button>
                  </div>
                )}

                <AnimatePresence>
                  {isProcessing && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center py-10 space-y-6">
                      <div className="relative">
                        <Loader2 className="w-20 h-20 text-indigo-500 animate-spin" />
                        {progress > 0 && <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">{progress}%</span>}
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold mb-2 text-white">Engines Running...</p>
                        <p className="text-slate-500">Transforming your files with WebAssembly cores.</p>
                      </div>
                    </motion.div>
                  )}

                  {result && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
                      <div className="glass p-10 rounded-[2rem] border-emerald-500/20 bg-emerald-500/5 flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6">
                          <FileCheck className="w-8 h-8 text-emerald-400" />
                        </div>
                        <h3 className="text-3xl font-bold mb-2 text-emerald-400">Ready to Download</h3>
                        <p className="text-slate-400">All files have been successfully processed and converted.</p>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-4">
                        <button onClick={downloadResult} className="flex-1 py-6 bg-white text-[#0A0A1F] hover:bg-slate-200 rounded-3xl font-black text-xl transition-all flex items-center justify-center gap-3 shadow-xl">
                          <Download className="w-6 h-6" /> Get Result
                        </button>
                        <button onClick={() => { setFiles([]); setResult(null); }} className="px-10 py-6 glass hover:bg-white/5 text-white rounded-3xl font-black text-xl transition-all border border-white/10">
                          Start Over
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {error && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-4 text-rose-400 font-bold">
                      <AlertCircle className="w-6 h-6 flex-shrink-0" />
                      <p>{error}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default Converter;

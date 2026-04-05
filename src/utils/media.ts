import imageCompression from 'browser-image-compression';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { jsPDF } from 'jspdf';
import * as pdfjs from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';
import mammoth from 'mammoth';
import * as XLSX from 'xlsx';

// Configure PDF.js worker using Vite's ?url import for local bundling
pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export const compressImage = async (file: File, options: any) => {
  try {
    const compressedFile = await imageCompression(file, {
      maxSizeMB: options.targetSizeMB || 1,
      maxWidthOrHeight: options.maxWidth || 1920,
      useWebWorker: true,
      initialQuality: options.quality || 0.8,
    });
    return compressedFile;
  } catch (error) {
    console.error('Image compression failed:', error);
    throw error;
  }
};

let ffmpeg: FFmpeg | null = null;
let isLoading = false;
let progressCallback: ((p: number) => void) | null = null;

const getFFmpeg = async () => {
  if (ffmpeg && ffmpeg.loaded) return ffmpeg;
  if (isLoading) {
    while (isLoading) {
      await new Promise(r => setTimeout(r, 100));
    }
    return ffmpeg!;
  }
  
  isLoading = true;
  try {
    ffmpeg = new FFmpeg();
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
    
    ffmpeg.on('log', ({ message }) => {
      console.log('FFmpeg:', message);
    });

    ffmpeg.on('progress', ({ progress }) => {
      if (progressCallback) progressCallback(Math.round(progress * 100));
    });

    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });
    return ffmpeg;
  } finally {
    isLoading = false;
  }
};

// Fungsi pembantu untuk cek perangkat
const isMobile = () => /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

export const compressVideo = async (file: File, options: any, onProgress: (p: number) => void) => {
  const ffmpeg = await getFFmpeg();
  const inputName = 'input.mp4';
  const outputName = 'output.mp4';
  
  progressCallback = onProgress;

  await ffmpeg.writeFile(inputName, await fetchFile(file));
  
  // Logika Adaptif: Beda HP, Beda Strategi
  const mobile = isMobile();
  const preset = mobile ? 'ultrafast' : 'veryfast';
  const crf = options.quality === 'high' ? '23' : (mobile ? '30' : '28');
  
  const ffmpegArgs = [
    '-i', inputName, 
    '-vcodec', 'libx264', 
    '-crf', crf, 
    '-preset', preset,
    '-threads', mobile ? '2' : '0', // Batasi thread di HP agar UI tidak freeze
    outputName
  ];

  // Jika di HP, paksa resolusi ke max 720p agar proses kompresi tidak stuck/lama
  if (mobile) {
    ffmpegArgs.splice(2, 0, '-vf', 'scale=-2:min(720\\,ih)');
  }

  console.log(`Starting compression on ${mobile ? 'Mobile' : 'Desktop'}...`);
  await ffmpeg.exec(ffmpegArgs);
  
  const data = await ffmpeg.readFile(outputName);
  const blob = new Blob([data as any], { type: 'video/mp4' });
  return new File([blob], file.name.replace(/\.[^/.]+$/, "") + '.mp4', { type: 'video/mp4' });
};

export const convertVideo = async (file: File, targetFormat: string, onProgress: (p: number) => void) => {
  const ffmpeg = await getFFmpeg();
  const inputName = `input_${file.name.replace(/\s+/g, '_')}`;
  const outputName = `output.${targetFormat}`;
  
  progressCallback = onProgress;

  await ffmpeg.writeFile(inputName, await fetchFile(file));
  console.log('Starting conversion...');
  await ffmpeg.exec(['-i', inputName, outputName]);
  
  const data = await ffmpeg.readFile(outputName);
  const type = targetFormat === 'gif' ? 'image/gif' : `video/${targetFormat}`;
  const blob = new Blob([data as any], { type });
  return new File([blob], file.name.replace(/\.[^/.]+$/, "") + `.${targetFormat}`, { type });
};

export const videoToGif = async (file: File, onProgress: (p: number) => void) => {
  const ffmpeg = await getFFmpeg();
  const inputName = `input_${file.name.replace(/\s+/g, '_')}`;
  const outputName = 'output.gif';
  
  progressCallback = onProgress;

  await ffmpeg.writeFile(inputName, await fetchFile(file));
  console.log('Starting GIF conversion...');
  
  await ffmpeg.exec([
    '-i', inputName, 
    '-vf', 'fps=10,scale=320:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse', 
    outputName
  ]);
  
  const data = await ffmpeg.readFile(outputName);
  const blob = new Blob([data as any], { type: 'image/gif' });
  return new File([blob], file.name.replace(/\.[^/.]+$/, "") + '.gif', { type: 'image/gif' });
};

export const imagesToPdf = async (files: File[]) => {
  const pdf = new jsPDF();
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const imgData = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.readAsDataURL(file);
    });
    
    if (i > 0) pdf.addPage();
    const props = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (props.height * pdfWidth) / props.width;
    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
  }
  
  return pdf.output('blob');
};

export const pdfToImages = async (file: File, targetFormat: string, onProgress: (p: number) => void) => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
  const numPages = pdf.numPages;
  const imageFiles: File[] = [];

  for (let i = 1; i <= numPages; i++) {
    onProgress(Math.round((i / numPages) * 100));
    const page = await pdf.getPage(i);
    const scale = 2; // High quality
    const viewport = page.getViewport({ scale });
    
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      await page.render({ canvasContext: ctx, viewport, canvas }).promise;
      const blob = await new Promise<Blob>((resolve) => 
        canvas.toBlob((b) => resolve(b!), `image/${targetFormat === 'jpg' ? 'jpeg' : targetFormat}`)
      );
      imageFiles.push(new File([blob], `page_${i}.${targetFormat}`, { type: `image/${targetFormat}` }));
    }
  }

  return imageFiles;
};

export const extractAudio = async (videoFile: File, targetFormat: string, onProgress: (p: number) => void) => {
  const ffmpeg = await getFFmpeg();
  const inputName = `input_${videoFile.name}`;
  const outputName = `output.${targetFormat}`;

  ffmpeg.on('progress', ({ progress }) => {
    onProgress(Math.round(progress * 100));
  });

  await ffmpeg.writeFile(inputName, await fetchFile(videoFile));
  
  await ffmpeg.exec(['-i', inputName, '-vn', '-acodec', targetFormat === 'wav' ? 'pcm_s16le' : 'libmp3lame', outputName]);

  const data = await ffmpeg.readFile(outputName);
  const type = `audio/${targetFormat}`;
  const blob = new Blob([data as any], { type });
  return new File([blob], videoFile.name.replace(/\.[^/.]+$/, "") + `.${targetFormat}`, { type });
};

export const docxToHtml = async (file: File) => {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.convertToHtml({ arrayBuffer });
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${file.name}</title>
      <style>
        body { font-family: -apple-system, system-ui, sans-serif; line-height: 1.6; max-width: 800px; margin: 40px auto; padding: 20px; color: #333; }
        img { max-width: 100%; height: auto; }
        table { border-collapse: collapse; width: 100%; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background: #f5f5f5; }
      </style>
    </head>
    <body>
      ${result.value}
    </body>
    </html>
  `;
  return new Blob([html], { type: 'text/html' });
};

export const xlsxToHtml = async (file: File) => {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer);
  let htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: sans-serif; padding: 20px; }
        table { border-collapse: collapse; margin-bottom: 20px; border: 1px solid #ddd; }
        th, td { border: 1px solid #ddd; padding: 8px; font-size: 14px; text-align: left; }
        th { background: #f8fafc; font-weight: bold; }
        .sheet-name { font-weight: bold; font-size: 18px; margin: 20px 0 10px; color: #4f46e5; border-bottom: 2px solid #4f46e5; display: inline-block; }
      </style>
    </head>
    <body>
  `;

  workbook.SheetNames.forEach(name => {
    const sheet = workbook.Sheets[name];
    htmlContent += `<div class="sheet-name">Sheet: ${name}</div>`;
    htmlContent += XLSX.utils.sheet_to_html(sheet);
  });

  htmlContent += `</body></html>`;
  return new Blob([htmlContent], { type: 'text/html' });
};

export const xlsxToCsv = async (file: File) => {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer);
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  const csv = XLSX.utils.sheet_to_csv(worksheet);
  return new Blob([csv], { type: 'text/csv' });
};

export const pdfToHtml = async (file: File) => {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  
  let htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${file.name}</title>
      <style>
        body { font-family: -apple-system, system-ui, sans-serif; line-height: 1.6; max-width: 900px; margin: 0 auto; padding: 40px 20px; color: #1e293b; background: #f8fafc; }
        .page { background: white; margin-bottom: 30px; padding: 50px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); border: 1px solid #e2e8f0; }
        .page-num { color: #64748b; font-size: 12px; font-weight: bold; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.1em; border-bottom: 1px solid #f1f5f9; padding-bottom: 5px; }
        p { margin-bottom: 1em; white-space: pre-wrap; }
        h1, h2, h3 { color: #0f172a; margin-top: 1.5em; }
      </style>
    </head>
    <body>
  `;

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    let lastY = -1;
    let pageHtml = `<div class="page"><div class="page-num">Page ${i}</div>`;
    
    textContent.items.forEach((item: any) => {
      if (lastY !== -1 && Math.abs(item.transform[5] - lastY) > 5) {
        pageHtml += `</p><p>`;
      } else if (lastY === -1) {
        pageHtml += `<p>`;
      }
      pageHtml += item.str + " ";
      lastY = item.transform[5];
    });

    pageHtml += `</p></div>`;
    htmlContent += pageHtml;
  }

  htmlContent += `</body></html>`;
  return new Blob([htmlContent], { type: 'text/html' });
};
    }
    return ffmpeg!;
  }
  
  isLoading = true;
  try {
    ffmpeg = new FFmpeg();
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
    
    ffmpeg.on('log', ({ message }) => {
      console.log('FFmpeg:', message);
    });

    ffmpeg.on('progress', ({ progress }) => {
      if (progressCallback) progressCallback(Math.round(progress * 100));
    });

    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });
    return ffmpeg;
  } finally {
    isLoading = false;
  }
};

export const compressVideo = async (file: File, options: any, onProgress: (p: number) => void) => {
  const ffmpeg = await getFFmpeg();
  const inputName = 'input.mp4';
  const outputName = 'output.mp4';
  
  progressCallback = onProgress;

  await ffmpeg.writeFile(inputName, await fetchFile(file));
  
  const crf = options.quality === 'high' ? '23' : '28';
  console.log('Starting compression...');
  await ffmpeg.exec(['-i', inputName, '-vcodec', 'libx264', '-crf', crf, '-preset', 'veryfast', outputName]);
  
  const data = await ffmpeg.readFile(outputName);
  const blob = new Blob([data as any], { type: 'video/mp4' });
  return new File([blob], file.name.replace(/\.[^/.]+$/, "") + '.mp4', { type: 'video/mp4' });
};

export const convertVideo = async (file: File, targetFormat: string, onProgress: (p: number) => void) => {
  const ffmpeg = await getFFmpeg();
  const inputName = `input_${file.name.replace(/\s+/g, '_')}`;
  const outputName = `output.${targetFormat}`;
  
  progressCallback = onProgress;

  await ffmpeg.writeFile(inputName, await fetchFile(file));
  console.log('Starting conversion...');
  await ffmpeg.exec(['-i', inputName, outputName]);
  
  const data = await ffmpeg.readFile(outputName);
  const type = targetFormat === 'gif' ? 'image/gif' : `video/${targetFormat}`;
  const blob = new Blob([data as any], { type });
  return new File([blob], file.name.replace(/\.[^/.]+$/, "") + `.${targetFormat}`, { type });
};

export const videoToGif = async (file: File, onProgress: (p: number) => void) => {
  const ffmpeg = await getFFmpeg();
  const inputName = `input_${file.name.replace(/\s+/g, '_')}`;
  const outputName = 'output.gif';
  
  progressCallback = onProgress;

  await ffmpeg.writeFile(inputName, await fetchFile(file));
  console.log('Starting GIF conversion...');
  
  await ffmpeg.exec([
    '-i', inputName, 
    '-vf', 'fps=10,scale=320:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse', 
    outputName
  ]);
  
  const data = await ffmpeg.readFile(outputName);
  const blob = new Blob([data as any], { type: 'image/gif' });
  return new File([blob], file.name.replace(/\.[^/.]+$/, "") + '.gif', { type: 'image/gif' });
};

export const imagesToPdf = async (files: File[]) => {
  const pdf = new jsPDF();
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const imgData = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.readAsDataURL(file);
    });
    
    if (i > 0) pdf.addPage();
    const props = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (props.height * pdfWidth) / props.width;
    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
  }
  
  return pdf.output('blob');
};

export const pdfToImages = async (file: File, targetFormat: string, onProgress: (p: number) => void) => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
  const numPages = pdf.numPages;
  const imageFiles: File[] = [];

  for (let i = 1; i <= numPages; i++) {
    onProgress(Math.round((i / numPages) * 100));
    const page = await pdf.getPage(i);
    const scale = 2; // High quality
    const viewport = page.getViewport({ scale });
    
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      await page.render({ canvasContext: ctx, viewport, canvas }).promise;
      const blob = await new Promise<Blob>((resolve) => 
        canvas.toBlob((b) => resolve(b!), `image/${targetFormat === 'jpg' ? 'jpeg' : targetFormat}`)
      );
      imageFiles.push(new File([blob], `page_${i}.${targetFormat}`, { type: `image/${targetFormat}` }));
    }
  }

  return imageFiles;
};

export const extractAudio = async (videoFile: File, targetFormat: string, onProgress: (p: number) => void) => {
  const ffmpeg = await getFFmpeg();
  const inputName = `input_${videoFile.name}`;
  const outputName = `output.${targetFormat}`;

  ffmpeg.on('progress', ({ progress }) => {
    onProgress(Math.round(progress * 100));
  });

  await ffmpeg.writeFile(inputName, await fetchFile(videoFile));
  
  // Basic audio extraction command
  // If target is MP3/AAC, we let FFmpeg transcode
  await ffmpeg.exec(['-i', inputName, '-vn', '-acodec', targetFormat === 'wav' ? 'pcm_s16le' : 'libmp3lame', outputName]);

  const data = await ffmpeg.readFile(outputName);
  const type = `audio/${targetFormat}`;
  const blob = new Blob([data as any], { type });
  return new File([blob], videoFile.name.replace(/\.[^/.]+$/, "") + `.${targetFormat}`, { type });
};

export const docxToHtml = async (file: File) => {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.convertToHtml({ arrayBuffer });
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${file.name}</title>
      <style>
        body { font-family: -apple-system, system-ui, sans-serif; line-height: 1.6; max-width: 800px; margin: 40px auto; padding: 20px; color: #333; }
        img { max-width: 100%; height: auto; }
        table { border-collapse: collapse; width: 100%; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background: #f5f5f5; }
      </style>
    </head>
    <body>
      ${result.value}
    </body>
    </html>
  `;
  return new Blob([html], { type: 'text/html' });
};

export const xlsxToHtml = async (file: File) => {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer);
  let htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: sans-serif; padding: 20px; }
        table { border-collapse: collapse; margin-bottom: 20px; border: 1px solid #ddd; }
        th, td { border: 1px solid #ddd; padding: 8px; font-size: 14px; text-align: left; }
        th { background: #f8fafc; font-weight: bold; }
        .sheet-name { font-weight: bold; font-size: 18px; margin: 20px 0 10px; color: #4f46e5; border-bottom: 2px solid #4f46e5; display: inline-block; }
      </style>
    </head>
    <body>
  `;

  workbook.SheetNames.forEach(name => {
    const sheet = workbook.Sheets[name];
    htmlContent += `<div class="sheet-name">Sheet: ${name}</div>`;
    htmlContent += XLSX.utils.sheet_to_html(sheet);
  });

  htmlContent += `</body></html>`;
  return new Blob([htmlContent], { type: 'text/html' });
};

export const xlsxToCsv = async (file: File) => {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer);
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  const csv = XLSX.utils.sheet_to_csv(worksheet);
  return new Blob([csv], { type: 'text/csv' });
};

export const pdfToHtml = async (file: File) => {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  
  let htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${file.name}</title>
      <style>
        body { font-family: -apple-system, system-ui, sans-serif; line-height: 1.6; max-width: 900px; margin: 0 auto; padding: 40px 20px; color: #1e293b; background: #f8fafc; }
        .page { background: white; margin-bottom: 30px; padding: 50px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); border: 1px solid #e2e8f0; }
        .page-num { color: #64748b; font-size: 12px; font-weight: bold; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.1em; border-bottom: 1px solid #f1f5f9; padding-bottom: 5px; }
        p { margin-bottom: 1em; white-space: pre-wrap; }
        h1, h2, h3 { color: #0f172a; margin-top: 1.5em; }
      </style>
    </head>
    <body>
  `;

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    let lastY = -1;
    let pageHtml = `<div class="page"><div class="page-num">Page ${i}</div>`;
    
    textContent.items.forEach((item: any) => {
      // Grouping logic based on Y coordinates to maintain basic paragraph structure
      if (lastY !== -1 && Math.abs(item.transform[5] - lastY) > 5) {
        pageHtml += `</p><p>`;
      } else if (lastY === -1) {
        pageHtml += `<p>`;
      }
      pageHtml += item.str + " ";
      lastY = item.transform[5];
    });

    pageHtml += `</p></div>`;
    htmlContent += pageHtml;
  }

  htmlContent += `</body></html>`;
  return new Blob([htmlContent], { type: 'text/html' });
};

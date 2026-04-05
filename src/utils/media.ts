import imageCompression from 'browser-image-compression';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

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

const getFFmpeg = async () => {
  if (ffmpeg) return ffmpeg;
  
  ffmpeg = new FFmpeg();
  const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
  });
  return ffmpeg;
};

export const compressVideo = async (file: File, options: any, onProgress: (p: number) => void) => {
  const ffmpeg = await getFFmpeg();
  const inputName = 'input.mp4';
  const outputName = 'output.mp4';
  
  ffmpeg.on('progress', ({ progress }) => {
    onProgress(Math.round(progress * 100));
  });

  await ffmpeg.writeFile(inputName, await fetchFile(file));
  
  // High quality (crf 28 is default, 23 is better, 18 is visually lossless)
  // We use crf 28 for "perceptual losslessness" with size reduction
  // Preset 'veryfast' for browser speed
  const crf = options.quality === 'high' ? '23' : '28';
  
  await ffmpeg.exec(['-i', inputName, '-vcodec', 'libx264', '-crf', crf, '-preset', 'veryfast', outputName]);
  
  const data = await ffmpeg.readFile(outputName);
  const blob = new Blob([data as any], { type: 'video/mp4' });
  return new File([blob], file.name, { type: 'video/mp4' });
};

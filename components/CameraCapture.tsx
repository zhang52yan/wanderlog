
import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Camera, RefreshCw, X, Circle } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (imageData: string) => void;
  onClose: () => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      setError("Unable to access camera. Please check permissions.");
    }
  }, []);

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        onCapture(dataUrl);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-between p-4">
      <div className="w-full flex justify-between items-center text-white">
        <button onClick={onClose} className="p-2 bg-white/10 rounded-full">
          <X size={24} />
        </button>
        <span className="font-medium">Capture Memory</span>
        <div className="w-10"></div>
      </div>

      <div className="relative flex-1 w-full flex items-center justify-center overflow-hidden rounded-2xl bg-zinc-900">
        {error ? (
          <div className="text-white text-center p-6">
            <p>{error}</p>
            <button 
              onClick={startCamera} 
              className="mt-4 px-4 py-2 bg-blue-500 rounded-lg flex items-center gap-2 mx-auto"
            >
              <RefreshCw size={18} /> Retry
            </button>
          </div>
        ) : (
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="h-full w-full object-cover"
          />
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />

      <div className="w-full py-8 flex justify-center items-center gap-12">
        <button 
          onClick={capturePhoto} 
          disabled={!!error}
          className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center transition-transform active:scale-90 disabled:opacity-50"
        >
          <div className="w-16 h-16 bg-white rounded-full"></div>
        </button>
      </div>
    </div>
  );
};

export default CameraCapture;

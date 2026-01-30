import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { AlertCircle, Camera, Loader2, X } from 'lucide-react';

interface ScannerProps {
  onScan: (data: string, format: string) => void;
  onClose: () => void;
}

const Scanner: React.FC<ScannerProps> = ({ onScan, onClose }) => {
  const [error, setError] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerDivId = "reader";

  useEffect(() => {
    let isMounted = true;

    const startScanner = async () => {
      try {
        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length) {
          if (!isMounted) return;
          
          const scanner = new Html5Qrcode(scannerDivId);
          scannerRef.current = scanner;

          await scanner.start(
            { facingMode: "environment" },
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
              aspectRatio: 1.0,
              formatsToSupport: [
                Html5QrcodeSupportedFormats.QR_CODE,
                Html5QrcodeSupportedFormats.EAN_13,
                Html5QrcodeSupportedFormats.EAN_8,
                Html5QrcodeSupportedFormats.UPC_A,
                Html5QrcodeSupportedFormats.UPC_E,
                Html5QrcodeSupportedFormats.CODE_128
              ]
            },
            (decodedText, decodedResult) => {
               // Play a beep sound on success (optional, keeping it simple)
               // Only trigger if we haven't stopped yet
               if (scannerRef.current?.isScanning) {
                 scanner.stop().then(() => {
                    onScan(decodedText, decodedResult.result.format?.formatName || 'UNKNOWN');
                 }).catch(err => console.error("Failed to stop", err));
               }
            },
            (errorMessage) => {
              // ignore frame errors
            }
          );
          setInitializing(false);
        } else {
          setError("No cameras found.");
          setInitializing(false);
        }
      } catch (err) {
        console.error("Error starting scanner", err);
        setError("Camera permission denied or not available.");
        setInitializing(false);
      }
    };

    startScanner();

    return () => {
      isMounted = false;
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch((e) => console.error("Failed to stop scanner on unmount", e));
        scannerRef.current.clear();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10 bg-gradient-to-b from-black/80 to-transparent">
        <h2 className="text-white font-semibold text-lg flex items-center gap-2">
          <Camera className="w-5 h-5 text-blue-400" />
          Scan Code
        </h2>
        <button 
          onClick={onClose}
          className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
        >
          <X className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Scanner Viewport */}
      <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-black">
        <div id={scannerDivId} className="w-full h-full object-cover"></div>
        
        {/* Overlay Guide */}
        {!initializing && !error && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-64 h-64 border-2 border-blue-500 rounded-lg relative bg-transparent shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]">
               <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-blue-400 -mt-1 -ml-1"></div>
               <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-blue-400 -mt-1 -mr-1"></div>
               <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-blue-400 -mb-1 -ml-1"></div>
               <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-blue-400 -mb-1 -mr-1"></div>
               
               {/* Scanning Line Animation */}
               <div className="absolute left-0 right-0 h-0.5 bg-blue-500/80 shadow-[0_0_8px_rgba(59,130,246,0.8)] animate-[scan_2s_ease-in-out_infinite] top-0"></div>
            </div>
            <p className="absolute bottom-20 text-white/80 text-sm font-medium bg-black/40 px-4 py-2 rounded-full">
              Align code within the frame
            </p>
          </div>
        )}

        {/* Loading State */}
        {initializing && (
          <div className="absolute flex flex-col items-center justify-center gap-4 text-white">
            <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
            <p>Starting Camera...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="absolute px-8 text-center flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <p className="text-white text-lg font-medium">{error}</p>
            <button 
              onClick={onClose}
              className="mt-4 px-6 py-2 bg-white text-black font-semibold rounded-full"
            >
              Go Back
            </button>
          </div>
        )}
      </div>
      
      <style>{`
        @keyframes scan {
          0%, 100% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default Scanner;

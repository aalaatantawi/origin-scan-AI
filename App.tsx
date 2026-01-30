import React, { useState, useCallback } from 'react';
import Scanner from './components/Scanner';
import ResultCard from './components/ResultCard';
import { ScanResult } from './types';
import { getCountryFromBarcode } from './utils/gs1Data';
import { analyzeScan } from './services/geminiService';
import { ScanBarcode, History, ChevronRight, Globe2, PackageSearch } from 'lucide-react';

const App: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [currentResult, setCurrentResult] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<ScanResult[]>([]);

  const handleScan = useCallback(async (data: string, format: string) => {
    setIsScanning(false);
    
    // 1. Initial local lookup (instant feedback)
    const gs1Info = getCountryFromBarcode(data);
    
    const newResult: ScanResult = {
      raw: data,
      format,
      timestamp: Date.now(),
      gs1Country: gs1Info,
    };
    
    setCurrentResult(newResult);
    setLoading(true);

    // 2. AI Analysis (Async)
    const aiData = await analyzeScan(data, format);
    
    const finalResult = {
      ...newResult,
      aiAnalysis: aiData
    };

    setCurrentResult(finalResult);
    setLoading(false);
    setHistory(prev => [finalResult, ...prev].slice(0, 50)); // Keep last 50
  }, []);

  const openHistoryItem = (item: ScanResult) => {
    setCurrentResult(item);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col max-w-lg mx-auto shadow-2xl overflow-hidden relative">
      
      {/* Top Bar */}
      <header className="p-6 pt-8 bg-slate-900/80 backdrop-blur-md sticky top-0 z-20 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-500/20">
            <Globe2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              OriginScan AI
            </h1>
            <p className="text-xs text-slate-400 font-medium tracking-wide">COUNTRY IDENTIFIER</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 flex flex-col gap-8 relative z-10">
        
        {/* Hero / Call to Action */}
        <div className="bg-gradient-to-br from-indigo-900/40 to-blue-900/40 border border-indigo-500/20 rounded-2xl p-6 text-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
               <ScanBarcode className="w-8 h-8 text-blue-400" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Identify Any Product</h2>
            <p className="text-slate-300 text-sm mb-6 max-w-[260px]">
              Scan a barcode or QR code to reveal its true country of origin and details.
            </p>
            <button
              onClick={() => setIsScanning(true)}
              className="px-8 py-3 bg-white text-slate-900 font-bold rounded-full hover:bg-blue-50 transition-all active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.2)] flex items-center gap-2"
            >
              <ScanBarcode className="w-5 h-5" />
              Start Scanning
            </button>
          </div>
        </div>

        {/* History List */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
             <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
               <History className="w-4 h-4" /> Recent Scans
             </h3>
             <span className="text-xs text-slate-600 bg-slate-900 px-2 py-1 rounded-md">{history.length}</span>
          </div>
          
          {history.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-slate-800 rounded-xl">
              <PackageSearch className="w-10 h-10 text-slate-700 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">No scans yet.</p>
            </div>
          ) : (
            <div className="space-y-3 pb-20">
              {history.map((item, idx) => (
                <button
                  key={`${item.timestamp}-${idx}`}
                  onClick={() => openHistoryItem(item)}
                  className="w-full bg-slate-900/50 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-xl p-4 flex items-center justify-between transition-all group"
                >
                  <div className="flex items-center gap-4 text-left">
                    <div className="text-2xl bg-slate-950 w-12 h-12 rounded-lg flex items-center justify-center border border-slate-800 shadow-inner">
                      {item.aiAnalysis?.countryCode ? (
                          // Convert code to flag emoji
                          item.aiAnalysis.countryCode.toUpperCase().replace(/./g, char => String.fromCodePoint(char.charCodeAt(0) + 127397))
                      ) : (
                          item.gs1Country?.flag || '📦'
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-200 line-clamp-1">
                        {item.aiAnalysis?.productName || item.gs1Country?.name || "Unknown Item"}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="font-mono bg-slate-950 px-1.5 py-0.5 rounded text-slate-400">{item.raw.substring(0, 15)}{item.raw.length > 15 ? '...' : ''}</span>
                        <span>• {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-blue-400 transition-colors" />
                </button>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Overlay Components */}
      {isScanning && (
        <Scanner 
          onScan={handleScan} 
          onClose={() => setIsScanning(false)} 
        />
      )}

      {currentResult && (
        <ResultCard 
          result={currentResult} 
          loading={loading} 
          onClose={() => setCurrentResult(null)} 
        />
      )}
    </div>
  );
};

export default App;

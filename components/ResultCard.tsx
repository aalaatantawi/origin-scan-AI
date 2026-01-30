import React from 'react';
import { ScanResult } from '../types';
import { Loader2, Globe, Box, Info, CheckCircle2, AlertTriangle, ScanLine } from 'lucide-react';

interface ResultCardProps {
  result: ScanResult;
  loading: boolean;
  onClose: () => void;
}

const ResultCard: React.FC<ResultCardProps> = ({ result, loading, onClose }) => {
  const { aiAnalysis, gs1Country, raw } = result;

  // Determine which country to show (AI overrides GS1 usually for specifics, but GS1 is ground truth for registration)
  const displayCountry = aiAnalysis?.countryOfOrigin || gs1Country?.name || 'Unknown Origin';
  const displayFlag = aiAnalysis?.countryCode 
    ? getFlagEmoji(aiAnalysis.countryCode) 
    : gs1Country?.flag || '🌍';
  
  // Helper to get flag from ISO code if AI returns just code
  function getFlagEmoji(countryCode: string) {
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char =>  127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  }

  return (
    <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-slate-900 w-full max-w-md rounded-t-2xl sm:rounded-2xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-800 flex justify-between items-start">
            <div>
              <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-1 flex items-center gap-2">
                 <ScanLine className="w-4 h-4" /> Scanned Content
              </h3>
              <p className="text-white font-mono text-lg truncate max-w-[250px]">{raw}</p>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                <span className="sr-only">Close</span>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {loading ? (
             <div className="flex flex-col items-center justify-center py-12 text-center">
               <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
               <h3 className="text-xl font-semibold text-white mb-2">Analyzing Origin...</h3>
               <p className="text-slate-400">Consulting global databases & AI</p>
             </div>
          ) : (
             <div className="space-y-6">
               {/* Main Country Badge */}
               <div className="bg-gradient-to-br from-blue-900/40 to-slate-800/40 border border-blue-500/30 rounded-xl p-6 text-center relative overflow-hidden">
                 <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-blue-500/20 blur-3xl rounded-full"></div>
                 <span className="text-6xl mb-4 block animate-[bounce_1s_ease-out_1]">{displayFlag}</span>
                 <h2 className="text-2xl font-bold text-white mb-1">{displayCountry}</h2>
                 <p className="text-blue-200/70 text-sm font-medium">Likely Country of Origin</p>
               </div>

               {/* Details Grid */}
               <div className="grid grid-cols-1 gap-4">
                  {/* Product Name */}
                  <div className="bg-slate-800/50 rounded-lg p-4 flex items-start gap-3">
                    <Box className="w-5 h-5 text-purple-400 mt-1 shrink-0" />
                    <div>
                      <h4 className="text-slate-400 text-xs font-bold uppercase mb-1">Product / Entity</h4>
                      <p className="text-slate-200 font-medium">{aiAnalysis?.productName || "Unknown Product"}</p>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="bg-slate-800/50 rounded-lg p-4 flex items-start gap-3">
                    <Info className="w-5 h-5 text-emerald-400 mt-1 shrink-0" />
                    <div>
                      <h4 className="text-slate-400 text-xs font-bold uppercase mb-1">Details</h4>
                      <p className="text-slate-300 text-sm leading-relaxed">
                        {aiAnalysis?.description || "No detailed description available."}
                      </p>
                    </div>
                  </div>

                  {/* GS1 vs AI Confidence */}
                  {gs1Country && (
                    <div className="bg-slate-800/50 rounded-lg p-4 flex items-start gap-3">
                      <Globe className="w-5 h-5 text-cyan-400 mt-1 shrink-0" />
                      <div>
                         <h4 className="text-slate-400 text-xs font-bold uppercase mb-1">Registration</h4>
                         <p className="text-slate-300 text-sm">
                           Barcode registered in <span className="text-white font-semibold">{gs1Country.name}</span> {gs1Country.flag}.
                         </p>
                      </div>
                    </div>
                  )}
                  
                  {/* Confidence Indicator */}
                  <div className="flex items-center gap-2 mt-2 justify-center">
                     {aiAnalysis?.confidence === 'high' ? (
                       <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-medium">
                         <CheckCircle2 className="w-3.5 h-3.5" /> High Confidence
                       </span>
                     ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-400 text-xs font-medium">
                          <AlertTriangle className="w-3.5 h-3.5" /> Medium/Low Confidence
                        </span>
                     )}
                  </div>
               </div>
             </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
          <button 
            onClick={onClose}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-900/20"
          >
            Scan Next
          </button>
        </div>

      </div>
    </div>
  );
};

export default ResultCard;

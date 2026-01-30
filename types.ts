export interface ScanResult {
  raw: string;
  format: string;
  timestamp: number;
  aiAnalysis?: AIAnalysisResult;
  gs1Country?: {
    name: string;
    code: string; // ISO 2-letter
    flag: string;
  };
}

export interface AIAnalysisResult {
  productName: string;
  countryOfOrigin: string;
  countryCode: string; // ISO 2-letter
  confidence: 'high' | 'medium' | 'low';
  description: string;
  isProduct: boolean;
}

export interface CountryPrefix {
  prefix: string; // e.g., "000-019" or "471"
  name: string;
  code: string;
  flag: string;
}

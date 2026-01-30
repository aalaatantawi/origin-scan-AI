import { GoogleGenAI, Type } from "@google/genai";
import { AIAnalysisResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeScan = async (scanData: string, format: string): Promise<AIAnalysisResult> => {
  try {
    const prompt = `
      I scanned a code. The content is: "${scanData}". The format is: "${format}".
      
      1. If it's a barcode (EAN, UPC), identify the likely product name, brand, and origin based on standard databases or general knowledge.
      2. If it's a URL or text (QR), analyze the content to determine if it refers to a product, company, or entity and infer the country of origin.
      3. Determine the confidence level of the origin.
      4. Provide a short description (max 20 words).
      
      Output JSON strictly.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            productName: { type: Type.STRING },
            countryOfOrigin: { type: Type.STRING },
            countryCode: { type: Type.STRING, description: "ISO 3166-1 alpha-2 code, e.g., US, JP, CN" },
            confidence: { type: Type.STRING, enum: ["high", "medium", "low"] },
            description: { type: Type.STRING },
            isProduct: { type: Type.BOOLEAN },
          },
          required: ["productName", "countryOfOrigin", "countryCode", "confidence", "description", "isProduct"],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");
    
    return JSON.parse(text) as AIAnalysisResult;

  } catch (error) {
    console.error("Gemini analysis failed:", error);
    return {
      productName: "Unknown Item",
      countryOfOrigin: "Unknown",
      countryCode: "XX",
      confidence: "low",
      description: "Could not analyze this code with AI.",
      isProduct: false,
    };
  }
};

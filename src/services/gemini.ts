import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.GEMINI_API_KEY || "";

export type AnalysisType = 'pros-cons' | 'comparison' | 'swot';

export async function generateAnalysis(decision: string, type: AnalysisType) {
  if (!API_KEY) {
    throw new Error("Gemini API key is missing. Please configure it in the AI Studio settings.");
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  let prompt = "";
  const audienceContext = "The target audience is someone's aunt, so use a warm, helpful, and clear tone. Avoid overly technical jargon. Focus on practical advice and clarity.";

  switch (type) {
    case 'pros-cons':
      prompt = `${audienceContext} Provide a detailed pros and cons list for the following decision: "${decision}". Format the response in Markdown with clear headings for Pros and Cons. Use bullet points. Include a brief, encouraging summary at the end.`;
      break;
    case 'comparison':
      prompt = `${audienceContext} Create a comparison table for the options involved in this decision: "${decision}". 
      
      IMPORTANT TABLE STRUCTURE:
      - Put the OPTIONS as columns (headers).
      - Put the SPECS/FEATURES as rows (first column).
      - This allows for easy side-by-side comparison.
      
      COLOR INDICATORS:
      For any rating or level (like cost, effort, risk, or impact), use these exact markers:
      - Use (L) for Low
      - Use (M) for Medium
      - Use (H) for High
      
      Format the response in Markdown using a table structure. Include a brief, warm summary at the end.`;
      break;
    case 'swot':
      prompt = `${audienceContext} Perform a SWOT analysis (Strengths, Weaknesses, Opportunities, Threats) for the following decision: "${decision}". 
      
      COLOR INDICATORS:
      For any rating or level, use these exact markers:
      - Use (L) for Low
      - Use (M) for Medium
      - Use (H) for High
      
      Format the response in Markdown with clear headings for each section. Include a brief, supportive summary at the end.`;
      break;
  }

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      temperature: 0.7,
    }
  });

  return response.text;
}


import { GoogleGenAI } from "@google/genai";

export const getTopicExplanation = async (subject: string, chapter: string, topic: string) => {
  // Always create instance inside the call to ensure latest API key context
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{
        parts: [{
          text: `You are AKI, an expert tutor for the HSC (Higher Secondary Certificate) exams. 
          The student is asking about:
          Subject: ${subject}
          Chapter: ${chapter}
          Topic: ${topic}
          
          Please provide:
          1. A clear, concise explanation of the topic.
          2. Key formulas or definitions. 
          
          CRITICAL INSTRUCTIONS FOR MATHEMATICS:
          - USE ONLY Unicode symbols (e.g., Δ, λ, ε₀, ħ, →, ∞, ±, √, ∑) and proper superscripts/subscripts (x², H₂O).
          - ABSOLUTELY FORBIDDEN: Do not use dollar signs ($) or double dollar signs ($$) as delimiters for math. 
          - The device cannot render LaTeX symbols inside dollar signs. If you use them, the answer will be broken.
          - Write formulas in plain text or using Markdown bold/italics.
          
          Structure:
          - Use standard Markdown headings (###).
          - Include "Common Mistake" and "Practice Tip" sections.
          - Use professional, academic, yet encouraging language.`
        }]
      }],
      config: {
        temperature: 0.2,
        topP: 0.8,
      }
    });

    const text = response.text || '';
    
    // Cleanup any lingering LaTeX symbols or delimiters that the model might leak
    return text
      .replace(/\$\$([\s\S]*?)\$\$/g, '$1')
      .replace(/\$([\s\S]*?)\$/g, '$1')
      .replace(/\\\[([\s\S]*?)\\\]/g, '$1')
      .replace(/\\\(([\s\S]*?)\\\)/g, '$1')
      .trim();
  } catch (error) {
    console.error('AKI API Error:', error);
    return "AKI is temporarily unavailable. This might be due to a network error or API limits. Please try again in a moment.";
  }
};

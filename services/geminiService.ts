
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const enhanceMemoryAndGetWeather = async (
  text: string, 
  location: string, 
  imageData?: string
): Promise<{ enhancement: string, weather: { temp: string, condition: string, icon: string } }> => {
  try {
    const prompt = `
      Act as a poetic travel companion and a local weather expert.
      Task 1: Enhance this travel memory: "${text}". Make it evocative and short (max 2 sentences).
      Task 2: Based on the location "${location}", search for current weather if possible or provide a realistic atmospheric description.
      
      Return the result in JSON format with the following structure:
      {
        "enhancement": "poetic string",
        "weather": {
          "temp": "e.g. 24°C",
          "condition": "e.g. Sunny",
          "icon": "e.g. ☀️"
        }
      }
    `;

    const parts: any[] = [{ text: prompt }];
    if (imageData) {
      const base64Data = imageData.split(',')[1];
      parts.push({
        inlineData: { mimeType: 'image/jpeg', data: base64Data }
      });
    }

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts },
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
      }
    });

    const result = JSON.parse(response.text || "{}");
    return {
      enhancement: result.enhancement || "A beautiful moment captured.",
      weather: result.weather || { temp: "--", condition: "Unknown", icon: "☁️" }
    };
  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      enhancement: "Captured in the journey.",
      weather: { temp: "--", condition: "Atmospheric", icon: "🌍" }
    };
  }
};

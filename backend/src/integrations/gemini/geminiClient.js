import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

const genai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export const generateContent = async (systemPrompt, userMessage) => {
  try {
    const response = await genai.models.generateContent({
      model: "gemini-2.0-flash",
      config: {
        systemInstruction: systemPrompt,
      },
      contents: [
        {
          role: "user",
          parts: [{ text: userMessage }],
        },
      ],
    });

    const text = response.text;
    if (!text) {
      console.error("Gemini returned empty response:", JSON.stringify(response));
      throw new Error("La IA devolvió una respuesta vacía");
    }

    return text;
  } catch (error) {
    console.error("Gemini API error:", error.message || error);

    if (error.message?.includes("API key")) {
      const err = new Error("La API key de Gemini no es válida. Verificá la variable GEMINI_API_KEY en .env");
      err.statusCode = 500;
      throw err;
    }

    const err = new Error("Error al comunicarse con la IA");
    err.statusCode = 500;
    throw err;
  }
};

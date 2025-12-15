import { GoogleGenAI } from "@google/genai";

// Initialize Gemini
// Note: In a real environment, this API key should be injected securely.
// We are using the process.env pattern as requested.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const GeminiService = {
  generatePythonClient: async (tokenName: string, scopes: string[]): Promise<string> => {
    if (!process.env.API_KEY) {
      return "# API Key missing. Please configure process.env.API_KEY to use AI features.\n\nimport requests\n...";
    }

    try {
      const prompt = `
        Write a Python script using the 'requests' library to interact with an API.
        The user has created a token named "${tokenName}" with scopes: ${scopes.join(', ')}.
        
        Requirements:
        1. Define a class 'NexusClient'.
        2. It should take the API Token in __init__.
        3. Include methods corresponding to the scopes (e.g., if 'read', add 'get_data'; if 'write', add 'create_data').
        4. Use a placeholder URL 'https://api.nexus-backend.com'.
        5. Include usage example at the bottom.
        6. Keep it concise and professional.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      return response.text || "Failed to generate code.";
    } catch (error) {
      console.error("Gemini Error:", error);
      return "# Error generating code. Please try again.";
    }
  }
};

import { GoogleGenAI } from "@google/genai";
import type { Product, Sale } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY environment variable not set. AI features will not work.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const getSalesInsights = async (query: string, products: Product[], sales: Sale[]): Promise<string> => {
  if (!API_KEY) {
    return "Gemini API key is not configured. Please set the API_KEY environment variable.";
  }

  const model = "gemini-2.5-flash";
  
  const productDataForAI = products.map(({ id, name, category, price }) => ({ id, name, category, price }));

  const prompt = `
    System Instruction: You are an expert data analyst for a restaurant named Zamzama. Your task is to answer questions about sales and inventory based ONLY on the JSON data provided below. Do not invent any information. If the data is insufficient to answer the question, state that clearly. Provide concise, clear answers, and if you are providing a list, format it nicely. The current date is ${new Date().toLocaleDateString()}.

    User Question: "${query}"

    Here is the data you MUST use:

    Products Data (describes all available products):
    ${JSON.stringify(productDataForAI, null, 2)}

    Sales Data (describes all transactions, including items sold, quantities, and timestamps in ISO 8601 format):
    ${JSON.stringify(sales, null, 2)}

    Based on the data above, please answer the user's question.
  `;

  try {
    const response = await ai.models.generateContent({
        model: model,
        contents: prompt
    });
    return response.text;
  } catch (error) {
    console.error("Error fetching from Gemini API:", error);
    if (error instanceof Error) {
        return `An error occurred while analyzing the data: ${error.message}`;
    }
    return "An unknown error occurred while analyzing the data.";
  }
};
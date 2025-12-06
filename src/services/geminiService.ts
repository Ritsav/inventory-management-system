import { GoogleGenAI } from "@google/genai";
import type { InventoryItem } from "../types";

const SYSTEM_INSTRUCTION = `
You are an expert Inventory Management AI Consultant. 
Your goal is to analyze inventory data and provide actionable strategic advice.
Focus on:
1. Identifying low stock items that need urgent restocking.
2. Spotting overstocked items or dead stock.
3. Suggesting sales or bundle opportunities based on categories.
4. Forecasting potential issues based on item types (e.g., perishables or tech obsolescence).

Output your response in clear, formatted Markdown. Be concise but professional.
`;

export const getInventoryInsights = async (inventory: InventoryItem[]) => {
  try {
    // Only send relevant fields to save tokens
    const simplifiedInventory = inventory.map(item => ({
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      price: item.price,
      minStock: item.minStockLevel,
      value: item.price * item.quantity
    }));

    const inventoryStr = JSON.stringify(simplifiedInventory, null, 2);
    
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = ai.models.generateContent;

    const response = await model({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
      contents: [
        {
          role: 'user',
          parts: [
            { text: "Here is my current inventory data:" },
            { text: inventoryStr },
            { text: "Please provide a future planning report with specific sections for: 1. Restock Alerts, 2. Financial Analysis, 3. Strategic Recommendations." }
          ]
        }
      ]
    });

    return response.text;
  } catch (error) {
    console.error("Error fetching Gemini insights:", error);
    throw new Error("Failed to generate insights. Please check your API key or try again later.");
  }
};
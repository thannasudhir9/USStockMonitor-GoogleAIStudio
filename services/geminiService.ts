import { GoogleGenAI, Type } from "@google/genai";
import { StockData, ConversionRates } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const stockDataSchema = {
    type: Type.OBJECT,
    properties: {
        symbol: { type: Type.STRING, description: "Stock ticker symbol" },
        name: { type: Type.STRING, description: "Company name" },
        price: { type: Type.NUMBER, description: "Current stock price in USD" },
        change1w: { type: Type.NUMBER, description: "Percentage change over 1 week" },
        change1m: { type: Type.NUMBER, description: "Percentage change over 1 month" },
        change3m: { type: Type.NUMBER, description: "Percentage change over 3 months" },
        change6m: { type: Type.NUMBER, description: "Percentage change over 6 months" },
        change1y: { type: Type.NUMBER, description: "Percentage change over 1 year" },
        lastTradeDate: { type: Type.STRING, description: "The date of the last available price, in YYYY-MM-DD format."}
    },
     required: ['symbol', 'name', 'price', 'change1w', 'change1m', 'change3m', 'change6m', 'change1y', 'lastTradeDate'],
};

export async function fetchHighGrowthStocks(count: number = 25): Promise<StockData[]> {
    const prompt = `
        Using the latest available data, generate a list of exactly ${count} US stocks whose value has increased by more than 50% in the last 6 months.
        For each stock, provide the following information:
        - Stock ticker symbol
        - Company name
        - Current stock price in USD
        - The date of the last available price (in YYYY-MM-DD format)
        - Percentage change for 1 week, 1 month, 3 months, 6 months, and 1 year.
        Return the data sorted by the 6-month percentage change in descending order.
    `;
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: stockDataSchema,
                },
            },
        });
        
        const jsonText = response.text;
        const data = JSON.parse(jsonText);
        
        if (!Array.isArray(data)) {
            throw new Error("API did not return an array of stocks.");
        }

        return data as StockData[];

    } catch (error) {
        console.error("Error fetching stock data from Gemini API:", error);
        throw new Error("Failed to fetch stock data. The API may be unavailable or the request failed. Please try again later.");
    }
}

export async function fetchConversionRates(): Promise<Omit<ConversionRates, 'USD'>> {
    const prompt = "Provide the latest currency conversion rates for 1 USD to EUR and 1 USD to INR. Respond in JSON format with keys 'EUR' and 'INR'.";
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        EUR: { type: Type.NUMBER },
                        INR: { type: Type.NUMBER },
                    },
                    required: ['EUR', 'INR'],
                }
            }
        });
        const jsonText = response.text;
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error fetching conversion rates:", error);
        // Provide fallback rates in case of API failure to avoid crashing the app
        return { EUR: 0.93, INR: 83.50 };
    }
}

export async function fetchHistoricalPrice(symbol: string, date: string): Promise<{price: number} | null> {
    const prompt = `What was the closing price of the stock with symbol ${symbol} on the date ${date}? Respond in JSON format with a single key "price". If the market was closed or the data is unavailable, return null for the price.`;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        price: { 
                            type: Type.NUMBER,
                            nullable: true,
                        },
                    },
                    required: ['price'],
                }
            }
        });
        const jsonText = response.text;
        const data = JSON.parse(jsonText);
        if(data && typeof data.price === 'number') {
            return { price: data.price };
        }
        return null;

    } catch (error) {
        console.error(`Error fetching historical price for ${symbol}:`, error);
        return null;
    }
}

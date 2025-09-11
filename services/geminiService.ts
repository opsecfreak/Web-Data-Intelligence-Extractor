import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { ScrapedData, ScrapeOptions } from '../types';
import { validateScrapedData } from '../utils/validation';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    products: {
      type: Type.ARRAY,
      description: "A list of products found on the site.",
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "The full name of the product." },
          price: { type: Type.STRING, description: "The price of the product, formatted as a string (e.g., '$99.99')." },
          partNumber: { type: Type.STRING, description: "The manufacturer part number or SKU." },
          description: { type: Type.STRING, description: "A brief description of the product." },
          url: { type: Type.STRING, description: "The direct URL to the product page." },
          mentions: {
            type: Type.ARRAY,
            description: "A list of forum threads mentioning this product.",
            items: {
              type: Type.OBJECT,
              properties: {
                threadTitle: { type: Type.STRING, description: "The title of the forum thread." },
                summary: { type: Type.STRING, description: "A brief summary of the user experience or compatibility information discussed." },
                url: { type: Type.STRING, description: "The URL to the forum thread." }
              }
            }
          }
        }
      }
    },
    qaItems: {
      type: Type.ARRAY,
      description: "A list of question and answer pairs from the forums.",
      items: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING, description: "The main question asked in the forum thread." },
          answerSummary: { type: Type.STRING, description: "A summary of the most helpful answer or resolution." },
          threadUrl: { type: Type.STRING, description: "The URL to the forum thread." },
          relatedProducts: {
            type: Type.ARRAY,
            description: "A list of product names or part numbers discussed in the thread.",
            items: { type: Type.STRING }
          }
        }
      }
    }
  }
};

const buildPrompt = (url: string, options: ScrapeOptions): string => {
  let prompt = `
    Act as an expert data scraper and analyst. I need you to virtually 'scrape' the website at the following URL: ${url}.
    Your task is to perform a deep crawl of the entire site, including product pages, shop sections, and any forums.

    Your Goal: Extract, analyze, and structure the following information:
    1.  **Product Data:** From any shop or product listing pages, identify individual products. For each, extract:
        - Product Name
        - Price
        - Part Number or SKU
        - A brief description
        - The direct URL to the product page.
    2.  **Forum Q&A Data:** From any forum sections, identify discussion threads. For each thread, extract:
        - The primary question being asked.
        - A concise summary of the most helpful answer or the general consensus.
        - The URL to the thread.
        - A list of any specific products (by name or part number) mentioned.
    3.  **Cross-Reference Data:** This is the most critical step. For each product you identify, search the forum data for any mentions of it. If you find mentions, create a summary of the context (e.g., "Users report this part is compatible with Drone Model X," or "Common issue with this module is a faulty connection."). Link this summary to the corresponding product.

    Rules for Extraction:
    - Ignore junk information: advertisements, navigation menus, footers, sidebars, and irrelevant boilerplate text.
    - Focus only on the main content related to products and forum discussions.
    - If a price or part number is not available, leave the field as an empty string.
    - Synthesize information. The answer summary should be a concise distillation of the discussion, not a direct copy-paste.
  `;

  // Add optional constraints to the prompt
  if (options.topic) {
    prompt += `\n- **IMPORTANT**: Focus your scraping and analysis specifically on content related to the following topic/keywords: "${options.topic}". Prioritize pages and threads that match this topic.\n`;
  }
  if (options.crawlDepth) {
    prompt += `- Limit your crawl to a depth of ${options.crawlDepth} pages from the starting URL. A depth of 1 means only the initial page and pages it links to directly.\n`;
  }
  if (options.maxResults) {
    prompt += `- Limit your output to approximately ${options.maxResults} of the most relevant products and ${options.maxResults} of the most relevant Q&A items.\n`;
  }

  prompt += "\nReturn the final, cross-referenced data in the specified JSON format.";
  return prompt;
};


export const scrapeAndAnalyzeWebsite = async (url: string, options: ScrapeOptions): Promise<ScrapedData> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
  }

  const prompt = buildPrompt(url, options);

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });
    
    const jsonString = response.text.trim();
    // It is possible Gemini returns a markdown code block ```json ... ```
    const cleanedJsonString = jsonString.replace(/^```json\s*|```$/g, '');
    const parsedData = JSON.parse(cleanedJsonString);
    
    // Validate the data structure before returning
    return validateScrapedData(parsedData);

  } catch (error) {
    console.error("Error during scraping and analysis:", error);
    if (error instanceof Error && error.message.includes('validation failed')) {
         throw new Error(`Data validation failed: The AI returned data in an unexpected format. ${error.message}`);
    }
    throw new Error("Failed to scrape and analyze website. The AI model might have had trouble processing the URL or the returned data was malformed.");
  }
};

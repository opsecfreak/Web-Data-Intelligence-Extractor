import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { ScrapedData, ScrapeOptions, DataSources } from '../types';
import { validateScrapedData } from '../utils/validation';

// FIX: Per coding guidelines, API key must be read from process.env.API_KEY. This also resolves the TypeScript error on import.meta.env.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    products: {
      type: Type.ARRAY,
      description: "A list of products found on the product data source sites.",
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "The full name of the product or part." },
          price: { type: Type.STRING, description: "The price of the product, formatted as a string (e.g., '$99.99')." },
          partNumber: { type: Type.STRING, description: "The manufacturer part number, SKU, or other unique identifier. This is a critical field." },
          description: { type: Type.STRING, description: "A brief description of the product." },
          url: { type: Type.STRING, description: "The direct URL to the product page." },
          mentions: {
            type: Type.ARRAY,
            description: "A list of forum threads from the forum data source sites mentioning this product.",
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
      description: "A list of question and answer pairs from the forum data source sites.",
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

const buildPrompt = (options: ScrapeOptions): string => {
    const { sources, topic, crawlDepth, maxResults } = options;
    
    const urlsList = sources.urls.length > 0 ? sources.urls.map(url => `- ${url}`).join('\n') : 'None provided.';

    let prompt = `
    Act as an expert data scraper and analyst. I need you to perform a targeted analysis of the websites provided in the Data Sources list.

    **Data Sources:**
    ${urlsList}

    Your task is to follow this three-step process:

    1.  **Analyze All Sources:** First, deeply crawl all the "Data Sources" URLs.

    2.  **Extract Key Information:** As you crawl, your goal is to identify and extract two distinct types of information from any of the sites:
        -   **Product/Part Data:** Look for e-commerce pages, product listings, or parts catalogs. For each individual product or part you find, extract:
            - Product/Part Name
            - Price
            - Part Number (or SKU, Manufacturer Part Number, etc.). This is a critical field. If a page lists multiple parts, extract each one as a separate product entry.
            - A brief description
            - The direct URL to the product page.
        -   **Q&A/Discussion Data:** Look for forum threads, community Q&A sections, or support pages. For each relevant discussion you find, extract:
            - The primary question being asked.
            - A concise summary of the most helpful answer or the general consensus.
            - The URL to the thread.
            - A list of any specific products (by name or part number) mentioned.

    3.  **Cross-Reference Data (CRITICAL STEP):** Finally, for each product you identified, search through all the discussion data you gathered for any mentions of it (by name or part number). If you find mentions, create a summary of the context (e.g., "Users report this part is compatible with Drone Model X," or "Common issue with this module is a faulty connection."). Link this summary and the source thread URL to the corresponding product.

    **Rules for Extraction:**
    - Scour for both product and Q&A data from ALL provided URLs. A single URL might contain both.
    - Ignore junk information: advertisements, navigation menus, footers, sidebars, and irrelevant boilerplate text.
    - Focus only on the main content related to products and forum discussions.
    - If a price or part number is not available for a product, leave the field as an empty string.
    - Synthesize information. The answer summary should be a concise distillation of the discussion, not a direct copy-paste.
  `;

  // Add optional constraints to the prompt
  if (topic) {
    prompt += `\n- **IMPORTANT**: Focus your scraping and analysis specifically on content related to the following topic/keywords: "${topic}". Prioritize pages and threads that match this topic.\n`;
  }
  if (crawlDepth) {
    prompt += `- Limit your crawl to a depth of ${crawlDepth} pages from each starting URL. A depth of 1 means only the initial page and pages it links to directly.\n`;
  }
  if (maxResults) {
    prompt += `- Limit your output to approximately ${maxResults} of the most relevant products and ${maxResults} of the most relevant Q&A items.\n`;
  }

  prompt += "\nReturn the final, cross-referenced data in the specified JSON format.";
  return prompt;
};


export const scrapeAndAnalyzeWebsite = async (options: ScrapeOptions): Promise<ScrapedData> => {
  // FIX: Check for process.env.API_KEY as per coding guidelines.
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
  }

  const prompt = buildPrompt(options);

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
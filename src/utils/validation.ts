import { ScrapedData, Product, QAItem, ForumMention } from '../types';

// Helper to check if a value is a string, and optionally non-empty
const isString = (value: any): value is string => typeof value === 'string';

// Helper to check if a value is an array
const isArray = (value: any): value is any[] => Array.isArray(value);

const validateForumMention = (mention: any): ForumMention => {
  if (!mention || typeof mention !== 'object') {
    throw new Error('Mention item is not a valid object.');
  }
  if (!isString(mention.threadTitle)) {
    throw new Error('Mention validation failed: threadTitle must be a string.');
  }
  if (!isString(mention.summary)) {
    throw new Error('Mention validation failed: summary must be a string.');
  }
  if (!isString(mention.url)) {
    throw new Error('Mention validation failed: url must be a string.');
  }
  return {
    threadTitle: mention.threadTitle,
    summary: mention.summary,
    url: mention.url,
  };
};

const validateProduct = (product: any): Product => {
  if (!product || typeof product !== 'object') {
    throw new Error('Product item is not a valid object.');
  }
  if (!isString(product.name)) {
    throw new Error('Product validation failed: name must be a string.');
  }
   if (!isString(product.price)) {
    throw new Error('Product validation failed: price must be a string.');
  }
   if (!isString(product.partNumber)) {
    throw new Error('Product validation failed: partNumber must be a string.');
  }
   if (!isString(product.description)) {
    throw new Error('Product validation failed: description must be a string.');
  }
   if (!isString(product.url)) {
    throw new Error('Product validation failed: url must be a string.');
  }
  if (!isArray(product.mentions)) {
    throw new Error('Product validation failed: mentions must be an array.');
  }
  return {
    name: product.name,
    price: product.price,
    partNumber: product.partNumber,
    description: product.description,
    url: product.url,
    mentions: product.mentions.map(validateForumMention),
  };
};

const validateQAItem = (qaItem: any): QAItem => {
  if (!qaItem || typeof qaItem !== 'object') {
    throw new Error('QA item is not a valid object.');
  }
  if (!isString(qaItem.question)) {
    throw new Error('QA validation failed: question must be a string.');
  }
  if (!isString(qaItem.answerSummary)) {
    throw new Error('QA validation failed: answerSummary must be a string.');
  }
  if (!isString(qaItem.threadUrl)) {
    throw new Error('QA validation failed: threadUrl must be a string.');
  }
  if (!isArray(qaItem.relatedProducts)) {
    throw new Error('QA validation failed: relatedProducts must be an array.');
  }
  if (!qaItem.relatedProducts.every(isString)) {
     throw new Error('QA validation failed: all relatedProducts must be strings.');
  }
  return {
    question: qaItem.question,
    answerSummary: qaItem.answerSummary,
    threadUrl: qaItem.threadUrl,
    relatedProducts: qaItem.relatedProducts,
  };
};


/**
 * Validates the structure of the scraped data received from the API.
 * Throws an error if the data does not conform to the ScrapedData interface.
 * @param data The raw data object parsed from the JSON response.
 * @returns The validated and typed ScrapedData object.
 */
export const validateScrapedData = (data: any): ScrapedData => {
  if (!data || typeof data !== 'object') {
    throw new Error('Root level of scraped data validation failed: response is not an object.');
  }

  if (!isArray(data.products)) {
    throw new Error('Scraped data validation failed: "products" field must be an array.');
  }
  
  if (!isArray(data.qaItems)) {
    throw new Error('Scraped data validation failed: "qaItems" field must be an array.');
  }

  try {
    const validatedProducts = data.products.map(validateProduct);
    const validatedQaItems = data.qaItems.map(validateQAItem);

    return {
      products: validatedProducts,
      qaItems: validatedQaItems,
    };
  } catch (error) {
      if (error instanceof Error) {
          // Re-throw with more context
          throw new Error(`Item-level validation failed: ${error.message}`);
      }
      throw new Error("An unknown validation error occurred.");
  }
};
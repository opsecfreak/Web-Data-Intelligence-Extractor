export interface ForumMention {
  threadTitle: string;
  summary: string;
  url: string;
}

export interface Product {
  name: string;
  price: string;
  partNumber: string;
  description: string;
  url: string;
  mentions: ForumMention[];
}

export interface QAItem {
  question: string;
  answerSummary: string;
  threadUrl: string;
  relatedProducts: string[];
}

export interface ScrapedData {
  products: Product[];
  qaItems: QAItem[];
}

export interface ScrapeOptions {
  topic?: string;
  maxResults?: number;
  crawlDepth?: number;
}

import React, { useState } from 'react';
import { WebIcon } from './Icons';
import { ScrapeOptions } from '../types';

interface ScraperInputProps {
  onScrape: (url: string, options: ScrapeOptions) => void;
  isLoading: boolean;
}

const ScraperInput: React.FC<ScraperInputProps> = ({ onScrape, isLoading }) => {
  const [url, setUrl] = useState<string>('https://yuneecpilots.com');
  const [error, setError] = useState<string>('');
  
  // Advanced options state
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [topic, setTopic] = useState('');
  const [maxResults, setMaxResults] = useState('');
  const [crawlDepth, setCrawlDepth] = useState('');


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    
    // Basic URL validation
    try {
      new URL(url);
      setError('');
      const options: ScrapeOptions = {
          topic: topic || undefined,
          maxResults: maxResults ? parseInt(maxResults, 10) : undefined,
          crawlDepth: crawlDepth ? parseInt(crawlDepth, 10) : undefined
      };
      onScrape(url, options);
    } catch (_) {
      setError('Please enter a valid URL (e.g., https://example.com)');
    }
  };
  
  const exampleUrls = [
      "https://yuneecpilots.com",
      "https://yuneecskins.com",
      "https://mobiletechspecialists.com/shop"
  ];

  return (
    <div className="w-full max-w-3xl mx-auto p-4 md:p-6 bg-gray-800/50 rounded-2xl shadow-lg border border-gray-700 backdrop-blur-sm">
      <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
        <label htmlFor="url-input" className="text-lg font-semibold text-gray-200">
          Enter Website URL to Analyze
        </label>
        <div className="flex relative items-center">
            <WebIcon className="w-5 h-5 absolute left-4 text-gray-400 pointer-events-none" />
            <input
            id="url-input"
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="e.g., https://yuneecpilots.com"
            className="w-full bg-gray-900 border border-gray-600 rounded-lg py-3 pl-11 pr-4 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition duration-200 text-gray-100 placeholder-gray-500"
            disabled={isLoading}
            />
        </div>
        {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
        <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-400">Examples:</span>
            {exampleUrls.map(exUrl => (
                <button 
                    key={exUrl}
                    type="button"
                    onClick={() => setUrl(exUrl)}
                    className="text-xs bg-gray-700 hover:bg-gray-600 text-cyan-300 px-2 py-1 rounded-md transition"
                    disabled={isLoading}
                >
                    {new URL(exUrl).hostname}
                </button>
            ))}
        </div>

        {/* Advanced Options */}
        <div className="pt-2">
            <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="text-sm text-cyan-400 hover:text-cyan-300">
                {showAdvanced ? 'Hide' : 'Show'} Advanced Options
            </button>
            {showAdvanced && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                    <div>
                        <label htmlFor="topic" className="block text-xs font-medium text-gray-400 mb-1">Topic / Keywords</label>
                        <input type="text" id="topic" value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g., 'battery issues'" className="w-full bg-gray-800 border border-gray-600 rounded-md py-2 px-3 text-sm focus:ring-1 focus:ring-cyan-500 outline-none" />
                    </div>
                    <div>
                        <label htmlFor="max-results" className="block text-xs font-medium text-gray-400 mb-1">Max Results (each)</label>
                        <input type="number" id="max-results" value={maxResults} onChange={e => setMaxResults(e.target.value)} placeholder="e.g., 25" className="w-full bg-gray-800 border border-gray-600 rounded-md py-2 px-3 text-sm focus:ring-1 focus:ring-cyan-500 outline-none" />
                    </div>
                    <div>
                        <label htmlFor="crawl-depth" className="block text-xs font-medium text-gray-400 mb-1">Crawl Depth</label>
                        <input type="number" id="crawl-depth" value={crawlDepth} onChange={e => setCrawlDepth(e.target.value)} placeholder="e.g., 2" className="w-full bg-gray-800 border border-gray-600 rounded-md py-2 px-3 text-sm focus:ring-1 focus:ring-cyan-500 outline-none" />
                    </div>
                </div>
            )}
        </div>


        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-md"
        >
          {isLoading ? 'Analyzing...' : 'Scrape & Analyze'}
        </button>
      </form>
    </div>
  );
};

export default ScraperInput;

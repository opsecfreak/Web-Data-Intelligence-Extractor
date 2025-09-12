import React, { useState, useEffect } from 'react';
import { ProductIcon, QuestionIcon, PlusIcon, TrashIcon, ChevronUpIcon, ChevronDownIcon } from './Icons';
import { ScrapeOptions, DataSources } from '../types';

interface ScraperInputProps {
  onScrape: (options: ScrapeOptions) => void;
  isLoading: boolean;
}

const getInitialState = <T,>(key: string, defaultValue: T): T => {
    try {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.warn(`Error reading localStorage key “${key}”:`, error);
        return defaultValue;
    }
};

const ScraperInput: React.FC<ScraperInputProps> = ({ onScrape, isLoading }) => {
  const [productUrls, setProductUrls] = useState<string[]>(() => getInitialState('productUrls', ['https://mobiletechspecialists.com/shop', 'https://yuneecskins.com']));
  const [forumUrls, setForumUrls] = useState<string[]>(() => getInitialState('forumUrls', ['https://yuneecpilots.com']));
  
  const [newProductUrl, setNewProductUrl] = useState('');
  const [newForumUrl, setNewForumUrl] = useState('');
  const [error, setError] = useState<string>('');
  
  // Advanced options state
  const [topic, setTopic] = useState('');
  const [maxResults, setMaxResults] = useState('');
  const [crawlDepth, setCrawlDepth] = useState('');

  // Persist URL lists to localStorage
  useEffect(() => {
      localStorage.setItem('productUrls', JSON.stringify(productUrls));
  }, [productUrls]);

  useEffect(() => {
      localStorage.setItem('forumUrls', JSON.stringify(forumUrls));
  }, [forumUrls]);

  const handleAddUrl = (type: 'product' | 'forum') => {
    const urlToAdd = type === 'product' ? newProductUrl : newForumUrl;
    if (!urlToAdd) return;

    try {
        new URL(urlToAdd);
        if (type === 'product') {
            if (!productUrls.includes(urlToAdd)) {
                setProductUrls(prev => [...prev, urlToAdd]);
            }
            setNewProductUrl('');
        } else {
            if (!forumUrls.includes(urlToAdd)) {
                setForumUrls(prev => [...prev, urlToAdd]);
            }
            setNewForumUrl('');
        }
        setError('');
    } catch (_) {
        setError(`Please enter a valid URL for the ${type} source.`);
    }
  };

  const handleRemoveUrl = (type: 'product' | 'forum', index: number) => {
      if (type === 'product') {
          setProductUrls(prev => prev.filter((_, i) => i !== index));
      } else {
          setForumUrls(prev => prev.filter((_, i) => i !== index));
      }
  };

  const handleMoveUrl = (type: 'product' | 'forum', index: number, direction: 'up' | 'down') => {
      const list = type === 'product' ? productUrls : forumUrls;
      const setList = type === 'product' ? setProductUrls : setForumUrls;
      const newIndex = direction === 'up' ? index - 1 : index + 1;

      if (newIndex < 0 || newIndex >= list.length) return;

      const newList = [...list];
      [newList[index], newList[newIndex]] = [newList[newIndex], newList[index]]; // Swap elements
      setList(newList);
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    
    if (productUrls.length === 0 && forumUrls.length === 0) {
        setError('Please add at least one data source URL to begin analysis.');
        return;
    }
    setError('');

    const sources: DataSources = { productUrls, forumUrls };
    const options: ScrapeOptions = {
        sources,
        topic: topic || undefined,
        maxResults: maxResults ? parseInt(maxResults, 10) : undefined,
        crawlDepth: crawlDepth ? parseInt(crawlDepth, 10) : undefined
    };
    onScrape(options);
  };

  const UrlListManager: React.FC<{
    type: 'product' | 'forum';
    urls: string[];
    newUrl: string;
    setNewUrl: (url: string) => void;
  }> = ({ type, urls, newUrl, setNewUrl }) => {
    const title = type === 'product' ? 'Product Data Sources' : 'Forum Data Sources';
    const Icon = type === 'product' ? ProductIcon : QuestionIcon;
    const accentColor = type === 'product' ? 'cyan' : 'teal';

    return (
      <div className="space-y-3">
        <label className="text-lg font-semibold text-gray-200 flex items-center gap-2">
          <Icon className={`w-6 h-6 text-${accentColor}-400`} />
          {title}
        </label>
        <div className="pl-1 space-y-2">
          {urls.map((url, index) => (
            <div key={`${type}-${url}-${index}`} className="flex items-center gap-2 bg-gray-900/50 p-1.5 rounded-md group">
              <span className="text-gray-300 text-sm truncate flex-1 pl-2">{url}</span>
              <div className="flex items-center">
                <button type="button" onClick={() => handleMoveUrl(type, index, 'up')} disabled={index === 0} className="p-1 text-gray-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"><ChevronUpIcon className="w-4 h-4" /></button>
                <button type="button" onClick={() => handleMoveUrl(type, index, 'down')} disabled={index === urls.length - 1} className="p-1 text-gray-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"><ChevronDownIcon className="w-4 h-4" /></button>
                <button type="button" onClick={() => handleRemoveUrl(type, index)} className="p-1 text-gray-500 hover:text-red-400 transition"><TrashIcon className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddUrl(type); }}}
            placeholder="https://..."
            className={`w-full bg-gray-900 border border-gray-600 rounded-md py-1.5 px-3 text-sm focus:ring-1 focus:ring-${accentColor}-500 outline-none transition duration-200`}
            disabled={isLoading}
          />
          <button type="button" onClick={() => handleAddUrl(type)} className={`bg-${accentColor}-600 hover:bg-${accentColor}-700 text-white font-bold p-2 rounded-md transition flex-shrink-0`} disabled={isLoading}><PlusIcon className="w-5 h-5"/></button>
        </div>
      </div>
    );
  };
  

  return (
    <div className="w-full max-w-4xl mx-auto p-5 bg-gray-800/50 rounded-2xl shadow-lg border border-gray-700 backdrop-blur-sm">
      <form onSubmit={handleSubmit} className="flex flex-col space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <UrlListManager type="product" urls={productUrls} newUrl={newProductUrl} setNewUrl={setNewProductUrl} />
            <UrlListManager type="forum" urls={forumUrls} newUrl={newForumUrl} setNewUrl={setNewForumUrl} />
        </div>

        {error && <p className="text-red-400 text-sm text-center">{error}</p>}
        
        {/* Advanced Options */}
        <div className="pt-2">
             <h3 className="text-lg font-semibold text-gray-200 mb-2">Fine-Tune Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-3 bg-gray-900/50 rounded-lg border border-gray-700">
                <div>
                    <label htmlFor="topic" className="block text-xs font-medium text-gray-400 mb-1">Topic / Keywords</label>
                    <input type="text" id="topic" value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g., 'battery issues'" className="w-full bg-gray-800 border border-gray-600 rounded-md py-1.5 px-3 text-sm focus:ring-1 focus:ring-cyan-500 outline-none" />
                </div>
                <div>
                    <label htmlFor="max-results" className="block text-xs font-medium text-gray-400 mb-1">Max Results (each)</label>
                    <input type="number" id="max-results" value={maxResults} onChange={e => setMaxResults(e.target.value)} placeholder="e.g., 25" className="w-full bg-gray-800 border border-gray-600 rounded-md py-1.5 px-3 text-sm focus:ring-1 focus:ring-cyan-500 outline-none" />
                </div>
                <div>
                    <label htmlFor="crawl-depth" className="block text-xs font-medium text-gray-400 mb-1">Crawl Depth</label>
                    <input type="number" id="crawl-depth" value={crawlDepth} onChange={e => setCrawlDepth(e.target.value)} placeholder="e.g., 2" className="w-full bg-gray-800 border border-gray-600 rounded-md py-1.5 px-3 text-sm focus:ring-1 focus:ring-cyan-500 outline-none" />
                </div>
            </div>
        </div>


        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-md"
        >
          {isLoading ? 'Analyzing...' : 'Scrape & Analyze'}
        </button>
      </form>
    </div>
  );
};

export default ScraperInput;
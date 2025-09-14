import React, { useState, useEffect } from 'react';
import { WebIcon, PlusIcon, TrashIcon, ChevronUpIcon, ChevronDownIcon } from './Icons';
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
  const [sourceUrls, setSourceUrls] = useState<string[]>(() => getInitialState('sourceUrls', ['https://mobiletechspecialists.com/shop', 'https://yuneecpilots.com', 'https://yuneecskins.com']));
  const [newUrl, setNewUrl] = useState('');
  const [error, setError] = useState<string>('');
  
  // Advanced options state
  const [topic, setTopic] = useState('');
  const [maxResults, setMaxResults] = useState('');
  const [crawlDepth, setCrawlDepth] = useState('');

  // Persist URL lists to localStorage
  useEffect(() => {
      localStorage.setItem('sourceUrls', JSON.stringify(sourceUrls));
  }, [sourceUrls]);


  const handleAddUrl = () => {
    if (!newUrl) return;

    try {
        new URL(newUrl);
        if (!sourceUrls.includes(newUrl)) {
            setSourceUrls(prev => [...prev, newUrl]);
        }
        setNewUrl('');
        setError('');
    } catch (_) {
        setError(`Please enter a valid URL.`);
    }
  };

  const handleRemoveUrl = (index: number) => {
      setSourceUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleMoveUrl = (index: number, direction: 'up' | 'down') => {
      const list = sourceUrls;
      const setList = setSourceUrls;
      const newIndex = direction === 'up' ? index - 1 : index + 1;

      if (newIndex < 0 || newIndex >= list.length) return;

      const newList = [...list];
      [newList[index], newList[newIndex]] = [newList[newIndex], newList[index]]; // Swap elements
      setList(newList);
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    
    if (sourceUrls.length === 0) {
        setError('Please add at least one data source URL to begin analysis.');
        return;
    }
    setError('');

    const sources: DataSources = { urls: sourceUrls };
    const options: ScrapeOptions = {
        sources,
        topic: topic || undefined,
        maxResults: maxResults ? parseInt(maxResults, 10) : undefined,
        crawlDepth: crawlDepth ? parseInt(crawlDepth, 10) : undefined
    };
    onScrape(options);
  };
  
  return (
    <div className="w-full max-w-4xl mx-auto p-5 bg-gray-800/50 rounded-2xl shadow-lg border border-gray-700 backdrop-blur-sm">
      <form onSubmit={handleSubmit} className="flex flex-col space-y-6">
        
        <div className="space-y-3">
            <label className="text-lg font-semibold text-gray-200 flex items-center gap-2">
                <WebIcon className="w-6 h-6 text-cyan-400" />
                Data Sources
            </label>
            <div className="pl-1 space-y-2">
            {sourceUrls.map((url, index) => (
                <div key={`${url}-${index}`} className="flex items-center gap-2 bg-gray-900/50 p-1.5 rounded-md group">
                <span className="text-gray-300 text-sm truncate flex-1 pl-2">{url}</span>
                <div className="flex items-center">
                    <button type="button" onClick={() => handleMoveUrl(index, 'up')} disabled={index === 0} className="p-1 text-gray-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"><ChevronUpIcon className="w-4 h-4" /></button>
                    <button type="button" onClick={() => handleMoveUrl(index, 'down')} disabled={index === sourceUrls.length - 1} className="p-1 text-gray-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"><ChevronDownIcon className="w-4 h-4" /></button>
                    <button type="button" onClick={() => handleRemoveUrl(index)} className="p-1 text-gray-500 hover:text-red-400 transition"><TrashIcon className="w-4 h-4" /></button>
                </div>
                </div>
            ))}
            </div>
            <div className="flex gap-2">
            <input
                type="text"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddUrl(); }}}
                placeholder="https://..."
                className="w-full bg-gray-900 border border-gray-600 rounded-md py-1.5 px-3 text-sm focus:ring-1 focus:ring-cyan-500 outline-none transition duration-200"
                disabled={isLoading}
            />
            <button type="button" onClick={handleAddUrl} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold p-2 rounded-md transition flex-shrink-0" disabled={isLoading}><PlusIcon className="w-5 h-5"/></button>
            </div>
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
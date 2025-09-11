import React, { useState, useCallback } from 'react';
import ScraperInput from './components/ScraperInput';
import SearchResults from './components/SearchResults';
import LoadingSpinner from './components/LoadingSpinner';
import SummaryView from './components/SummaryView';
import { scrapeAndAnalyzeWebsite } from './services/geminiService';
import { ScrapedData, ScrapeOptions } from './types';
import { WebIcon } from './components/Icons';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [data, setData] = useState<ScrapedData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleScrape = useCallback(async (url: string, options: ScrapeOptions) => {
    setIsLoading(true);
    setError(null);
    setData(null);
    try {
      const result = await scrapeAndAnalyzeWebsite(url, options);
      setData(result);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const WelcomeScreen = () => (
    <div className="text-center p-8">
      <WebIcon className="w-24 h-24 mx-auto text-cyan-500 opacity-30" />
      <h2 className="mt-6 text-3xl font-bold text-gray-300">Welcome to the Web Data Intelligence Extractor</h2>
      <p className="mt-4 max-w-2xl mx-auto text-gray-400">
        Enter a website URL above to begin. The AI will analyze the site, extract product information, and cross-reference it with forum discussions to provide valuable insights.
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans p-4 md:p-8">
      <header className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-extrabold">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-teal-500">
            Web Data Intelligence Extractor
          </span>
        </h1>
        <p className="text-gray-400 mt-2 max-w-2xl mx-auto">
          Leverage AI to scrape, analyze, and search website data for product insights and user experiences.
        </p>
      </header>
      
      <main>
        <ScraperInput onScrape={handleScrape} isLoading={isLoading} />

        <div className="mt-8">
          {isLoading && <LoadingSpinner message="AI is analyzing the website... this may take a moment." />}
          {error && (
            <div className="max-w-3xl mx-auto bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-center">
              <p className="font-bold">Analysis Failed</p>
              <p className="text-sm">{error}</p>
            </div>
          )}
          {data ? (
             <>
                <SummaryView data={data} />
                <SearchResults data={data} />
             </>
          ) : (
            !isLoading && !error && <WelcomeScreen />
          )}
        </div>
      </main>
      
      <footer className="text-center mt-12 text-sm text-gray-600">
        <p>Powered by Google Gemini</p>
      </footer>
    </div>
  );
};

export default App;
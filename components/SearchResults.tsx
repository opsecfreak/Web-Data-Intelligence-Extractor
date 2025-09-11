import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ScrapedData, Product, QAItem } from '../types';
import ProductCard from './ProductCard';
import QACard from './QACard';
import { SearchIcon, ProductIcon, QuestionIcon, ExportIcon } from './Icons';
import { exportDataAsFile, generateFullReportCsv, generateFullReportHtml } from '../utils/export';

interface SearchResultsProps {
  data: ScrapedData;
}

const SearchResults: React.FC<SearchResultsProps> = ({ data }) => {
  // Main search
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'products' | 'qa'>('products');
  
  // Export menu
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);


  // Product filters
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [hasPartNumber, setHasPartNumber] = useState(false);

  // Q&A filters
  const [relatedProductQuery, setRelatedProductQuery] = useState('');

  const filteredProducts = useMemo((): Product[] => {
    if (!data.products) return [];
    
    return data.products.filter(p => {
      const searchMatch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.partNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase());

      if (!searchMatch) return false;

      // Price filter
      const priceNum = p.price ? parseFloat(p.price.replace(/[^0-9.]/g, '')) : NaN;
      const min = minPrice ? parseFloat(minPrice) : NaN;
      const max = maxPrice ? parseFloat(maxPrice) : NaN;
      
      if (!isNaN(priceNum)) { // Product has a valid price
        if (!isNaN(min) && priceNum < min) return false;
        if (!isNaN(max) && priceNum > max) return false;
      } else { // Product has no valid price
        // If a price filter is active, products without a price should be excluded.
        if (!isNaN(min) || !isNaN(max)) return false;
      }
      
      // Part number filter
      if (hasPartNumber && (!p.partNumber || p.partNumber.trim() === '')) {
        return false;
      }

      return true;
    });
  }, [data.products, searchQuery, minPrice, maxPrice, hasPartNumber]);

  const filteredQAItems = useMemo((): QAItem[] => {
    if (!data.qaItems) return [];
    return data.qaItems.filter(qa => {
      const searchMatch = 
        qa.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        qa.answerSummary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        qa.relatedProducts.some(p => p.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!searchMatch) return false;

      const relatedProductMatch = 
        !relatedProductQuery || 
        qa.relatedProducts.some(p => p.toLowerCase().includes(relatedProductQuery.toLowerCase()));

      if (!relatedProductMatch) return false;

      return true;
    });
  }, [data.qaItems, searchQuery, relatedProductQuery]);

  const hasData = data.products.length > 0 || data.qaItems.length > 0;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setIsExportMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExportFiltered = (format: 'csv' | 'html') => {
      const filteredData: ScrapedData = {
          products: filteredProducts,
          qaItems: filteredQAItems,
      };
      const filename = "web_intelligence_report_filtered";
      if (format === 'csv') {
          const csvContent = generateFullReportCsv(filteredData);
          exportDataAsFile(`${filename}.csv`, csvContent, 'text/csv;charset=utf-8;');
      } else {
          const htmlContent = generateFullReportHtml(filteredData);
          exportDataAsFile(`${filename}.html`, htmlContent, 'text/html;charset=utf-8;');
      }
      setIsExportMenuOpen(false);
  }

  const handleExportUnfiltered = (format: 'csv' | 'html') => {
    const filename = "web_intelligence_report_full";
    if (format === 'csv') {
        const csvContent = generateFullReportCsv(data);
        exportDataAsFile(`${filename}.csv`, csvContent, 'text/csv;charset=utf-8;');
    } else {
        const htmlContent = generateFullReportHtml(data);
        exportDataAsFile(`${filename}.html`, htmlContent, 'text/html;charset=utf-8;');
    }
    setIsExportMenuOpen(false);
  }


  if (!hasData) {
      return null;
  }
  
  const FilterBar = () => {
      if (activeTab === 'products') {
          return (
            <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 mb-6 flex flex-wrap items-center gap-x-6 gap-y-4">
                <span className="font-semibold text-gray-300">Filters:</span>
                <div className="flex items-center gap-2">
                    <label htmlFor="min-price" className="text-sm text-gray-400">Min Price:</label>
                    <input
                        id="min-price"
                        type="number"
                        placeholder="e.g., 50"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        className="w-24 bg-gray-900 border border-gray-600 rounded-md py-1 px-2 text-sm focus:ring-1 focus:ring-cyan-500 outline-none"
                        aria-label="Minimum Price"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <label htmlFor="max-price" className="text-sm text-gray-400">Max Price:</label>
                    <input
                        id="max-price"
                        type="number"
                        placeholder="e.g., 500"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        className="w-24 bg-gray-900 border border-gray-600 rounded-md py-1 px-2 text-sm focus:ring-1 focus:ring-cyan-500 outline-none"
                        aria-label="Maximum Price"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <input
                        id="has-part-number"
                        type="checkbox"
                        checked={hasPartNumber}
                        onChange={(e) => setHasPartNumber(e.target.checked)}
                        className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-cyan-600 focus:ring-cyan-500"
                    />
                    <label htmlFor="has-part-number" className="text-sm text-gray-400 select-none cursor-pointer">Has Part Number</label>
                </div>
            </div>
          );
      }
      if (activeTab === 'qa') {
        return (
            <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 mb-6 flex flex-wrap items-center gap-4">
                <label htmlFor="related-product" className="font-semibold text-gray-300">Filter by Related Product:</label>
                <input
                    id="related-product"
                    type="text"
                    placeholder="Enter product name or part #"
                    value={relatedProductQuery}
                    onChange={(e) => setRelatedProductQuery(e.target.value)}
                    className="flex-grow bg-gray-900 border border-gray-600 rounded-md py-1 px-2 text-sm focus:ring-1 focus:ring-teal-500 outline-none"
                />
            </div>
        );
      }
      return null;
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 mt-8">
      <div className="relative mb-6">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search all results..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-gray-800 border border-gray-600 rounded-lg py-3 pl-11 pr-4 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition duration-200"
          aria-label="Search all results"
        />
      </div>

      <div className="flex flex-wrap justify-between items-center border-b border-gray-700 mb-6 gap-4">
        <div className="flex">
            <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-2 px-4 py-2 text-lg font-medium transition-colors ${activeTab === 'products' ? 'border-b-2 border-cyan-500 text-cyan-400' : 'text-gray-400 hover:text-white'}`}
            aria-pressed={activeTab === 'products'}
            >
            <ProductIcon />
            Products ({filteredProducts.length})
            </button>
            <button
            onClick={() => setActiveTab('qa')}
            className={`flex items-center gap-2 px-4 py-2 text-lg font-medium transition-colors ${activeTab === 'qa' ? 'border-b-2 border-teal-500 text-teal-400' : 'text-gray-400 hover:text-white'}`}
            aria-pressed={activeTab === 'qa'}
            >
            <QuestionIcon />
            Q&A ({filteredQAItems.length})
            </button>
        </div>
        <div className="relative" ref={exportMenuRef}>
            <button 
                onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-gray-200 font-semibold px-4 py-2 rounded-md transition"
            >
                <ExportIcon className="w-5 h-5" />
                Export...
            </button>
            {isExportMenuOpen && (
                 <div className="absolute right-0 mt-2 w-56 bg-gray-900 border border-gray-700 rounded-md shadow-lg z-10">
                    <div className="py-1">
                        <div className="px-4 pt-2 pb-1 text-xs text-gray-500 font-semibold uppercase">Export Filtered View</div>
                        <button onClick={() => handleExportFiltered('csv')} className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">
                           Download Filtered as CSV
                        </button>
                        <button onClick={() => handleExportFiltered('html')} className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">
                           Download Filtered as HTML
                        </button>
                        <div className="border-t border-gray-700 my-1"></div>
                        <div className="px-4 pt-2 pb-1 text-xs text-gray-500 font-semibold uppercase">Export Full Dataset</div>
                         <button onClick={() => handleExportUnfiltered('csv')} className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">
                           Download All as CSV
                        </button>
                        <button onClick={() => handleExportUnfiltered('html')} className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">
                           Download All as HTML
                        </button>
                    </div>
                </div>
            )}
        </div>
      </div>

      <FilterBar />

      <div>
        {activeTab === 'products' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" aria-live="polite">
            {filteredProducts.length > 0 ? (
                filteredProducts.map((product, index) => <ProductCard key={`${product.partNumber}-${index}`} product={product} />)
            ) : (
                <p className="text-gray-400 md:col-span-2 lg:col-span-3 text-center py-8">No products match your search or filters.</p>
            )}
          </div>
        )}
        {activeTab === 'qa' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6" aria-live="polite">
            {filteredQAItems.length > 0 ? (
                filteredQAItems.map((item, index) => <QACard key={index} item={item} />)
            ) : (
                <p className="text-gray-400 md:col-span-2 text-center py-8">No Q&A items match your search or filters.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ScrapedData, Product, QAItem } from '../types';
import ProductCard from './ProductCard';
import QACard from './QACard';
import { SearchIcon, ProductIcon, QuestionIcon, ExportIcon } from './Icons';
import { exportDataAsFile, generateFullReportCsv, generateFullReportHtml, generatePartsListCsv } from '../utils/export';
import { parsePrice } from '../utils/parsing';

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


  // Product filters and sorting
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [hasPartNumber, setHasPartNumber] = useState(false);
  const [priceFilterExcludesUnpriced, setPriceFilterExcludesUnpriced] = useState(true);
  const [productSort, setProductSort] = useState('name-asc');

  // Q&A filters and sorting
  const [relatedProductQuery, setRelatedProductQuery] = useState('');
  const [qaSort, setQaSort] = useState('question-asc');


  const filteredProducts = useMemo((): Product[] => {
    if (!data.products) return [];
    
    const filtered = data.products.filter(p => {
      const searchMatch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.partNumber && p.partNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase());

      if (!searchMatch) return false;

      // Price filter logic
      const priceNum = parsePrice(p.price);
      const min = minPrice ? parseFloat(minPrice) : NaN;
      const max = maxPrice ? parseFloat(maxPrice) : NaN;
      const isPriceFilterActive = !isNaN(min) || !isNaN(max);

      if (isPriceFilterActive) {
        if (priceNum !== null) { // Product has a valid price
          if (!isNaN(min) && priceNum < min) return false;
          if (!isNaN(max) && priceNum > max) return false;
        } else { // Product has no valid price
          if (priceFilterExcludesUnpriced) {
             return false; // Exclude if checkbox is checked
          }
        }
      }
      
      // Part number filter
      if (hasPartNumber && (!p.partNumber || p.partNumber.trim() === '')) {
        return false;
      }

      return true;
    });

    // Sorting
    return filtered.sort((a, b) => {
      switch (productSort) {
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'price-asc': {
          const priceA = parsePrice(a.price);
          const priceB = parsePrice(b.price);
          if (priceA === null) return 1;
          if (priceB === null) return -1;
          return priceA - priceB;
        }
        case 'price-desc': {
          const priceA = parsePrice(a.price);
          const priceB = parsePrice(b.price);
          if (priceA === null) return 1;
          if (priceB === null) return -1;
          return priceB - priceA;
        }
        case 'part-desc': {
          const hasPartA = !!a.partNumber?.trim();
          const hasPartB = !!b.partNumber?.trim();
          if (hasPartA === hasPartB) return a.name.localeCompare(b.name);
          return hasPartA ? -1 : 1; // true comes first
        }
        default:
          return 0;
      }
    });

  }, [data.products, searchQuery, minPrice, maxPrice, hasPartNumber, priceFilterExcludesUnpriced, productSort]);

  const filteredQAItems = useMemo((): QAItem[] => {
    if (!data.qaItems) return [];
    const filtered = data.qaItems.filter(qa => {
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

    // Sorting
    return filtered.sort((a, b) => {
        switch (qaSort) {
            case 'question-asc':
                return a.question.localeCompare(b.question);
            case 'question-desc':
                return b.question.localeCompare(a.question);
            case 'related-desc':
                return b.relatedProducts.length - a.relatedProducts.length;
            case 'related-asc':
                return a.relatedProducts.length - b.relatedProducts.length;
            default:
                return 0;
        }
    });

  }, [data.qaItems, searchQuery, relatedProductQuery, qaSort]);

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

  const handleExportPartsListFiltered = () => {
    const csvContent = generatePartsListCsv(filteredProducts);
    exportDataAsFile('filtered_parts_list.csv', csvContent, 'text/csv;charset=utf-8;');
    setIsExportMenuOpen(false);
  };
  
  const handleExportPartsListUnfiltered = () => {
      const csvContent = generatePartsListCsv(data.products);
      exportDataAsFile('full_parts_list.csv', csvContent, 'text/csv;charset=utf-8;');
      setIsExportMenuOpen(false);
  };


  if (!hasData) {
      return null;
  }
  
  const FilterBar = () => {
      if (activeTab === 'products') {
          return (
            <div className="bg-gray-800/50 p-2 rounded-lg border border-gray-700 mb-4 flex flex-wrap items-center gap-x-4 gap-y-2">
                <span className="font-semibold text-gray-300 text-sm">Filters:</span>
                <div className="flex items-center gap-2">
                    <label htmlFor="min-price" className="text-xs text-gray-400">Min Price:</label>
                    <input
                        id="min-price" type="number" placeholder="e.g., 50" value={minPrice} onChange={(e) => setMinPrice(e.target.value)}
                        className="w-20 bg-gray-900 border border-gray-600 rounded-md py-1 px-2 text-xs focus:ring-1 focus:ring-cyan-500 outline-none"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <label htmlFor="max-price" className="text-xs text-gray-400">Max Price:</label>
                    <input
                        id="max-price" type="number" placeholder="e.g., 500" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)}
                        className="w-20 bg-gray-900 border border-gray-600 rounded-md py-1 px-2 text-xs focus:ring-1 focus:ring-cyan-500 outline-none"
                    />
                </div>
                 <div className="flex items-center gap-2">
                    <input
                        id="exclude-unpriced" type="checkbox" checked={priceFilterExcludesUnpriced} onChange={(e) => setPriceFilterExcludesUnpriced(e.target.checked)}
                        className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-cyan-600 focus:ring-cyan-500"
                    />
                    <label htmlFor="exclude-unpriced" className="text-xs text-gray-400 select-none cursor-pointer">Exclude unpriced</label>
                </div>
                <div className="flex items-center gap-2">
                    <input
                        id="has-part-number" type="checkbox" checked={hasPartNumber} onChange={(e) => setHasPartNumber(e.target.checked)}
                        className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-cyan-600 focus:ring-cyan-500"
                    />
                    <label htmlFor="has-part-number" className="text-xs text-gray-400 select-none cursor-pointer">Has Part Number</label>
                </div>
                <div className="border-l border-gray-600 h-5 mx-1"></div>
                <div className="flex items-center gap-2">
                    <label htmlFor="product-sort" className="text-xs text-gray-400">Sort by:</label>
                    <select
                        id="product-sort" value={productSort} onChange={(e) => setProductSort(e.target.value)}
                        className="bg-gray-900 border border-gray-600 rounded-md py-1 px-2 text-xs focus:ring-1 focus:ring-cyan-500 outline-none"
                    >
                        <option value="name-asc">Name (A-Z)</option>
                        <option value="name-desc">Name (Z-A)</option>
                        <option value="price-asc">Price (Low to High)</option>
                        <option value="price-desc">Price (High to Low)</option>
                        <option value="part-desc">Has Part Number</option>
                    </select>
                </div>
            </div>
          );
      }
      if (activeTab === 'qa') {
        return (
            <div className="bg-gray-800/50 p-2 rounded-lg border border-gray-700 mb-4 flex flex-wrap items-center gap-4">
                <div className="flex-grow flex items-center gap-2">
                    <label htmlFor="related-product" className="font-semibold text-gray-300 text-sm">Filter by Related Product:</label>
                    <input
                        id="related-product" type="text" placeholder="Enter product name or part #" value={relatedProductQuery} onChange={(e) => setRelatedProductQuery(e.target.value)}
                        className="flex-grow bg-gray-900 border border-gray-600 rounded-md py-1 px-2 text-sm focus:ring-1 focus:ring-teal-500 outline-none"
                    />
                </div>
                 <div className="border-l border-gray-600 h-5 mx-1"></div>
                 <div className="flex items-center gap-2">
                    <label htmlFor="qa-sort" className="text-sm text-gray-400">Sort by:</label>
                    <select
                        id="qa-sort" value={qaSort} onChange={(e) => setQaSort(e.target.value)}
                        className="bg-gray-900 border border-gray-600 rounded-md py-1 px-2 text-sm focus:ring-1 focus:ring-teal-500 outline-none"
                    >
                        <option value="question-asc">Question (A-Z)</option>
                        <option value="question-desc">Question (Z-A)</option>
                        <option value="related-desc">Related Products (Most First)</option>
                        <option value="related-asc">Related Products (Least First)</option>
                    </select>
                </div>
            </div>
        );
      }
      return null;
  }

  return (
    <div className="w-full max-w-7xl mx-auto mt-8">
       {/* Results Header */}
        <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
            <h2 className="text-2xl font-bold text-gray-300">Detailed Results</h2>
            <div className="relative" ref={exportMenuRef}>
                <button 
                    onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                    className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold px-4 py-2 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-md"
                >
                    <ExportIcon className="w-5 h-5" />
                    Export...
                </button>
                {isExportMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-gray-900 border border-gray-700 rounded-md shadow-lg z-10">
                        <div className="py-1">
                            <div className="px-4 pt-2 pb-1 text-xs text-gray-500 font-semibold uppercase">Export Filtered Data</div>
                            <button onClick={() => handleExportFiltered('csv')} className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">
                            Download as CSV
                            </button>
                            <button onClick={() => handleExportFiltered('html')} className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">
                            Download as HTML
                            </button>
                            <div className="border-t border-gray-700 my-1"></div>
                            <div className="px-4 pt-2 pb-1 text-xs text-gray-500 font-semibold uppercase">Export Full Dataset</div>
                            <button onClick={() => handleExportUnfiltered('csv')} className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">
                            Download All as CSV
                            </button>
                            <button onClick={() => handleExportUnfiltered('html')} className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">
                            Download All as HTML
                            </button>
                            <div className="border-t border-gray-700 my-1"></div>
                            <div className="px-4 pt-2 pb-1 text-xs text-gray-500 font-semibold uppercase">Parts List</div>
                             <button onClick={handleExportPartsListFiltered} className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">
                                Download Filtered as CSV
                            </button>
                             <button onClick={handleExportPartsListUnfiltered} className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">
                                Download All as CSV
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
        
      <div className="relative mb-4">
        <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search results..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-gray-800 border border-gray-600 rounded-lg py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition duration-200"
          aria-label="Search all results"
        />
      </div>

      <div className="flex border-b border-gray-700 mb-4">
          <button
          onClick={() => setActiveTab('products')}
          className={`flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors ${activeTab === 'products' ? 'border-b-2 border-cyan-500 text-cyan-400' : 'text-gray-400 hover:text-white'}`}
          aria-pressed={activeTab === 'products'}
          >
          <ProductIcon className="w-5 h-5" />
          Products ({filteredProducts.length})
          </button>
          <button
          onClick={() => setActiveTab('qa')}
          className={`flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors ${activeTab === 'qa' ? 'border-b-2 border-teal-500 text-teal-400' : 'text-gray-400 hover:text-white'}`}
          aria-pressed={activeTab === 'qa'}
          >
          <QuestionIcon className="w-5 h-5" />
          Q&A ({filteredQAItems.length})
          </button>
      </div>
      
      <FilterBar />

      <div>
        {activeTab === 'products' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3" aria-live="polite">
            {filteredProducts.length > 0 ? (
                filteredProducts.map((product, index) => <ProductCard key={`${product.url}-${index}`} product={product} />)
            ) : (
                <p className="text-gray-400 md:col-span-2 lg:col-span-3 text-center py-12">No products match your search or filters.</p>
            )}
          </div>
        )}
        {activeTab === 'qa' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3" aria-live="polite">
            {filteredQAItems.length > 0 ? (
                filteredQAItems.map((item, index) => <QACard key={`${item.threadUrl}-${index}`} item={item} />)
            ) : (
                <p className="text-gray-400 md:col-span-2 text-center py-12">No Q&A items match your search or filters.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
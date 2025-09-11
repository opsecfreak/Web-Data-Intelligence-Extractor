import React, { useState, useRef, useEffect } from 'react';
import { Product } from '../types';
import { LinkIcon, ExportIcon } from './Icons';
import { generateProductCsv, generateProductHtml, exportDataAsFile } from '../utils/export';


interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleExport = (format: 'csv' | 'html') => {
    const filename = product.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    if (format === 'csv') {
        const csvContent = generateProductCsv([product]);
        exportDataAsFile(`${filename}.csv`, csvContent, 'text/csv;charset=utf-8;');
    } else {
        const htmlContent = generateProductHtml(product);
        exportDataAsFile(`${filename}.html`, htmlContent, 'text/html;charset=utf-8;');
    }
    setIsMenuOpen(false);
  };
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-5 transition-all duration-300 hover:shadow-cyan-500/10 hover:border-cyan-700 hover:-translate-y-1 flex flex-col h-full">
      <div className="flex justify-between items-start">
        <div className="flex-1 pr-4">
          <h3 className="text-xl font-bold text-cyan-400">{product.name}</h3>
          <p className="text-sm text-gray-400">Part #: {product.partNumber || 'N/A'}</p>
        </div>
        <div className="relative" ref={menuRef}>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-gray-400 hover:text-white rounded-full transition">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
            </button>
            {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-gray-900 border border-gray-700 rounded-md shadow-lg z-10">
                    <div className="py-1">
                        <button onClick={() => handleExport('csv')} className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">
                            <ExportIcon className="w-4 h-4 mr-2" /> Export as CSV
                        </button>
                        <button onClick={() => handleExport('html')} className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">
                           <ExportIcon className="w-4 h-4 mr-2" /> Export as HTML
                        </button>
                    </div>
                </div>
            )}
        </div>
      </div>
       <div className="text-lg font-semibold text-green-400 bg-green-900/50 px-3 py-1 rounded-md self-start my-3">
          {product.price || 'N/A'}
        </div>
      <p className="text-gray-300 flex-grow">{product.description}</p>
      {product.url && (
        <a 
          href={product.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center text-cyan-500 hover:text-cyan-400 mt-3 text-sm"
        >
          <LinkIcon className="mr-2" /> View Product Page
        </a>
      )}

      {product.mentions && product.mentions.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <h4 className="font-semibold text-gray-200 mb-2">Forum Intelligence:</h4>
          <ul className="space-y-3">
            {product.mentions.map((mention, index) => (
              <li key={index} className="bg-gray-900/70 p-3 rounded-md">
                <p className="text-gray-300 text-sm">"{mention.summary}"</p>
                <a 
                  href={mention.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-xs text-cyan-600 hover:text-cyan-500 mt-1"
                >
                  <LinkIcon className="w-4 h-4 mr-1" /> {mention.threadTitle}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ProductCard;

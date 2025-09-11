import React, { useState, useRef, useEffect } from 'react';
import { QAItem } from '../types';
import { LinkIcon, ExportIcon } from './Icons';
import { generateQaCsv, generateQaHtml, exportDataAsFile } from '../utils/export';

interface QACardProps {
  item: QAItem;
}

const QACard: React.FC<QACardProps> = ({ item }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleExport = (format: 'csv' | 'html') => {
    const filename = item.question.substring(0, 30).replace(/[^a-z0-9]/gi, '_').toLowerCase();
    if (format === 'csv') {
        const csvContent = generateQaCsv([item]);
        exportDataAsFile(`${filename}.csv`, csvContent, 'text/csv;charset=utf-8;');
    } else {
        const htmlContent = generateQaHtml(item);
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
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-5 transition-all duration-300 hover:shadow-teal-500/10 hover:border-teal-700 hover:-translate-y-1 flex flex-col h-full">
       <div className="flex justify-between items-start mb-2">
            <div className="flex-1 pr-4">
                <p className="text-sm text-gray-400">Question:</p>
                <h3 className="text-lg font-semibold text-teal-400">"{item.question}"</h3>
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

      <div className="mt-3 flex-grow">
        <p className="text-sm text-gray-400">Answer Summary:</p>
        <p className="text-gray-300">{item.answerSummary}</p>
      </div>
      
      {item.relatedProducts && item.relatedProducts.length > 0 && (
        <div className="mt-4">
          <p className="text-sm text-gray-400 mb-2">Related Products Mentioned:</p>
          <div className="flex flex-wrap gap-2">
            {item.relatedProducts.map((product, index) => (
              <span key={index} className="text-xs bg-gray-700 text-cyan-300 px-2 py-1 rounded-md">
                {product}
              </span>
            ))}
          </div>
        </div>
      )}

      {item.threadUrl && (
        <a 
          href={item.threadUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center text-teal-500 hover:text-teal-400 mt-4 text-sm"
        >
          <LinkIcon className="mr-2" /> View Forum Thread
        </a>
      )}
    </div>
  );
};

export default QACard;

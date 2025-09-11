
import React from 'react';
import { QAItem } from '../types';
import { LinkIcon } from './Icons';

interface QACardProps {
  item: QAItem;
}

const QACard: React.FC<QACardProps> = ({ item }) => {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-5 transition-all duration-300 hover:shadow-teal-500/10 hover:border-teal-700 hover:-translate-y-1">
      <div>
        <p className="text-sm text-gray-400">Question:</p>
        <h3 className="text-lg font-semibold text-teal-400 mb-2">"{item.question}"</h3>
      </div>
      <div className="mt-3">
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

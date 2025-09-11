
import React from 'react';
import { Product } from '../types';
import { LinkIcon } from './Icons';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-5 transition-all duration-300 hover:shadow-cyan-500/10 hover:border-cyan-700 hover:-translate-y-1">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-bold text-cyan-400">{product.name}</h3>
          <p className="text-sm text-gray-400">Part #: {product.partNumber || 'N/A'}</p>
        </div>
        <div className="text-lg font-semibold text-green-400 bg-green-900/50 px-3 py-1 rounded-md">
          {product.price || 'N/A'}
        </div>
      </div>
      <p className="text-gray-300 mt-3">{product.description}</p>
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

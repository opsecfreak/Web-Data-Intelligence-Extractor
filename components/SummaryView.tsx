import React, { useMemo } from 'react';
import { ScrapedData } from '../types';
import { ProductIcon, QuestionIcon, DollarIcon, TagIcon } from './Icons';

interface SummaryViewProps {
  data: ScrapedData;
}

/**
 * Parses a price string into a number, handling various currency formats.
 * @param priceString - The string to parse (e.g., "$1,299.99", "£150", "1.299,99 EUR").
 * @returns The parsed number or null if parsing fails.
 */
const parsePrice = (priceString: string): number | null => {
  if (!priceString || typeof priceString !== 'string') {
    return null;
  }
  
  // Remove currency symbols, codes (like USD), and whitespace
  let cleaned = priceString.replace(/[$\sA-Z€£]+/g, '').trim();
  
  const lastCommaIndex = cleaned.lastIndexOf(',');
  const lastDotIndex = cleaned.lastIndexOf('.');

  // Handle European-style decimals (e.g., "1.299,95")
  if (lastCommaIndex > lastDotIndex) {
    cleaned = cleaned.replace(/\./g, '').replace(',', '.');
  } else {
    // Handle American-style thousands separators (e.g., "1,299.95")
    cleaned = cleaned.replace(/,/g, '');
  }

  const price = parseFloat(cleaned);
  return isNaN(price) ? null : price;
};


const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string | number; colorClass: string }> = ({ icon, label, value, colorClass }) => (
    <div className={`bg-gray-800/60 p-5 rounded-xl border border-gray-700 flex items-center space-x-4`}>
        <div className={`p-3 rounded-full bg-gray-900 ${colorClass}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm text-gray-400">{label}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
        </div>
    </div>
);


const SummaryView: React.FC<SummaryViewProps> = ({ data }) => {
    const stats = useMemo(() => {
        const productCount = data.products?.length || 0;
        const qaCount = data.qaItems?.length || 0;

        const validPrices = data.products
            .map(p => parsePrice(p.price))
            .filter((price): price is number => price !== null);

        const averagePrice = validPrices.length > 0
            ? (validPrices.reduce((sum, price) => sum + price, 0) / validPrices.length)
            : 0;
            
        const keywordCounts: { [key: string]: number } = {};
        data.qaItems.forEach(item => {
            item.relatedProducts.forEach(productName => {
                const keyword = productName.trim();
                if (keyword) {
                    keywordCounts[keyword] = (keywordCounts[keyword] || 0) + 1;
                }
            });
        });
        const topKeywords = Object.entries(keywordCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
            .map(([keyword]) => keyword);

        return {
            productCount,
            qaCount,
            averagePrice: averagePrice.toFixed(2),
            topKeywords,
        };
    }, [data]);

    return (
        <div className="w-full max-w-7xl mx-auto p-4 md:px-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-300 mb-4">Analysis Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
               <StatCard 
                    icon={<ProductIcon className="w-6 h-6"/>}
                    label="Total Products"
                    value={stats.productCount}
                    colorClass="text-cyan-400"
               />
               <StatCard 
                    icon={<QuestionIcon className="w-6 h-6"/>}
                    label="Total Q&A Items"
                    value={stats.qaCount}
                    colorClass="text-teal-400"
               />
                <StatCard 
                    icon={<DollarIcon className="w-6 h-6"/>}
                    label="Average Product Price"
                    value={`$${stats.averagePrice}`}
                    colorClass="text-green-400"
               />
                 <div className="bg-gray-800/60 p-5 rounded-xl border border-gray-700 flex items-center space-x-4 col-span-1">
                    <div className="p-3 rounded-full bg-gray-900 text-purple-400">
                        <TagIcon className="w-6 h-6"/>
                    </div>
                    <div>
                        <p className="text-sm text-gray-400">Top Keywords</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                            {stats.topKeywords.length > 0 ? stats.topKeywords.map(kw => (
                                <span key={kw} className="text-xs bg-gray-700 text-purple-300 px-2 py-1 rounded-md">{kw}</span>
                            )) : <span className="text-sm text-gray-500">None found</span>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SummaryView;
import React, { useMemo } from 'react';
import { ScrapedData } from '../types';
import { ProductIcon, QuestionIcon, DollarIcon, TagIcon } from './Icons';
import { parsePrice } from '../utils/parsing';

interface SummaryViewProps {
  data: ScrapedData;
}

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string | number; colorClass: string }> = ({ icon, label, value, colorClass }) => (
    <div className={`bg-gray-800/60 p-3 rounded-xl border border-gray-700 flex items-center space-x-3`}>
        <div className={`p-2 rounded-full bg-gray-900 ${colorClass}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm text-gray-400">{label}</p>
            <p className="text-xl font-bold text-white">{value}</p>
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
        <div className="w-full max-w-7xl mx-auto mb-6">
            <h2 className="text-2xl font-bold text-gray-300 mb-3">Analysis Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
               <StatCard 
                    icon={<ProductIcon className="w-5 h-5"/>}
                    label="Total Products"
                    value={stats.productCount}
                    colorClass="text-cyan-400"
               />
               <StatCard 
                    icon={<QuestionIcon className="w-5 h-5"/>}
                    label="Total Q&A Items"
                    value={stats.qaCount}
                    colorClass="text-teal-400"
               />
                <StatCard 
                    icon={<DollarIcon className="w-5 h-5"/>}
                    label="Average Product Price"
                    value={`$${stats.averagePrice}`}
                    colorClass="text-green-400"
               />
                 <div className="bg-gray-800/60 p-3 rounded-xl border border-gray-700 flex items-center space-x-3 col-span-1">
                    <div className="p-2 rounded-full bg-gray-900 text-purple-400">
                        <TagIcon className="w-5 h-5"/>
                    </div>
                    <div>
                        <p className="text-sm text-gray-400">Top Keywords</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                            {stats.topKeywords.length > 0 ? stats.topKeywords.map(kw => (
                                <span key={kw} className="text-xs bg-gray-700 text-purple-300 px-2 py-0.5 rounded-md">{kw}</span>
                            )) : <span className="text-sm text-gray-500">None found</span>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SummaryView;
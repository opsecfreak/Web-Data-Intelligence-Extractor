import React, { useState, useEffect } from 'react';

const STATUS_MESSAGES = [
    "Initializing AI analysis...",
    "Crawling provided URLs...",
    "Parsing website content...",
    "Identifying products and discussions...",
    "Cross-referencing data points...",
    "Building intelligence report...",
    "Finalizing results...",
];

const ProgressBar: React.FC = () => {
    const [progress, setProgress] = useState(0);
    const [messageIndex, setMessageIndex] = useState(0);

    useEffect(() => {
        // Simulate progress for a better UX, as the actual process is a single long step.
        const progressInterval = setInterval(() => {
            setProgress(prev => {
                // Slow down the progress as it gets closer to 100
                if (prev >= 95) {
                    clearInterval(progressInterval);
                    return 95; // Hang at 95% until the process finishes
                }
                const increment = Math.random() * 5;
                return Math.min(prev + increment, 95);
            });
        }, 800);

        // Cycle through status messages
        const messageInterval = setInterval(() => {
            setMessageIndex(prev => (prev + 1) % STATUS_MESSAGES.length);
        }, 3000);

        return () => {
            clearInterval(progressInterval);
            clearInterval(messageInterval);
        };
    }, []);

    return (
        <div className="w-full max-w-2xl mx-auto p-4 flex flex-col items-center justify-center space-y-3">
            <div className="w-full bg-gray-700 rounded-full h-2.5">
                <div 
                    className="bg-gradient-to-r from-cyan-500 to-teal-500 h-2.5 rounded-full transition-all duration-500 ease-out" 
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
            <p className="text-cyan-300 text-sm font-medium text-center">
                {STATUS_MESSAGES[messageIndex]} ({Math.round(progress)}%)
            </p>
        </div>
    );
};

export default ProgressBar;
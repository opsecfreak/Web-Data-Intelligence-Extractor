import React from 'react';

const LoadingSpinner: React.FC<{ message: string }> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-8">
      <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-cyan-400"></div>
      <p className="text-cyan-300 text-lg font-medium">{message}</p>
    </div>
  );
};

export default LoadingSpinner;
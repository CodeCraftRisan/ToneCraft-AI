
import React from 'react';

interface LoaderProps {
  text?: string;
  size?: number;
}

const Loader: React.FC<LoaderProps> = ({ text, size = 6 }) => {
  const sizeClasses = `h-${size} w-${size}`;
  return (
    <div className="flex items-center justify-center gap-2">
      <div className={`${sizeClasses} animate-spin rounded-full border-4 border-solid border-purple-500 border-t-transparent`}></div>
      {text && <span className="text-gray-400">{text}</span>}
    </div>
  );
};

export default Loader;

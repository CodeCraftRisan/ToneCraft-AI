import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className }) => {
  return (
    <div className={`bg-gray-800 shadow-lg rounded-xl p-6 mb-8 transition-all duration-300 ${className}`}>
      {children}
    </div>
  );
};

export default Card;
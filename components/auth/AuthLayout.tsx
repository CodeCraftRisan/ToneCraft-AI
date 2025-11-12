
import React from 'react';

const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 p-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white tracking-tight">
          AI Communication Assistant
        </h1>
        <p className="text-gray-400 mt-2">Your personal writing and communication partner.</p>
      </div>
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;

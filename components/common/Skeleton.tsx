import React from 'react';

const SkeletonText: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`bg-gray-700 rounded-md animate-pulse ${className}`}></div>
);

export const ToneAnalysisSkeleton: React.FC = () => (
    <div>
        <SkeletonText className="h-8 w-2/4 mb-3" />
        <SkeletonText className="h-5 w-full" />
        <SkeletonText className="h-5 w-5/6 mt-1" />
    </div>
);


export const ClaritySkeleton: React.FC = () => (
    <div>
        <div className="flex items-baseline mb-4">
            <SkeletonText className="h-12 w-24" />
            <SkeletonText className="h-6 w-16 ml-2" />
        </div>
        <SkeletonText className="h-6 w-1/3 mb-3" />
        <ul className="space-y-2">
            <li><SkeletonText className="h-5 w-full" /></li>
            <li><SkeletonText className="h-5 w-5/6" /></li>
        </ul>
    </div>
);

export const DraftSkeleton: React.FC = () => (
    <div className="bg-gray-800 shadow-lg rounded-xl p-6 transition-all duration-300">
        <div className="flex justify-between items-center mb-4">
            <SkeletonText className="h-7 w-24 rounded-full" />
        </div>
        <SkeletonText className="h-5 w-full mb-2" />
        <SkeletonText className="h-5 w-full mb-2" />
        <SkeletonText className="h-5 w-3/4" />
    </div>
);

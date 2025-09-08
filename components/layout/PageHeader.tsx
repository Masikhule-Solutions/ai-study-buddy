import React from 'react';

interface PageHeaderProps {
  title: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title }) => {
  return (
    <header className="sticky top-0 z-10 bg-white/30 backdrop-blur-xl border-b border-gray-200/80 px-4 md:px-6 lg:px-8">
        <div className="flex items-center h-16">
            <h1 className="text-xl font-bold text-gray-800">{title}</h1>
        </div>
    </header>
  );
};

export default PageHeader;

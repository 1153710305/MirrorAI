import React from 'react';

interface HeaderProps {
    onOpenHistory: () => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenHistory }) => {
  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0 flex items-center gap-2">
            <div className="w-8 h-8 bg-fashion-black rounded-full flex items-center justify-center">
                <span className="text-fashion-accent font-bold text-lg">M</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-fashion-black">
              Mirror<span className="text-fashion-accent">AI</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
             <button 
                onClick={onOpenHistory}
                className="flex items-center gap-2 text-gray-600 hover:text-fashion-black transition-colors px-3 py-2 rounded-lg hover:bg-gray-100"
             >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="hidden sm:inline text-sm font-medium">历史记录</span>
             </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

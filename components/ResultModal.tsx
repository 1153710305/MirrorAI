import React from 'react';
import { TryOnResult } from '../types';

interface ResultModalProps {
  result: TryOnResult | null;
  onClose: () => void;
  isOpen: boolean;
}

const ResultModal: React.FC<ResultModalProps> = ({ result, onClose, isOpen }) => {
  if (!isOpen || !result) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* 背景遮罩 */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* 内容卡片 */}
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-4xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* 关闭按钮 */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex-1 overflow-auto p-2 bg-gray-100 flex items-center justify-center">
            <img 
              src={result.imageUrl} 
              alt="Generated Try-On" 
              className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-md"
            />
        </div>

        <div className="p-6 bg-white border-t border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-2">✨ 试穿效果</h3>
            {result.description && (
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                    {result.description}
                </p>
            )}
            <div className="flex gap-4">
                 <button 
                    onClick={() => {
                        const link = document.createElement('a');
                        link.href = result.imageUrl;
                        link.download = `mirror-ai-tryon-${Date.now()}.png`;
                        link.click();
                    }}
                    className="flex-1 bg-fashion-black text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                 >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M12 12.75l-3-3m0 0l-3 3m3-3v7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    下载图片
                 </button>
                 <button 
                    onClick={onClose}
                    className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                 >
                    重新调整
                 </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ResultModal;
import React from 'react';
import { HistoryItem } from '../types';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onSelectHistory: (item: HistoryItem) => void;
  onClearHistory: () => void;
}

/**
 * 历史记录侧边栏组件
 */
const HistoryDrawer: React.FC<HistoryDrawerProps> = ({ 
  isOpen, 
  onClose, 
  history, 
  onSelectHistory,
  onClearHistory
}) => {
  return (
    <>
      {/* 遮罩层 */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* 抽屉内容 */}
      <div className={`fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* 头部 */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white">
          <h2 className="text-xl font-bold text-gray-900">历史创作</h2>
          <button onClick={onClose} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 列表 */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mb-4 opacity-30">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
              <p>暂无历史记录</p>
              <p className="text-xs mt-2">生成的图片将暂时保存在这里</p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((item) => (
                <div 
                  key={item.id} 
                  onClick={() => onSelectHistory(item)}
                  className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-fashion-accent cursor-pointer transition-all group"
                >
                  <div className="flex gap-2 mb-2">
                    <div className="w-1/3 aspect-[3/4] bg-gray-100 rounded-md overflow-hidden relative">
                        <img src={item.personPreview} alt="Person" className="w-full h-full object-cover" />
                        <span className="absolute bottom-0 left-0 bg-black/50 text-white text-[10px] px-1 w-full text-center">人物</span>
                    </div>
                    <div className="w-1/3 aspect-[3/4] bg-gray-100 rounded-md overflow-hidden relative">
                         <img src={item.garmentPreview} alt="Garment" className="w-full h-full object-cover" />
                         <span className="absolute bottom-0 left-0 bg-black/50 text-white text-[10px] px-1 w-full text-center">服装</span>
                    </div>
                    <div className="w-1/3 aspect-[3/4] bg-gray-100 rounded-md overflow-hidden relative border-2 border-fashion-accent/20">
                         <img src={item.resultImage} alt="Result" className="w-full h-full object-cover" />
                         <span className="absolute bottom-0 left-0 bg-fashion-accent text-white text-[10px] px-1 w-full text-center font-bold">结果</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-xs text-gray-400 mt-2">
                    <span>{new Date(item.timestamp).toLocaleString()}</span>
                    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{item.modelName.includes('Flash') ? 'Flash' : 'Pro'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 底部清除 */}
        {history.length > 0 && (
            <div className="p-4 bg-white border-t border-gray-100">
                <button 
                    onClick={() => {
                        if(window.confirm('确定要清空所有历史记录吗？')) {
                            onClearHistory();
                        }
                    }}
                    className="w-full py-2 text-red-500 text-sm hover:bg-red-50 rounded-lg transition-colors"
                >
                    清空历史记录
                </button>
            </div>
        )}
      </div>
    </>
  );
};

export default HistoryDrawer;

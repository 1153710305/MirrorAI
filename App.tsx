import React, { useState, useCallback, useEffect, useRef } from 'react';
import Header from './components/Header';
import UploadCard from './components/UploadCard';
import ResultModal from './components/ResultModal';
import HistoryDrawer from './components/HistoryDrawer';
import { geminiService } from './services/geminiService';
import LocalStorageService from './services/localStorageService';
import Logger from './services/logger';
import { ImageUpload, TryOnResult, AppStatus, HistoryItem } from './types';
import { AVAILABLE_MODELS, DEFAULT_MODEL_ID, LOADING_MESSAGES } from './constants';

/**
 * 主应用组件
 * 采用移动端优先的响应式设计
 */
const App: React.FC = () => {
  // 状态管理
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);
  const [isCheckingKey, setIsCheckingKey] = useState<boolean>(true);
  const [isLocalEnv, setIsLocalEnv] = useState<boolean>(false); // 是否为本地/自托管环境

  // 核心数据状态
  const [personImage, setPersonImage] = useState<ImageUpload | null>(null);
  const [garmentImage, setGarmentImage] = useState<ImageUpload | null>(null);
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [result, setResult] = useState<TryOnResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  // 设置与选项
  const [extraPrompt, setExtraPrompt] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>(DEFAULT_MODEL_ID);
  
  // UI 交互状态
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [historyList, setHistoryList] = useState<HistoryItem[]>([]);
  const [loadingMsg, setLoadingMsg] = useState<string>(LOADING_MESSAGES[0]);

  // 加载提示轮播定时器
  const loadingTimerRef = useRef<number | null>(null);

  // 初始化检查 API Key 状态 和 加载历史记录
  useEffect(() => {
    const checkKey = async () => {
        try {
            if (window.aistudio) {
                const hasSelected = await window.aistudio.hasSelectedApiKey();
                setHasApiKey(hasSelected);
                setIsLocalEnv(false);
            } else {
                // 如果没有 window.aistudio，说明是本地或自托管环境
                // 我们假设用户通过环境变量 process.env.API_KEY 配置了 Key
                // 暂时设置为 true，如果在请求时报错 MISSING_API_KEY，再显示错误
                setHasApiKey(true);
                setIsLocalEnv(true);
            }
        } catch (e) {
            console.error("检查 API Key 失败", e);
        } finally {
            setIsCheckingKey(false);
        }
    };
    checkKey();
    refreshHistory();
  }, []);

  // 轮播加载文字
  useEffect(() => {
    if (status === AppStatus.PROCESSING) {
        let index = 0;
        setLoadingMsg(LOADING_MESSAGES[0]);
        loadingTimerRef.current = window.setInterval(() => {
            index = (index + 1) % LOADING_MESSAGES.length;
            setLoadingMsg(LOADING_MESSAGES[index]);
        }, 2000);
    } else {
        if (loadingTimerRef.current) {
            clearInterval(loadingTimerRef.current);
            loadingTimerRef.current = null;
        }
    }
    return () => {
        if (loadingTimerRef.current) clearInterval(loadingTimerRef.current);
    };
  }, [status]);

  const refreshHistory = () => {
      setHistoryList(LocalStorageService.getHistory());
  };

  // 处理连接 API Key (仅限 AI Studio 环境)
  const handleConnectApiKey = async () => {
    if (window.aistudio) {
        try {
            await window.aistudio.openSelectKey();
            setHasApiKey(true);
            setErrorMessage('');
        } catch (e) {
            Logger.error("选择 API Key 失败", e);
        }
    }
  };

  // 处理生成逻辑
  const handleGenerate = useCallback(async () => {
    if (!personImage || !garmentImage) {
      setErrorMessage("请先上传您的照片和服装照片");
      return;
    }

    setStatus(AppStatus.PROCESSING);
    setErrorMessage('');
    setResult(null); // 清除上次结果
    
    try {
      // 调用 Service 层
      const data = await geminiService.generateTryOn(
          personImage, 
          garmentImage, 
          extraPrompt,
          selectedModel
      );
      
      setResult(data);
      setStatus(AppStatus.SUCCESS);

      // 保存到历史记录
      const newHistoryItem: HistoryItem = {
          id: Date.now().toString(),
          timestamp: Date.now(),
          personPreview: personImage.previewUrl,
          garmentPreview: garmentImage.previewUrl,
          resultImage: data.imageUrl,
          prompt: extraPrompt,
          modelName: AVAILABLE_MODELS.find(m => m.id === selectedModel)?.name || selectedModel
      };
      LocalStorageService.addHistory(newHistoryItem);
      refreshHistory();

    } catch (err: any) {
      Logger.error("生成过程发生错误", err);
      
      const errorMsg = err.message;

      // 1. 权限不足 (需付费)
      if (errorMsg === 'PERMISSION_DENIED') {
        setHasApiKey(false);
        setErrorMessage("授权已过期或权限不足，请重新连接 API Key (需使用付费项目)");
        setStatus(AppStatus.IDLE);
        return;
      }

      // 2. 缺少 Key (本地环境未配置 .env)
      if (errorMsg === 'MISSING_API_KEY') {
        setHasApiKey(false); // 这会触发显示登录/配置页
        // 如果是本地环境，hasApiKey false 后会显示配置指引
        setStatus(AppStatus.IDLE);
        return;
      }

      // 3. Key 格式错误 (本地环境 .env 写法问题)
      if (errorMsg === 'MALFORMED_API_KEY') {
        setErrorMessage("API Key 格式错误。请检查 .env 文件，确保 Key 没有被引号包裹，且是以 AIza 开头的字符串。请按 F12 查看控制台日志以获取详情。");
        setStatus(AppStatus.ERROR);
        return;
      }

      // 4. Key 无效 (Referrer 限制/局域网访问)
      if (errorMsg === 'INVALID_API_KEY') {
        setErrorMessage("API Key 无效 (400 Bad Request)。请按 F12 打开控制台查看您发送的 Key 是否正确。如果在局域网访问，请在 Google Cloud Console 检查 Referrer 设置。");
        setStatus(AppStatus.ERROR);
        return;
      }

      // 其他错误
      setErrorMessage(errorMsg || "未知错误，请重试");
      setStatus(AppStatus.ERROR);
    }
  }, [personImage, garmentImage, extraPrompt, selectedModel]);

  // 从历史记录恢复
  const handleSelectHistory = (item: HistoryItem) => {
      setResult({
          imageUrl: item.resultImage,
          description: "从历史记录加载"
      });
      // 注意：这里没有恢复 personImage/garmentImage 的 file 对象，因为 LocalStorage 没存 Blob
      // 如果需要重新生成，用户需要重新上传。这里仅做展示。
      setIsHistoryOpen(false);
  };

  const handleClearHistory = () => {
      LocalStorageService.clearHistory();
      refreshHistory();
  };

  // 渲染加载中界面
  if (isCheckingKey) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-fashion-gray">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fashion-black"></div>
        </div>
    );
  }

  // 渲染 Key 连接/登录界面
  if (!hasApiKey) {
    return (
        <div className="min-h-screen flex flex-col bg-white font-sans">
             <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 max-w-lg mx-auto w-full text-center">
                <div className="w-16 h-16 bg-fashion-black rounded-full flex items-center justify-center mb-6 shadow-lg">
                    <span className="text-fashion-accent font-bold text-3xl">M</span>
                </div>
                <h2 className="text-3xl font-extrabold text-gray-900 mb-2">MirrorAI Pro</h2>
                
                {errorMessage && (
                    <div className="mb-6 bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm w-full border border-red-100">
                        {errorMessage}
                    </div>
                )}

                {/* AI Studio 环境显示连接按钮 */}
                {!isLocalEnv ? (
                    <>
                        <p className="text-gray-500 mb-8 text-lg">
                            为了提供高保真的面部保持和专业级图像合成，我们需要连接您的 Google Cloud API Key。
                        </p>
                        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 shadow-sm w-full mb-8">
                            <h3 className="font-semibold text-gray-800 mb-2">💎 专业版模型</h3>
                            <p className="text-sm text-gray-600 mb-4">使用 <code>gemini-3-pro-image-preview</code> 获得最佳体验。</p>
                            <button
                                onClick={handleConnectApiKey}
                                className="w-full py-3.5 px-6 rounded-xl bg-fashion-black text-white font-bold text-lg hover:bg-gray-800 transition-all hover:shadow-lg active:scale-95 flex items-center justify-center gap-2"
                            >
                                连接 API Key
                            </button>
                        </div>
                         <p className="text-xs text-gray-400">
                            注意：请确保选择已绑定 Billing 的 Google Cloud 项目。<br/>
                            <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="underline hover:text-fashion-black">了解计费详情</a>
                        </p>
                    </>
                ) : (
                    /* 本地环境显示环境变量配置指引 */
                    <div className="text-left w-full">
                         <p className="text-gray-500 mb-6 text-center">
                            检测到本地运行环境。请配置 API Key 以继续。
                        </p>
                        <div className="bg-gray-800 text-gray-200 p-6 rounded-xl overflow-x-auto text-sm mb-6">
                            <p className="mb-2 text-gray-400"># 在项目根目录创建或修改 .env 文件:</p>
                            <code className="text-green-400">API_KEY=AIzaSyD...你的Key...</code>
                            <p className="mt-4 mb-2 text-yellow-400 font-bold">⚠️ 注意：不要给 Key 加引号！</p>
                            <code className="text-red-300 line-through">API_KEY="AIza..."</code> <span className="text-gray-400">(错误写法)</span>
                        </div>
                         <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 text-sm text-yellow-800">
                            <strong>⚠️ 局域网访问报错 (400 Error)?</strong>
                            <p className="mt-1">
                                如果您在手机或其他设备通过 IP 访问（如 192.168.x.x），Google 可能会拒绝该请求。
                                <br/>解决方案：请前往 Google Cloud Console > Credentials，找到您的 API Key，确保 <strong>Application restrictions</strong> 为 None，或在 <strong>Website restrictions</strong> 中添加该局域网 IP。
                            </p>
                        </div>
                        <button 
                            onClick={() => window.location.reload()}
                            className="mt-6 w-full py-3 rounded-xl border border-gray-300 hover:bg-gray-50 font-semibold"
                        >
                            配置完成后点击刷新
                        </button>
                    </div>
                )}
             </div>
        </div>
    );
  }

  const isProcessing = status === AppStatus.PROCESSING;

  return (
    <div className="min-h-screen flex flex-col bg-fashion-gray font-sans relative overflow-x-hidden">
      <Header onOpenHistory={() => setIsHistoryOpen(true)} />

      <HistoryDrawer 
        isOpen={isHistoryOpen} 
        onClose={() => setIsHistoryOpen(false)} 
        history={historyList}
        onSelectHistory={handleSelectHistory}
        onClearHistory={handleClearHistory}
      />

      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* 顶部介绍 */}
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-fashion-black mb-4">
            预见 <span className="text-fashion-accent">更美的自己</span>
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg">
            上传您的照片和心仪的衣物，AI 将为您生成逼真的上身效果图。
          </p>
        </div>

        {/* 核心操作区：左右分栏 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* 左侧：人物上传 */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-xs">1</span>
                    上传您的照片
                </h3>
                <span className="text-xs text-gray-400">全身/半身清晰照</span>
            </div>
            <UploadCard 
              title="添加人物照片" 
              subtitle="点击或拖拽上传全身照"
              image={personImage}
              onImageSelected={setPersonImage}
              className="h-80 sm:h-96 shadow-sm hover:shadow-md"
            />
          </div>

          {/* 右侧：服装上传 */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-fashion-accent text-white flex items-center justify-center text-xs">2</span>
                    上传服装照片
                </h3>
                <span className="text-xs text-gray-400">平铺图或模特图</span>
            </div>
            <UploadCard 
              title="添加服装照片" 
              subtitle="点击或拖拽上传衣服图片"
              image={garmentImage}
              onImageSelected={setGarmentImage}
              className="h-80 sm:h-96 shadow-sm hover:shadow-md"
            />
          </div>
        </div>

        {/* 底部控制区：设置与生成 */}
        <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 flex flex-col gap-6 max-w-3xl mx-auto border border-gray-100">
            
            {/* 错误提示 */}
            {errorMessage && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex flex-col gap-1 text-sm">
                    <div className="flex items-center gap-2 font-semibold">
                         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        生成失败
                    </div>
                    <div>{errorMessage}</div>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 风格输入 */}
                <div>
                    <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-2">
                        风格调整 (可选)
                    </label>
                    <input
                        type="text"
                        id="prompt"
                        value={extraPrompt}
                        onChange={(e) => setExtraPrompt(e.target.value)}
                        placeholder="例如：商务休闲风、自然阳光..."
                        className="block w-full rounded-xl border-gray-300 bg-gray-50 border px-4 py-3 text-gray-900 focus:border-fashion-accent focus:ring-fashion-accent sm:text-sm transition-all outline-none"
                    />
                </div>

                {/* 模型选择 */}
                <div>
                    <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-2">
                        选择模型
                    </label>
                    <div className="relative">
                        <select
                            id="model"
                            value={selectedModel}
                            onChange={(e) => setSelectedModel(e.target.value)}
                            className="block w-full rounded-xl border-gray-300 bg-gray-50 border px-4 py-3 text-gray-900 focus:border-fashion-accent focus:ring-fashion-accent sm:text-sm transition-all outline-none appearance-none cursor-pointer"
                        >
                            {AVAILABLE_MODELS.map(m => (
                                <option key={m.id} value={m.id}>{m.name}</option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                             </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* 模型描述提示 */}
            <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded-lg">
                <span className="font-semibold">当前模型特性：</span>
                {AVAILABLE_MODELS.find(m => m.id === selectedModel)?.description}
            </div>

            <button
                onClick={handleGenerate}
                disabled={isProcessing || !personImage || !garmentImage}
                className={`
                    w-full py-4 px-6 rounded-xl text-white font-bold text-lg shadow-lg transform transition-all duration-200
                    flex items-center justify-center gap-3 overflow-hidden relative
                    ${isProcessing || !personImage || !garmentImage 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-fashion-black to-gray-800 hover:scale-[1.01] hover:shadow-xl active:scale-[0.99]'}
                `}
            >
                {isProcessing ? (
                    <div className="flex flex-col items-center animate-pulse">
                        <div className="flex items-center gap-2">
                             <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>{loadingMsg}</span>
                        </div>
                    </div>
                ) : (
                    <>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-fashion-accent">
                          <path fillRule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813a3.75 3.75 0 002.576-2.576l.813-2.846A.75.75 0 019 4.5zM6.97 11.03a.75.75 0 111.06-1.06l.75.75a.75.75 0 01-1.06 1.06l-.75-.75z" clipRule="evenodd" />
                        </svg>
                        生成试穿效果
                    </>
                )}
            </button>
        </div>

      </main>

      {/* 结果模态框 */}
      <ResultModal 
        isOpen={!!result || status === AppStatus.SUCCESS} 
        result={result} 
        onClose={() => {
            setResult(null);
            setStatus(AppStatus.IDLE);
        }} 
      />

      <footer className="bg-white border-t border-gray-200 mt-12 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
            <p>&copy; {new Date().getFullYear()} MirrorAI. Powered by Google Gemini.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
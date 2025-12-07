import React, { useRef } from 'react';
import { ImageUpload } from '../types';

interface UploadCardProps {
  title: string;
  subtitle: string;
  image: ImageUpload | null;
  onImageSelected: (img: ImageUpload) => void;
  accept?: string;
  className?: string;
}

/**
 * 通用图片上传组件
 * 支持点击上传和拖拽上传（虽然此处主要实现点击，但保留了扩展性）
 */
const UploadCard: React.FC<UploadCardProps> = ({ 
  title, 
  subtitle, 
  image, 
  onImageSelected, 
  accept = "image/*",
  className 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // 提取 base64 data (去除 data:image/xxx;base64, 前缀)
      const base64Data = result.split(',')[1];
      const mimeType = file.type;

      onImageSelected({
        file,
        previewUrl: result,
        base64Data,
        mimeType
      });
    };
    reader.readAsDataURL(file);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div 
      className={`relative group cursor-pointer border-2 border-dashed border-gray-300 rounded-2xl hover:border-fashion-accent transition-all duration-300 bg-white overflow-hidden ${className}`}
      onClick={handleClick}
    >
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept={accept} 
        className="hidden" 
      />
      
      {image ? (
        <div className="w-full h-full relative">
          <img 
            src={image.previewUrl} 
            alt={title} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
          />
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
             <span className="text-white font-medium bg-black/50 px-4 py-2 rounded-full backdrop-blur-sm">更换图片</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
             <p className="text-white text-sm font-semibold">{title}</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 sm:h-80 p-6 text-center">
          <div className="w-16 h-16 mb-4 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-fashion-accent/10 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-gray-400 group-hover:text-fashion-accent">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="mt-2 text-sm text-gray-500">{subtitle}</p>
        </div>
      )}
    </div>
  );
};

export default UploadCard;
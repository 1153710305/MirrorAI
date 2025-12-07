/**
 * 图片上传的数据结构
 */
export interface ImageUpload {
  /** 文件对象 */
  file: File;
  /** 预览图片的 URL */
  previewUrl: string;
  /** 不带前缀的 base64 字符串，用于 API 发送 */
  base64Data: string;
  /** 文件的 MIME 类型 */
  mimeType: string;
}

/**
 * 试衣请求参数
 */
export interface TryOnRequest {
  /** 用户人物图片 */
  personImage: ImageUpload;
  /** 服装图片 */
  garmentImage: ImageUpload;
  /** 用户额外的要求，比如“在海边”、“商务风格” */
  additionalPrompt?: string;
  /** 使用的模型ID */
  modelId: string;
}

/**
 * API响应结果
 */
export interface TryOnResult {
  /** 结果图片的 URL (base64) */
  imageUrl: string;
  /** 模型对结果的描述 */
  description?: string;
}

/**
 * 历史记录项结构
 */
export interface HistoryItem {
  id: string;
  timestamp: number;
  personPreview: string; // 仅存预览图URL，不存Base64以节省空间（注意：Base64过大可能导致LocalStorage溢出，这里为了演示简化存Base64 Preview，实际项目应存云端URL）
  garmentPreview: string;
  resultImage: string;
  prompt: string;
  modelName: string;
}

/**
 * 模型配置选项
 */
export interface ModelOption {
  id: string;
  name: string;
  description: string;
  isRecommended?: boolean;
}

/**
 * 日志级别枚举
 */
export enum LogLevel {
  /** 信息 */
  INFO = 'INFO',
  /** 警告 */
  WARN = 'WARN',
  /** 错误 */
  ERROR = 'ERROR'
}

/**
 * 加载状态枚举
 */
export enum AppStatus {
  /** 空闲状态 */
  IDLE = 'IDLE',
  /** 处理中 */
  PROCESSING = 'PROCESSING',
  /** 成功 */
  SUCCESS = 'SUCCESS',
  /** 错误 */
  ERROR = 'ERROR'
}

declare global {
  /**
   * AI Studio 全局对象接口
   * 用于管理 API Key 选择
   */
  interface AIStudio {
    /**
     * 检查是否已选择 API Key
     * @returns Promise<boolean>
     */
    hasSelectedApiKey: () => Promise<boolean>;
    /**
     * 打开 API Key 选择对话框
     * @returns Promise<void>
     */
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    /**
     * AI Studio 全局实例，可能未定义
     */
    aistudio?: AIStudio;
  }
}

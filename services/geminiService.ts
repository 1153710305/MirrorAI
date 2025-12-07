import { GoogleGenAI } from "@google/genai";
import { TryOnResult, ImageUpload } from '../types';
import { 
  DEFAULT_MODEL_ID,
  SYSTEM_PROMPT, 
  generateUserPrompt,
  PROMPT_BASE_IMAGE_LABEL,
  PROMPT_GARMENT_IMAGE_LABEL
} from '../constants';
import Logger from './logger';

/**
 * Gemini 服务类
 * 封装与 Google GenAI SDK 的交互逻辑
 */
class GeminiService {
  // 移除构造函数中的初始化，改为在方法调用时动态创建，
  // 以便在用户重新选择 API Key 后能立即生效（解决 Race Condition）
  constructor() {
  }

  /**
   * 执行虚拟试衣生成任务
   * @param personImg 用户图片对象
   * @param garmentImg 服装图片对象
   * @param extraPrompt 用户额外提示词
   * @param modelId 使用的模型ID
   * @returns Promise<TryOnResult>
   */
  async generateTryOn(
    personImg: ImageUpload, 
    garmentImg: ImageUpload, 
    extraPrompt: string = '',
    modelId: string = DEFAULT_MODEL_ID
  ): Promise<TryOnResult> {
    
    Logger.info(`开始请求 Gemini 进行虚拟试衣生成，模型: ${modelId}`);

    // 获取原始 Key
    let apiKey = process.env.API_KEY || '';

    // --- 核心修复：Key 清洗与验证 ---
    // 1. 去除可能存在的引号 (单引号或双引号) - 这是 .env 常见错误
    apiKey = apiKey.replace(/['"]/g, '');
    // 2. 去除首尾空格
    apiKey = apiKey.trim();

    // 3. 打印脱敏日志帮助调试
    if (apiKey) {
        const maskedKey = apiKey.length > 8 
            ? `${apiKey.substring(0, 5)}...${apiKey.substring(apiKey.length - 4)}` 
            : '******';
        Logger.info(`正在使用的 API Key: ${maskedKey} (长度: ${apiKey.length})`);
    } else {
        Logger.error("未检测到 API Key");
    }

    if (!apiKey) {
        Logger.error("API_KEY 为空，请先选择 API Key 或配置 .env");
        throw new Error("MISSING_API_KEY");
    }

    // 4. 格式预检：Google API Key 通常以 AIza 开头
    if (!apiKey.startsWith('AIza')) {
        Logger.error(`API Key 格式看起来不正确 (未以 AIza 开头). 当前值前缀: ${apiKey.substring(0, 3)}...`);
        // 这里不抛出错误，而是尝试继续，但记录警告，因为极少数情况可能不同
        Logger.warn("警告：API Key 格式可能不正确，建议检查 .env 文件是否包含多余字符。");
    }
    // ---------------------------

    const ai = new GoogleGenAI({ apiKey });

    try {
      // 1. 准备 Prompt
      const textPrompt = generateUserPrompt(extraPrompt);
      
      // 2. 准备图片数据部分
      // 这里的顺序和标注非常重要，用于引导模型理解哪张是底图
      const parts = [
        {
          text: SYSTEM_PROMPT
        },
        {
          text: PROMPT_BASE_IMAGE_LABEL
        },
        {
          inlineData: {
            mimeType: personImg.mimeType,
            data: personImg.base64Data
          }
        },
        {
           text: PROMPT_GARMENT_IMAGE_LABEL
        },
        {
          inlineData: {
            mimeType: garmentImg.mimeType,
            data: garmentImg.base64Data
          }
        },
        {
            text: textPrompt
         }
      ];

      // 3. 调用 API
      // 使用 generateContent 接口
      const response = await ai.models.generateContent({
        model: modelId,
        contents: {
          parts: parts
        },
        config: {
            // 图像生成配置
        }
      });

      Logger.info("API 请求成功，正在解析结果...");

      // 4. 解析结果
      // 结果可能包含生成的图片（inlineData）或文本描述
      let generatedImageUrl = '';
      let description = '';

      if (response.candidates && response.candidates[0].content && response.candidates[0].content.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            // 找到了图片部分
            const base64Data = part.inlineData.data;
            const mimeType = part.inlineData.mimeType || 'image/png'; // 默认为 png
            generatedImageUrl = `data:${mimeType};base64,${base64Data}`;
          } else if (part.text) {
            // 找到了文本部分
            description += part.text;
          }
        }
      }

      if (!generatedImageUrl) {
        // 如果没有生成图片，通常是由于安全过滤或 Prompt 拒绝
        Logger.warn("未返回图片，可能是模型拒绝了请求。", response);
        throw new Error("模型未能生成图片，请尝试更换清晰的照片，或检查图片是否包含敏感内容。");
      }

      return {
        imageUrl: generatedImageUrl,
        description: description
      };

    } catch (error: any) {
      Logger.error("Gemini API 调用失败", error);
      
      const errorMsg = error.message || JSON.stringify(error);

      // 处理 API Key 无效 (400 Bad Request)
      // 通常是因为 Referrer 限制（局域网访问）或 Key 本身错误
      if (errorMsg.includes('API_KEY_INVALID') || errorMsg.includes('API key not valid')) {
         // 再次检查格式，如果是格式问题，抛出特定错误
         if (!apiKey.startsWith('AIza')) {
            throw new Error("MALFORMED_API_KEY");
         }
         throw new Error("INVALID_API_KEY");
      }

      // 捕获权限错误 (403 Forbidden)
      // 通常是因为没有付费项目权限
      if (errorMsg.includes('403') || errorMsg.includes('PERMISSION_DENIED') || errorMsg.includes('Requested entity was not found')) {
         throw new Error("PERMISSION_DENIED");
      }

      throw new Error(error.message || "生成失败，请稍后重试。");
    }
  }
}

// 导出单例实例
export const geminiService = new GeminiService();
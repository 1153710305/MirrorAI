import { HistoryItem } from '../types';
import { STORAGE_KEY_HISTORY } from '../constants';
import Logger from './logger';

/**
 * 本地存储服务
 * 处理历史记录的增删改查
 */
class LocalStorageService {
  /**
   * 获取所有历史记录
   */
  static getHistory(): HistoryItem[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_HISTORY);
      if (!raw) return [];
      return JSON.parse(raw);
    } catch (e) {
      Logger.error("读取历史记录失败", e);
      return [];
    }
  }

  /**
   * 添加一条历史记录
   * @param item 新记录
   */
  static addHistory(item: HistoryItem): void {
    try {
      const current = this.getHistory();
      // 新记录插在最前面
      const updated = [item, ...current];
      // 限制存储数量，防止 LocalStorage 爆满 (例如保留最近20条)
      // 注意：Base64 图片很大，LocalStorage 只有 5MB 左右限制
      // 在生产环境中，应该只存 URL 或 IndexedDB。这里为了 Demo 稳定性，限制为最近 10 条。
      const limited = updated.slice(0, 10);
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(limited));
    } catch (e) {
      Logger.error("保存历史记录失败 (可能是存储空间不足)", e);
    }
  }

  /**
   * 清空历史记录
   */
  static clearHistory(): void {
    localStorage.removeItem(STORAGE_KEY_HISTORY);
  }
}

export default LocalStorageService;

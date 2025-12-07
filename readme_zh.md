# MirrorAI (魔镜试衣)

## 项目简介
MirrorAI 是一款基于 React 和 Google Gemini 多模态大模型开发的虚拟试衣 Web 应用。它允许用户上传自己的照片和心仪的服装图片，通过 AI 技术生成逼真的上身效果图，帮助用户在购买前预览穿着效果。

## 核心功能
*   **高保真试衣**：默认采用 `gemini-3-pro-image-preview` 模型，专注于保留用户面部特征（Face ID）和体态。
*   **多模型选择 (New)**：用户可以在“高保真 Pro 版”（注重质量）和“极速 Flash 版”（注重速度）之间自由切换。
*   **历史记录 (New)**：自动保存生成的试衣效果，支持通过侧边栏随时查看过往创作。
*   **智能进度提示 (New)**：生成过程中展示具体的 AI 处理步骤，缓解等待焦虑。
*   **双图上传**：支持用户分别上传人物全身照和服装照片。
*   **AI 智能合成**：将目标服装的材质、光影自然融合到用户照片中。
*   **风格定制**：用户可以通过文字输入额外的场景或风格需求。

## 技术栈
*   **前端框架**: React 18+ (TypeScript)
*   **样式库**: Tailwind CSS
*   **AI 模型**: Google Gemini API (`@google/genai` SDK)
*   **数据存储**: LocalStorage (客户端本地存储)

## 快速开始

### 前置要求
1.  Node.js 16+
2.  有效的 Google Gemini API Key（需申请支持 `gemini-3-pro-image-preview` 的权限）。

### 安装与运行

1.  克隆仓库。
2.  在项目根目录下创建 `.env` 文件，并添加 API Key：
    ```env
    # 注意：确保不要将带有真实Key的.env文件提交到Git仓库
    API_KEY=你的Google_API_Key
    ```
3.  安装依赖：
    ```bash
    npm install react react-dom @google/genai
    ```
4.  运行项目。

## 常见问题与故障排查

### 1. 报错 `API Key not valid` (Error 400)
如果您在本地局域网测试时遇到此错误，通常有两个原因：

**原因 A: .env 格式错误 (最常见)**
您可能在 `.env` 文件中给 Key 加了引号。
*   ❌ 错误写法: `API_KEY="AIzaSyD..."`
*   ✅ 正确写法: `API_KEY=AIzaSyD...` (直接粘贴，不要空格，不要引号)

**解决方案**：检查 `.env` 文件，去除 Key 周围的引号和空格。

**原因 B: 局域网 Referrer 限制**
如果您在 Google Cloud Console 中设置了 Referrer 限制，局域网 IP 可能被拦截。
**解决方案**：
1.  访问 [Google Cloud Console](https://console.cloud.google.com/apis/credentials)。
2.  检查 **Application restrictions** (应用限制) 设置。
3.  如果是 "None" 但依然报错，请尝试创建一个新的 API Key 测试，或者检查是否有其他网络代理干扰。

### 2. 报错 `PERMISSION_DENIED` (Error 403)
这通常表示您使用的 API Key 关联的项目没有开通付费功能，或者没有访问特定模型（如 `gemini-3-pro-image-preview`）的权限。请确保在 Google AI Studio 中连接了已绑定 Billing 的 GCP 项目。

## 代码结构
*   `App.tsx`: 主应用入口，包含状态管理和页面布局。
*   `services/geminiService.ts`: 封装 Gemini API 调用逻辑。
*   `services/localStorageService.ts`: 处理历史记录的本地存取。
*   `constants.ts`: 管理所有提示词（Prompt）和模型常量。
*   `components/`: UI 组件库（上传卡片、结果展示、历史抽屉等）。

## 版本历史
*   v1.2.2: 修复本地 API Key 格式校验问题，增强日志输出，自动清洗 Key 中的引号。
*   v1.2.1: 优化局域网访问体验，增加 API Key 配置指引和错误排查提示。
*   v1.2.0: 新增模型选择功能（Pro/Flash），新增历史记录侧边栏，优化加载动画体验。
*   v1.1.0: 升级模型为 `gemini-3-pro-image-preview`，大幅优化 Prompt 以解决“生成人物不一致”的问题。
*   v1.0.0: 初始版本发布，支持基础虚拟试衣功能。
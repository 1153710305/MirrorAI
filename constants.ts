/**
 * 应用全局配置常量
 */

/**
 * 可用的模型列表
 */
export const AVAILABLE_MODELS = [
  {
    id: 'gemini-3-pro-image-preview',
    name: 'Pro 高保真版 (推荐)',
    description: '最佳的人物一致性与细节保留，适合正式试穿。',
    isRecommended: true
  },
  {
    id: 'gemini-2.5-flash-image',
    name: 'Flash 极速版',
    description: '生成速度极快，适合快速预览大概效果，人物相似度略低。',
    isRecommended: false
  }
];

export const DEFAULT_MODEL_ID = 'gemini-3-pro-image-preview';

/**
 * 加载过程中的提示语轮播
 */
export const LOADING_MESSAGES = [
  "正在连接 AI 造型中心...",
  "正在分析人物骨骼关键点...",
  "正在提取服装材质与纹理...",
  "正在计算光影与褶皱...",
  "正在进行最终渲染合成...",
  "即将完成，请稍候..."
];

/**
 * 本地存储的 Key
 */
export const STORAGE_KEY_HISTORY = 'mirror_ai_history_v1';

/**
 * 系统提示词与结构化Prompt
 * 采用Markdown格式方便阅读和修改
 */
export const SYSTEM_PROMPT = `
你是一位专业的AI图像修图师和虚拟试衣专家。你的核心任务是**图像编辑（Image Editing）**，而不是创造新的人物。

请严格遵守以下【核心指令】：
1. **绝对一致性**：第一张图片（人物照）是**底图**。你必须直接使用这张图片中的人物脸部、发型、体型、姿势、肤色和背景。**严禁**重新生成一张新的人脸或改变人物的身体结构。
2. **衣物替换**：第二张图片（服装照）是**素材**。提取这件衣服的纹理、款式、颜色，将其自然地“合成”到底图人物的身上。
3. **融合处理**：
   - 衣服的褶皱、光影必须遵循底图的光源方向。
   - 衣服的遮挡关系要符合人物的姿势（如手插兜、抱臂等）。
   - 如果衣服是长袖而底图是短袖，请自然覆盖手臂；反之亦然。

**违规禁忌**：
- ❌ 绝对不要改变人物的面部五官（Face ID）。
- ❌ 绝对不要改变图片的背景环境。
- ❌ 绝对不要改变图片的构图比例。
`;

/**
 * 图片标签提示词 - 底图
 */
export const PROMPT_BASE_IMAGE_LABEL = "以下是【图片1：底图/人物照】(Base Image - Keep Face ID & Pose):";

/**
 * 图片标签提示词 - 服装图
 */
export const PROMPT_GARMENT_IMAGE_LABEL = "以下是【图片2：服装照】(Garment Reference):";

/**
 * 生成用户请求的Prompt
 * @param extraInstruction 用户额外的风格指令
 * @returns 完整的 Prompt 字符串
 */
export const generateUserPrompt = (extraInstruction: string = ''): string => {
  return `
请执行虚拟试衣任务：

【输入说明】
- 图片1 (Base Image): 用户本人照片。请保持这张图的**人脸**和**背景**完全不变。
- 图片2 (Garment Image): 目标服装。

【操作要求】
将图片2中的服装穿在图片1的人物身上。
1. **面部锁定**：必须100%保留图片1中的面部特征，不要做任何美化或修改。
2. **姿态锁定**：保持图片1的身体姿势不变。
3. **服装适配**：根据人物的体型，调整服装的剪裁和贴合度。

${extraInstruction ? `【额外风格/细节要求】: ${extraInstruction}` : '【风格要求】: 保持原图的摄影风格和光线感，看起来像是一张真实的抓拍照片。'}
`;
};

/**
 * 默认占位图，提升UI体验
 */
export const PLACEHOLDER_PERSON = "https://picsum.photos/400/600?random=1";
export const PLACEHOLDER_GARMENT = "https://picsum.photos/400/400?random=2";

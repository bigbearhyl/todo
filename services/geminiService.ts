import { GoogleGenAI, Type } from "@google/genai";
import { AISettings } from "../types";

const DEFAULT_MODEL = 'gemini-2.5-flash';

export const getAISettings = (): AISettings => {
  if (typeof window === 'undefined') return { apiKey: '', baseUrl: '', modelName: DEFAULT_MODEL };
  
  const saved = localStorage.getItem('smartplan_ai_settings');
  if (saved) {
    return JSON.parse(saved);
  }
  return {
    apiKey: '',
    baseUrl: '',
    modelName: DEFAULT_MODEL
  };
};

export const generateSuggestedSubtasks = async (taskTitle: string, taskDescription: string): Promise<string[]> => {
  const settings = getAISettings();
  
  // 优先使用用户设置的 Key，如果没有则尝试读取环境变量（兼容开发环境）
  // Note: process.env.API_KEY might be empty in production client-side build if not injected
  const apiKey = settings.apiKey || (typeof process !== 'undefined' && process.env && process.env.API_KEY) || '';

  if (!apiKey) {
    console.warn("API_KEY is missing. Please configure it in Settings.");
    return ["检查日程安排", "准备所需材料", "执行主要任务", "复盘与总结"];
  }

  try {
    // 动态构建配置对象
    const clientOptions: any = { apiKey };
    
    // 只有当 baseUrl 不为空时才设置，否则使用 SDK 默认值
    if (settings.baseUrl && settings.baseUrl.trim() !== '') {
      clientOptions.baseUrl = settings.baseUrl;
    }

    // 每次调用都创建一个新的实例以确保使用最新的配置
    const ai = new GoogleGenAI(clientOptions);

    const prompt = `
      我有一个任务，标题是："${taskTitle}"，描述是："${taskDescription}"。
      请为我生成 3 到 5 个具体、可执行的每日子任务或里程碑，帮助我完成这个目标。
      请保持简短精炼（每个不超过 15 个字）。请直接返回 JSON 数组格式的字符串，内容用中文回答。
    `;

    const response = await ai.models.generateContent({
      model: settings.modelName || DEFAULT_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    
    const result = JSON.parse(text);
    return Array.isArray(result) ? result : [];
    
  } catch (error) {
    console.error("Error generating subtasks:", error);
    return ["AI 服务连接失败，请检查设置中的 API Key 和地址"];
  }
};

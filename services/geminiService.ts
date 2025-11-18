import { GoogleGenAI, Type } from "@google/genai";

// Initialize Gemini Client
const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateSuggestedSubtasks = async (taskTitle: string, taskDescription: string): Promise<string[]> => {
  if (!apiKey) {
    console.warn("API_KEY is missing. Skipping AI generation.");
    return ["检查日程安排", "准备所需材料", "执行主要任务", "复盘与总结"];
  }

  try {
    const prompt = `
      我有一个任务，标题是："${taskTitle}"，描述是："${taskDescription}"。
      请为我生成 3 到 5 个具体、可执行的每日子任务或里程碑，帮助我完成这个目标。
      请保持简短精炼（每个不超过 15 个字）。请直接返回 JSON 数组格式的字符串，内容用中文回答。
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
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
    return [];
  }
};
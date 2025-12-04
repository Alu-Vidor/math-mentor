import { GoogleGenAI } from "@google/genai";

// Initialize the client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// We use gemini-3-pro-preview for better mathematical reasoning and image analysis capabilities.
const MODEL_NAME = 'gemini-3-pro-preview';

const SYSTEM_INSTRUCTION = `
Ты — опытный, мудрый, строгий, но справедливый школьный учитель математики. 
Твоя цель — научить ученика мыслить, а не просто дать ответ.
Обращайся к ученику на "ты".
Стиль общения: поддерживающий, педагогический, структурированный.
`;

export const getMathHint = async (imageBase64: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: imageBase64
            }
          },
          {
            text: "Посмотри на это фото с решением задачи. Ученик просит подсказку. Не говори полное решение и ответ. Найди место, где ученик мог застрять или совершить ошибку, и дай наводящую подсказку. Если решение кажется верным, просто подбодри и предложи проверить вычисления."
          }
        ]
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        thinkingConfig: { thinkingBudget: 1024 } // Allow some reasoning time
      }
    });

    return response.text || "Извини, я не смог разглядеть решение. Попробуй сделать фото четче.";
  } catch (error) {
    console.error("Error getting hint:", error);
    return "Произошла ошибка при анализе изображения. Попробуй еще раз.";
  }
};

export const getFullAnalysis = async (imageBase64: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: imageBase64
            }
          },
          {
            text: `Подсказка не помогла. Проведи полный разбор решения на фото.
            1. Проверь ход решения.
            2. Если есть ошибки, выпиши их по пунктам. Для каждой ошибки объясни, ПОЧЕМУ так нельзя делать, ссылаясь на математические правила.
            3. Напиши правильный ход решения и ответ.
            Используй Markdown для форматирования (жирный шрифт, списки).`
          }
        ]
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        thinkingConfig: { thinkingBudget: 2048 } // More reasoning for full analysis
      }
    });

    return response.text || "Не удалось сформировать полный разбор. Попробуй загрузить фото заново.";
  } catch (error) {
    console.error("Error getting analysis:", error);
    return "Произошла ошибка при составлении разбора. Попробуй позже.";
  }
};
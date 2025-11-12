
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { ToneAnalysis, ClarityReport, Draft } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const textModel = 'gemini-2.5-flash';
const ttsModel = 'gemini-2.5-flash-preview-tts';

export const analyzeTone = async (text: string): Promise<ToneAnalysis> => {
    try {
        const response = await ai.models.generateContent({
            model: textModel,
            contents: `Analyze the tone of the following text. Provide the dominant tone, a suitable emoji, and a brief reason. Text: "${text}"`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        tone: { type: Type.STRING, description: "The dominant tone (e.g., Formal, Casual, Confident)." },
                        emoji: { type: Type.STRING, description: "A single emoji that represents the tone." },
                        reason: { type: Type.STRING, description: "A brief explanation for the tone analysis." }
                    },
                    required: ["tone", "emoji", "reason"],
                }
            }
        });
        const result = JSON.parse(response.text);
        return result as ToneAnalysis;
    } catch (error) {
        console.error("Error analyzing tone:", error);
        throw new Error("Failed to analyze tone.");
    }
};

export const rewriteText = async (text: string, targetTone: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: textModel,
            contents: `Rewrite the following text to have a more "${targetTone}" tone, while preserving the core message. Return only the rewritten text. Text: "${text}"`,
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error rewriting text:", error);
        throw new Error("Failed to rewrite text.");
    }
};

export const checkClarity = async (text: string): Promise<ClarityReport> => {
    try {
        const response = await ai.models.generateContent({
            model: textModel,
            contents: `Analyze the clarity and readability of the following text. Provide a clarity score from 0 to 100. Also, provide up to 3 specific, actionable suggestions for improvement. Text: "${text}"`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        clarityScore: { type: Type.INTEGER, description: "A clarity score from 0 (very unclear) to 100 (very clear)." },
                        suggestions: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                            description: "An array of actionable suggestions."
                        }
                    },
                    required: ["clarityScore", "suggestions"],
                }
            }
        });
        const result = JSON.parse(response.text);
        return result as ClarityReport;
    } catch (error) {
        console.error("Error checking clarity:", error);
        throw new Error("Failed to check clarity.");
    }
};

export const generateDrafts = async (incomingMessage: string, instruction: string): Promise<Draft[]> => {
    try {
        const response = await ai.models.generateContent({
            model: textModel,
            contents: `Based on the following incoming message and user instruction, generate 3 complete draft replies with varying tones (e.g., Direct, Sympathetic, Detailed).\n\nIncoming Message:\n"${incomingMessage}"\n\nUser Instruction:\n"${instruction}"`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            tone: { type: Type.STRING, description: "The tone of the draft (e.g., Direct, Sympathetic)." },
                            text: { type: Type.STRING, description: "The full text of the draft reply." }
                        },
                        required: ["tone", "text"]
                    }
                }
            }
        });
        const result = JSON.parse(response.text);
        return result as Draft[];
    } catch (error) {
        console.error("Error generating drafts:", error);
        throw new Error("Failed to generate drafts.");
    }
};

export const generateSpeech = async (text: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: ttsModel,
            contents: [{ parts: [{ text: text }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' },
                    },
                },
            },
        });
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) {
            throw new Error("No audio data received from API.");
        }
        return base64Audio;
    } catch (error) {
        console.error("Error generating speech:", error);
        throw new Error("Failed to generate speech.");
    }
};

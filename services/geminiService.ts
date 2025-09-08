
import { GoogleGenAI, Type } from "@google/genai";
import type { ChatMessage, Quiz, Flashcard, StudyPlan } from '../types';

// Check for API key without throwing an error to allow the app to render.
export const isApiKeySet = !!(process.env && process.env.API_KEY);

const ai = isApiKeySet ? new GoogleGenAI({ apiKey: process.env.API_KEY }) : null;
const model = "gemini-2.5-flash";

const ensureApiKey = () => {
    if (!ai) {
        console.error("Gemini API key not configured. Please set the API_KEY environment variable.");
        return false;
    }
    return true;
}

export async function* getChatResponseStream(history: ChatMessage[], newMessage: ChatMessage, context?: string): AsyncGenerator<string> {
    if (!ensureApiKey()) {
        yield "API key not configured. Please follow the setup instructions in the README file.";
        return;
    }

    try {
        let systemInstruction = "You are an AI Study Buddy, an expert tutor. Explain concepts clearly, concisely, and in a friendly, encouraging tone. Help students understand their study material.";

        if (context) {
            systemInstruction = `You are an AI Study Buddy. Your primary goal is to answer questions based *only* on the provided study material.
            
STUDY MATERIAL:
---
${context}
---

When the user asks a question, first search the STUDY MATERIAL for the answer.
- If you find the answer, provide it based on the material.
- If you cannot find the answer in the STUDY MATERIAL, you MUST explicitly state: "I couldn't find the answer in your study material, but I can answer it based on my general knowledge." and then proceed to answer the question.

Maintain a friendly and encouraging tone.`;
        }
        
        const chat = ai.chats.create({ 
            model,
            history: history.map(msg => ({
                role: msg.role,
                parts: [{ text: msg.text }] // Simplified history for this model
            })),
            config: {
                systemInstruction
            }
        });

        // FIX: Corrected the type of `parts` to allow for text parts.
        const parts: ({ text: string } | { inlineData: { mimeType: string; data: string; } })[] = [{ text: newMessage.text }];
        if (newMessage.image) {
            parts.unshift({
                inlineData: {
                    mimeType: newMessage.image.mimeType,
                    data: newMessage.image.data,
                }
            });
        }

        // FIX: Changed `message: { parts }` to `message: parts` to correctly pass multipart content.
        const result = await chat.sendMessageStream({ message: parts });

        for await (const chunk of result) {
            yield chunk.text;
        }
    } catch (error) {
        console.error("Gemini chat error:", error);
        yield "Sorry, I encountered an error. Please try again.";
    }
};

export const analyzeImage = async (imageBase64: string, mimeType: string): Promise<string> => {
    if (!ensureApiKey()) return "API key not configured.";

    try {
        const imagePart = {
            inlineData: {
                data: imageBase64,
                mimeType,
            },
        };
        const textPart = {
            text: "You are an expert academic assistant. Analyze this image of study notes or a textbook page. Extract the key concepts, summarize the main points, and identify any important definitions or formulas. Present the information in a clear, structured format using markdown.",
        };

        const response = await ai.models.generateContent({
            model,
            contents: { parts: [imagePart, textPart] },
        });

        return response.text;
    } catch (error) {
        console.error("Gemini image analysis error:", error);
        return "Sorry, I couldn't analyze the image. Please ensure it's a clear photo of text and try again.";
    }
};

export const generateQuiz = async (topic: string): Promise<Quiz | null> => {
    if (!ensureApiKey()) return null;

     try {
        const response = await ai.models.generateContent({
            model,
            contents: `Generate a 5-question multiple-choice quiz on the topic: "${topic}". For each question, provide four options, indicate the correct answer's index (0-3), and a brief explanation for why it's correct.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            question: { type: Type.STRING },
                            options: {
                                type: Type.ARRAY,
                                items: { type: Type.STRING }
                            },
                            correctAnswerIndex: { type: Type.INTEGER },
                            explanation: { type: Type.STRING }
                        },
                        required: ["question", "options", "correctAnswerIndex", "explanation"]
                    }
                }
            }
        });
        
        const jsonText = response.text.trim();
        const quizData = JSON.parse(jsonText);
        
        // Basic validation
        if (Array.isArray(quizData) && quizData.every(q => 'question' in q && 'options' in q && 'correctAnswerIndex' in q)) {
            return quizData as Quiz;
        } else {
            throw new Error("Invalid quiz format received");
        }

    } catch (error) {
        console.error("Gemini quiz generation error:", error);
        return null;
    }
};

export const generateImage = async (prompt: string): Promise<string | null> => {
    if (!ensureApiKey()) return null;
    
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/png',
                aspectRatio: '1:1',
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
            return `data:image/png;base64,${base64ImageBytes}`;
        }
        return null;
    } catch (error) {
        console.error("Gemini image generation error:", error);
        return null;
    }
};

export const generateFlashcards = async (topic: string): Promise<Flashcard[] | null> => {
    if (!ensureApiKey()) return null;

    try {
        const response = await ai.models.generateContent({
            model,
            contents: `Generate a set of 10-15 flashcards for the topic: "${topic}". For each flashcard, provide a "front" with a key term or question, and a "back" with the corresponding definition or answer.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            front: { type: Type.STRING, description: "The term or question on the front of the card." },
                            back: { type: Type.STRING, description: "The definition or answer on the back of the card." }
                        },
                        required: ["front", "back"]
                    }
                }
            }
        });
        
        const jsonText = response.text.trim();
        const flashcardData = JSON.parse(jsonText);

        if (Array.isArray(flashcardData) && flashcardData.every(f => 'front' in f && 'back' in f)) {
            return flashcardData as Flashcard[];
        } else {
            throw new Error("Invalid flashcard format received");
        }
    } catch (error) {
        console.error("Gemini flashcard generation error:", error);
        return null;
    }
};

export const generateStudyPlan = async (topic: string, goal: string, duration: number): Promise<StudyPlan | null> => {
    if (!ensureApiKey()) return null;

    try {
        const response = await ai.models.generateContent({
            model,
            contents: `Create a ${duration}-day study plan for the topic "${topic}". The user's goal is to "${goal}". For each day, provide a specific sub-topic and a concrete task or exercise to complete.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            day: { type: Type.INTEGER, description: "The day number in the plan (e.g., 1, 2, 3)." },
                            topic: { type: Type.STRING, description: "The specific sub-topic to focus on for the day." },
                            task: { type: Type.STRING, description: "A concrete task or exercise for the day." }
                        },
                        required: ["day", "topic", "task"]
                    }
                }
            }
        });
        
        const jsonText = response.text.trim();
        const planData = JSON.parse(jsonText);

        if (Array.isArray(planData) && planData.every(p => 'day' in p && 'topic' in p && 'task' in p)) {
            // Add the 'completed' property to each day
            return planData.map(p => ({ ...p, completed: false })) as StudyPlan;
        } else {
            throw new Error("Invalid study plan format received");
        }
    } catch (error) {
        console.error("Gemini study plan generation error:", error);
        return null;
    }
};
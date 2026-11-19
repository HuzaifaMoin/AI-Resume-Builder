import OpenAI from "openai";

// OpenRouter exposes an OpenAI-compatible API, so the OpenAI SDK works with it.
// Free models can be slow or rate limited, so every request has a hard timeout
// instead of the SDK's 10-minute default.
const ai = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
    timeout: 45000,
    maxRetries: 1,
    defaultHeaders: {
        "X-Title": "AI Resume Builder",
    },
});

// Primary model from the environment, with OpenRouter's free router as a fallback
// when the primary model is busy or rate limited.
export const AI_MODEL = process.env.OPENROUTER_MODEL || "openrouter/free";
const FALLBACK_MODEL = "openrouter/free";

export async function createCompletion(params) {
    const models = AI_MODEL === FALLBACK_MODEL ? [AI_MODEL] : [AI_MODEL, FALLBACK_MODEL];
    return ai.chat.completions.create({
        ...params,
        model: models[0],
        // OpenRouter-specific: try the next model if the first one fails.
        ...(models.length > 1 ? { models } : {}),
    });
}

// Free models sometimes wrap JSON in ```json fences or add text around it.
export function parseJsonResponse(text) {
    if (!text) throw new Error("The AI returned an empty response");
    const cleaned = text.replace(/```(?:json)?/gi, "").trim();
    try {
        return JSON.parse(cleaned);
    } catch {
        const start = cleaned.indexOf("{");
        const end = cleaned.lastIndexOf("}");
        if (start !== -1 && end > start) {
            return JSON.parse(cleaned.slice(start, end + 1));
        }
        throw new Error("The AI response was not valid JSON");
    }
}

export function aiErrorMessage(error) {
    if (error?.name === "APIConnectionTimeoutError" || /timed out/i.test(error?.message || "")) {
        return "The AI service took too long to respond. Please try again.";
    }
    if (error?.status === 429) {
        return "The AI service is busy right now. Please try again in a minute.";
    }
    return error?.message || "AI request failed";
}

export default ai;

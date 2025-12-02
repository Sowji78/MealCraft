import { GoogleGenAI, Type, Schema } from "@google/genai";
import { UserProfile, DietPlan, RecipeSuggestion, DayPlan, Meal, NutritionInfo } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Schemas ---

const nutritionSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    calories: { type: Type.NUMBER },
    protein: { type: Type.NUMBER },
    carbs: { type: Type.NUMBER },
    fats: { type: Type.NUMBER },
  },
  required: ["calories", "protein", "carbs", "fats"],
};

const mealSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING },
    type: { type: Type.STRING, enum: ["breakfast", "lunch", "snack", "dinner"] },
    description: { type: Type.STRING },
    ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
    nutrition: nutritionSchema,
    recipeSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: ["name", "type", "description", "ingredients", "nutrition"],
};

const dayPlanSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    day: { type: Type.STRING },
    meals: { type: Type.ARRAY, items: mealSchema },
    totalNutrition: nutritionSchema,
    summary: { type: Type.STRING },
  },
  required: ["day", "meals", "totalNutrition", "summary"],
};

const dietPlanSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    description: { type: Type.STRING },
    days: { type: Type.ARRAY, items: dayPlanSchema },
  },
  required: ["title", "description", "days"],
};

const recipeListSchema: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      timeToCook: { type: Type.STRING },
      difficulty: { type: Type.STRING },
      calories: { type: Type.NUMBER },
      ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
      instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
    },
    required: ["title", "timeToCook", "ingredients", "instructions"],
  },
};

// --- Services ---

export const generateDietPlan = async (profile: UserProfile, durationDays: number = 3): Promise<DietPlan> => {
  const prompt = `
    Generate a personalized ${durationDays}-day diet plan for a user with the following profile:
    - Age: ${profile.age}, Gender: ${profile.gender}, Height: ${profile.height}cm, Weight: ${profile.weight}kg
    - Activity: ${profile.activityLevel}
    - Goal: ${profile.goal}
    - Diet Preference: ${profile.dietType}
    - Cuisines: ${profile.cuisinePreferences.join(", ")}
    - Allergies: ${profile.allergies.join(", ")}
    - Medical Conditions: ${profile.medicalConditions.join(", ")}
    
    The plan should include specific meals with estimated nutrition facts.
    Also provide a motivating description and title for the plan.
    Ensure meals are diverse and fit the calorie requirements for the goal.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: dietPlanSchema,
      thinkingConfig: { thinkingBudget: 0 } // Speed over deep reasoning for this structured task
    },
  });

  const data = JSON.parse(response.text || "{}");
  
  // Add IDs and timestamp locally
  return {
    ...data,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  } as DietPlan;
};

export const generateRecipesFromIngredients = async (ingredients: string[], imageBase64?: string): Promise<RecipeSuggestion[]> => {
  let contents: any = [];
  
  if (imageBase64) {
    contents.push({
      inlineData: {
        mimeType: "image/jpeg",
        data: imageBase64
      }
    });
    contents.push({ text: "Identify the ingredients in this image and suggest 3 healthy recipes using them." });
  } else {
    contents.push({ text: `Suggest 3 healthy recipes using these ingredients: ${ingredients.join(", ")}. Assume user has basic pantry staples.` });
  }

  const response = await ai.models.generateContent({
    model: imageBase64 ? "gemini-2.5-flash-image" : "gemini-2.5-flash",
    contents: { parts: contents }, // Correct structure for mixed content
    config: {
      responseMimeType: "application/json",
      responseSchema: recipeListSchema,
    }
  });

  return JSON.parse(response.text || "[]") as RecipeSuggestion[];
};

export const generateAppLogo = async (): Promise<string | null> => {
  try {
      // Using Flash Image for fast generation
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              text: "Create a clean and modern logo for a brand called 'MealCraft'. Use a plain white background. In the center of the logo, place a cartoon-style man with a big belly, smiling happily, looking satisfied after eating. Next to him or around him, show small subtle icons of food (non-veg items like chicken leg, fish, eggs). The man should look friendly, cute, and cheerful. Below the character, add the tagline in bold clean font: 'eat and happy'. Use soft colors, minimal shading, and a modern flat illustration style suitable for a food and diet website.",
            },
          ],
        },
        config: {
            imageConfig: {
                aspectRatio: "1:1",
            }
        }
      });

      // Extract image
      for (const part of response.candidates?.[0]?.content?.parts || []) {
          if (part.inlineData) {
              return `data:image/png;base64,${part.inlineData.data}`;
          }
      }
      return null;
  } catch (e) {
      console.error("Logo generation failed", e);
      return null;
  }
};

export const chatWithFoodAI = async (message: string, history: {role: string, parts: {text: string}[]}[]): Promise<string> => {
    const chat = ai.chats.create({
        model: "gemini-2.5-flash",
        history: history,
        config: {
            systemInstruction: "You are MealCraft AI, a friendly and knowledgeable nutrition assistant. Keep answers concise and helpful."
        }
    });

    const result = await chat.sendMessage({ message });
    return result.text || "I couldn't process that.";
};

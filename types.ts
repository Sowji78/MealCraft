export interface UserProfile {
  name: string;
  age: number;
  height: number; // cm
  weight: number; // kg
  gender: 'male' | 'female' | 'other';
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  goal: 'loss' | 'maintain' | 'gain';
  dietType: 'veg' | 'non-veg' | 'vegan' | 'keto' | 'paleo';
  cuisinePreferences: string[];
  allergies: string[];
  medicalConditions: string[];
}

export interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface Meal {
  id: string;
  name: string;
  type: 'breakfast' | 'lunch' | 'snack' | 'dinner';
  description: string;
  ingredients: string[];
  nutrition: NutritionInfo;
  recipeSteps?: string[];
}

export interface DayPlan {
  day: string; // "Monday", "Day 1", etc.
  meals: Meal[];
  totalNutrition: NutritionInfo;
  summary: string;
}

export interface DietPlan {
  id: string;
  title: string;
  description: string; // AI generated context
  days: DayPlan[];
  createdAt: string;
}

export interface GroceryItem {
  name: string;
  category: string;
  quantity: string;
  checked: boolean;
}

export interface RecipeSuggestion {
  title: string;
  timeToCook: string;
  difficulty: string;
  calories: number;
  ingredients: string[];
  instructions: string[];
  matchScore?: number; // How well it matches user input
}

export enum AppStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

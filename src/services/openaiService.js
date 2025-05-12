import { generateMeal as apiGenerateMeal } from './apiService';

// Function to generate a meal using our backend API (which uses OpenAI)
export const generateMeal = async (mealType, preferences, calorieRange, cookingTime) => {
  try {
    // Validate required parameters
    if (!mealType || mealType.trim() === '') {
      throw new Error('Meal type is required');
    }
    
    // Call our backend API
    const meal = await apiGenerateMeal(mealType, preferences, calorieRange, cookingTime);
    
    // If the meal doesn't have an ID, generate one
    if (!meal.id) {
      meal.id = generateUniqueId();
    }
    
    return meal;
  } catch (error) {
    console.error('Error generating meal:', error);
    throw new Error('Failed to generate meal. Please try again later.');
  }
};

// Generate a unique ID for the meal
const generateUniqueId = () => {
  return Date.now().toString() + Math.random().toString(36).substring(2, 9);
};

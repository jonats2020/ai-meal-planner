import {
  getMealFavorites,
  saveMealFavorite,
  removeMealFavorite,
  checkMealFavorite,
  getPlannedMeals as getApiPlannedMeals,
  savePlannedMeals as saveApiPlannedMeals,
  clearAllData as clearApiAllData
} from './apiService';

// Save a meal to favorites
export const saveFavoriteMeal = async (meal) => {
  try {
    // Check if the meal is already in favorites
    const isFavorite = await isMealFavorite(meal.id);
    
    if (!isFavorite) {
      // Add the meal to favorites via API
      await saveMealFavorite(meal);
    }
    
    return true;
  } catch (error) {
    console.error('Error saving favorite meal:', error);
    throw error;
  }
};

// Get all favorite meals
export const getFavoriteMeals = async () => {
  try {
    const meals = await getMealFavorites();
    return meals || [];
  } catch (error) {
    console.error('Error getting favorite meals:', error);
    throw error;
  }
};

// Remove a meal from favorites
export const removeFavoriteMeal = async (mealId) => {
  try {
    await removeMealFavorite(mealId);
    return true;
  } catch (error) {
    console.error('Error removing favorite meal:', error);
    throw error;
  }
};

// Check if a meal is in favorites
export const isMealFavorite = async (mealId) => {
  try {
    const response = await checkMealFavorite(mealId);
    return response.isFavorite;
  } catch (error) {
    console.error('Error checking if meal is favorite:', error);
    throw error;
  }
};

// Save planned meals
export const savePlannedMeal = async (meals) => {
  try {
    await saveApiPlannedMeals(meals);
    return true;
  } catch (error) {
    console.error('Error saving planned meals:', error);
    throw error;
  }
};

// Get all planned meals
export const getPlannedMeals = async () => {
  try {
    const meals = await getApiPlannedMeals();
    return meals || [];
  } catch (error) {
    console.error('Error getting planned meals:', error);
    // For error tolerance, return empty array if there's an issue
    return [];
  }
};

// Clear all user data (for testing/debugging)
export const clearAllData = async () => {
  try {
    await clearApiAllData();
    return true;
  } catch (error) {
    console.error('Error clearing all data:', error);
    throw error;
  }
};

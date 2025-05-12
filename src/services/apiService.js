// API service for communicating with our backend
// Define a base URL that works in the development environment
const API_BASE_URL = 'http://localhost:3000/api';

// Generic API request function
const apiRequest = async (endpoint, method = 'GET', data = null) => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    // Add body data if provided (for POST/PUT requests)
    if (data && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);
    
    // Check if the request was successful
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API request failed with status ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API ${method} request to ${endpoint} failed:`, error);
    throw error;
  }
};

// Meal API endpoints
export const getMealFavorites = () => apiRequest('/meals/favorites');

export const saveMealFavorite = (meal) => apiRequest('/meals/favorites', 'POST', meal);

export const removeMealFavorite = (mealId) => apiRequest(`/meals/favorites/${mealId}`, 'DELETE');

export const checkMealFavorite = (mealId) => apiRequest(`/meals/favorites/${mealId}`);

export const getPlannedMeals = () => apiRequest('/meals/planned');

export const savePlannedMeals = (meals) => apiRequest('/meals/planned', 'POST', meals);

export const clearAllData = () => apiRequest('/meals/all', 'DELETE');

// OpenAI API endpoints
export const generateMeal = (mealType, preferences, calorieRange, cookingTime) => {
  return apiRequest('/openai/generate-meal', 'POST', {
    mealType,
    preferences,
    calorieRange,
    cookingTime
  });
};

export default {
  getMealFavorites,
  saveMealFavorite,
  removeMealFavorite,
  checkMealFavorite,
  getPlannedMeals,
  savePlannedMeals,
  clearAllData,
  generateMeal
};
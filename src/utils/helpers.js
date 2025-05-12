// Format date to readable string
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};

// Calculate calories for a given recipe based on servings
export const calculateCaloriesPerServing = (totalCalories, servings) => {
  if (!totalCalories || !servings || servings <= 0) return 0;
  return Math.round(totalCalories / servings);
};

// Convert cooking time string to minutes for sorting/comparison
export const cookingTimeToMinutes = (timeString) => {
  if (!timeString) return 0;
  
  const timeStr = timeString.toLowerCase();
  let totalMinutes = 0;
  
  // Extract hours
  const hoursMatch = timeStr.match(/(\d+)\s*h/);
  if (hoursMatch) {
    totalMinutes += parseInt(hoursMatch[1]) * 60;
  }
  
  // Extract minutes
  const minutesMatch = timeStr.match(/(\d+)\s*m/);
  if (minutesMatch) {
    totalMinutes += parseInt(minutesMatch[1]);
  }
  
  // If no pattern matched but there's a number, assume it's minutes
  if (totalMinutes === 0) {
    const justNumber = timeStr.match(/(\d+)/);
    if (justNumber) {
      totalMinutes = parseInt(justNumber[1]);
    }
  }
  
  return totalMinutes;
};

// Filter meals by type
export const filterMealsByType = (meals, type) => {
  if (!type || type === 'All') return meals;
  return meals.filter(meal => meal.type === type);
};

// Sort meals by various criteria
export const sortMeals = (meals, sortBy) => {
  const sortedMeals = [...meals];
  
  switch (sortBy) {
    case 'calories-low-to-high':
      return sortedMeals.sort((a, b) => a.calories - b.calories);
    case 'calories-high-to-low':
      return sortedMeals.sort((a, b) => b.calories - a.calories);
    case 'name-a-to-z':
      return sortedMeals.sort((a, b) => a.name.localeCompare(b.name));
    case 'name-z-to-a':
      return sortedMeals.sort((a, b) => b.name.localeCompare(a.name));
    case 'cooking-time':
      return sortedMeals.sort((a, b) => {
        return cookingTimeToMinutes(a.cookingTime) - cookingTimeToMinutes(b.cookingTime);
      });
    default:
      return sortedMeals;
  }
};

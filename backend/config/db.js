const supabase = require('./supabase');
const sqlite = require('./sqlite');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Track which database is being used
let usingSupabase = true;
let dbInitialized = false;

// Create the data directory if it doesn't exist
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize the database
const initializeDatabase = async () => {
  if (dbInitialized) {
    return true;
  }
  
  // Try to check if Supabase is available
  try {
    // Check for favorite_meals table
    const { data: favData, error: favError } = await supabase
      .from('favorite_meals')
      .select('id')
      .limit(1);
    
    // Check for planned_meals table  
    const { data: planData, error: planError } = await supabase
      .from('planned_meals')
      .select('id')
      .limit(1);
    
    // If both tables exist or we got non-42P01 errors, supabase might be configured correctly
    const favExists = !favError || favError.code !== '42P01';
    const planExists = !planError || planError.code !== '42P01';
    
    if (favExists && planExists) {
      console.log('Using Supabase for database operations');
      usingSupabase = true;
      dbInitialized = true;
      return true;
    }
    
    // If tables don't exist, try inserting to create them
    if (favError && favError.code === '42P01') {
      console.log('favorite_meals table does not exist in Supabase');
      const { error } = await supabase
        .from('favorite_meals')
        .insert([{ 
          id: 'init-test',
          title: 'Initialization Test',
          type: 'test',
          user_id: 'system'
        }]);
      
      if (error && error.code === '42P01') {
        console.error('Could not create favorite_meals table in Supabase');
      }
    }
    
    if (planError && planError.code === '42P01') {
      console.log('planned_meals table does not exist in Supabase');
      const { error } = await supabase
        .from('planned_meals')
        .insert([{ 
          user_id: 'system',
          meals_data: []
        }]);
      
      if (error && error.code === '42P01') {
        console.error('Could not create planned_meals table in Supabase');
      }
    }
    
    // Recheck after insertion attempts
    const { error: recheckFavError } = await supabase.from('favorite_meals').select('id').limit(1);
    const { error: recheckPlanError } = await supabase.from('planned_meals').select('id').limit(1);
    
    if ((!recheckFavError || recheckFavError.code !== '42P01') && 
        (!recheckPlanError || recheckPlanError.code !== '42P01')) {
      console.log('Using Supabase for database operations');
      usingSupabase = true;
      dbInitialized = true;
      return true;
    }
    
    // If still failing, fall back to SQLite
    console.log('Supabase tables not available, falling back to SQLite');
    usingSupabase = false;
  } catch (error) {
    console.error('Error checking Supabase:', error);
    console.log('Falling back to SQLite');
    usingSupabase = false;
  }
  
  // Initialize SQLite if needed
  if (!usingSupabase) {
    try {
      await sqlite.initializeDatabase();
      console.log('Using SQLite for database operations');
      dbInitialized = true;
      return true;
    } catch (error) {
      console.error('Error initializing SQLite:', error);
      return false;
    }
  }
  
  return false;
};

// Get favorite meals
const getFavoriteMeals = async (userId = 'default_user') => {
  if (usingSupabase) {
    const { data, error } = await supabase
      .from('favorite_meals')
      .select('*')
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error getting favorite meals from Supabase:', error);
      throw error;
    }
    
    return data || [];
  } else {
    try {
      const meals = await sqlite.getData(
        'SELECT * FROM favorite_meals WHERE user_id = ?',
        [userId]
      );
      
      // Parse JSON fields
      return meals.map(meal => ({
        ...meal,
        ingredients: JSON.parse(meal.ingredients || '[]'),
        instructions: JSON.parse(meal.instructions || '[]'),
        nutritional_info: JSON.parse(meal.nutritional_info || '{}')
      }));
    } catch (error) {
      console.error('Error getting favorite meals from SQLite:', error);
      throw error;
    }
  }
};

// Save a favorite meal
const saveFavoriteMeal = async (meal, userId = 'default_user') => {
  const mealWithUser = {
    ...meal,
    user_id: userId,
    date_added: new Date().toISOString()
  };
  
  if (usingSupabase) {
    const { error } = await supabase
      .from('favorite_meals')
      .insert([mealWithUser]);
    
    if (error) {
      console.error('Error saving favorite meal to Supabase:', error);
      throw error;
    }
    
    return true;
  } else {
    try {
      // Convert array/object fields to JSON strings
      const mealForSqlite = {
        ...mealWithUser,
        ingredients: JSON.stringify(mealWithUser.ingredients || []),
        instructions: JSON.stringify(mealWithUser.instructions || []),
        nutritional_info: JSON.stringify(mealWithUser.nutritional_info || {})
      };
      
      await sqlite.runQuery(
        `INSERT INTO favorite_meals
         (id, title, type, calories, servings, cooking_time, ingredients, instructions, nutritional_info, user_id, date_added)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          mealForSqlite.id,
          mealForSqlite.title,
          mealForSqlite.type,
          mealForSqlite.calories,
          mealForSqlite.servings,
          mealForSqlite.cooking_time,
          mealForSqlite.ingredients,
          mealForSqlite.instructions,
          mealForSqlite.nutritional_info,
          mealForSqlite.user_id,
          mealForSqlite.date_added
        ]
      );
      
      return true;
    } catch (error) {
      console.error('Error saving favorite meal to SQLite:', error);
      throw error;
    }
  }
};

// Remove a favorite meal
const removeFavoriteMeal = async (mealId, userId = 'default_user') => {
  if (usingSupabase) {
    const { error } = await supabase
      .from('favorite_meals')
      .delete()
      .eq('id', mealId)
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error removing favorite meal from Supabase:', error);
      throw error;
    }
    
    return true;
  } else {
    try {
      await sqlite.runQuery(
        'DELETE FROM favorite_meals WHERE id = ? AND user_id = ?',
        [mealId, userId]
      );
      
      return true;
    } catch (error) {
      console.error('Error removing favorite meal from SQLite:', error);
      throw error;
    }
  }
};

// Check if a meal is a favorite
const isMealFavorite = async (mealId, userId = 'default_user') => {
  if (usingSupabase) {
    const { data, error } = await supabase
      .from('favorite_meals')
      .select('id')
      .eq('id', mealId)
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error) {
      console.error('Error checking if meal is favorite in Supabase:', error);
      throw error;
    }
    
    return !!data;
  } else {
    try {
      const meal = await sqlite.getSingleRow(
        'SELECT id FROM favorite_meals WHERE id = ? AND user_id = ?',
        [mealId, userId]
      );
      
      return !!meal;
    } catch (error) {
      console.error('Error checking if meal is favorite in SQLite:', error);
      throw error;
    }
  }
};

// Get planned meals
const getPlannedMeals = async (userId = 'default_user') => {
  if (usingSupabase) {
    const { data, error } = await supabase
      .from('planned_meals')
      .select('meals_data')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error) {
      console.error('Error getting planned meals from Supabase:', error);
      throw error;
    }
    
    return data ? data.meals_data : [];
  } else {
    try {
      const result = await sqlite.getSingleRow(
        'SELECT meals_data FROM planned_meals WHERE user_id = ?',
        [userId]
      );
      
      if (result && result.meals_data) {
        return JSON.parse(result.meals_data);
      }
      
      return [];
    } catch (error) {
      console.error('Error getting planned meals from SQLite:', error);
      throw error;
    }
  }
};

// Save planned meals
const savePlannedMeals = async (meals, userId = 'default_user') => {
  if (usingSupabase) {
    // Check if user already has planned meals
    const { data, error: checkError } = await supabase
      .from('planned_meals')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (checkError && checkError.code !== '42P01') {
      console.error('Error checking planned meals in Supabase:', checkError);
      throw checkError;
    }
    
    if (data) {
      // Update existing record
      const { error } = await supabase
        .from('planned_meals')
        .update({
          meals_data: meals,
          last_updated: new Date().toISOString()
        })
        .eq('user_id', userId);
      
      if (error) {
        console.error('Error updating planned meals in Supabase:', error);
        throw error;
      }
    } else {
      // Insert new record
      const { error } = await supabase
        .from('planned_meals')
        .insert({
          user_id: userId,
          meals_data: meals,
          last_updated: new Date().toISOString()
        });
      
      if (error) {
        console.error('Error inserting planned meals in Supabase:', error);
        throw error;
      }
    }
    
    return true;
  } else {
    try {
      // Check if user already has planned meals
      const existingMeals = await sqlite.getSingleRow(
        'SELECT id FROM planned_meals WHERE user_id = ?',
        [userId]
      );
      
      if (existingMeals) {
        // Update existing record
        await sqlite.runQuery(
          'UPDATE planned_meals SET meals_data = ?, last_updated = ? WHERE user_id = ?',
          [JSON.stringify(meals), new Date().toISOString(), userId]
        );
      } else {
        // Insert new record
        await sqlite.runQuery(
          'INSERT INTO planned_meals (user_id, meals_data, last_updated) VALUES (?, ?, ?)',
          [userId, JSON.stringify(meals), new Date().toISOString()]
        );
      }
      
      return true;
    } catch (error) {
      console.error('Error saving planned meals to SQLite:', error);
      throw error;
    }
  }
};

// Clear all user data
const clearAllData = async (userId = 'default_user') => {
  if (usingSupabase) {
    try {
      // Delete favorite meals
      const { error: favError } = await supabase
        .from('favorite_meals')
        .delete()
        .eq('user_id', userId);
      
      if (favError) {
        console.error('Error clearing favorite meals from Supabase:', favError);
        throw favError;
      }
      
      // Delete planned meals
      const { error: planError } = await supabase
        .from('planned_meals')
        .delete()
        .eq('user_id', userId);
      
      if (planError) {
        console.error('Error clearing planned meals from Supabase:', planError);
        throw planError;
      }
      
      return true;
    } catch (error) {
      console.error('Error clearing all data from Supabase:', error);
      throw error;
    }
  } else {
    try {
      // Delete favorite meals
      await sqlite.runQuery(
        'DELETE FROM favorite_meals WHERE user_id = ?',
        [userId]
      );
      
      // Delete planned meals
      await sqlite.runQuery(
        'DELETE FROM planned_meals WHERE user_id = ?',
        [userId]
      );
      
      return true;
    } catch (error) {
      console.error('Error clearing all data from SQLite:', error);
      throw error;
    }
  }
};

// Get database status
const getDatabaseStatus = async () => {
  try {
    // Try to check if Supabase is available
    const { data: favData, error: favError } = await supabase
      .from('favorite_meals')
      .select('id')
      .limit(1);
    
    const { data: planData, error: planError } = await supabase
      .from('planned_meals')
      .select('id')
      .limit(1);
    
    // Check SQLite database
    const sqliteDbPath = path.join(dataDir, 'meals.db');
    const sqliteExists = fs.existsSync(sqliteDbPath);
    
    return {
      supabase: {
        connected: !!process.env.SUPABASE_URL && !!process.env.SUPABASE_ANON_KEY,
        favorite_meals: {
          exists: !favError || favError.code !== '42P01',
          error: favError ? favError.message : null
        },
        planned_meals: {
          exists: !planError || planError.code !== '42P01',
          error: planError ? planError.message : null
        }
      },
      sqlite: {
        exists: sqliteExists,
        path: sqliteDbPath,
        initialized: dbInitialized && !usingSupabase
      },
      using: usingSupabase ? 'supabase' : 'sqlite',
      initialized: dbInitialized
    };
  } catch (error) {
    console.error('Error getting database status:', error);
    return {
      error: error.message,
      using: usingSupabase ? 'supabase' : 'sqlite',
      initialized: dbInitialized
    };
  }
};

module.exports = {
  initializeDatabase,
  getFavoriteMeals,
  saveFavoriteMeal,
  removeFavoriteMeal,
  isMealFavorite,
  getPlannedMeals,
  savePlannedMeals,
  clearAllData,
  getDatabaseStatus
};
const supabase = require('./supabase');

// Execute a direct SQL query
const executeSQL = async (query, params = []) => {
  try {
    // Use the more direct SQL execution approach
    const { data, error } = await supabase.rpc('execute_sql', {
      sql_query: query,
      params: params
    });
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error executing SQL query:', error);
    throw error;
  }
};

// Create tables directly using SQL
const createTablesWithSQL = async () => {
  try {
    // Create favorite_meals table
    await executeSQL(`
      CREATE TABLE IF NOT EXISTS public.favorite_meals (
        id TEXT NOT NULL PRIMARY KEY,
        title TEXT NOT NULL,
        type TEXT NOT NULL,
        calories INTEGER,
        servings INTEGER,
        cooking_time INTEGER,
        ingredients JSONB,
        instructions JSONB,
        nutritional_info JSONB,
        user_id TEXT NOT NULL,
        date_added TIMESTAMP WITH TIME ZONE DEFAULT now()
      );
    `);
    
    console.log('favorite_meals table created or already exists');
    
    // Create planned_meals table
    await executeSQL(`
      CREATE TABLE IF NOT EXISTS public.planned_meals (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        meals_data JSONB,
        last_updated TIMESTAMP WITH TIME ZONE DEFAULT now()
      );
    `);
    
    console.log('planned_meals table created or already exists');
    
    return true;
  } catch (error) {
    console.error('Error creating tables directly with SQL:', error);
    return false;
  }
};

module.exports = {
  executeSQL,
  createTablesWithSQL
};
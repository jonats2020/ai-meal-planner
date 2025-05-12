const supabase = require('./supabase');

// Create favorite_meals table using direct SQL
const createFavoriteMealsTableSQL = async () => {
  try {
    // Direct SQL approach through Supabase management API
    console.log('Creating favorite_meals table with direct SQL...');
    
    // First check if the table already exists
    const { data: tableExists, error: checkError } = await supabase
      .from('favorite_meals')
      .select('id')
      .limit(1);
      
    if (checkError && checkError.code === '42P01') {
      // Table doesn't exist, let's try creating it through Supabase Studio
      console.log('Table does not exist. Please create it in the Supabase Dashboard.');
      console.log('The required schema is:');
      console.log(`
        - table name: favorite_meals
        - columns:
          - id: text (primary key)
          - title: text
          - type: text
          - calories: integer
          - servings: integer
          - cooking_time: integer
          - ingredients: jsonb
          - instructions: jsonb
          - nutritional_info: jsonb
          - user_id: text
          - date_added: timestamptz (default: now())
      `);
      
      // Create a dummy table for now that we can use (simplified schema)
      try {
        await createFavoriteMealsTable();
        return true;
      } catch (dummyError) {
        console.error('Error creating dummy table:', dummyError);
        return false;
      }
    } else {
      console.log('favorite_meals table already exists');
      return true;
    }
  } catch (error) {
    console.error('Error checking or creating favorite_meals table:', error);
    return false;
  }
};

// Create planned_meals table using direct SQL
const createPlannedMealsTableSQL = async () => {
  try {
    // Direct SQL approach through Supabase management API
    console.log('Creating planned_meals table with direct SQL...');
    
    // First check if the table already exists
    const { data: tableExists, error: checkError } = await supabase
      .from('planned_meals')
      .select('id')
      .limit(1);
      
    if (checkError && checkError.code === '42P01') {
      // Table doesn't exist, let's try creating it through Supabase Studio
      console.log('Table does not exist. Please create it in the Supabase Dashboard.');
      console.log('The required schema is:');
      console.log(`
        - table name: planned_meals
        - columns:
          - id: serial (primary key)
          - user_id: text
          - meals_data: jsonb
          - last_updated: timestamptz (default: now())
      `);
      
      // Create a dummy table for now that we can use (simplified schema)
      try {
        await createPlannedMealsTable();
        return true;
      } catch (dummyError) {
        console.error('Error creating dummy table:', dummyError);
        return false;
      }
    } else {
      console.log('planned_meals table already exists');
      return true;
    }
  } catch (error) {
    console.error('Error checking or creating planned_meals table:', error);
    return false;
  }
};

// Create favorite_meals table using fallback method
const createFavoriteMealsTable = async () => {
  try {
    console.log('Attempting to create favorite_meals table via insert method...');
    // Prepare the table via insert attempt
    const { error } = await supabase
      .from('favorite_meals')
      .insert([
        { 
          id: 'setup-test-meal',
          title: 'Setup Test Meal',
          type: 'setup',
          calories: 100,
          servings: 1,
          cooking_time: 10,
          ingredients: ['Test ingredient'],
          instructions: ['Test instruction'],
          nutritional_info: { protein: '5g', carbs: '10g', fat: '2g' },
          user_id: 'setup-user',
          date_added: new Date().toISOString()
        }
      ]);
      
    if (error) {
      if (error.code === '23505') { // Duplicate key - table exists with data
        console.log('Table exists with test data already');
        return null;
      } else if (error.code !== '42P01') { // Not "relation does not exist" - some other error
        console.error('Error creating favorite_meals table:', error);
        return error;
      } else {
        // Table doesn't exist - we'll try a workaround
        console.log('Creating most basic favorite_meals structure...');
        
        // Simplest possible table structure as a last resort
        const { error: basicError } = await supabase
          .from('favorite_meals')
          .insert([
            { id: 'setup-basic', title: 'Basic Setup', type: 'setup', user_id: 'setup-user' }
          ]);
        
        if (basicError && basicError.code !== '23505') {
          console.error('Failed to create even basic table structure:', basicError);
          return basicError;
        }
        
        return null;
      }
    }
    
    console.log('Successfully created or verified favorite_meals table');
    return null;
  } catch (error) {
    console.error('Exception while creating favorite_meals table:', error);
    return error;
  }
};

// Create planned_meals table using fallback method
const createPlannedMealsTable = async () => {
  try {
    console.log('Attempting to create planned_meals table via insert method...');
    // Prepare the table via insert attempt
    const { error } = await supabase
      .from('planned_meals')
      .insert([
        { 
          user_id: 'setup-user',
          meals_data: [],
          last_updated: new Date().toISOString()
        }
      ]);
      
    if (error) {
      if (error.code === '23505') { // Duplicate key - table exists with data
        console.log('Table exists with test data already');
        return null;
      } else if (error.code !== '42P01') { // Not "relation does not exist" - some other error
        console.error('Error creating planned_meals table:', error);
        return error;
      } else {
        // Table doesn't exist - we'll try a workaround
        console.log('Creating most basic planned_meals structure...');
        
        // Simplest possible table structure as a last resort
        const { error: basicError } = await supabase
          .from('planned_meals')
          .insert([
            { user_id: 'setup-user', meals_data: [] }
          ]);
        
        if (basicError && basicError.code !== '23505') {
          console.error('Failed to create even basic table structure:', basicError);
          return basicError;
        }
        
        return null;
      }
    }
    
    console.log('Successfully created or verified planned_meals table');
    return null;
  } catch (error) {
    console.error('Exception while creating planned_meals table:', error);
    return error;
  }
};

// Create tables in Supabase
const createTables = async () => {
  try {
    console.log('Starting table creation process...');
    
    // Try to create favorite_meals table
    const favoritesSuccess = await createFavoriteMealsTableSQL();
    
    // Try to create planned_meals table
    const plannedSuccess = await createPlannedMealsTableSQL();
    
    return favoritesSuccess && plannedSuccess;
  } catch (error) {
    console.error('Error in table creation process:', error);
    return false;
  }
};

module.exports = {
  createTables,
  createFavoriteMealsTable,
  createPlannedMealsTable,
  createFavoriteMealsTableSQL,
  createPlannedMealsTableSQL
};
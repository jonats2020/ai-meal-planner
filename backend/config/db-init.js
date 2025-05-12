const supabase = require('./supabase');
const { createTablesWithSQL } = require('./direct-sql');

// Attempt to create tables via stored procedures
async function createTablesViaProcedures() {
  try {
    console.log('Attempting to create tables using stored procedures...');
    
    // Try to create favorite_meals table using stored procedure
    const { error: favError } = await supabase.rpc('create_favorite_meals_table', {});
    if (favError) {
      console.error('Error creating favorite_meals table via procedure:', favError.message);
      return false;
    }
    
    // Try to create planned_meals table using stored procedure
    const { error: planError } = await supabase.rpc('create_planned_meals_table', {});
    if (planError) {
      console.error('Error creating planned_meals table via procedure:', planError.message);
      return false;
    }
    
    console.log('Tables created successfully via stored procedures');
    return true;
  } catch (error) {
    console.error('Error in procedure-based table creation:', error.message);
    return false;
  }
}

// Create the execute_sql function in Supabase if it doesn't exist
async function createSQLExecuteFunction() {
  try {
    console.log('Checking if execute_sql function exists...');
    
    // First, check if the function already exists
    const { data, error } = await supabase.rpc('pg_get_function_result', {
      func_name: 'execute_sql'
    });
    
    if (error && error.message.includes('does not exist')) {
      console.log('execute_sql function needs to be created...');
      
      // Create the function
      const { error: createError } = await supabase.rpc('pg_create_function', {
        func_name: 'execute_sql',
        func_args: 'sql_query TEXT, params JSONB DEFAULT \'[]\'::jsonb',
        func_returns: 'JSONB',
        func_body: `
          DECLARE
            result JSONB;
          BEGIN
            EXECUTE sql_query INTO result;
            RETURN result;
          EXCEPTION WHEN OTHERS THEN
            RETURN jsonb_build_object('error', SQLERRM, 'code', SQLSTATE);
          END;
        `,
        func_language: 'plpgsql',
        func_security: 'DEFINER'
      });
      
      if (createError) {
        console.error('Error creating execute_sql function:', createError.message);
        return false;
      }
      
      console.log('execute_sql function created successfully');
      return true;
    } else if (error) {
      console.error('Error checking for execute_sql function:', error.message);
      return false;
    } else {
      console.log('execute_sql function already exists');
      return true;
    }
  } catch (error) {
    console.error('Error setting up SQL execution function:', error.message);
    return false;
  }
}

// Create the tables directly via SQL queries
async function createTablesDirectly() {
  try {
    console.log('Creating tables directly via SQL...');
    
    // Create favorite_meals table
    const { error: favError } = await supabase.rpc('execute_sql', {
      sql_query: `
        CREATE TABLE IF NOT EXISTS public.favorite_meals (
          id TEXT PRIMARY KEY,
          title TEXT,
          type TEXT,
          calories INTEGER,
          servings INTEGER,
          cooking_time INTEGER,
          ingredients JSONB,
          instructions JSONB,
          nutritional_info JSONB,
          user_id TEXT,
          date_added TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
      `
    });
    
    if (favError) {
      console.error('Error creating favorite_meals table directly:', favError.message);
      return false;
    }
    
    // Create planned_meals table
    const { error: planError } = await supabase.rpc('execute_sql', {
      sql_query: `
        CREATE TABLE IF NOT EXISTS public.planned_meals (
          id SERIAL PRIMARY KEY,
          user_id TEXT,
          meals_data JSONB,
          last_updated TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
      `
    });
    
    if (planError) {
      console.error('Error creating planned_meals table directly:', planError.message);
      return false;
    }
    
    console.log('Tables created successfully via direct SQL');
    return true;
  } catch (error) {
    console.error('Error in direct SQL table creation:', error.message);
    return false;
  }
}

// Table creation and initialization script
async function initializeDatabase() {
  console.log('Starting database initialization...');

  try {
    // First try to create tables using the most direct method
    let success = await createTablesWithSQL();
    
    if (!success) {
      // If that fails, try to create tables via stored procedures
      success = await createTablesViaProcedures();
      
      if (!success) {
        // If that fails too, try direct SQL execution as a last resort
        success = await createTablesDirectly();
        
        if (!success) {
          console.error('All table creation methods failed');
          return false;
        }
      }
    }
    
    console.log('Database initialization complete!');
    return true;
  } catch (error) {
    console.error('Unhandled error during database initialization:', error.message);
    return false;
  }
}

// Export the functions for use in other files
module.exports = { 
  initializeDatabase,
  createTablesWithSQL,
  createTablesViaProcedures,
  createTablesDirectly,
  createSQLExecuteFunction
};

// If this script is run directly, execute the initialization
if (require.main === module) {
  initializeDatabase()
    .then((success) => {
      if (success) {
        console.log('Initialization script completed successfully.');
      } else {
        console.log('Initialization script completed with errors.');
      }
      process.exit(0);
    })
    .catch((error) => {
      console.error('Initialization script failed with exception:', error);
      process.exit(1);
    });
}
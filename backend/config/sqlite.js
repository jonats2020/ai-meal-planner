const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Ensure the data directory exists
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Create or open the SQLite database
const dbPath = path.join(dataDir, 'meals.db');
const db = new sqlite3.Database(dbPath);

// Initialize database tables
const initializeDatabase = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Create favorite_meals table
      db.run(`
        CREATE TABLE IF NOT EXISTS favorite_meals (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          type TEXT NOT NULL,
          calories INTEGER,
          servings INTEGER,
          cooking_time INTEGER,
          ingredients TEXT,
          instructions TEXT,
          nutritional_info TEXT,
          user_id TEXT NOT NULL,
          date_added TEXT
        )
      `, (err) => {
        if (err) {
          console.error('Error creating favorite_meals table:', err);
          reject(err);
          return;
        }
        
        // Create planned_meals table
        db.run(`
          CREATE TABLE IF NOT EXISTS planned_meals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            meals_data TEXT,
            last_updated TEXT
          )
        `, (err) => {
          if (err) {
            console.error('Error creating planned_meals table:', err);
            reject(err);
            return;
          }
          
          console.log('SQLite database initialized successfully');
          resolve(true);
        });
      });
    });
  });
};

// Helper function to run a query
const runQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        reject(err);
        return;
      }
      
      resolve({ 
        changes: this.changes,
        lastID: this.lastID
      });
    });
  });
};

// Helper function to get data
const getData = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      
      resolve(rows);
    });
  });
};

// Helper function to get a single row
const getSingleRow = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      
      resolve(row);
    });
  });
};

// Close the database connection
const closeDatabase = () => {
  return new Promise((resolve, reject) => {
    db.close((err) => {
      if (err) {
        reject(err);
        return;
      }
      
      resolve(true);
    });
  });
};

module.exports = {
  db,
  initializeDatabase,
  runQuery,
  getData,
  getSingleRow,
  closeDatabase
};
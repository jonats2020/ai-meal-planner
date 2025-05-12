const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Default user ID (in a real app, this would come from authentication)
const USER_ID = 'default_user';

// Initialize database on startup
router.use(async (req, res, next) => {
  try {
    if (!req.app.locals.dbInitialized) {
      await db.initializeDatabase();
      req.app.locals.dbInitialized = true;
    }
    next();
  } catch (error) {
    console.error('Error initializing database:', error);
    res.status(500).json({ error: 'Database initialization failed' });
  }
});

// Get all favorite meals
router.get('/favorites', async (req, res) => {
  try {
    const data = await db.getFavoriteMeals(USER_ID);
    res.json(data);
  } catch (error) {
    console.error('Error getting favorite meals:', error);
    res.status(500).json({ error: 'Failed to get favorite meals' });
  }
});

// Save a meal to favorites
router.post('/favorites', async (req, res) => {
  try {
    const meal = req.body;
    
    // First check if the meal is already in favorites
    const isFavorite = await db.isMealFavorite(meal.id, USER_ID);
    
    if (!isFavorite) {
      await db.saveFavoriteMeal(meal, USER_ID);
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving favorite meal:', error);
    res.status(500).json({ error: 'Failed to save favorite meal' });
  }
});

// Remove a meal from favorites
router.delete('/favorites/:id', async (req, res) => {
  try {
    const mealId = req.params.id;
    await db.removeFavoriteMeal(mealId, USER_ID);
    res.json({ success: true });
  } catch (error) {
    console.error('Error removing favorite meal:', error);
    res.status(500).json({ error: 'Failed to remove favorite meal' });
  }
});

// Check if a meal is in favorites
router.get('/favorites/:id', async (req, res) => {
  try {
    const mealId = req.params.id;
    const isFavorite = await db.isMealFavorite(mealId, USER_ID);
    res.json({ isFavorite });
  } catch (error) {
    console.error('Error checking if meal is favorite:', error);
    res.status(500).json({ error: 'Failed to check if meal is favorite' });
  }
});

// Get all planned meals
router.get('/planned', async (req, res) => {
  try {
    const meals = await db.getPlannedMeals(USER_ID);
    res.json(meals);
  } catch (error) {
    console.error('Error getting planned meals:', error);
    res.status(500).json({ error: 'Failed to get planned meals' });
  }
});

// Save planned meals
router.post('/planned', async (req, res) => {
  try {
    const meals = req.body;
    await db.savePlannedMeals(meals, USER_ID);
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving planned meals:', error);
    res.status(500).json({ error: 'Failed to save planned meals' });
  }
});

// Clear all user data (for testing/debugging)
router.delete('/all', async (req, res) => {
  try {
    await db.clearAllData(USER_ID);
    res.json({ success: true });
  } catch (error) {
    console.error('Error clearing all data:', error);
    res.status(500).json({ error: 'Failed to clear all data' });
  }
});

// Get database status
router.get('/database/status', async (req, res) => {
  try {
    const status = await db.getDatabaseStatus();
    res.json(status);
  } catch (error) {
    console.error('Error getting database status:', error);
    res.status(500).json({ error: 'Failed to get database status' });
  }
});

module.exports = router;
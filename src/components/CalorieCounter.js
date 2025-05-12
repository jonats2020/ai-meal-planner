import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Colors from '../theme/colors';
import Typography from '../theme/typography';
import { getPlannedMeals } from '../services/storageService';

const CalorieCounter = () => {
  const [totalCalories, setTotalCalories] = useState(0);
  const [dailyGoal, setDailyGoal] = useState(2000); // Default goal
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlannedMeals();
  }, []);

  const loadPlannedMeals = async () => {
    try {
      setLoading(true);
      const meals = await getPlannedMeals();
      
      if (meals && meals.length > 0) {
        // Sum up calories from planned meals
        const total = meals.reduce((sum, meal) => sum + (meal.calories || 0), 0);
        setTotalCalories(total);
      } else {
        setTotalCalories(0);
      }
    } catch (error) {
      console.error('Error loading calorie data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate percentage of daily goal
  const percentage = Math.min(100, Math.round((totalCalories / dailyGoal) * 100));
  
  // Determine progress bar color based on percentage
  const getProgressColor = () => {
    if (percentage < 70) return Colors.success;
    if (percentage < 90) return Colors.warning;
    return Colors.error;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Today's Calories</Text>
        <TouchableOpacity onPress={loadPlannedMeals}>
          <Feather name="refresh-cw" size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.statsContainer}>
        <View style={styles.calorieDisplay}>
          <Text style={styles.calorieValue}>{totalCalories}</Text>
          <Text style={styles.calorieLabel}>/ {dailyGoal} cal</Text>
        </View>
        
        <View style={styles.progressBarContainer}>
          <View 
            style={[
              styles.progressBar,
              { 
                width: `${percentage}%`,
                backgroundColor: getProgressColor(),
              }
            ]}
          />
        </View>
        
        <Text style={styles.progressText}>{percentage}% of daily goal</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    elevation: 3,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    ...Typography.h3,
  },
  statsContainer: {
    alignItems: 'center',
  },
  calorieDisplay: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  calorieValue: {
    ...Typography.h1,
    color: Colors.primary,
  },
  calorieLabel: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  progressBarContainer: {
    height: 10,
    width: '100%',
    backgroundColor: Colors.backgroundLight,
    borderRadius: 5,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 5,
  },
  progressText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
});

export default CalorieCounter;

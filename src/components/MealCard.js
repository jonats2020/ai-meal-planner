import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Colors from '../theme/colors';
import Typography from '../theme/typography';

const MealCard = ({ meal, onPress, onRemove, showRemoveButton = false, onSelect, isSelected = false }) => {
  // Use title or name property, depending on what's available
  const mealName = meal.title || meal.name;
  
  return (
    <TouchableOpacity 
      style={[styles.container, isSelected && styles.selectedContainer]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {meal.imageUrl && (
        <Image 
          source={{ uri: meal.imageUrl }} 
          style={styles.mealImage}
          resizeMode="cover"
        />
      )}
      
      <View style={styles.content}>
        <View style={styles.mealInfo}>
          <Text style={styles.mealName}>{mealName}</Text>
          {meal.description && (
            <Text style={styles.mealDescription} numberOfLines={2}>
              {meal.description}
            </Text>
          )}
          
          <View style={styles.mealDetails}>
            <View style={styles.calorieInfo}>
              <Feather name="zap" size={16} color={Colors.primary} />
              <Text style={styles.calorieText}>
                {meal.calories} calories
              </Text>
            </View>
            
            {(meal.cookingTime || meal.cookTime) && (
              <View style={styles.timeInfo}>
                <Feather name="clock" size={16} color={Colors.textSecondary} />
                <Text style={styles.timeText}>
                  {meal.cookingTime || meal.cookTime} mins
                </Text>
              </View>
            )}
          </View>
        </View>
        
        <View style={styles.buttonsContainer}>
          {showRemoveButton && (
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={(e) => {
                e.stopPropagation();
                onRemove();
              }}
            >
              <Feather name="trash-2" size={20} color={Colors.error} />
            </TouchableOpacity>
          )}
          
          {onSelect && (
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={(e) => {
                e.stopPropagation();
                onSelect();
              }}
            >
              <Feather 
                name={isSelected ? "check-circle" : "circle"} 
                size={20} 
                color={isSelected ? Colors.primary : Colors.textSecondary} 
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    overflow: 'hidden',
  },
  selectedContainer: {
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  mealImage: {
    width: '100%',
    height: 180,
  },
  content: {
    padding: 16,
    flexDirection: 'row',
  },
  mealInfo: {
    flex: 1,
  },
  mealName: {
    ...Typography.h3,
    marginBottom: 8,
  },
  mealDescription: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  mealDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  calorieInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  calorieText: {
    ...Typography.caption,
    color: Colors.primary,
    marginLeft: 4,
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  timeText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  buttonsContainer: {
    justifyContent: 'space-between',
  },
  iconButton: {
    padding: 8,
    marginBottom: 4,
  },
});

export default MealCard;

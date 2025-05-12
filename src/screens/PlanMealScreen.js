import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import Colors from '../theme/colors';
import Typography from '../theme/typography';
import { savePlannedMeal, getPlannedMeals, getFavoriteMeals } from '../services/storageService';
import MealCard from '../components/MealCard';

const PlanMealScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [plannedMeals, setPlannedMeals] = useState([]);
  const [favoriteMeals, setFavoriteMeals] = useState([]);
  const [selectedFavorites, setSelectedFavorites] = useState([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      mealName: '',
      calories: '',
      mealType: 'Breakfast', // Default meal type
    }
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load planned meals
      const meals = await getPlannedMeals();
      if (meals) {
        setPlannedMeals(meals);
      }
      
      // Load favorite meals
      const favorites = await getFavoriteMeals();
      if (favorites) {
        setFavoriteMeals(favorites);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load meals data');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      const newMeal = {
        id: Date.now().toString(),
        name: data.mealName,
        calories: parseInt(data.calories),
        type: data.mealType,
        date: new Date().toISOString(),
      };
      
      const updatedMeals = [...plannedMeals, newMeal];
      await savePlannedMeal(updatedMeals);
      setPlannedMeals(updatedMeals);
      reset();
      
      Alert.alert('Success', 'Meal plan added successfully');
    } catch (error) {
      console.error('Error saving meal plan:', error);
      Alert.alert('Error', 'Failed to save meal plan');
    }
  };

  const deleteMeal = async (id) => {
    try {
      const updatedMeals = plannedMeals.filter(meal => meal.id !== id);
      await savePlannedMeal(updatedMeals);
      setPlannedMeals(updatedMeals);
    } catch (error) {
      console.error('Error deleting meal:', error);
      Alert.alert('Error', 'Failed to delete meal');
    }
  };
  
  const toggleFavoriteSelection = (meal) => {
    const isSelected = selectedFavorites.some(fav => fav.id === meal.id);
    
    if (isSelected) {
      // Remove from selection
      setSelectedFavorites(selectedFavorites.filter(fav => fav.id !== meal.id));
    } else {
      // Add to selection
      setSelectedFavorites([...selectedFavorites, meal]);
    }
  };
  
  const addSelectedFavoritesToPlan = async () => {
    if (selectedFavorites.length === 0) {
      Alert.alert('No Selection', 'Please select at least one favorite meal to add to your plan.');
      return;
    }
    
    try {
      // Add selected favorites to planned meals
      const updatedMeals = [...plannedMeals, ...selectedFavorites];
      await savePlannedMeal(updatedMeals);
      setPlannedMeals(updatedMeals);
      
      // Clear selection
      setSelectedFavorites([]);
      setShowFavorites(false);
      
      Alert.alert('Success', 'Favorite meals added to your plan successfully');
    } catch (error) {
      console.error('Error adding favorites to plan:', error);
      Alert.alert('Error', 'Failed to add favorites to your plan');
    }
  };

  const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { paddingTop: insets.top }]}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Plan Your Meals</Text>
        <View style={{ width: 24 }} />
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading meal data...</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.formContainer}>
            <Text style={styles.label}>Meal Name</Text>
            <Controller
              control={control}
              rules={{
                required: 'Meal name is required',
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.mealName && styles.inputError]}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholder="Enter meal name"
                  placeholderTextColor={Colors.textSecondary}
                />
              )}
              name="mealName"
            />
            {errors.mealName && <Text style={styles.errorText}>{errors.mealName.message}</Text>}

            <Text style={styles.label}>Calories</Text>
            <Controller
              control={control}
              rules={{
                required: 'Calories are required',
                pattern: {
                  value: /^[0-9]+$/,
                  message: 'Please enter a valid number'
                }
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.calories && styles.inputError]}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholder="Enter calories"
                  placeholderTextColor={Colors.textSecondary}
                  keyboardType="numeric"
                />
              )}
              name="calories"
            />
            {errors.calories && <Text style={styles.errorText}>{errors.calories.message}</Text>}

            <Text style={styles.label}>Meal Type</Text>
            <View style={styles.mealTypeContainer}>
              {mealTypes.map((type) => (
                <Controller
                  key={type}
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <TouchableOpacity
                      style={[
                        styles.mealTypeButton,
                        value === type && styles.mealTypeButtonSelected,
                      ]}
                      onPress={() => onChange(type)}
                    >
                      <Text
                        style={[
                          styles.mealTypeText,
                          value === type && styles.mealTypeTextSelected,
                        ]}
                      >
                        {type}
                      </Text>
                    </TouchableOpacity>
                  )}
                  name="mealType"
                />
              ))}
            </View>

            <TouchableOpacity 
              style={styles.submitButton}
              onPress={handleSubmit(onSubmit)}
            >
              <Text style={styles.submitButtonText}>Add Meal</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.favoritesButton}
              onPress={() => setShowFavorites(!showFavorites)}
            >
              <Feather name="heart" size={16} color={Colors.white} />
              <Text style={styles.favoritesButtonText}>
                {showFavorites ? 'Hide Favorites' : 'Select From Favorites'}
              </Text>
            </TouchableOpacity>
          </View>
          
          {showFavorites && (
            <View style={styles.favoritesContainer}>
              <View style={styles.favoritesHeader}>
                <Text style={styles.sectionTitle}>Your Favorite Meals</Text>
                {selectedFavorites.length > 0 && (
                  <TouchableOpacity 
                    style={styles.addSelectedButton}
                    onPress={addSelectedFavoritesToPlan}
                  >
                    <Text style={styles.addSelectedButtonText}>
                      Add Selected ({selectedFavorites.length})
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
              
              {favoriteMeals.length === 0 ? (
                <Text style={styles.emptyMessage}>No favorite meals yet. Save some meals as favorites first!</Text>
              ) : (
                favoriteMeals.map((meal) => (
                  <MealCard
                    key={meal.id}
                    meal={meal}
                    onPress={() => toggleFavoriteSelection(meal)}
                    onSelect={() => toggleFavoriteSelection(meal)}
                    isSelected={selectedFavorites.some(fav => fav.id === meal.id)}
                  />
                ))
              )}
            </View>
          )}

          <View style={styles.plannedMealsContainer}>
            <Text style={styles.sectionTitle}>Planned Meals</Text>
            
            {plannedMeals.length === 0 ? (
              <Text style={styles.emptyMessage}>No planned meals yet. Add your first meal above!</Text>
            ) : (
              plannedMeals.map((meal) => (
                <MealCard
                  key={meal.id}
                  meal={meal}
                  onPress={() => {}}
                  onRemove={() => deleteMeal(meal.id)}
                  showRemoveButton={true}
                />
              ))
            )}
          </View>
        </ScrollView>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerTitle: {
    ...Typography.h2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...Typography.body,
    marginTop: 12,
    color: Colors.textSecondary,
  },
  formContainer: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  label: {
    ...Typography.label,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    ...Typography.body,
  },
  inputError: {
    borderColor: Colors.error,
  },
  errorText: {
    color: Colors.error,
    ...Typography.caption,
    marginTop: -12,
    marginBottom: 16,
  },
  mealTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  mealTypeButton: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  mealTypeButtonSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  mealTypeText: {
    color: Colors.text,
    ...Typography.body,
  },
  mealTypeTextSelected: {
    color: Colors.white,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  submitButtonText: {
    color: Colors.white,
    ...Typography.button,
  },
  favoritesButton: {
    backgroundColor: Colors.secondary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  favoritesButtonText: {
    color: Colors.white,
    ...Typography.button,
    marginLeft: 8,
  },
  favoritesContainer: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  favoritesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addSelectedButton: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  addSelectedButtonText: {
    color: Colors.white,
    ...Typography.caption,
  },
  plannedMealsContainer: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    ...Typography.h3,
    marginBottom: 16,
  },
  emptyMessage: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginVertical: 20,
  },
});

export default PlanMealScreen;

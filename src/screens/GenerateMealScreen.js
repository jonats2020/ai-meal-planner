import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import Colors from '../theme/colors';
import Typography from '../theme/typography';
import { generateMeal } from '../services/openaiService';

const GenerateMealScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [generatedMeal, setGeneratedMeal] = useState(null);
  
  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      mealType: 'Dinner',
      preferences: '',
      calorieRange: '',
      cookingTime: '',
    }
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setGeneratedMeal(null);
      
      const meal = await generateMeal(
        data.mealType, 
        data.preferences, 
        data.calorieRange, 
        data.cookingTime
      );
      
      setGeneratedMeal(meal);
    } catch (error) {
      console.error('Error generating meal:', error);
      Alert.alert(
        'Error', 
        'Failed to generate meal. Please try again later.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = () => {
    if (generatedMeal) {
      navigation.navigate('MealDetail', { meal: generatedMeal });
    }
  };

  const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert'];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { paddingTop: insets.top }]}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name='arrow-left' size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Generate Meal</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
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
                name='mealType'
              />
            ))}
          </View>

          <Text style={styles.label}>Dietary Preferences (Optional)</Text>
          <Controller
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={styles.input}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                placeholder='E.g., vegetarian, gluten-free, low-carb'
                placeholderTextColor={Colors.textSecondary}
                multiline
              />
            )}
            name='preferences'
          />

          <Text style={styles.label}>Calorie Range (Optional)</Text>
          <Controller
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={styles.input}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                placeholder='E.g., 300-500'
                placeholderTextColor={Colors.textSecondary}
              />
            )}
            name='calorieRange'
          />

          <Text style={styles.label}>Cooking Time (Optional)</Text>
          <Controller
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={styles.input}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                placeholder='E.g., under 30 minutes, quick'
                placeholderTextColor={Colors.textSecondary}
              />
            )}
            name='cookingTime'
          />

          <TouchableOpacity
            style={styles.generateButton}
            onPress={handleSubmit(onSubmit)}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.generateButtonText}>Generate Meal</Text>
            )}
          </TouchableOpacity>
        </View>

        {generatedMeal && (
          <View style={styles.resultContainer}>
            <Text style={styles.resultTitle}>Generated Meal</Text>
            <Text style={styles.mealName}>{generatedMeal.title}</Text>

            <View style={styles.calorieInfo}>
              <Feather name='zap' size={18} color={Colors.primary} />
              <Text style={styles.calorieText}>
                {generatedMeal.calories} calories per serving
              </Text>
            </View>

            <Text style={styles.descriptionLabel}>Description:</Text>
            <Text style={styles.description}>{generatedMeal.description}</Text>

            <View style={styles.buttonGroup}>
              <TouchableOpacity
                style={styles.detailsButton}
                onPress={handleViewDetails}
              >
                <Text style={styles.detailsButtonText}>View Details</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
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
  mealTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
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
  generateButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  generateButtonText: {
    color: Colors.white,
    ...Typography.button,
  },
  resultContainer: {
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
  resultTitle: {
    ...Typography.h3,
    marginBottom: 12,
  },
  mealName: {
    ...Typography.h2,
    marginBottom: 8,
  },
  calorieInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  calorieText: {
    ...Typography.body,
    color: Colors.primary,
    marginLeft: 6,
  },
  descriptionLabel: {
    ...Typography.label,
    marginBottom: 8,
  },
  description: {
    ...Typography.body,
    marginBottom: 20,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  detailsButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    flex: 1,
  },
  detailsButtonText: {
    color: Colors.white,
    ...Typography.button,
  },
});

export default GenerateMealScreen;

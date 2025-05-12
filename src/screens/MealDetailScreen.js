import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  ActivityIndicator,
  Image
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../theme/colors';
import Typography from '../theme/typography';
import { saveFavoriteMeal, isMealFavorite } from '../services/storageService';

const MealDetailScreen = ({ route, navigation }) => {
  const { meal } = route.params;
  const insets = useSafeAreaInsets();
  const [isFavorite, setIsFavorite] = useState(false);
  const [checkingFavorite, setCheckingFavorite] = useState(true);
  const [savingFavorite, setSavingFavorite] = useState(false);
  
  // Get meal name from either name or title property
  const mealName = meal.name || meal.title;

  console.log({ meal });

  // Check if meal is already in favorites
  React.useEffect(() => {
    const checkFavoriteStatus = async () => {
      try {
        const favoriteStatus = await isMealFavorite(meal.id);
        setIsFavorite(favoriteStatus);
      } catch (error) {
        console.error('Error checking favorite status:', error);
      } finally {
        setCheckingFavorite(false);
      }
    };
    
    checkFavoriteStatus();
  }, [meal.id]);

  const toggleFavorite = async () => {
    try {
      setSavingFavorite(true);
      await saveFavoriteMeal(meal);
      setIsFavorite(true);
      Alert.alert('Success', 'Meal added to favorites!');
    } catch (error) {
      console.error('Error saving favorite:', error);
      Alert.alert('Error', 'Failed to save favorite');
    } finally {
      setSavingFavorite(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name='arrow-left' size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Meal Details</Text>
        {checkingFavorite ? (
          <ActivityIndicator size='small' color={Colors.primary} />
        ) : savingFavorite ? (
          <ActivityIndicator size='small' color={Colors.primary} />
        ) : (
          <TouchableOpacity onPress={toggleFavorite} disabled={isFavorite}>
            <Feather
              name={isFavorite ? 'heart' : 'heart'}
              size={24}
              color={isFavorite ? Colors.primary : Colors.textSecondary}
              style={isFavorite && styles.favoriteIcon}
            />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {meal.imageUrl && (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: meal.imageUrl }}
              style={styles.mealImage}
              resizeMode='cover'
            />
          </View>
        )}

        <View style={styles.mealHeaderContainer}>
          <Text style={styles.mealName}>{mealName}</Text>

          <View style={styles.mealInfoRow}>
            <View style={styles.infoItem}>
              <Feather name='zap' size={18} color={Colors.primary} />
              <Text style={styles.infoText}>{meal.calories} calories</Text>
            </View>

            {(meal.cookingTime || meal.cookTime) && (
              <View style={styles.infoItem}>
                <Feather name='clock' size={18} color={Colors.primary} />
                <Text style={styles.infoText}>
                  {meal.cookingTime || meal.cookTime}
                </Text>
              </View>
            )}

            {meal.servings && (
              <View style={styles.infoItem}>
                <Feather name='users' size={18} color={Colors.primary} />
                <Text style={styles.infoText}>{meal.servings} servings</Text>
              </View>
            )}
          </View>
        </View>

        {meal.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{meal.description}</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ingredients</Text>
          {meal.ingredients.map((ingredient, index) => (
            <View key={index} style={styles.ingredientItem}>
              <View style={styles.bullet} />
              <Text style={styles.ingredientText}>{ingredient}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Instructions</Text>
          {meal.instructions.map((instruction, index) => (
            <View key={index} style={styles.instructionItem}>
              <Text style={styles.instructionNumber}>{index + 1}</Text>
              <Text style={styles.instructionText}>{instruction}</Text>
            </View>
          ))}
        </View>

        {meal.nutritionalInfo && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Nutritional Information</Text>
            {Object.entries(meal.nutritionalInfo).map(([key, value], index) => (
              <View key={index} style={styles.nutrientItem}>
                <Text style={styles.nutrientName}>
                  {key.charAt(0).toUpperCase() + key.slice(1)}:
                </Text>
                <Text style={styles.nutrientValue}>{value}</Text>
              </View>
            ))}
          </View>
        )}

        {meal.tips && meal.tips.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tips</Text>
            {meal.tips.map((tip, index) => (
              <View key={index} style={styles.tipItem}>
                <Feather
                  name='info'
                  size={16}
                  color={Colors.primary}
                  style={styles.tipIcon}
                />
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
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
  favoriteIcon: {
    transform: [{ scale: 1.1 }]
  },
  imageContainer: {
    width: '100%',
    height: 250,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    elevation: 3,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  mealImage: {
    width: '100%',
    height: '100%',
  },
  mealHeaderContainer: {
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
  mealName: {
    ...Typography.h1,
    marginBottom: 12,
  },
  mealInfoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
  infoText: {
    ...Typography.body,
    color: Colors.text,
    marginLeft: 6,
  },
  section: {
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
  sectionTitle: {
    ...Typography.h3,
    marginBottom: 16,
  },
  description: {
    ...Typography.body,
    color: Colors.text,
    lineHeight: 22,
  },
  ingredientItem: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    marginTop: 6,
    marginRight: 10,
  },
  ingredientText: {
    ...Typography.body,
    flex: 1,
  },
  instructionItem: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  instructionNumber: {
    ...Typography.h4,
    color: Colors.primary,
    marginRight: 12,
    width: 24,
    textAlign: 'center',
  },
  instructionText: {
    ...Typography.body,
    flex: 1,
    lineHeight: 22,
  },
  nutrientItem: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'center',
  },
  nutrientName: {
    ...Typography.body,
    fontWeight: 'bold',
    width: 100,
  },
  nutrientValue: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  tipItem: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  tipIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  tipText: {
    ...Typography.body,
    flex: 1,
    fontStyle: 'italic',
  },
});

export default MealDetailScreen;

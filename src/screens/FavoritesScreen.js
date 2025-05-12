import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  Alert,
  ActivityIndicator 
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Colors from '../theme/colors';
import Typography from '../theme/typography';
import MealCard from '../components/MealCard';
import { getFavoriteMeals, removeFavoriteMeal } from '../services/storageService';

const FavoritesScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const favoriteMeals = await getFavoriteMeals();
      setFavorites(favoriteMeals || []);
    } catch (error) {
      console.error('Error loading favorites:', error);
      Alert.alert('Error', 'Failed to load favorite meals');
    } finally {
      setLoading(false);
    }
  };

  // Reload favorites when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [])
  );

  const handleMealPress = (meal) => {
    navigation.navigate('MealDetail', { meal });
  };

  const handleRemoveFavorite = async (mealId) => {
    try {
      await removeFavoriteMeal(mealId);
      setFavorites(favorites.filter(meal => meal.id !== mealId));
    } catch (error) {
      console.error('Error removing favorite:', error);
      Alert.alert('Error', 'Failed to remove meal from favorites');
    }
  };

  const renderMealCard = ({ item }) => (
    <MealCard
      meal={item}
      onPress={() => handleMealPress(item)}
      onRemove={() => handleRemoveFavorite(item.id)}
      showRemoveButton
    />
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Favorite Meals</Text>
        <View style={{ width: 24 }} />
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : favorites.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Feather name="heart" size={64} color={Colors.textSecondary} />
          <Text style={styles.emptyText}>No favorite meals yet</Text>
          <Text style={styles.emptySubText}>
            Generate meals and add them to your favorites
          </Text>
          <TouchableOpacity
            style={styles.generateButton}
            onPress={() => navigation.navigate('GenerateMeal')}
          >
            <Text style={styles.generateButtonText}>Generate a Meal</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={favorites}
          renderItem={renderMealCard}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    ...Typography.h3,
    marginTop: 16,
    marginBottom: 8,
    color: Colors.text,
  },
  emptySubText: {
    ...Typography.body,
    textAlign: 'center',
    color: Colors.textSecondary,
    marginBottom: 24,
  },
  generateButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  generateButtonText: {
    ...Typography.button,
    color: Colors.white,
  },
});

export default FavoritesScreen;

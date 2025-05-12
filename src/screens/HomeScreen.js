import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../theme/colors';
import Typography from '../theme/typography';
import CalorieCounter from '../components/CalorieCounter';

const HomeScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>AI Meal Planner</Text>
          <TouchableOpacity 
            style={styles.favoritesButton}
            onPress={() => navigation.navigate('Favorites')}
          >
            <Feather name="heart" size={24} color={Colors.primary} />
          </TouchableOpacity>
        </View>
        
        <CalorieCounter />
        
        <View style={styles.cardContainer}>
          <TouchableOpacity 
            style={styles.card}
            onPress={() => navigation.navigate('PlanMeal')}
          >
            <View style={styles.cardContent}>
              <Feather name="calendar" size={50} color={Colors.primary} />
              <Text style={styles.cardTitle}>Plan Your Meals</Text>
              <Text style={styles.cardDescription}>
                Set your daily meal plan and track calories
              </Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.card}
            onPress={() => navigation.navigate('GenerateMeal')}
          >
            <View style={styles.cardContent}>
              <Feather name="cpu" size={50} color={Colors.primary} />
              <Text style={styles.cardTitle}>AI Meal Generator</Text>
              <Text style={styles.cardDescription}>
                Let AI suggest perfect meals based on your preferences
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.tipContainer}>
          <Text style={styles.tipTitle}>Today's Healthy Tip</Text>
          <Text style={styles.tipText}>
            Aim to fill half your plate with vegetables and fruits, one quarter with protein, 
            and one quarter with whole grains for balanced nutrition.
          </Text>
        </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    ...Typography.h1,
    color: Colors.text,
  },
  favoritesButton: {
    padding: 10,
  },
  cardContainer: {
    marginVertical: 20,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 3,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  cardContent: {
    alignItems: 'center',
    padding: 10,
  },
  cardTitle: {
    ...Typography.h2,
    marginTop: 10,
    color: Colors.text,
  },
  cardDescription: {
    ...Typography.body,
    textAlign: 'center',
    marginTop: 5,
    color: Colors.textSecondary,
  },
  tipContainer: {
    backgroundColor: Colors.accent,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  tipTitle: {
    ...Typography.h3,
    color: Colors.white,
    marginBottom: 10,
  },
  tipText: {
    ...Typography.body,
    color: Colors.white,
  },
});

export default HomeScreen;

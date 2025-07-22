import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { recipes } from './../../data';

const RecipeByCategory = ({ route, navigation }) => {
  const { category } = route.params;
  const filteredRecipes = recipes.filter(recipe => recipe.category === category);

  const getCategoryIcon = (category) => {
    const iconMap = {
      'Main Course': 'restaurant',
      'Dessert': 'ice-cream',
      'Appetizer': 'wine',
      'Beverage': 'cafe',
      'Soup': 'bowl',
      'Salad': 'leaf',
    };
    return iconMap[category] || 'fast-food';
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => navigation.navigate('RecipeDetail', { recipe: item })}
    >
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.image }} style={styles.itemImage} />
        <LinearGradient
          colors={['transparent', 'rgba(211, 84, 0, 0.3)', 'rgba(211, 84, 0, 0.7)', 'rgba(44, 62, 80, 0.9)']}
          style={styles.itemTextContainer}
        >
          <View style={styles.recipeInfo}>
            <Text style={styles.itemText}>{item.name}</Text>
            <View style={styles.recipeDetails}>
              <View style={styles.detailItem}>
                <Ionicons name="time" size={12} color="#FDEBD0" />
                <Text style={styles.detailText}>30 min</Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="flame" size={12} color="#FDEBD0" />
                <Text style={styles.detailText}>{item.calories} cal</Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FDEBD0" />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <View style={styles.categoryIcon}>
            <Ionicons name={getCategoryIcon(category)} size={32} color="#FDEBD0" />
          </View>
          <Text style={styles.title}>{category}</Text>
          <Text style={styles.subtitle}>
            {filteredRecipes.length} delicious dishes
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        <FlatList
          data={filteredRecipes}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="restaurant-outline" size={80} color="#4D5656" />
              <Text style={styles.emptyTitle}>No recipes found</Text>
              <Text style={styles.emptyText}>
                We couldn't find any recipes in this category
              </Text>
            </View>
          }
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDEBD0',
  },
  header: {
    backgroundColor: '#E67E22',
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#D35400',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  headerContent: {
    alignItems: 'center',
    paddingTop: 20,
  },
  categoryIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#D35400',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FDEBD0',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#FDEBD0',
    opacity: 0.9,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  itemContainer: {
    flex: 1,
    margin: 8,
  },
  imageContainer: {
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  itemImage: {
    width: '100%',
    height: 220,
  },
  itemTextContainer: {
    position: 'absolute',
    bottom: 0,
    padding: 15,
    width: '100%',
  },
  recipeInfo: {
    alignItems: 'flex-start',
  },
  itemText: {
    color: '#FDEBD0',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  recipeDetails: {
    flexDirection: 'row',
    gap: 15,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    color: '#FDEBD0',
    fontSize: 12,
    marginLeft: 4,
    opacity: 0.9,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginTop: 20,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#4D5656',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});

export default RecipeByCategory;
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { recipes } from '../data';

const ExplorePage = () => {
  const navigation = useNavigation();

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
          <View>
            <Text style={styles.itemText}>{item.name}</Text>
          </View>
        </LinearGradient>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Explore Dishes</Text>
        <Text style={styles.subtitle}>Discover delicious dishes</Text>
      </View>

      <FlatList
        data={recipes}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      />
      <StatusBar style="auto" />
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
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FDEBD0',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#FDEBD0',
    opacity: 0.9,
  },
  scrollContainer: {
    padding: 15,
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
    height: 200,
  },
  itemTextContainer: {
    position: 'absolute',
    bottom: 0,
    padding: 15,
    width: '100%',
  },
  itemText: {
    color: '#FDEBD0',
    fontSize: 16,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
});

export default ExplorePage;
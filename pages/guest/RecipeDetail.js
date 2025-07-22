import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import database from "../../database.json";

const RecipeDetail = ({ route, navigation }) => {
  const { recipe } = route.params;
  const [isSaved, setIsSaved] = useState(false);

  const infoData = [
    { label: "Calories", value: `${recipe.calories} Cal`, icon: "flame" },
    { label: "Time", value: recipe.cookingTime, icon: "time" },
    { label: "Servings", value: `${recipe.servings} People`, icon: "people" },
  ];

  useEffect(() => {
    const exists = database.savedRecipes.some((item) => item.id === recipe.id);
    setIsSaved(exists);
  }, [database.savedRecipes, recipe.id]);

  const handleSave = async () => {
    try {
      const response = await fetch("http://10.0.2.2:5001/savedRecipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(recipe),
      });
      const data = await response.json();
      console.log("Recipe saved!", data);
      Alert.alert("Success", "Recipe has been saved to your favorites!");
      setIsSaved(true);
    } catch (error) {
      console.error("Error saving recipe:", error);
      Alert.alert("Error", "Failed to save recipe. Please try again later.");
    }
  };

  const handleAddToCart = async () => {
    try {
      const storedCart = await AsyncStorage.getItem("cartItems");
      const cart = storedCart ? JSON.parse(storedCart) : [];

      const existing = cart.find((item) => item.id === recipe.id);
      let updatedCart;

      if (existing) {
        updatedCart = cart.map((item) =>
          item.id === recipe.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        updatedCart = [...cart, { ...recipe, quantity: 1 }];
      }

      await AsyncStorage.setItem("cartItems", JSON.stringify(updatedCart));
      Alert.alert("Added to Cart", "Item has been added to your cart!");
    } catch (error) {
      console.error("Add to cart error:", error);
      Alert.alert("Error", "Cannot add to cart.");
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header with Image */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: recipe.image }} style={styles.recipeImage} />
        <LinearGradient
          colors={['transparent', 'rgba(44, 62, 80, 0.8)']}
          style={styles.imageOverlay}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#FDEBD0" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Ionicons
              name={isSaved ? "heart" : "heart-outline"}
              size={24}
              color={isSaved ? "#D35400" : "#FDEBD0"}
            />
          </TouchableOpacity>
        </LinearGradient>
      </View>

      {/* Recipe Info */}
      <View style={styles.contentContainer}>
        <View style={styles.headerSection}>
          <View style={styles.titleContainer}>
            <Text style={styles.recipeName}>{recipe.name}</Text>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{recipe.category}</Text>
            </View>
          </View>

          {recipe.price && (
            <View style={styles.priceContainer}>
              <Ionicons name="pricetag" size={20} color="#E67E22" />
              <Text style={styles.price}>
                {recipe.price?.toLocaleString()} VND
              </Text>
            </View>
          )}

          <Text style={styles.description}>{recipe.description}</Text>
        </View>

        {/* Info Cards */}
        <View style={styles.infoContainer}>
          {infoData.map((info, index) => (
            <View key={index} style={styles.infoCard}>
              <View style={styles.infoIconContainer}>
                <Ionicons name={info.icon} size={24} color="#E67E22" />
              </View>
              <Text style={styles.infoLabel}>{info.label}</Text>
              <Text style={styles.infoValue}>{info.value}</Text>
            </View>
          ))}
        </View>

        {/* Ingredients Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="nutrition" size={24} color="#E67E22" />
            <Text style={styles.sectionTitle}>Ingredients</Text>
          </View>
          <View style={styles.ingredientsContainer}>
            {recipe.ingredients.map((ingredient, index) => (
              <View key={index} style={styles.ingredientItem}>
                <View style={styles.ingredientDot} />
                <View style={styles.ingredientContent}>
                  <Text style={styles.ingredientName}>{ingredient.name}</Text>
                  <Text style={styles.ingredientAmount}>{ingredient.amount}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Instructions Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="list" size={24} color="#E67E22" />
            <Text style={styles.sectionTitle}>Instructions</Text>
          </View>
          <View style={styles.stepsContainer}>
            {recipe.instructions.map((step, index) => (
              <View key={index} style={styles.stepItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Call to Action */}
        <View style={styles.ctaContainer}>
          <LinearGradient
            colors={["#E67E22", "#D35400"]}
            style={styles.ctaGradient}
            start={[0, 0]}
            end={[1, 0]}
          >
            <Ionicons name="restaurant" size={32} color="#FDEBD0" />
            <Text style={styles.ctaTitle}>Ready to Cook</Text>
            <Text style={styles.ctaSubtitle}>
              Add this delicious food to your cart
            </Text>
          </LinearGradient>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.addToCartButton}
            onPress={handleAddToCart}
          >
            <Ionicons name="basket" size={20} color="#FDEBD0" />
            <Text style={styles.addToCartText}>Add to Cart</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.viewCartButton}
            onPress={() => navigation.navigate("Main", { screen: "Cart" })}
          >
            <Ionicons name="eye" size={20} color="#E67E22" />
            <Text style={styles.viewCartText}>View Cart</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FDEBD0",
  },
  imageContainer: {
    position: "relative",
    height: 300,
  },
  recipeImage: {
    width: "100%",
    height: "100%",
  },
  imageOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "flex-start",
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(44, 62, 80, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  saveButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(253, 235, 208, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  contentContainer: {
    flex: 1,
    backgroundColor: "#FDEBD0",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    marginTop: -25,
    paddingTop: 25,
  },
  headerSection: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  titleContainer: {
    marginBottom: 15,
  },
  recipeName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 10,
    lineHeight: 34,
  },
  categoryBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#E67E22",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  categoryText: {
    color: "#FDEBD0",
    fontSize: 12,
    fontWeight: "600",
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  price: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#D35400",
    marginLeft: 8,
  },
  description: {
    fontSize: 16,
    color: "#4D5656",
    lineHeight: 24,
  },
  infoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 15,
    alignItems: "center",
    flex: 1,
    marginHorizontal: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  infoIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#FDEBD0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 12,
    color: "#4D5656",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2C3E50",
    textAlign: "center",
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2C3E50",
    marginLeft: 10,
  },
  ingredientsContainer: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  ingredientItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  ingredientDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E67E22",
    marginRight: 15,
  },
  ingredientContent: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  ingredientName: {
    fontSize: 16,
    color: "#2C3E50",
    flex: 1,
  },
  ingredientAmount: {
    fontSize: 16,
    fontWeight: "600",
    color: "#E67E22",
  },
  stepsContainer: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  stepItem: {
    flexDirection: "row",
    marginBottom: 20,
  },
  stepNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#E67E22",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
    marginTop: 2,
  },
  stepNumberText: {
    color: "#FDEBD0",
    fontSize: 14,
    fontWeight: "bold",
  },
  stepText: {
    flex: 1,
    fontSize: 16,
    color: "#2C3E50",
    lineHeight: 24,
  },
  ctaContainer: {
    marginHorizontal: 20,
    marginBottom: 25,
    borderRadius: 20,
    overflow: "hidden",
  },
  ctaGradient: {
    alignItems: "center",
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  ctaTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FDEBD0",
    marginTop: 10,
    marginBottom: 5,
  },
  ctaSubtitle: {
    fontSize: 16,
    color: "#FDEBD0",
    opacity: 0.9,
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingBottom: 30,
    gap: 15,
  },
  addToCartButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#D35400",
    paddingVertical: 15,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  addToCartText: {
    color: "#FDEBD0",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  viewCartButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    paddingVertical: 15,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "#E67E22",
  },
  viewCartText: {
    color: "#E67E22",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
});

export default RecipeDetail;
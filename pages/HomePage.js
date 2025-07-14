import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useMemo, useState } from "react";
import {
  Dimensions,
  FlatList,
  ImageBackground,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  ScrollView
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { recipes } from "../data";

const numColumns = 2;
const screenWidth = Dimensions.get("window").width;
const itemWidth = screenWidth / numColumns - 24;

export default function HomePage() {
  const navigation = useNavigation();
  const [search, setSearch] = useState("");
  const [nameUser, setNameUser] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [randomRecipes, setRandomRecipes] = useState([]);

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const name = await AsyncStorage.getItem("nameUser");
        if (name) setNameUser(name);
      } catch (error) {
        console.error("Lỗi khi lấy tên người dùng:", error);
      }
    };

    const updateRandomRecipes = () => {
      const shuffled = [...recipes].sort(() => 0.5 - Math.random());
      setRandomRecipes(shuffled.slice(0, 8));
    };

    updateRandomRecipes();
    const interval = setInterval(updateRandomRecipes, 300000);
    fetchUserName();

    return () => clearInterval(interval);
  }, []);

  const categories = useMemo(
    () => [...new Set(recipes.map((recipe) => recipe.category))],
    [recipes]
  );

  const removeVietnameseTones = (str) => {
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D");
  };

  const filteredRecipes = useMemo(() => {
    if (search.length === 0) return recipes;
    const searchNormalized = removeVietnameseTones(search.toLowerCase());
    return recipes.filter((recipe) =>
      removeVietnameseTones(recipe.name.toLowerCase()).includes(searchNormalized)
    );
  }, [search]);

  const handleSearch = (query) => {
    setSearch(query);
    setShowSuggestions(query.length > 0);
  };

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

  const renderCategoryItem = (category) => (
    <TouchableOpacity
      key={category}
      style={styles.categoryItem}
      onPress={() => navigation.navigate("RecipeByCategory", { category })}
    >
      <View style={styles.categoryIconContainer}>
        <Ionicons name={getCategoryIcon(category)} size={28} color="#E67E22" />
      </View>
      <Text style={styles.categoryText}>{category}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.userInfo}>
            <View style={styles.avatarContainer}>
              <Ionicons name="person" size={24} color="#FDEBD0" />
            </View>
            <View>
              <Text style={styles.greeting}>Hello,</Text>
              <Text style={styles.userName}>{nameUser || 'Guest'}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications" size={24} color="#FDEBD0" />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={randomRecipes}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        numColumns={numColumns}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.recipeCard}
            onPress={() => navigation.navigate("RecipeDetail", { recipe: item })}
          >
            <ImageBackground
              source={{ uri: item.image }}
              style={styles.recipeImage}
              imageStyle={{ borderRadius: 15 }}
            >
              <View style={styles.recipeOverlay}>
                <Text style={styles.recipeText}>{item.name}</Text>
                <View style={styles.recipeInfo}>
                  <Ionicons name="time" size={12} color="#FDEBD0" />
                  <Text style={styles.recipeTime}>30 min</Text>
                </View>
              </View>
            </ImageBackground>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.recipeGrid}
        ListHeaderComponent={
          <View style={styles.content}>
            {/* SEARCH */}
            <View style={styles.searchWrapper}>
              <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#4D5656" style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  value={search}
                  onChangeText={handleSearch}
                  placeholder="Search dishes, ingredients..."
                  returnKeyType="done"
                  onFocus={() => setShowSuggestions(true)}
                  placeholderTextColor="#4D5656"
                />
                {search.length > 0 && (
                  <TouchableOpacity onPress={() => {
                    setSearch('');
                    setShowSuggestions(false);
                  }}>
                    <Ionicons name="close-circle" size={20} color="#4D5656" />
                  </TouchableOpacity>
                )}
              </View>

              {showSuggestions && search.length > 0 && filteredRecipes.length > 0 && (
                <View style={styles.suggestionsContainer}>
                  <FlatList
                    data={filteredRecipes.slice(0, 5)}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.suggestionItem}
                        onPress={() => {
                          navigation.navigate("RecipeDetail", { recipe: item });
                          setSearch(item.name);
                          setShowSuggestions(false);
                        }}
                      >
                        <Ionicons name="restaurant" size={16} color="#E67E22" />
                        <Text style={styles.suggestionText}>{item.name}</Text>
                      </TouchableOpacity>
                    )}
                  />
                </View>
              )}
            </View>

            {/* CATEGORIES */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Categories</Text>
              <FlatList
                data={categories}
                horizontal
                showsHorizontalScrollIndicator={false}
                renderItem={({ item }) => renderCategoryItem(item)}
                keyExtractor={(item) => item}
                contentContainerStyle={styles.categoryList}
              />
            </View>

            {/* TITLE for recommendations */}
            <Text style={styles.sectionTitle}>Recommended for You</Text>
          </View>
        }
      />
    </View>
  );

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FDEBD0"
  },
  header: {
    backgroundColor: "#E67E22",
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: "#D35400",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  greeting: {
    fontSize: 14,
    color: "#FDEBD0",
    opacity: 0.9,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FDEBD0",
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#D35400",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  searchWrapper: {
    position: "relative",
    marginBottom: 25,
    zIndex: 1000,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  searchIcon: {
    marginRight: 10
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#2C3E50",
  },
  suggestionsContainer: {
    position: "absolute",
    top: 55,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 15,
    maxHeight: 200,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 10,
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  suggestionText: {
    fontSize: 16,
    color: "#2C3E50",
    marginLeft: 10,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 15,
  },
  categoryList: {
    paddingVertical: 5,
  },
  categoryItem: {
    alignItems: "center",
    marginRight: 20,
    backgroundColor: "#fff",
    paddingVertical: 15,
    paddingHorizontal: 12,
    borderRadius: 15,
    minWidth: 80,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#FDEBD0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 12,
    color: "#2C3E50",
    fontWeight: "600",
    textAlign: "center",
  },
  recipeGrid: {
    paddingBottom: 20,
  },
  recipeCard: {
    flex: 1,
    margin: 8,
    height: 180,
    borderRadius: 15,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  recipeImage: {
    width: itemWidth,
    height: 180,
    justifyContent: "flex-end"
  },
  recipeOverlay: {
    backgroundColor: "rgba(44, 62, 80, 0.8)",
    padding: 12,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  recipeText: {
    color: "#FDEBD0",
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 4,
  },
  recipeInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  recipeTime: {
    color: "#FDEBD0",
    fontSize: 12,
    marginLeft: 4,
    opacity: 0.9,
  },
});
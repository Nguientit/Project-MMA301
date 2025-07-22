"use client"

import React from "react"

import AsyncStorage from "@react-native-async-storage/async-storage"
import { useNavigation, useFocusEffect } from "@react-navigation/native"
import { useEffect, useMemo, useState } from "react"
import {
  Dimensions,
  FlatList,
  ImageBackground,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from "react-native"
import Ionicons from "react-native-vector-icons/Ionicons"
import { recipes } from "../../data"
import {myRecipes} from "../../data"
import {savedRecipes} from "../../data"
import FoodRecommendationPopup from "./FoodRecommendationPopup"
import ChatbotPopup from "./ChatbotPopup"
import NotificationService from "../services/NotificationService"
import MessagingService from "../services/MessagingService"

const numColumns = 2
const screenWidth = Dimensions.get("window").width
const itemWidth = screenWidth / numColumns - 24

function HomePage() {
  const navigation = useNavigation()
  const [search, setSearch] = useState("")
  const [nameUser, setNameUser] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [randomRecipes, setRandomRecipes] = useState([])
  const [showRecommendationPopup, setShowRecommendationPopup] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [currentTableId, setCurrentTableId] = useState("")
  const [selectedTableName, setSelectedTableName] = useState("")
  const [cartItemCount, setCartItemCount] = useState(0)

  // Use useFocusEffect to reload data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      fetchUserName()
      updateRandomRecipes()
      loadUnreadMessages()
      loadCartCount()
    }, []),
  )

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await NotificationService.initialize()
        await NotificationService.scheduleRecurringFoodRecommendations()
      } catch (error) {
        console.log("Notification initialization error:", error)
      }
    }

    const checkShowRecommendation = async () => {
      try {
        const lastShown = await AsyncStorage.getItem("lastRecommendationShown")
        const now = new Date().getTime()
        const oneHour = 60 * 60 * 1000
        if (!lastShown || now - Number.parseInt(lastShown) > oneHour) {
          setTimeout(() => {
            setShowRecommendationPopup(true)
            AsyncStorage.setItem("lastRecommendationShown", now.toString())
          }, 3000)
        }
      } catch (error) {
        console.log("Error checking recommendation:", error)
      }
    }

    initializeApp()
    checkShowRecommendation()

    // Update random recipes every 5 minutes
    const interval = setInterval(updateRandomRecipes, 300000)

    // Check for unread messages every 30 seconds
    const messageInterval = setInterval(loadUnreadMessages, 30000)

    return () => {
      clearInterval(interval)
      clearInterval(messageInterval)
    }
  }, [])

  const fetchUserName = async () => {
    try {
      const name = await AsyncStorage.getItem("nameUser")
      const tableId = await AsyncStorage.getItem("selectedTable")
      const tableName = await AsyncStorage.getItem("selectedTableName")
      if (name) setNameUser(name)
      if (tableId) setCurrentTableId(tableId)
      if (tableName) setSelectedTableName(tableName)
    } catch (error) {
      console.error("Lỗi khi lấy thông tin người dùng:", error)
    }
  }

  const updateRandomRecipes = () => {
    const shuffled = [...recipes].sort(() => 0.5 - Math.random())
    setRandomRecipes(shuffled.slice(0, 8))
  }

  const loadUnreadMessages = async () => {
    try {
      const tableId = await AsyncStorage.getItem("selectedTable")
      if (tableId) {
        const unreadMessages = await MessagingService.getUnreadMessages(tableId)
        setUnreadCount(unreadMessages.length)
      }
    } catch (error) {
      console.error("Error loading unread messages:", error)
    }
  }

  const loadCartCount = async () => {
    try {
      const cartItems = await AsyncStorage.getItem("cartItems")
      const cart = cartItems ? JSON.parse(cartItems) : []
      const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)
      setCartItemCount(totalItems)
    } catch (error) {
      console.error("Error loading cart count:", error)
    }
  }

  const categories = useMemo(() => [...new Set(recipes.map((recipe) => recipe.category))], [recipes])

  const removeVietnameseTones = (str) => {
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
  }

  const filteredRecipes = useMemo(() => {
    if (search.length === 0) return recipes
    const searchNormalized = removeVietnameseTones(search.toLowerCase())
    return recipes.filter((recipe) => removeVietnameseTones(recipe.name.toLowerCase()).includes(searchNormalized))
  }, [search])

  const handleSearch = (query) => {
    setSearch(query)
    setShowSuggestions(query.length > 0)
  }

  const getCategoryIcon = (category) => {
    const iconMap = {
      Lunch: "restaurant",
      Dinner: "restaurant-outline",
      Dess: "ice-cream",
      Appetizer: "wine",
      Beverage: "cafe",
      Soup: "bowl",
      Salad: "leaf",
    }
    return iconMap[category] || "fast-food"
  }

  const handleSelectRecommendedDish = async (dish) => {
    try {
      const storedCart = await AsyncStorage.getItem("cartItems")
      const cart = storedCart ? JSON.parse(storedCart) : []
      const existing = cart.find((item) => item.id === dish.id)
      let updatedCart

      if (existing) {
        updatedCart = cart.map((item) =>
          item.id === dish.id
            ? {
                ...item,
                quantity: item.quantity + dish.quantity,
                note: dish.note || item.note,
              }
            : item,
        )
      } else {
        updatedCart = [...cart, dish]
      }

      await AsyncStorage.setItem("cartItems", JSON.stringify(updatedCart))
      loadCartCount() // Refresh cart count
      Alert.alert("Thành công", "Đã thêm món vào giỏ hàng!")
    } catch (error) {
      console.error("Add to cart error:", error)
      Alert.alert("Lỗi", "Không thể thêm vào giỏ hàng.")
    }
  }

  const handleShowRecommendations = () => {
    setShowRecommendationPopup(true)
  }

  const handleNotificationPress = () => {
    navigation.navigate("NotificationsPage")
  }

  const handleTodayComboPress = () => {
    navigation.navigate("TodayComboPage")
  }

  const handleDishStatisticsPress = () => {
    navigation.navigate("DishStatisticsPage")
  }

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
  )

  const renderQuickActions = () => (
    <View style={styles.quickActionsSection}>
      <Text style={styles.sectionTitle}>Truy cập nhanh</Text>
      <View style={styles.quickActionsGrid}>
        <TouchableOpacity style={styles.quickActionCard} onPress={handleTodayComboPress}>
          <View style={[styles.quickActionIcon, { backgroundColor: "#3498DB" }]}>
            <Ionicons name="calendar-outline" size={24} color="#FDEBD0" />
          </View>
          <Text style={styles.quickActionTitle}>Combo hôm nay</Text>
          <Text style={styles.quickActionSubtitle}>AI tạo combo riêng cho bạn</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.quickActionCard} onPress={handleDishStatisticsPress}>
          <View style={[styles.quickActionIcon, { backgroundColor: "#27AE60" }]}>
            <Ionicons name="analytics" size={24} color="#FDEBD0" />
          </View>
          <Text style={styles.quickActionTitle}>Thống kê món ăn</Text>
          <Text style={styles.quickActionSubtitle}>Xem lịch sử và lời khuyên AI</Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.userInfo}>
            <View style={styles.avatarContainer}>
              <Ionicons name="person" size={24} color="#FDEBD0" />
            </View>
            <View>
              <Text style={styles.greeting}>Xin chào,</Text>
              <Text style={styles.userName}>{nameUser || "Khách"}</Text>
              {selectedTableName && <Text style={styles.tableInfo}>{selectedTableName}</Text>}
            </View>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.recommendationButton} onPress={handleShowRecommendations}>
              <Ionicons name="bulb" size={20} color="#FDEBD0" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.notificationButton} onPress={handleNotificationPress}>
              <Ionicons name="notifications" size={24} color="#FDEBD0" />
              {unreadCount > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>{unreadCount > 9 ? "9+" : unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.cartButton} onPress={() => navigation.navigate("Cart")}>
              <Ionicons name="bag" size={24} color="#FDEBD0" />
              {cartItemCount > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{cartItemCount > 9 ? "9+" : cartItemCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
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
            <ImageBackground source={{ uri: item.image }} style={styles.recipeImage} imageStyle={{ borderRadius: 15 }}>
              <View style={styles.recipeOverlay}>
                <Text style={styles.recipeText}>{item.name}</Text>
                <View style={styles.recipeInfo}>
                  <Ionicons name="time" size={12} color="#FDEBD0" />
                  <Text style={styles.recipeTime}>{item.cookingTime}</Text>
                </View>
                <View style={styles.recipePrice}>
                  <Text style={styles.recipePriceText}>{item.price?.toLocaleString()}đ</Text>
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
                  placeholder="Tìm món ăn, nguyên liệu..."
                  returnKeyType="done"
                  onFocus={() => setShowSuggestions(true)}
                  placeholderTextColor="#4D5656"
                />
                {search.length > 0 && (
                  <TouchableOpacity
                    onPress={() => {
                      setSearch("")
                      setShowSuggestions(false)
                    }}
                  >
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
                          navigation.navigate("RecipeDetail", { recipe: item })
                          setSearch(item.name)
                          setShowSuggestions(false)
                        }}
                      >
                        <Ionicons name="restaurant" size={16} color="#E67E22" />
                        <Text style={styles.suggestionText}>{item.name}</Text>
                        <Text style={styles.suggestionPrice}>{item.price?.toLocaleString()}đ</Text>
                      </TouchableOpacity>
                    )}
                  />
                </View>
              )}
            </View>

            {/* QUICK ACTIONS */}
            {renderQuickActions()}

            {/* CATEGORIES */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Danh mục món ăn</Text>
              <FlatList
                data={categories}
                horizontal
                showsHorizontalScrollIndicator={false}
                renderItem={({ item }) => renderCategoryItem(item)}
                keyExtractor={(item) => item}
                contentContainerStyle={styles.categoryList}
              />
            </View>

            {/* AI Chatbot Promotion */}
            <View style={styles.aiPromotion}>
              <View style={styles.aiPromotionContent}>
                <Ionicons name="sparkles" size={24} color="#E67E22" />
                <View style={styles.aiPromotionText}>
                  <Text style={styles.aiPromotionTitle}>Hỏi AI về món ăn!</Text>
                  <Text style={styles.aiPromotionSubtitle}>AI sẽ gửi thông tin món ăn trực tiếp trong chat</Text>
                </View>
              </View>
            </View>

            {/* TITLE for recommendations */}
            <Text style={styles.sectionTitle}>Gợi ý cho bạn</Text>
          </View>
        }
      />

      {/* Food Recommendation Popup */}
      <FoodRecommendationPopup
        visible={showRecommendationPopup}
        onClose={() => setShowRecommendationPopup(false)}
        onSelectDish={handleSelectRecommendedDish}
      />

      {/* Enhanced AI Chatbot Popup */}
      <ChatbotPopup />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FDEBD0",
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
    flex: 1,
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
  tableInfo: {
    fontSize: 12,
    color: "#FDEBD0",
    opacity: 0.8,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
  },
  recommendationButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#D35400",
    justifyContent: "center",
    alignItems: "center",
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#D35400",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: "#E74C3C",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FDEBD0",
  },
  notificationBadgeText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#FDEBD0",
  },
  cartButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#D35400",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  cartBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: "#27AE60",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FDEBD0",
  },
  cartBadgeText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#FDEBD0",
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
    marginRight: 10,
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
    flex: 1,
  },
  suggestionPrice: {
    fontSize: 14,
    color: "#E67E22",
    fontWeight: "600",
  },
  quickActionsSection: {
    marginBottom: 25,
  },
  quickActionsGrid: {
    flexDirection: "row",
    gap: 15,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  quickActionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2C3E50",
    textAlign: "center",
    marginBottom: 4,
  },
  quickActionSubtitle: {
    fontSize: 12,
    color: "#4D5656",
    textAlign: "center",
    lineHeight: 16,
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
  aiPromotion: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 15,
    marginBottom: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderLeftWidth: 4,
    borderLeftColor: "#E67E22",
  },
  aiPromotionContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  aiPromotionText: {
    flex: 1,
    marginLeft: 15,
  },
  aiPromotionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 4,
  },
  aiPromotionSubtitle: {
    fontSize: 14,
    color: "#4D5656",
    fontStyle: "italic",
  },
  recipeGrid: {
    paddingBottom: 20,
  },
  recipeCard: {
    flex: 1,
    margin: 8,
    height: 200,
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
    height: 200,
    justifyContent: "flex-end",
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
    marginBottom: 4,
  },
  recipeTime: {
    color: "#FDEBD0",
    fontSize: 12,
    marginLeft: 4,
    opacity: 0.9,
  },
  recipePrice: {
    alignSelf: "flex-start",
  },
  recipePriceText: {
    color: "#FDEBD0",
    fontSize: 12,
    fontWeight: "bold",
    backgroundColor: "rgba(230, 126, 34, 0.8)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
})

export default HomePage

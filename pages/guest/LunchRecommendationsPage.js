"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, TextInput, Alert } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import Ionicons from "react-native-vector-icons/Ionicons"
import { LinearGradient } from "expo-linear-gradient"
import { recipes } from "../../data"

const LunchRecommendationsPage = ({ navigation }) => {
  const [lunchCombos, setLunchCombos] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredCombos, setFilteredCombos] = useState([])

  useEffect(() => {
    generateLunchCombos()
  }, [])

  useEffect(() => {
    filterCombos()
  }, [searchQuery, lunchCombos])

  const generateLunchCombos = () => {
    // Lọc các món phù hợp cho bữa trưa từ data mới
    const lunchDishes = recipes.filter((recipe) => recipe.category === "Lunch")
    const dinnerDishes = recipes.filter((recipe) => recipe.category === "Dinner")
    const beverages = recipes.filter((recipe) => recipe.category === "Beverage")
    const appetizers = recipes.filter((recipe) => recipe.category === "Appetizer")
    const desserts = recipes.filter((recipe) => recipe.category === "Dessert")

    const combos = [
      // Combo Ấn Độ truyền thống
      {
        id: "combo1",
        name: "Combo Ấn Độ Truyền Thống",
        description: "Bữa trưa đậm đà hương vị Ấn Độ với các món chính và đồ uống",
        price: 120000,
        originalPrice: 140000,
        image: lunchDishes[0]?.image || "https://via.placeholder.com/300x200",
        items: [lunchDishes[0], beverages[0]].filter(Boolean),
        badge: "Phổ biến",
        rating: 4.8,
        prepTime: "35-40 phút",
      },
      // Combo Biryani đặc biệt
      {
        id: "combo2",
        name: "Combo Biryani Đặc Biệt",
        description: "Cơm Biryani thơm ngon với đồ uống và món khai vị",
        price: 150000,
        originalPrice: 170000,
        image: lunchDishes[0]?.image || "https://via.placeholder.com/300x200",
        items: [lunchDishes[0], appetizers[0], beverages[1]].filter(Boolean),
        badge: "Premium",
        rating: 4.9,
        prepTime: "45-50 phút",
      },
      // Combo chay healthy
      {
        id: "combo3",
        name: "Combo Chay Healthy",
        description: "Bữa ăn nhẹ nhàng với Dal và đồ uống tươi mát",
        price: 85000,
        originalPrice: 100000,
        image: lunchDishes[1]?.image || "https://via.placeholder.com/300x200",
        items: [lunchDishes[1], beverages[0]].filter(Boolean),
        badge: "Healthy",
        rating: 4.6,
        prepTime: "25-30 phút",
      },
      // Combo dinner cho trưa
      {
        id: "combo4",
        name: "Combo Gà Tikka Masala",
        description: "Món gà đặc trưng với hương vị đậm đà, phù hợp cho bữa trưa",
        price: 95000,
        originalPrice: 110000,
        image: dinnerDishes[1]?.image || "https://via.placeholder.com/300x200",
        items: [dinnerDishes[1], beverages[1]].filter(Boolean),
        badge: "Đặc biệt",
        rating: 4.7,
        prepTime: "40-45 phút",
      },
      // Combo nhanh
      {
        id: "combo5",
        name: "Combo Express",
        description: "Nhanh gọn với Samosa và đồ uống, phù hợp giờ trưa bận rộn",
        price: 60000,
        originalPrice: 75000,
        image: appetizers[0]?.image || "https://via.placeholder.com/300x200",
        items: [appetizers[0], beverages[1]].filter(Boolean),
        badge: "Nhanh",
        rating: 4.4,
        prepTime: "15-20 phút",
      },
      // Combo ngọt ngào
      {
        id: "combo6",
        name: "Combo Ngọt Ngào",
        description: "Kết hợp món chính với tráng miệng truyền thống",
        price: 110000,
        originalPrice: 130000,
        image: desserts[0]?.image || "https://via.placeholder.com/300x200",
        items: [lunchDishes[1], desserts[0], beverages[0]].filter(Boolean),
        badge: "Ngọt ngào",
        rating: 4.5,
        prepTime: "35-40 phút",
      },
    ]

    setLunchCombos(combos)
    setFilteredCombos(combos)
  }

  const filterCombos = () => {
    if (!searchQuery.trim()) {
      setFilteredCombos(lunchCombos)
      return
    }

    const filtered = lunchCombos.filter((combo) => {
      const searchLower = searchQuery.toLowerCase()
      return (
        combo.name.toLowerCase().includes(searchLower) ||
        combo.description.toLowerCase().includes(searchLower) ||
        combo.badge.toLowerCase().includes(searchLower) ||
        combo.items.some(
          (item) => item.name.toLowerCase().includes(searchLower) || item.category.toLowerCase().includes(searchLower),
        )
      )
    })

    setFilteredCombos(filtered)
  }

  const handleAddToCart = async (combo) => {
    try {
      const storedCart = await AsyncStorage.getItem("cartItems")
      const cart = storedCart ? JSON.parse(storedCart) : []

      // Tạo item combo để thêm vào giỏ hàng
      const comboItem = {
        id: combo.id,
        name: combo.name,
        price: combo.price,
        image: combo.image,
        description: combo.description,
        quantity: 1,
        isCombo: true,
        comboItems: combo.items,
      }

      const existing = cart.find((item) => item.id === combo.id)
      let updatedCart

      if (existing) {
        updatedCart = cart.map((item) => (item.id === combo.id ? { ...item, quantity: item.quantity + 1 } : item))
      } else {
        updatedCart = [...cart, comboItem]
      }

      await AsyncStorage.setItem("cartItems", JSON.stringify(updatedCart))
      Alert.alert("Đã thêm vào giỏ hàng", `${combo.name} đã được thêm vào giỏ hàng!`)
    } catch (error) {
      console.error("Add combo to cart error:", error)
      Alert.alert("Lỗi", "Không thể thêm combo vào giỏ hàng.")
    }
  }

  const getBadgeColor = (badge) => {
    const colors = {
      "Phổ biến": "#E67E22",
      Healthy: "#27AE60",
      Premium: "#8E44AD",
      Nhanh: "#3498DB",
      "Đặc biệt": "#E74C3C",
      "Ngọt ngào": "#F39C12",
    }
    return colors[badge] || "#E67E22"
  }

  const renderComboCard = ({ item }) => (
    <View style={styles.comboCard}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.image }} style={styles.comboImage} />
        <LinearGradient colors={["transparent", "rgba(44, 62, 80, 0.7)"]} style={styles.imageOverlay} />
        <View style={styles.badgeContainer}>
          <View style={[styles.badge, { backgroundColor: getBadgeColor(item.badge) }]}>
            <Text style={styles.badgeText}>{item.badge}</Text>
          </View>
        </View>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={14} color="#FFD700" />
          <Text style={styles.ratingText}>{item.rating}</Text>
        </View>
      </View>

      <View style={styles.comboInfo}>
        <Text style={styles.comboName}>{item.name}</Text>
        <Text style={styles.comboDescription}>{item.description}</Text>

        <View style={styles.comboDetails}>
          <View style={styles.detailItem}>
            <Ionicons name="time" size={16} color="#4D5656" />
            <Text style={styles.detailText}>{item.prepTime}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="restaurant" size={16} color="#4D5656" />
            <Text style={styles.detailText}>{item.items.length} món</Text>
          </View>
        </View>

        <View style={styles.itemsList}>
          <Text style={styles.itemsTitle}>Bao gồm:</Text>
          {item.items.map((dish, index) => (
            <Text key={index} style={styles.itemName}>
              • {dish.name} ({dish.cookingTime})
            </Text>
          ))}
        </View>

        <View style={styles.priceContainer}>
          <View style={styles.priceInfo}>
            <Text style={styles.originalPrice}>{item.originalPrice.toLocaleString()}đ</Text>
            <Text style={styles.currentPrice}>{item.price.toLocaleString()}đ</Text>
          </View>
          <TouchableOpacity style={styles.addButton} onPress={() => handleAddToCart(item)}>
            <Ionicons name="add" size={20} color="#FDEBD0" />
            <Text style={styles.addButtonText}>Thêm</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#FDEBD0" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Combo Ấn Độ Trưa</Text>
          <Text style={styles.headerSubtitle}>{filteredCombos.length} combo đặc biệt</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#4D5656" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Tìm combo, món ăn Ấn Độ..."
          placeholderTextColor="#4D5656"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons name="close-circle" size={20} color="#4D5656" />
          </TouchableOpacity>
        )}
      </View>

      {/* Combos List */}
      <FlatList
        data={filteredCombos}
        keyExtractor={(item) => item.id}
        renderItem={renderComboCard}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="restaurant-outline" size={60} color="#4D5656" />
            <Text style={styles.emptyTitle}>Không tìm thấy combo</Text>
            <Text style={styles.emptyText}>Thử tìm kiếm với từ khóa khác</Text>
          </View>
        }
      />
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
    flexDirection: "row",
    alignItems: "center",
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#D35400",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FDEBD0",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#FDEBD0",
    opacity: 0.9,
    marginTop: 2,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginVertical: 20,
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
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  comboCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    marginBottom: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  imageContainer: {
    position: "relative",
    height: 200,
  },
  comboImage: {
    width: "100%",
    height: "100%",
  },
  imageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  badgeContainer: {
    position: "absolute",
    top: 15,
    left: 15,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  badgeText: {
    color: "#FDEBD0",
    fontSize: 12,
    fontWeight: "bold",
  },
  ratingContainer: {
    position: "absolute",
    top: 15,
    right: 15,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#2C3E50",
    marginLeft: 4,
  },
  comboInfo: {
    padding: 20,
  },
  comboName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 8,
  },
  comboDescription: {
    fontSize: 14,
    color: "#4D5656",
    lineHeight: 20,
    marginBottom: 15,
  },
  comboDetails: {
    flexDirection: "row",
    marginBottom: 15,
    gap: 20,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailText: {
    fontSize: 14,
    color: "#4D5656",
    marginLeft: 6,
  },
  itemsList: {
    marginBottom: 20,
  },
  itemsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: 8,
  },
  itemName: {
    fontSize: 13,
    color: "#4D5656",
    marginBottom: 4,
    paddingLeft: 8,
  },
  priceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceInfo: {
    flex: 1,
  },
  originalPrice: {
    fontSize: 14,
    color: "#4D5656",
    textDecorationLine: "line-through",
    marginBottom: 4,
  },
  currentPrice: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#D35400",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E67E22",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  addButtonText: {
    color: "#FDEBD0",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 6,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2C3E50",
    marginTop: 15,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#4D5656",
    textAlign: "center",
  },
})

export default LunchRecommendationsPage

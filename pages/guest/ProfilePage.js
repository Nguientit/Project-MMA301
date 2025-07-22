"use client"

import AsyncStorage from "@react-native-async-storage/async-storage"
import { useNavigation } from "@react-navigation/native"
import { useEffect, useState } from "react"
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import Ionicons from "react-native-vector-icons/Ionicons"
import OrderStatsModal from "./OrderStatsModal"

const ProfilePage = () => {
  const navigation = useNavigation()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [showStatsModal, setShowStatsModal] = useState(false)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const nameUser = await AsyncStorage.getItem("nameUser")
        const emailUser = await AsyncStorage.getItem("emailUser")

        if (nameUser) setName(nameUser)
        if (emailUser) setEmail(emailUser)
      } catch (error) {
        console.error("Lỗi khi lấy thông tin người dùng:", error)
      }
    }

    fetchUserData()
  }, [])

  const handleLogout = async () => {
    try {
      await AsyncStorage.multiRemove([
        "emailUser",
        "nameUser",
        "passwordUser",
        "isGuest",
        "selectedTable",
        "selectedTableName",
      ])

      navigation.replace("Login")
      Alert.alert("Đăng xuất thành công!")
    } catch (error) {
      console.error("Lỗi khi đăng xuất:", error)
      Alert.alert("Đã xảy ra lỗi khi đăng xuất. Vui lòng thử lại.")
    }
  }

  const handleShowStats = () => {
    setShowStatsModal(true)
  }

  const handleNavigateToLunchRecommendations = () => {
    // Sử dụng navigate thay vì replace để có thể quay lại
    navigation.navigate("LunchRecommendationsPage")
  }

  return (
    <View style={styles.container}>
      {/* User Info Header */}
      <View style={styles.userHeader}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person" size={40} color="#FDEBD0" />
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{name || "Guest User"}</Text>
          <Text style={styles.userEmail}>{email || "guest@restaurant.com"}</Text>
        </View>
      </View>

      <View style={styles.menuContainer}>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate("CreateRecipe")}>
          <View style={styles.iconContainer}>
            <Ionicons name="restaurant" size={24} color="#E67E22" />
          </View>
          <Text style={styles.menuText}>Create New Dish</Text>
          <Ionicons name="chevron-forward" size={20} color="#4D5656" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={handleShowStats}>
          <View style={styles.iconContainer}>
            <Ionicons name="analytics" size={24} color="#E67E22" />
          </View>
          <Text style={styles.menuText}>My Dish Statistics</Text>
          <Ionicons name="chevron-forward" size={20} color="#4D5656" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={handleNavigateToLunchRecommendations}>
          <View style={styles.iconContainer}>
            <Ionicons name="restaurant-outline" size={24} color="#E67E22" />
          </View>
          <Text style={styles.menuText}>Lunch Combos</Text>
          <Ionicons name="chevron-forward" size={20} color="#4D5656" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.iconContainer}>
            <Ionicons name="search" size={24} color="#E67E22" />
          </View>
          <Text style={styles.menuText}>Browse More Dishes</Text>
          <Ionicons name="chevron-forward" size={20} color="#4D5656" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
          <View style={styles.iconContainer}>
            <Ionicons name="log-out" size={24} color="#D35400" />
          </View>
          <Text style={[styles.menuText, { color: "#D35400" }]}>Logout</Text>
          <Ionicons name="chevron-forward" size={20} color="#4D5656" />
        </TouchableOpacity>
      </View>

      {/* Order Stats Modal */}
      <OrderStatsModal visible={showStatsModal} onClose={() => setShowStatsModal(false)} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FDEBD0",
    padding: 20,
  },
  userHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#E67E22",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: "#4D5656",
  },
  menuContainer: {
    backgroundColor: "#fff",
    borderRadius: 15,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FDEBD0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  menuText: {
    fontSize: 16,
    color: "#2C3E50",
    fontWeight: "500",
    flex: 1,
  },
})

export default ProfilePage

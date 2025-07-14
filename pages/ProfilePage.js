import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

const ProfilePage = () => {
  const navigation = useNavigation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const nameUser = await AsyncStorage.getItem("nameUser");
        const emailUser = await AsyncStorage.getItem("emailUser");

        if (nameUser && emailUser) {
          setName(nameUser);
          setEmail(emailUser);
        }
      } catch (error) {
        console.error("Lỗi khi lấy thông tin người dùng:", error);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = async () => {
    try {
      await AsyncStorage.multiRemove([
        "emailUser",
        "nameUser",
        "passwordUser",
        "isGuest",
        "selectedTable",
        "selectedTableName",
      ]);

      navigation.replace("Login");
      Alert.alert("Đăng xuất thành công!");
    } catch (error) {
      console.error("Lỗi khi đăng xuất:", error);
      Alert.alert("Đã xảy ra lỗi khi đăng xuất. Vui lòng thử lại.");
    }
  };

  return (
    <View style={styles.container}>
      

      <View style={styles.menuContainer}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate("CreateRecipe")}
        >
          <View style={styles.iconContainer}>
            <Ionicons name="restaurant" size={24} color="#E67E22" />
          </View>
          <Text style={styles.menuText}>Create New Dish</Text>
          <Ionicons name="chevron-forward" size={20} color="#4D5656" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.iconContainer}>
            <Ionicons name="book" size={24} color="#E67E22" />
          </View>
          <Text style={styles.menuText}>My Dish</Text>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FDEBD0",
    padding: 20,
  },
  profileHeader: {
    alignItems: "center",
    marginBottom: 40,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#E67E22",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  profileName: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 5,
  },
  profileEmail: {
    fontSize: 16,
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
});

export default ProfilePage;
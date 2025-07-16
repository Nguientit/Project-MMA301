import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";

export default function WaiterDashboard() {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const load = async () => {
      const storedName = await AsyncStorage.getItem("nameUser");
      const storedRole = await AsyncStorage.getItem("role");
      const storedUsername = await AsyncStorage.getItem("username");

      if (storedRole !== "waiter") {
        Alert.alert("Từ chối truy cập!", "Bạn không có quyền xem trang này!");
        navigation.replace("Login");
        return;
      }

      const storedOrders = await AsyncStorage.getItem("paidOrders");
      const allOrders = storedOrders ? JSON.parse(storedOrders) : [];
      const filteredOrders = allOrders.filter(
        (order) => order.waiterId === storedUsername
      );

      setOrders(filteredOrders);
      setName(storedName || "");
      setRole(storedRole || "");
      setLoading(false);
    };

    load();
  }, []);

  const handleLogout = async () => {
    Alert.alert(
      "Xác nhận đăng xuất",
      "Bạn muốn đăng xuất?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            await AsyncStorage.multiRemove(["username", "nameUser", "role", "isGuest"]);
            navigation.replace("Login");
          },
        },
      ]
    );
  };

  const handleCompleteTable = async (orderId) => {
    Alert.alert(
      "Complete Table Service",
      "Mark this table as completed?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Complete",
          onPress: async () => {
            const storedOrders = await AsyncStorage.getItem("paidOrders");
            const allOrders = storedOrders ? JSON.parse(storedOrders) : [];
            const updatedOrders = allOrders.filter((order) => order.id !== orderId);
            await AsyncStorage.setItem("paidOrders", JSON.stringify(updatedOrders));
            setOrders(orders.filter(order => order.id !== orderId));
            Alert.alert("Success", "Table service completed!");
          },
        },
      ]
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Đã thanh toán":
        return "#28a745";
      case "Đã huỷ":
        return "#D35400";
      default:
        return "#4D5656";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Đã thanh toán":
        return "checkmark-circle";
      case "Đã huỷ":
        return "close-circle";
      default:
        return "time";
    }
  };

  const renderItem = ({ item }) => {
    const totalPrice = item.items.reduce(
      (sum, food) => sum + food.price * food.quantity,
      0
    );

    return (
      <View style={styles.orderCard}>
        <View style={styles.orderHeader}>
          <View style={styles.tableInfo}>
            <Ionicons name="restaurant" size={20} color="#E67E22" />
            <Text style={styles.tableText}>{item.tableId}</Text>
          </View>
          <View style={styles.timeInfo}>
            <Ionicons name="time" size={16} color="#4D5656" />
            <Text style={styles.timeText}>
              {new Date(item.createdAt).toLocaleTimeString()}
            </Text>
          </View>
        </View>

        <View style={styles.itemsList}>
          {item.items.map((food, index) => (
            <View key={index} style={styles.foodItemRow}>
              <Text style={styles.foodItem}>
                {food.name} x{food.quantity}
              </Text>
              <Text style={styles.foodPrice}>
                {food.price.toLocaleString()}đ
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.orderFooter}>
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalPrice}>
              {totalPrice.toLocaleString()}đ
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Ionicons
              name={getStatusIcon(item.status)}
              size={14}
              color="#FDEBD0"
            />
            <Text style={styles.statusText}>
              {item.status === "Đã thanh toán" ? "Paid" : "Cancelled"}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.completeButton}
          onPress={() => handleCompleteTable(item.id)}
        >
          <Ionicons name="checkmark-done" size={20} color="#FDEBD0" />
          <Text style={styles.completeButtonText}>Complete Service</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E67E22" />
        <Text style={styles.loadingText}>Loading orders...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.welcomeContainer}>
          <Ionicons name="person-circle" size={40} color="#FDEBD0" />
          <View style={styles.welcomeText}>
            <Text style={styles.welcomeTitle}>Welcome back,</Text>
            <Text style={styles.userName}>{name}</Text>
          </View>
        </View>
        <Text style={styles.roleText}>Waiter Dashboard</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.sectionHeader}>
          <Ionicons name="clipboard" size={24} color="#E67E22" />
          <Text style={styles.sectionTitle}>Your Tables</Text>
          <View style={styles.orderCount}>
            <Text style={styles.countText}>{orders.length}</Text>
          </View>
        </View>

        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="restaurant-outline" size={60} color="#4D5656" />
              <Text style={styles.emptyText}>No active tables</Text>
              <Text style={styles.emptySubtext}>Completed orders will appear here</Text>
            </View>
          }
          contentContainerStyle={styles.ordersList}
          showsVerticalScrollIndicator={false}
        />

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out" size={20} color="#FDEBD0" />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
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
    paddingBottom: 25,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  welcomeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  welcomeText: {
    marginLeft: 15,
  },
  welcomeTitle: {
    fontSize: 16,
    color: "#FDEBD0",
    opacity: 0.9,
  },
  userName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FDEBD0",
  },
  roleText: {
    fontSize: 14,
    color: "#FDEBD0",
    opacity: 0.8,
    textAlign: "center",
    marginTop: 5,
  },
  content: {
    flex: 1,
    padding: 20,
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
    flex: 1,
  },
  orderCount: {
    backgroundColor: "#D35400",
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  countText: {
    color: "#FDEBD0",
    fontWeight: "bold",
    fontSize: 14,
  },
  ordersList: {
    paddingBottom: 100,
  },
  orderCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  tableInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  tableText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2C3E50",
    marginLeft: 8,
  },
  timeInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeText: {
    fontSize: 14,
    color: "#4D5656",
    marginLeft: 4,
  },
  itemsList: {
    marginBottom: 15,
  },
  foodItemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  foodItem: {
    fontSize: 16,
    color: "#2C3E50",
    flex: 1,
  },
  foodPrice: {
    fontSize: 16,
    color: "#E67E22",
    fontWeight: "600",
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    marginBottom: 15,
  },
  totalContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2C3E50",
    marginRight: 8,
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#D35400",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FDEBD0",
    marginLeft: 4,
  },
  completeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#28a745",
    paddingVertical: 12,
    borderRadius: 10,
  },
  completeButtonText: {
    color: "#FDEBD0",
    fontWeight: "bold",
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: "#4D5656",
    fontWeight: "600",
    marginTop: 15,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#4D5656",
    opacity: 0.7,
    marginTop: 5,
  },
  logoutButton: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#D35400",
    paddingVertical: 15,
    borderRadius: 12,
  },
  logoutButtonText: {
    color: "#FDEBD0",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FDEBD0",
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: "#2C3E50",
  },
});
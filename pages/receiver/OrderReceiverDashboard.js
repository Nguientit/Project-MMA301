import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  FlatList,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";

const waiterTableMap = {
  table_1: "waiter1",
  table_2: "waiter1",
  table_3: "waiter1",
  table_4: "waiter2",
  table_5: "waiter2",
  table_6: "waiter2",
  table_7: "waiter3",
  table_8: "waiter3",
  table_9: "waiter3",
  table_10: "waiter4",
  table_11: "waiter4",
  table_12: "waiter4",
};

export default function OrderReceiverDashboard() {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    const loadData = async () => {
      const storedName = await AsyncStorage.getItem("nameUser");
      const storedRole = await AsyncStorage.getItem("role");

      if (storedRole !== "receiver") {
        Alert.alert("Bạn không có quyền truy cập trang này!");
        navigation.replace("Login");
        return;
      }

      setName(storedName || "");
      setRole(storedRole || "");

      const storedOrders = await AsyncStorage.getItem("orders");
      setOrders(storedOrders ? JSON.parse(storedOrders) : []);
      setLoading(false);
    };

    loadData();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.multiRemove(["username", "nameUser", "role", "isGuest"]);
    navigation.replace("Login");
  };

  const saveOrders = async (newOrders) => {
    setOrders(newOrders);
    await AsyncStorage.setItem("orders", JSON.stringify(newOrders));
  };

  const forwardToWaiter = async (order, status) => {
    const tableId = order.tableId || order.table;
    const waiterId = waiterTableMap[tableId];
    const updatedOrder = { ...order, status, waiterId };
    const existing = await AsyncStorage.getItem("paidOrders");
    const paidOrders = existing ? JSON.parse(existing) : [];
    paidOrders.push(updatedOrder);
    await AsyncStorage.setItem("paidOrders", JSON.stringify(paidOrders));
  };

  const handleConfirmPayment = async (orderId) => {
    const order = orders.find((o) => o.id === orderId);
    const updatedOrder = { ...order, status: "Đã thanh toán" };

    await forwardToWaiter(updatedOrder, "Đã thanh toán");

    const existingHistory = await AsyncStorage.getItem("history");
    const history = existingHistory ? JSON.parse(existingHistory) : [];
    history.push(updatedOrder);
    await AsyncStorage.setItem("history", JSON.stringify(history));

    const remainingOrders = orders.filter((o) => o.id !== orderId);
    await saveOrders(remainingOrders);
  };

  const handleCancelOrder = async (orderId) => {
    const order = orders.find((o) => o.id === orderId);
    await forwardToWaiter(order, "Đã huỷ");
    const remainingOrders = orders.filter((o) => o.id !== orderId);
    await saveOrders(remainingOrders);
  };

  const renderOrder = ({ item }) => {
    const totalPrice = item.items.reduce(
      (sum, food) => sum + food.price * food.quantity,
      0
    );

    return (
      <View style={styles.orderCard}>
        <View style={styles.orderHeader}>
          <View style={styles.tableInfo}>
            <Ionicons name="restaurant" size={20} color="#E67E22" />
            <Text style={styles.orderTable}>{item.table}</Text>
          </View>
          <View style={styles.timeInfo}>
            <Ionicons name="time" size={16} color="#4D5656" />
            <Text style={styles.orderTime}>
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

        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalPrice}>
            {totalPrice.toLocaleString()}đ
          </Text>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.actionButton, styles.confirmButton]}
            onPress={() => handleConfirmPayment(item.id)}
          >
            <Ionicons name="checkmark-circle" size={20} color="#FDEBD0" />
            <Text style={styles.buttonText}>Confirm Payment</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.cancelButton]}
            onPress={() =>
              Alert.alert("Confirm", "Are you sure you want to cancel this order?", [
                { text: "No" },
                {
                  text: "Cancel Order",
                  style: "destructive",
                  onPress: () => handleCancelOrder(item.id),
                },
              ])
            }
          >
            <Ionicons name="close-circle" size={20} color="#FDEBD0" />
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
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
        <Text style={styles.roleText}>BTN Restaurant</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.sectionHeader}>
          <Ionicons name="receipt" size={24} color="#E67E22" />
          <Text style={styles.sectionTitle}>Pending Orders</Text>
          <View style={styles.orderCount}>
            <Text style={styles.countText}>{orders.length}</Text>
          </View>
        </View>

        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          renderItem={renderOrder}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="clipboard" size={60} color="#4D5656" />
              <Text style={styles.emptyText}>No pending orders</Text>
              <Text style={styles.emptySubtext}>New orders will appear here</Text>
            </View>
          }
          contentContainerStyle={styles.ordersList}
          showsVerticalScrollIndicator={false}
        />

        <View style={styles.bottomActions}>
          <TouchableOpacity
            style={styles.historyButton}
            onPress={() => navigation.navigate("HistoryPage")}
          >
            <Ionicons name="time" size={20} color="#FDEBD0" />
            <Text style={styles.historyButtonText}>Order History</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out" size={20} color="#FDEBD0" />
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
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
  orderTable: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2C3E50",
    marginLeft: 8,
  },
  timeInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  orderTime: {
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
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    marginBottom: 20,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2C3E50",
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#D35400",
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 10,
  },
  confirmButton: {
    backgroundColor: "#28a745",
  },
  cancelButton: {
    backgroundColor: "#D35400",
  },
  buttonText: {
    color: "#FDEBD0",
    fontWeight: "bold",
    marginLeft: 6,
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
  bottomActions: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: "row",
    gap: 12,
  },
  historyButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#A04000",
    paddingVertical: 15,
    borderRadius: 12,
  },
  historyButtonText: {
    color: "#FDEBD0",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 8,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#D35400",
    paddingVertical: 15,
    paddingHorizontal: 20,
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
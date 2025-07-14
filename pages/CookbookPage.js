import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  Image,
  Modal,
  StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useFocusEffect } from "@react-navigation/native";
import uuid from "react-native-uuid";

export default function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const [showQR, setShowQR] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const loadCart = async () => {
        const storedCart = await AsyncStorage.getItem("cartItems");
        if (storedCart) {
          setCartItems(JSON.parse(storedCart));
        } else {
          setCartItems([]);
        }
      };
      loadCart();
    }, [])
  );

  const updateCart = async (newCart) => {
    setCartItems(newCart);
    await AsyncStorage.setItem("cartItems", JSON.stringify(newCart));
  };

  const removeFromCart = (id) => {
    const updatedCart = cartItems.filter((item) => item.id !== id);
    updateCart(updatedCart);
  };

  const increaseQuantity = (id) => {
    const updatedCart = cartItems.map((item) =>
      item.id === id ? { ...item, quantity: item.quantity + 1 } : item
    );
    updateCart(updatedCart);
  };

  const decreaseQuantity = (id) => {
    const updatedCart = cartItems
      .map((item) =>
        item.id === id ? { ...item, quantity: item.quantity - 1 } : item
      )
      .filter((item) => item.quantity > 0);
    updateCart(updatedCart);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((sum, item) => sum + item.quantity * item.price, 0);
  };

  const getTotalQuantity = () => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      Alert.alert("Cart is empty", "Please add items before checkout.");
      return;
    }

    const tableId =
      (await AsyncStorage.getItem("selectedTable")) || "UnknownTableId";
    const tableName =
      (await AsyncStorage.getItem("selectedTableName")) || "Unknown Table";

    const newOrder = {
      id: uuid.v4(),
      table: tableName,
      tableId: tableId,
      items: cartItems,
      createdAt: new Date().toISOString(),
      status: "Đang chờ thanh toán",
    };

    const existing = await AsyncStorage.getItem("orders");
    const orders = existing ? JSON.parse(existing) : [];

    orders.push(newOrder);
    await AsyncStorage.setItem("orders", JSON.stringify(orders));

    setCartItems([]);
    await AsyncStorage.removeItem("cartItems");

    setShowQR(true);
  };

  const renderItem = ({ item }) => (
    <View style={styles.cartItem}>
      <View style={styles.itemImageContainer}>
        <Image source={{ uri: item.image }} style={styles.itemImage} />
      </View>

      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemPrice}>
          {item.price.toLocaleString()}đ each
        </Text>
        <Text style={styles.itemTotal}>
          Subtotal: {(item.quantity * item.price).toLocaleString()}đ
        </Text>

        <View style={styles.qtyControl}>
          <TouchableOpacity
            style={styles.qtyButton}
            onPress={() => decreaseQuantity(item.id)}
          >
            <Ionicons name="remove" size={18} color="#FDEBD0" />
          </TouchableOpacity>

          <View style={styles.qtyDisplay}>
            <Text style={styles.qtyText}>{item.quantity}</Text>
          </View>

          <TouchableOpacity
            style={styles.qtyButton}
            onPress={() => increaseQuantity(item.id)}
          >
            <Ionicons name="add" size={18} color="#FDEBD0" />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => removeFromCart(item.id)}
      >
        <Ionicons name="trash" size={20} color="#D35400" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="basket" size={30} color="#FDEBD0" />
        <Text style={styles.title}>My Cart</Text>
        {cartItems.length > 0 && (
          <View style={styles.cartBadge}>
            <Text style={styles.badgeText}>{getTotalQuantity()}</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <FlatList
          data={cartItems}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="basket-outline" size={80} color="#4D5656" />
              <Text style={styles.emptyTitle}>Your cart is empty</Text>
              <Text style={styles.emptyText}>Add some delicious food to get started</Text>
            </View>
          }
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />

        {cartItems.length > 0 && (
          <View style={styles.summaryContainer}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Items:</Text>
              <Text style={styles.summaryValue}>{getTotalQuantity()}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total Amount:</Text>
              <Text style={styles.totalValue}>
                {getTotalPrice().toLocaleString()}đ
              </Text>
            </View>
          </View>
        )}
      </View>

      {cartItems.length > 0 && (
        <TouchableOpacity style={styles.checkoutBtn} onPress={handleCheckout}>
          <Ionicons name="card" size={24} color="#FDEBD0" />
          <Text style={styles.checkoutText}>
            Proceed to Payment
          </Text>
        </TouchableOpacity>
      )}

      <Modal visible={showQR} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Ionicons name="qr-code" size={40} color="#E67E22" />
              <Text style={styles.modalTitle}>Scan QR Code to Pay</Text>
            </View>

            <View style={styles.qrContainer}>
              <Image
                source={require("../assets/qr-code.jpg")}
                style={styles.qrImage}
                resizeMode="contain"
              />
            </View>

            <View style={styles.paymentInfo}>

              <Text style={styles.paymentNote}>
                Please show this QR code to the cashier
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => setShowQR(false)}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FDEBD0",
  },
  header: {
    backgroundColor: "#E67E22",
    paddingTop: 50,
    paddingBottom: 25,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    position: "relative",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FDEBD0",
    marginLeft: 12,
  },
  cartBadge: {
    position: "absolute",
    right: 20,
    backgroundColor: "#D35400",
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  badgeText: {
    color: "#FDEBD0",
    fontWeight: "bold",
    fontSize: 14,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  listContainer: {
    paddingBottom: 20,
  },
  cartItem: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  itemImageContainer: {
    borderRadius: 12,
    overflow: "hidden",
    marginRight: 15,
  },
  itemImage: {
    width: 70,
    height: 70,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    color: "#4D5656",
    marginBottom: 4,
  },
  itemTotal: {
    fontSize: 14,
    color: "#E67E22",
    fontWeight: "600",
    marginBottom: 10,
  },
  qtyControl: {
    flexDirection: "row",
    alignItems: "center",
  },
  qtyButton: {
    backgroundColor: "#E67E22",
    borderRadius: 8,
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  qtyDisplay: {
    backgroundColor: "#FDEBD0",
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginHorizontal: 10,
    borderWidth: 1,
    borderColor: "#E67E22",
  },
  qtyText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2C3E50",
  },
  removeButton: {
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
  },
  summaryContainer: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 16,
    color: "#4D5656",
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2C3E50",
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2C3E50",
  },
  totalValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#D35400",
  },
  checkoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#D35400",
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 18,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  checkoutText: {
    color: "#FDEBD0",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2C3E50",
    marginTop: 20,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: "#4D5656",
    textAlign: "center",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
    width: "100%",
    maxWidth: 350,
  },
  modalHeader: {
    alignItems: "center",
    marginBottom: 25,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2C3E50",
    marginTop: 10,
    textAlign: "center",
  },
  qrContainer: {
    backgroundColor: "#FDEBD0",
    borderRadius: 15,
    padding: 20,
    marginBottom: 25,
  },
  qrImage: {
    width: 200,
    height: 200,
  },
  paymentInfo: {
    alignItems: "center",
    marginBottom: 25,
  },
  paymentAmount: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#D35400",
    marginBottom: 8,
  },
  paymentNote: {
    fontSize: 14,
    color: "#4D5656",
    textAlign: "center",
  },
  closeButton: {
    backgroundColor: "#E67E22",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 12,
  },
  closeButtonText: {
    color: "#FDEBD0",
    fontSize: 16,
    fontWeight: "bold",
  },
});
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";

export default function LoginPage() {
  const navigation = useNavigation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const fixedUsers = [
    {
      username: "waiter1",
      password: "123456",
      role: "waiter",
      name: "Nhân viên phục vụ A",
    },
    {
      username: "waiter2",
      password: "123456",
      role: "waiter",
      name: "Nhân viên phục vụ B",
    },
    {
      username: "waiter3",
      password: "123456",
      role: "waiter",
      name: "Nhân viên phục vụ C",
    },
    {
      username: "waiter4",
      password: "123456",
      role: "waiter",
      name: "Nhân viên phục vụ D",
    },
    {
      username: "receiver1",
      password: "123456",
      role: "receiver",
      name: "Nhân viên nhận đơn B",
    },
  ];

  const handleGuestLogin = async () => {
    await AsyncStorage.setItem("isGuest", "true");
    navigation.replace("TableSelection");
  };

  const handleLogin = async () => {
    const user = fixedUsers.find(
      (u) => u.username === username && u.password === password
    );

    if (user) {
      await AsyncStorage.setItem("isGuest", "false");
      await AsyncStorage.setItem("username", user.username);
      await AsyncStorage.setItem("nameUser", user.name);
      await AsyncStorage.setItem("role", user.role);

      Alert.alert("Đăng nhập thành công!");

      if (user.role === "waiter") {
        navigation.replace("WaiterDashboard");
      } else if (user.role === "receiver") {
        navigation.replace("OrderReceiverDashboard");
      }
    } else {
      Alert.alert("Sai tài khoản hoặc mật khẩu!");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Ionicons name="beer" size={60} color="#FDEBD0" />
        </View>
        <Text style={styles.title}>BTN Restaurant</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.inputContainer}>
          <Ionicons name="person-outline" size={20} color="#4D5656" style={styles.inputIcon} />
          <TextInput
            placeholder="Username"
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholderTextColor="#4D5656"
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color="#4D5656" style={styles.inputIcon} />
          <TextInput
            placeholder="Password"
            style={styles.input}
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            placeholderTextColor="#4D5656"
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={20}
              color="#4D5656"
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
          <Text style={styles.loginText}>Login as Employee</Text>
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity onPress={handleGuestLogin} style={styles.guestBtn}>
          <Ionicons name="person-add-outline" size={20} color="#E67E22" style={{ marginRight: 10 }} />
          <Text style={styles.guestText}>Continue as Guest</Text>
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
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: "center",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#D35400",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FDEBD0",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: "#FDEBD0",
    opacity: 0.9,
  },
  formContainer: {
    flex: 1,
    padding: 30,
    justifyContent: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 15,
    paddingHorizontal: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 15,
    fontSize: 16,
    color: "#2C3E50",
  },
  loginBtn: {
    backgroundColor: "#E67E22",
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  loginText: {
    color: "#FDEBD0",
    fontSize: 18,
    fontWeight: "bold",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#4D5656",
    opacity: 0.3,
  },
  dividerText: {
    marginHorizontal: 15,
    color: "#4D5656",
    fontSize: 14,
  },
  guestBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    paddingVertical: 15,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "#E67E22",
  },
  guestText: {
    color: "#E67E22",
    fontSize: 16,
    fontWeight: "600",
  },
});
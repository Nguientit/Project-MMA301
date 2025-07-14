import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import MainTabNavigator from "./navigation/MainTabNavigator";
import CreateRecipeScreen from "./pages/CreateRecipe";
import Login from "./pages/Login";
import RecipeByCategory from "./pages/RecipeByCategory";
import RecipeDetail from "./pages/RecipeDetail";
import Signup from "./pages/Signup";
import Start from "./pages/Start";
import TableSelectionPage from "./pages/TableSelectionPage";
import OrderReceiverDashboard from "./pages/OrderReceiverDashboard";
import WaiterDashboard from "./pages/WaiterDashboard"; 
import HistoryPage from "./pages/HistoryPage"; 

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Start" component={Start} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Signup" component={Signup} />
        <Stack.Screen name="RecipeByCategory" component={RecipeByCategory} />
        <Stack.Screen name="RecipeDetail" component={RecipeDetail} />
        <Stack.Screen name="CreateRecipe" component={CreateRecipeScreen} />
        <Stack.Screen name="TableSelection" component={TableSelectionPage} />
        <Stack.Screen name="Main" component={MainTabNavigator} />
        <Stack.Screen
          name="OrderReceiverDashboard"
          component={OrderReceiverDashboard}
        />
        <Stack.Screen name="WaiterDashboard" component={WaiterDashboard} />
        <Stack.Screen name="HistoryPage" component={HistoryPage} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

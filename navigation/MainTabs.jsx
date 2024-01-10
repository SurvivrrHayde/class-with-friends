import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Icon from "react-native-vector-icons/MaterialIcons";
import CommunityIcon from "react-native-vector-icons/MaterialCommunityIcons";
import { GroupsScreen, CreateGroupScreen, JoinGroupScreen, AddClassesScreen } from "../screens";
import { theme } from "../assets/theme";

const BottomTab = createBottomTabNavigator();

const MainTabs = () => (
  <BottomTab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarShowLabel: false,
      tabBarStyle: { height: "10.5%" },
      tabBarActiveTintColor: theme.colors.primary,
      tabBarItemStyle: { fontWeight: 'bold' }
    }}
  >
    <BottomTab.Screen
      name="GroupsScreen"
      component={GroupsScreen}
      options={{
        tabBarIcon: ({ color }) => (
          <CommunityIcon name="home" size={28} color={color} />
        ),
      }}
    />
    <BottomTab.Screen
      name="CreateGroupScreen"
      component={CreateGroupScreen}
      options={{
        tabBarIcon: ({ color }) => (
          <Icon name="create" size={28} color={color} />
        ),
      }}
    />
    <BottomTab.Screen
      name="JoinGroupScreen"
      component={JoinGroupScreen}
      options={{
        tabBarIcon: ({ color }) => (
          <CommunityIcon name="location-enter" size={28} color={color} />
        ),
      }}
    />
    <BottomTab.Screen
      name="AddClassesScreen"
      component={AddClassesScreen}
      options={{
        tabBarIcon: ({ color }) => (
          <CommunityIcon name="bookshelf" size={28} color={color} />
        ),
      }}
    />
  </BottomTab.Navigator>
);

export default MainTabs;

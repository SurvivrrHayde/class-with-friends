import React from "react";
import { TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { getAuth } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

const LogoutButton = ({ navigation }) => {
  const handleLogoutPress = async () => {
    const auth = getAuth();
    await auth.signOut();
    const keys = ["userUid", "userName", "userGroups"];
    await AsyncStorage.multiRemove(keys);
    navigation.navigate("LoginScreen");
  };

  return (
    <TouchableOpacity onPress={handleLogoutPress}>
      <Icon name="logout" size={24} style={{ marginHorizontal: 8 }} />
    </TouchableOpacity>
  );
};

export default LogoutButton;

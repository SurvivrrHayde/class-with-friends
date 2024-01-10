import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  ScrollView,
  StatusBar,
} from "react-native";
import { getFirestore, collection, doc, getDoc } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/MaterialIcons";
import CommunityIcon from "react-native-vector-icons/MaterialCommunityIcons";
import { getAuth } from "firebase/auth";
import { theme } from '../assets/theme';

const GroupsScreen = ({ navigation }) => {
  const [userGroups, setUserGroups] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUserGroupsFromDatabase = async () => {
    try {
      const userUid = await AsyncStorage.getItem("userUid");

      const db = getFirestore();
      const usersCollection = collection(db, "users");
      const userDocRef = doc(usersCollection, userUid);

      // Retrieve the user document
      const userDocSnapshot = await getDoc(userDocRef);
      const userDocData = userDocSnapshot.data();

      if (userDocData && userDocData.userGroups) {
        const groupRefs = userDocData.userGroups;

        // Fetch group documents
        const groupPromises = groupRefs.map(async (groupRef) => {
          const groupDocSnapshot = await getDoc(groupRef);
          const groupDocData = groupDocSnapshot.data();
          const groupDocId = groupDocSnapshot.id;
          return { id: groupDocId, ...groupDocData };
        });

        const groupsData = await Promise.all(groupPromises);

        // Save groupsData to AsyncStorage
        await AsyncStorage.setItem("userGroups", JSON.stringify(groupsData));

        setUserGroups(groupsData);
        setRefreshing(false);
      }
    } catch (error) {
      console.error(
        "Error fetching user groups from the database:",
        error.message
      );
      setRefreshing(false);
    }
  };

  const fetchUserGroups = useCallback(async () => {
    try {
      setRefreshing(true);

      // Check if userGroups data exists in AsyncStorage
      const storedGroupsData = await AsyncStorage.getItem("userGroups");

      if (storedGroupsData) {
        // If data exists, use it
        const parsedGroupsData = JSON.parse(storedGroupsData);
        setUserGroups(parsedGroupsData);
      } else {
        // Fetch from the database regardless for the pull-to-refresh functionality
        await fetchUserGroupsFromDatabase();
      }
    } catch (error) {
      console.error("Error checking and fetching user groups:", error.message);
    } finally {
      setRefreshing(false);
    }
  }, [fetchUserGroupsFromDatabase]);

  useEffect(() => {
    fetchUserGroups();
  }, []);

  const handleGroupPress = (groupId) => {
    navigation.navigate("GroupDetailScreen", { groupId });
  };

  const handleLogoutPress = async () => {
    const auth = getAuth();
    await auth.signOut();
    await AsyncStorage.removeItem("userUid");
    navigation.navigate("LoginScreen");
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {/* White Container at the Top */}
      <View style={styles.topContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerText}>Groups</Text>
          <TouchableOpacity onPress={() => handleLogoutPress()}>
            <Icon name="logout" size={24} style={styles.logoutIcon} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <View style={styles.searchInputContainer}>
          <CommunityIcon name="magnify" size={24} style={styles.searchIcon} />
          <TextInput
            placeholder="Search groups"
            style={styles.searchInput}
            placeholderTextColor="gray"
          />
        </View>
      </View>

      {/* List of Cards */}
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={fetchUserGroupsFromDatabase}
            colors={["#009387"]}
          />
        }
      >
        {userGroups.length > 0 ? (
          userGroups.map((group) => (
            <TouchableOpacity
              onPress={() => handleGroupPress(group.id)}
              style={styles.cardContainer}
              key={group.id}
            >
              <View style={styles.cardContent}>
                <View style={styles.profileContainer}>
                  <CommunityIcon
                    size={48}
                    name="account"
                    style={styles.profileImage}
                  />
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.groupName}>{group.groupName}</Text>
                  <Text
                    style={styles.memberCount}
                  >{`${group.groupCount} members`}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.messageCardContainer}>
            <View style={styles.cardContent}>
              <CommunityIcon name="alert" size={24} style={styles.alertIcon} />
              <Text style={styles.messageText}>
                You aren't in any Groups! Join or create a group using the
                buttons below!
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topContainer: {
    backgroundColor: "white",
    width: "100%",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderBottomWidth: 1,
    borderBottomColor: "lightgray",
    marginBottom: 12,
    paddingTop: "10%",
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 24,
    marginBottom: 16,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  logoutIcon: {
    width: 24,
    height: 24,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 16,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: "black",
  },
  searchIcon: {
    width: 24,
    height: 24,
    marginHorizontal: 8,
  },
  cardContainer: {
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    elevation: 3,
    paddingVertical: "2%",
    marginHorizontal: 16,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileContainer: {
    marginRight: 16,
    marginLeft: 16,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    color: theme.colors.primary,
  },
  textContainer: {
    flex: 1,
  },
  groupName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  memberCount: {
    fontWeight: "bold",
    color: "gray",
  },
  messageCardContainer: {
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    padding: 16,
  },
  alertIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
    color: "red",
  },
  messageText: {
    flex: 1,
    fontSize: 16,
    color: "black",
  },
});

export default GroupsScreen;

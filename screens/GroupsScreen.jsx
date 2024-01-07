import React, { useState, useEffect, useCallback } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl } from "react-native";
import { getFirestore, collection, doc, getDoc } from "firebase/firestore";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuth } from "firebase/auth";

const GroupsScreen = ({ navigation }) => {
  const [userGroups, setUserGroups] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUserGroupsFromDatabase = async () => {
    try {
      console.log("fetchUserGroupsFromDatabase");
      const userUid = await AsyncStorage.getItem('userUid');

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
        await AsyncStorage.setItem('userGroups', JSON.stringify(groupsData));

        setUserGroups(groupsData);
        setRefreshing(false);
      }
    } catch (error) {
      console.error("Error fetching user groups from the database:", error.message);
      setRefreshing(false);
    }
  };

  const fetchUserGroups = useCallback(async () => {
    try {
      console.log("fetchUserGroups");

      setRefreshing(true);

      // Check if userGroups data exists in AsyncStorage
      const storedGroupsData = await AsyncStorage.getItem('userGroups');

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

  const handleCreateGroupPress = () => {
    navigation.navigate('CreateGroupScreen');
  };

  const handleJoinGroupPress = () => {
    navigation.navigate('JoinGroupScreen');
  };

  const handleAddClassesPress = () => {
    navigation.navigate('AddClassesScreen');
  };

  const handleLogoutPress = async () => {
    const auth = getAuth();
    await auth.signOut();
    await AsyncStorage.removeItem('userUid');
    navigation.navigate('LoginScreen');
  };

  return (
    <View style={styles.container}>
      <Text>User's Groups:</Text>
      <FlatList
        style={styles.flatList}
        data={userGroups}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handleGroupPress(item.id, item.groupName)}
          >
            <View style={styles.groupItem}>
              <Text>{item.groupName} with {item.groupCount}</Text>
            </View>
          </TouchableOpacity>
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchUserGroupsFromDatabase} />
        }
      />
      <TouchableOpacity style={styles.button} onPress={handleCreateGroupPress}>
        <Text>Create Group</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={handleJoinGroupPress}>
        <Text>Join Group</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={handleAddClassesPress}>
        <Text>Add Classes</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={handleLogoutPress}>
        <Text>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  flatList: {
    flex: 1,
    width: "100%",
  },
  groupItem: {
    borderBottomWidth: 1,
    padding: 10,
    width: "80%",
  },
  button: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#DDDDDD",
  },
});

export default GroupsScreen;

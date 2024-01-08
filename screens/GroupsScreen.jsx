import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, RefreshControl, TextInput } from "react-native";
import { getFirestore, collection, doc, getDoc } from "firebase/firestore";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getAuth } from "firebase/auth";

const GroupsScreen = ({ navigation, route }) => {
  const { refresh = false} = route.params;
  const [userGroups, setUserGroups] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUserGroupsFromDatabase = async () => {
    try {
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
    if (refresh) {
      fetchUserGroupsFromDatabase();
    } else {
      fetchUserGroups();
    }
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
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Groups</Text>
        <TouchableOpacity onPress={() => handleLogoutPress()}>
          <Icon name="logout" size={24} style={styles.logoutIcon} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <TextInput
          placeholder="Search groups"
          style={styles.searchInput}
        />
        <Icon name="magnify" style={styles.searchIcon} />
      </View>

      {/* List of Cards */}
      {userGroups.map((group) => (
        <TouchableOpacity onPress={(group) => handleGroupPress(group.id)} style={styles.cardContainer}>
      <View style={styles.cardContent}>
        <View style={styles.profileContainer}>
          <Icon name="account" style={styles.profileImage} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.groupName}>{group.groupName}</Text>
          <Text style={styles.memberCount}>{`${group.groupCount} members`}</Text>
        </View>
      </View>
    </TouchableOpacity>
      ))}

      {/* Bottom Buttons */}
      <View style={styles.bottomButtonsContainer}>
        <TouchableOpacity style={[styles.bottomButton, styles.leftButton]}>
          <Text style={styles.buttonText}>Classes</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.bottomButton, styles.rightButton]}>
          <Text style={styles.buttonText}>Join Group</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.circleButton}>
          <Text style={styles.plusIcon}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  logoutIcon: {
    width: 24,
    height: 24,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchIcon: {
    width: 24,
    height: 24,
    marginLeft: 8,
  },
  bottomButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bottomButton: {
    flex: 1,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  leftButton: {
    backgroundColor: 'yellow',
    marginRight: 8,
  },
  rightButton: {
    backgroundColor: 'green',
    marginLeft: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  circleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'gray',
  },
  plusIcon: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  cardContainer: {
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  profileContainer: {
    marginRight: 16,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  textContainer: {
    flex: 1,
  },
  groupName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  memberCount: {
    fontWeight: 'bold',
    color: 'gray',
  },
});

export default GroupsScreen;

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
  TouchableWithoutFeedback,
  Modal,
  Button,
} from "react-native";
import { getFirestore, collection, doc, getDoc } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CommunityIcon from "react-native-vector-icons/MaterialCommunityIcons";
import { theme } from '../assets/theme';
import { LogoutButton } from "../components";
import { useFocusEffect } from "@react-navigation/native";
import deleteAccount from "../functions/deleteAccount";
import { getAuth } from "firebase/auth";

const GroupsScreen = ({ navigation }) => {
  const [userGroups, setUserGroups] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [groupSearchQuery, setGroupSearchQuery] = useState('');
  const [groupsFiltered, setGroupsFiltered] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);

  const handleDeleteAccount = async () => {
    await deleteAccount();
    const user = getAuth().currentUser;
    await user.delete();
    const keys = ["userUid", "userName", "userGroups"];
    await AsyncStorage.multiRemove(keys);
    navigation.navigate("StartScreen");
  };

  const openModal = () => {
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const fetchUserGroupsFromDatabase = async () => {
    try {
      const userUid = await AsyncStorage.getItem("userUid");

      const db = getFirestore();
      const usersCollection = collection(db, "users");
      const userDocRef = doc(usersCollection, userUid);

      // Retrieve the user document
      const userDocSnapshot = await getDoc(userDocRef);
      const userDocData = userDocSnapshot.data();
      await AsyncStorage.setItem("userName", userDocData.name);

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

  useFocusEffect(
    useCallback(() => {
      fetchUserGroups();
    }, [])
  );

  const handleGroupPress = (groupId) => {
    navigation.navigate("GroupDetailScreen", { groupId });
  };

  const groupsFilter = (searchText) => {
    setGroupSearchQuery(searchText);
    const filteredGroups = userGroups.filter((userGroup) =>
      userGroup.groupName.toLowerCase().includes(searchText.toLowerCase())
    );
    setGroupsFiltered(filteredGroups);
  };

  const userGroupsToDisplay = groupSearchQuery.length > 0 ? groupsFiltered : userGroups;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {/* White Container at the Top */}
      <View style={styles.topContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerText}>Groups</Text>
          <View style={styles.containerIcons}>
            <TouchableWithoutFeedback onPress={openModal}>
              <CommunityIcon name="account-circle-outline" size={24} style={styles.accountIcon} />
            </TouchableWithoutFeedback>
            <LogoutButton navigation={navigation} />
          </View>
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
            onChangeText={(text) => groupsFilter(text)}
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
          userGroupsToDisplay.map((group) => (
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

      {/* Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.overlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalText}>Are you sure you want to delete your account?</Text>
              <Button title="Delete Account" color="red" onPress={handleDeleteAccount} />
              <Button title="Go Back" onPress={closeModal} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  containerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accountIcon: {
    marginHorizontal: 8,
  },
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
    margin: 16,
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
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    overflow: 'hidden',
  },
  modalContent: {
    padding: 20,
  },
  modalText: {
    marginBottom: 10,
  },
});

export default GroupsScreen;

import React, { useEffect, useState } from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { collection, doc, getDoc, getDocs, getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CommunityIcon from "react-native-vector-icons/MaterialCommunityIcons";
import { theme } from '../assets/theme';
import { RefreshControl, FlatList, StyleSheet, View, TextInput, ScrollView, Modal, Text, TouchableOpacity, StatusBar } from 'react-native';
import { LogoutButton, BackButton } from '../components';

const Tab = createMaterialTopTabNavigator();

const GroupDetailScreen = ({ navigation, route }) => {
  const { groupId } = route.params;
  const [userClassesInfo, setUserClassesInfo] = useState([]);
  const [groupClassesInfo, setGroupClassesInfo] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedClassUsers, setSelectedClassUsers] = useState([]);
  const [selectedClassName, setSelectedClassName] = useState("");
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userFilteredClasses, setUserFilteredClasses] = useState([]);
  const [groupSearchQuery, setGroupSearchQuery] = useState('');
  const [groupFilteredClasses, setGroupFilteredClasses] = useState([]);

  let userClasses;

  const fetchClassesFromDatabase = async () => {
    try {
      setRefreshing(true);
      const userUid = await AsyncStorage.getItem('userUid');
      const db = getFirestore();
      const userClassesDocRef = doc(db, 'userClasses', userUid);
      const userClassesDocSnapshot = await getDoc(userClassesDocRef);

      if (!userClassesDocSnapshot.exists()) {
        return;
      }
      const enrolledClasses = userClassesDocSnapshot.data().classes;

      const currentGroupId = groupId;
      const groupClassesCollection = collection(db, 'groupClasses', currentGroupId, 'specificGroupClasses');
      const querySnapshot = await getDocs(groupClassesCollection);

      const groupClassesData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      userClasses = enrolledClasses;
      const groupClassesInfoTester = [];

      const ownUserName = await AsyncStorage.getItem("userName");

      for (const groupClass of groupClassesData) {
        const { classUsers } = groupClass;

        // Get user names from the classUsers reference
        const userPromises = classUsers.map(async (userRef) => {
          const userDocSnapshot = await getDoc(userRef);
          const userDocData = userDocSnapshot.data();
          return userDocData;
        });

        const userDocs = await Promise.all(userPromises);
        const userNames = userDocs.filter(user => user.name !== ownUserName).map(user => user.name);

        const classesCollection = collection(db, "classes"); //change to spring24
        const classesDocRef = doc(classesCollection, groupClass.id);
        const classesSnapshot = await getDoc(classesDocRef);
        const classesFields = classesSnapshot.data();

        const userCount = userNames.length;

        groupClassesInfoTester.push({ //Add descr
          id: groupClass.id,
          userCount: userCount,
          userList: userNames,
          className: classesFields.className,
          classSection: classesFields.classSection,
        });
      }

      const classesInfo = [];
      for (const userClass of userClasses) {
        const matchingClass = groupClassesInfoTester.find((groupClass) => groupClass.id === userClass);
        classesInfo.push(matchingClass);
      }

      // Save classes data to AsyncStorage
      await AsyncStorage.setItem('userClassesInfo', JSON.stringify(classesInfo));
      await AsyncStorage.setItem('groupClassesInfo' + groupId, JSON.stringify(groupClassesInfoTester));

      setUserClassesInfo(classesInfo);
      setGroupClassesInfo(groupClassesInfoTester);

      setRefreshing(false);
    } catch (error) {
      console.error('Error fetching user classes:', error.message);
      setRefreshing(false);
    }
  };

  const fetchClasses = async () => {
    try {
      setRefreshing(true);

      // Check if classes data exists in AsyncStorage
      const storedUserClassesInfo = await AsyncStorage.getItem('userClassesInfo');
      const storedGroupClassesInfo = await AsyncStorage.getItem('groupClassesInfo' + groupId);

      if (storedUserClassesInfo && storedGroupClassesInfo) {
        // If data exists, use it
        const parsedUserClassesInfo = JSON.parse(storedUserClassesInfo);
        const parsedGroupClassesInfo = JSON.parse(storedGroupClassesInfo);

        setUserClassesInfo(parsedUserClassesInfo);
        setGroupClassesInfo(parsedGroupClassesInfo);
      } else {
        await fetchClassesFromDatabase();
      }
    } catch (error) {
      console.error('Error checking and fetching classes info:', error.message);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleListItemPress = (item) => {
    setSelectedClassUsers(item.userList);
    setSelectedClassName(item.className);
    setModalVisible(true);
  };

  const userFilterClasses = (searchText) => { //filter by name as well
    setUserSearchQuery(searchText);
    const filteredClasses = userClassesInfo.filter((userClass) =>
      userClass.className.toLowerCase().includes(searchText.toLowerCase())
    );
    setUserFilteredClasses(filteredClasses);
  };

  const groupFilterClasses = (searchText) => { //filter by name as well
    setGroupSearchQuery(searchText);
    const filteredClasses = groupClassesInfo.filter((groupClass) =>
      groupClass.className.toLowerCase().includes(searchText.toLowerCase())
    );
    setGroupFilteredClasses(filteredClasses);
  };

  const userClassesToDisplay = userSearchQuery.length > 0 ? userFilteredClasses : userClassesInfo;
  const groupClassesToDisplay = groupSearchQuery.length > 0 ? groupFilteredClasses : groupClassesInfo;

  return (
    <View style={styles.flexContainer}>
      <StatusBar barStyle="dark-content" />
      {/* White Container at the Top */}
      <View style={styles.topContainer}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <BackButton goBack={navigation.goBack} />
            <Text style={styles.headerText}>{groupId}</Text>
          </View>
          <LogoutButton navigation={navigation}/>
        </View>
      </View>
      <Tab.Navigator
        tabBarPosition="bottom"
        tabBarOptions={{
          labelStyle: { fontSize: 16, fontWeight: 'bold' },
          activeTintColor: theme.colors.primary,
          indicatorStyle: { backgroundColor: theme.colors.primary, position: 'absolute', top: 0, height: 2 },
          style: { height: "12%" },

        }}
      >
        <Tab.Screen
          name="UserClasses"
          options={{ title: 'Your Classes' }}
        >
          {() => (
            <View style={styles.flexContainer}>
              {/* Search Bar */}
              <View style={styles.searchBar}>
                <View style={styles.searchInputContainer}>
                  <CommunityIcon name="magnify" size={24} style={styles.searchIcon} />
                  <TextInput
                    placeholder="Search classes"
                    style={styles.searchInput}
                    placeholderTextColor="gray"
                    onChangeText={(text) => userFilterClasses(text)}
                  />
                </View>
              </View>

              {/* List of Cards */} {/* Need to update card so desc is on top and then class catolog number and section are both below */}
              <ScrollView
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={fetchClassesFromDatabase}
                    colors={["#009387"]}
                  />
                }
              >
                {userClassesInfo.length > 0 ? (
                  userClassesToDisplay.map((userClass) => (
                    <TouchableOpacity
                      onPress={() => handleListItemPress(userClass)}
                      style={styles.cardContainer}
                      key={userClass.id}
                    >
                      <View style={styles.cardContent}>
                        <View style={styles.textContainer}>
                          <Text style={styles.className}>{userClass.className}</Text>
                          <Text style={styles.classSection}>Section {userClass.classSection}</Text>
                        </View>
                        <View style={styles.textContainer}>
                          <Text style={styles.memberCount}>
                            {`${userClass.userCount} ${userClass.userCount === 1 ? "friend" : "friends"}`}
                          </Text>
                          {userClass.userCount === 0 ? <Text style={styles.helperText}> Tell People to Join!</Text> : <Text style={styles.helperText}>Press to view!</Text>}
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))
                ) : (
                  <View style={styles.messageCardContainer}>
                    <View style={styles.cardContent}>
                      <CommunityIcon name="alert" size={24} style={styles.alertIcon} />
                      <Text style={styles.messageText}>
                        You aren't in any Classes! Input your classes using the
                        class button in the bottom right of the Groups Screen!
                      </Text>
                    </View>
                  </View>
                )}
              </ScrollView>

              <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
              >
                <View style={styles.modalContainer}>
                  <View style={styles.modalContent}>
                    <Text style={styles.modalHeaderText}>{selectedClassName}</Text>
                    <FlatList
                      data={selectedClassUsers}
                      keyExtractor={(userName) => userName}
                      renderItem={({ item }) => (
                        <View>
                          <Text>{item}</Text>
                        </View>
                      )}
                    />
                    <TouchableOpacity
                      style={styles.modalCloseButton}
                      onPress={() => setModalVisible(false)}
                    >
                      <Text style={styles.modalCloseButtonText}>Close</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>
            </View>
          )}
        </Tab.Screen>
        <Tab.Screen
          name="GroupClasses"
          options={{ title: 'Group\'s Classes' }}
        >
          {() => (
            <View style={styles.flexContainer}>
              {/* Search Bar */}
              <View style={styles.searchBar}>
                <View style={styles.searchInputContainer}>
                  <CommunityIcon name="magnify" size={24} style={styles.searchIcon} />
                  <TextInput
                    placeholder="Search classes"
                    style={styles.searchInput}
                    placeholderTextColor="gray"
                    onChangeText={(text) => groupFilterClasses(text)}
                  />
                </View>
              </View>

              {/* List of Cards */}
              <ScrollView
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={fetchClassesFromDatabase}
                    colors={["#009387"]}
                  />
                }
              >
                {groupClassesInfo.length > 0 ? (
                  groupClassesToDisplay.map((groupClass) => (
                    <TouchableOpacity
                      onPress={() => handleListItemPress(groupClass)}
                      style={styles.cardContainer}
                      key={groupClass.id}
                    >
                      <View style={styles.cardContent}>
                        <View style={styles.textContainer}>
                          <Text style={styles.className}>{groupClass.className}</Text>
                          <Text style={styles.classSection}>Section {groupClass.classSection}</Text>
                        </View>
                        <View style={styles.textContainer}>
                          <Text style={styles.memberCount}>
                            {`${groupClass.userCount} ${groupClass.userCount === 1 ? "friend" : "friends"}`}
                          </Text>
                          {groupClass.userCount === 0 ? <Text style={styles.helperText}> Tell People to Join!</Text> : <Text style={styles.helperText}>Press to view!</Text>}
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))
                ) : (
                  <View style={styles.messageCardContainer}>
                    <View style={styles.cardContent}>
                      <CommunityIcon name="alert" size={24} style={styles.alertIcon} />
                      <Text style={styles.messageText}>
                        This group has no user's in classes! Input your classes using the
                        class button in the bottom right of the Groups Screen!
                      </Text>
                    </View>
                  </View>
                )}
              </ScrollView>

              <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
              >
                <View style={styles.modalContainer}>
                  <View style={styles.modalContent}>
                    <Text style={styles.modalHeaderText}>{selectedClassName}</Text>
                    <FlatList
                      data={selectedClassUsers}
                      keyExtractor={(userName) => userName}
                      renderItem={({ item }) => (
                        <View>
                          <Text>{item}</Text>
                        </View>
                      )}
                    />
                    <TouchableOpacity
                      style={styles.modalCloseButton}
                      onPress={() => setModalVisible(false)}
                    >
                      <Text style={styles.modalCloseButtonText}>Close</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>
            </View>
          )}
        </Tab.Screen>
      </Tab.Navigator>
    </View>
  );
};

const styles = StyleSheet.create({
  flexContainer: {
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // semi-transparent background color
  },
  modalContent: {
    width: '80%', // adjust the width as needed
    padding: 20,
    backgroundColor: '#fff', // white background color
    borderRadius: 10,
  },
  modalHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalCloseButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#3498db', // blue background color
    borderRadius: 5,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    color: '#fff', // white text color
    fontWeight: 'bold',
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
    marginLeft: 8,
  },
  logoutIcon: {
    width: 24,
    height: 24,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
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
    padding: "4%",
    marginHorizontal: 16,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 36,
  },
  textContainer: {
    flex: 1,
  },
  className: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  classSection: {
    fontWeight: 'bold',
    color: 'gray',
  },
  memberCount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  helperText: {
    fontSize: 12,
    color: 'gray',
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
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
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
  scrollViewContainer: {
    paddingBottom: "30%",
  },
});

export default GroupDetailScreen;

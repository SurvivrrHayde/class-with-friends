import React, { useEffect, useState } from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { collection, doc, getDoc, getDocs, getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RefreshControl, FlatList, StyleSheet, View, Modal, Text, TouchableOpacity } from 'react-native';

const Tab = createMaterialTopTabNavigator();

const GroupDetailScreen = ({ route }) => {
  const { groupId } = route.params;
  const [userClassesInfo, setUserClassesInfo] = useState([]);
  const [groupClassesInfo, setGroupClassesInfo] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedClassUsers, setSelectedClassUsers] = useState([]);

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

      for (const groupClass of groupClassesData) {
        const { classUsers } = groupClass;

        // Get user names from the classUsers reference
        const userPromises = classUsers.map(async (userRef) => {
          const userDocSnapshot = await getDoc(userRef);
          const userDocData = userDocSnapshot.data();
          return userDocData;
        });

        const userDocs = await Promise.all(userPromises);
        const userNames = userDocs.map((user) => user.name);

        const classesCollection = collection(db, "classes");
        const classesDocRef = doc(classesCollection, groupClass.id);
        const classesSnapshot = await getDoc(classesDocRef);
        const classesFields = classesSnapshot.data();

        const userCount = userNames.length;

        groupClassesInfoTester.push({
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
    setModalVisible(true);
  };

  return (
    <Tab.Navigator>
      <Tab.Screen
        name="UserClasses"
        options={{ title: 'Your Classes' }}
      >
        {() => (
          <View>
            <FlatList
              data={userClassesInfo}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => handleListItemPress(item)}>
                  <View>
                    <Text>{`${item.className} - ${item.classSection} - ${item.userCount} members`}</Text>
                  </View>
                </TouchableOpacity>
              )}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={fetchClassesFromDatabase} />
              }
            />

            <Modal
              animationType="slide"
              transparent={true}
              visible={modalVisible}
              onRequestClose={() => setModalVisible(false)}
            >
              <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalHeaderText}>User Names</Text>
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
                    <Text style={styles.modalCloseButtonText}>Close Modal</Text>
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
          <View>
            <FlatList
              data={groupClassesInfo}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => handleListItemPress(item)}>
                  <View>
                    <Text>{`${item.className} - ${item.classSection} - ${item.userCount} members`}</Text>
                  </View>
                </TouchableOpacity>
              )}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={fetchClassesFromDatabase} />
              }
            />
            <Modal
              animationType="slide"
              transparent={true}
              visible={modalVisible}
              onRequestClose={() => setModalVisible(false)}
            >
              <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalHeaderText}>User Names</Text>
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
                    <Text style={styles.modalCloseButtonText}>Close Modal</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          </View>
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
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
});

export default GroupDetailScreen;

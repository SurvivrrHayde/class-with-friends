import React, { useEffect, useState } from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import UserClassesTab from '../components/UserClassesTab';
import GroupClassesTab from '../components/GroupClassesTab';
import { collection, doc, getDoc, getDocs, getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Tab = createMaterialTopTabNavigator();

const GroupDetailScreen = ({ route }) => {
  const { groupId } = route.params;
  const [userClassesInfo, setUserClassesInfo] = useState([]);
  const [groupClassesInfo, setGroupClassesInfo] = useState([]);
  let userClasses;
  let groupClasses;

  useEffect(() => {
    let userUid;

    const getUserUid = async () => {
      userUid = await AsyncStorage.getItem('userUid');
    }

    const db = getFirestore();

    const fetchClasses = async () => {
      try {
        // Query userClasses collection to get the IDs of the user's classes
        const userClassesDocRef = doc(db, 'userClasses', userUid);
        const userClassesDocSnapshot = await getDoc(userClassesDocRef);

        if (!userClassesDocSnapshot.exists()) {
          return;
        }

        const enrolledClasses = userClassesDocSnapshot.data().classes;

        const currentGroupId = groupId;

        // Get the groupClasses document for the current group
        const groupClassesCollection = collection(db, 'groupClasses', currentGroupId, 'specificGroupClasses');

        // Get all documents from the specificGroupClasses subcollection
        const querySnapshot = await getDocs(groupClassesCollection);


        // Extract data from each document
        const groupClassesData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));


        groupClasses = groupClassesData;
        userClasses = enrolledClasses;

      } catch (error) {
        console.error('Error fetching user classes:', error.message);
      }
    };

    const getGroupClassesInfo = async () => {
      const groupClassesInfoTester = [];

      for (const groupClass of groupClasses) {
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
      setGroupClassesInfo(groupClassesInfoTester);

      const classesInfo = [];
      for (const userClass of userClasses) {
        const matchingClass = groupClassesInfoTester.find((groupClass) => groupClass.id === userClass);
        classesInfo.push(matchingClass);
      }
      setUserClassesInfo(classesInfo);

    };

    const fetchData = async () => {
      try {
        await getUserUid();
        await fetchClasses();
        await getGroupClassesInfo();
      } catch (error) {
        console.error('Error fetching data:', error.message);
      }
    };

    fetchData();

  }, []);

  return (
    <Tab.Navigator>
      <Tab.Screen
        name="UserClasses" a
        options={{ title: 'Your Classes' }}
      >
        {() => <UserClassesTab classesInfo={userClassesInfo} />}
      </Tab.Screen>
      <Tab.Screen
        name="GroupClasses"
        options={{ title: 'Group Classes' }}
      >
        {() => <GroupClassesTab classesInfo={groupClassesInfo} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

export default GroupDetailScreen;

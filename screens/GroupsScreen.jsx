// GroupsScreen.js
import React, { useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

const GroupsScreen = ({ route }) => {
  const { userId } = route.params;
  const [userGroups, setUserGroups] = useState([]);

  useEffect(() => {
    const fetchUserGroups = async () => {
      try {
        const auth = getAuth();
        const userUid = auth.currentUser.uid;

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
            return groupDocSnapshot.data();
          });

          const groupDocs = await Promise.all(groupPromises);

          // Extract group names
          const groupNames = groupDocs.map((groupDoc) => groupDoc.groupName);

          // Set the state to trigger a re-render with the group names
          setUserGroups(groupNames);
        }
      } catch (error) {
        console.error("Error fetching user groups:", error.message);
      }
    };

    fetchUserGroups();
  }, []);

  return (
    <View style={styles.container}>
      <Text>User's Groups:</Text>
      <FlatList
        data={userGroups}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <View style={styles.groupItem}>
            <Text>{item}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupItem: {
    borderBottomWidth: 1,
    padding: 10,
    width: '80%',
  },
});

export default GroupsScreen;

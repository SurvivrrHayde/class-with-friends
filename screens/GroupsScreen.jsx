// GroupsScreen.js
import React, { useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { getFirestore, collection } from "firebase/firestore";

const GroupsScreen = ({ navigation }) => {
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
          const groupsData = groupDocs.map((groupDoc) => ({
            ...groupDoc,
            id: groupDoc.id,
          }));

          // Set the state to trigger a re-render with the group names
          setUserGroups(groupsData);
        }
      } catch (error) {
        console.error("Error fetching user groups:", error.message);
      }
    };

    fetchUserGroups();
  }, []);

  const handleGroupPress = (groupId, groupName) => {
    navigation.navigate("GroupDetailScreen", { groupId, groupName });
  };

  return (
    <View style={styles.container}>
      <Text>User's Groups:</Text>
      <FlatList
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
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  groupItem: {
    borderBottomWidth: 1,
    padding: 10,
    width: "80%",
  },
});

export default GroupsScreen;

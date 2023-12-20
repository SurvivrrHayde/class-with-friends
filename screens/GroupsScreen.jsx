// GroupsScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';

const GroupsScreen = ({ route }) => {
  const { userId } = route.params;
  const [userGroups, setUserGroups] = useState([]);

  useEffect(() => {
    const fetchUserGroups = async () => {
      const db = getFirestore();
      const q = query(collection(db, 'groups'), where('userId', '==', userId));
      const querySnapshot = await getDocs(q);

      const groups = [];
      querySnapshot.forEach((doc) => {
        groups.push(doc.data());
      });

      setUserGroups(groups);
    };

    fetchUserGroups();
  }, [userId]);

  return (
    <View style={styles.container}>
      <Text>Groups Screen</Text>
      <FlatList
        data={userGroups}
        keyExtractor={(item) => item.groupId}
        renderItem={({ item }) => (
          <View style={styles.groupItem}>
            <Text>{item.groupName}</Text>
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

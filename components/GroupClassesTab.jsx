// GroupClassesTab.js

import React, { useEffect, useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import { getFirestore, collection, where, query, getDocs } from 'firebase/firestore';

const GroupClassesTab = ({ groupId }) => {
  const [groupClasses, setGroupClasses] = useState([]);

  useEffect(() => {
    const fetchGroupClasses = async () => {
      try {
        const db = getFirestore();
        const classesCollection = collection(db, 'classes');

        // Replace 'groupId' with the actual field name where group data is stored in your classes documents
        const q = query(classesCollection, where('groupId', '==', groupId));
        const querySnapshot = await getDocs(q);

        const classesData = querySnapshot.docs.map((doc) => doc.data());
        setGroupClasses(classesData);
      } catch (error) {
        console.error('Error fetching group classes:', error.message);
      }
    };

    fetchGroupClasses();
  }, [groupId]);

  return (
    <View>
      <Text>Group Classes:</Text>
      <FlatList
        data={groupClasses}
        keyExtractor={(item) => item.classId}
        renderItem={({ item }) => (
          <View>
            <Text>{item.className}</Text>
            {/* Display other class details as needed */}
          </View>
        )}
      />
    </View>
  );
};

export default GroupClassesTab;

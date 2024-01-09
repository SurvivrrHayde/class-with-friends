import React, { useState } from "react";
import { View, Text, TextInput, Button } from "react-native";
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  collection,
  setDoc,
  increment,
  getFirestore,
} from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

const JoinGroupScreen = ({ navigation }) => {
  const [groupName, setGroupName] = useState("");
  const [passcode, setPasscode] = useState("");

  const handleJoinGroup = async () => {
    try {
      const userUid = await AsyncStorage.getItem("userUid");
      const db = getFirestore();

      // check if the user has classes
      const userClassesDocRef = doc(db, "userClasses", userUid);
      const userClassesDocSnapshot = await getDoc(userClassesDocRef);

      if (!userClassesDocSnapshot.exists()) {
        navigation.navigate("MainTabs", {
          screen: "AddClassesScreen",
          params: { promptToAddClasses: true },
        });
        return;
      }

      console.log("Step 1");
      // Step 1: Check if the user is not already in a group with the same id
      const userDocRef = doc(db, "users", userUid);
      const userDocSnapshot = await getDoc(userDocRef);

      const userGroups = userDocSnapshot.data().userGroups;
      if (userGroups.some((groupRef) => groupRef.id === groupName)) {
        console.error("User is already in a group with the same id");
        return;
      }
      console.log("Step 2");
      // Step 2: Check if the group document with the id (groupName) exists
      const groupClassesDocRef = doc(db, "groupClasses", groupName);
      const groupClassesDocSnapshot = await getDoc(groupClassesDocRef);

      if (!groupClassesDocSnapshot.exists()) {
        console.error("Group does not exist");
        return;
      }
      console.log("Step 3");
      // Step 3: Check if the passcode aligns with the passcode field in the group document
      const groupDocRef = doc(db, "groups", groupName);
      const groupDocSnapshot = await getDoc(groupDocRef);
      const actualPasscode = groupDocSnapshot.data().passcode;

      if (passcode !== actualPasscode) {
        console.error("Incorrect passcode");
        return;
      }
      console.log("Step 4");
      // Step 4: Add the group reference to the user's userGroups
      await updateDoc(userDocRef, {
        userGroups: arrayUnion(groupDocRef),
      });
      console.log("Step 5");
      // Step 5: Update the group document
      await updateDoc(groupDocRef, {
        groupCount: increment(1),
        groupUsers: arrayUnion(userDocRef),
      });
      console.log("Step 6");
      // Step 6: Update the groupClasses document in the specificGroupClasses subcollection
      const specificGroupClassesCollectionRef = collection(
        groupClassesDocRef,
        "specificGroupClasses"
      );

      const userClassesSnapshot = await getDoc(userClassesDocRef);
      const userClasses = userClassesSnapshot.data().classes;

      for (const userClass of userClasses) {
        const classDocRef = doc(specificGroupClassesCollectionRef, userClass);
        const classDocSnapshot = await getDoc(classDocRef);

        if (classDocSnapshot.exists()) {
          // If document exists, update the userCount field and add a reference to the classUsers array
          await updateDoc(classDocRef, {
            userCount: increment(1),
            classUsers: arrayUnion(userDocRef),
          });
        } else {
          // If document doesn't exist, create it
          await setDoc(classDocRef, {
            userCount: 1,
            classUsers: [userDocRef],
          });
        }
      }

      // Navigate back to the 'GroupsScreen'
      navigation.navigate("MainTabs", {
        screen: "GroupsScreen",
        params: { refresh: true },
      });
    } catch (error) {
      console.error("Error joining group:", error.message);
    }
  };

  return (
    <View>
      <Text>Group Name</Text>
      <TextInput value={groupName} onChangeText={setGroupName} />

      <Text>Passcode</Text>
      <TextInput value={passcode} onChangeText={setPasscode} secureTextEntry />

      <Button title="Submit" onPress={handleJoinGroup} />
    </View>
  );
};

export default JoinGroupScreen;

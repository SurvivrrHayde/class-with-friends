import React, { useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  collection,
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { StatusBar } from "expo-status-bar";
import Paragraph from "../components/Paragraph";
import { LogoutButton, TextInput, Button } from "../components";

const CreateGroupScreen = ({ navigation }) => {
  const [groupName, setGroupName] = useState({ value: '', error: '' });
  const [passcode, setPasscode] = useState({ value: '', error: '' });
  const [loading, setLoading] = useState(false);

  const handleCreateGroup = async () => {
    try {
      setLoading(true);
      if (!groupName.value) {
        setGroupName({...groupName, error: "Group Name can't be empty."})
        setLoading(false);
        return;
      }
      if (!passcode.value) {
        setPasscode({...passcode, error: "Passcode can't be empty."})
        setLoading(false);
        return;
      }
      const userUid = await AsyncStorage.getItem("userUid");

      const db = getFirestore();
      const usersCollection = collection(db, "users");
      const userDocRef = doc(usersCollection, userUid);

      const groupData = {
        groupCount: 1,
        groupName: groupName.value,
        groupUsers: [userDocRef],
        passcode: passcode.value,
      };

      // Add the new group to the 'groups' collection
      const groupsCollection = collection(db, "groups");
      const groupDocRef = doc(groupsCollection, groupData.groupName);

      //check if exists
      const groupDocSnapshot = await getDoc(groupDocRef);

      if (groupDocSnapshot.exists()) {
        setGroupName({...groupName, error: "Group Name Taken"})
        setLoading(false);
        return;
      }

      // Query userClasses collection to get the IDs of the user's classes
      const userClassesCollection = collection(db, "userClasses");
      const userClassesDocRef = doc(userClassesCollection, userUid);

      const userClassesSnapshot = await getDoc(userClassesDocRef);

      if (!userClassesSnapshot.exists()) {
        navigation.navigate("MainTabs", {
          screen: "AddClassesScreen",
          params: { promptToAddClasses: true },
        });
        setLoading(false);
        return;
      }

      const userClasses = userClassesSnapshot.data().classes;

      //Add the new group to the 'groupClasses' collection

      const groupClassesDocRef = doc(db, "groupClasses", groupName.value);

      await setDoc(groupClassesDocRef, {});
      const specificGroupClassesCollectionRef = collection(
        groupClassesDocRef,
        "specificGroupClasses"
      );

      for (const userClass of userClasses) {
        const classDocRef = doc(specificGroupClassesCollectionRef, userClass);

        await setDoc(classDocRef, {
          userCount: 1,
          classUsers: [userDocRef],
        });
      }

      await setDoc(groupDocRef, groupData);

      await updateDoc(userDocRef, {
        userGroups: arrayUnion(groupDocRef),
      });

      setPasscode({ value: '', error: '' });
      setGroupName({ value: '', error: '' });

      const storedUserGroupsString = await AsyncStorage.getItem("userGroups");
      const storedUserGroups = storedUserGroupsString
        ? JSON.parse(storedUserGroupsString)
        : [];
      const newGroup = { id: groupData.groupName , ...groupData }
      const updatedGroups = [...storedUserGroups, newGroup];
      await AsyncStorage.setItem("userGroups", JSON.stringify(updatedGroups));

      setLoading(false);
      // Navigate back to the 'GroupsScreen'
      navigation.navigate("MainTabs", {
        screen: "GroupsScreen",
      });
    } catch (error) {
      setPasscode({...passcode, error: "Unknown error creating group:" + error.message + " seek Developer"});
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.topContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerText}>Create Group</Text>
          <LogoutButton navigation={navigation}/>
        </View>
      </View>

      {loading ? (
        // Render loading screen
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={styles.loadingText}>Creating Group...</Text>
        </View>
      ) : (
      <View style={styles.centeredContent}>
        <Paragraph>Create a group for you and your friends to enjoy!</Paragraph>
        <View style={styles.inputContainer}>
          <TextInput
            label="Group Name"
            returnKeyType="next"
            value={groupName.value}
            onChangeText={(text) => setGroupName({ value: text, error: '' })}
            error={!!groupName.error}
            errorText={groupName.error}
            autoCapitalize="none"
          />
          <TextInput
            label="Passcode"
            returnKeyType="done"
            value={passcode.value}
            onChangeText={(text) => setPasscode({ value: text, error: '' })}
            error={!!passcode.error}
            errorText={passcode.error}
            secureTextEntry
          />
        </View>
        <Button mode="contained" onPress={handleCreateGroup}>
          Create Group
        </Button>
      </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
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
  centeredContent: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 15,
    paddingBottom: "30%",
  },
  inputContainer: {
    marginBottom: 16,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  }
})

export default CreateGroupScreen;
import React, { useState } from "react";
import { View, Text, StatusBar, StyleSheet, ActivityIndicator, TouchableOpacity } from "react-native";
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
import Icon from "react-native-vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Paragraph from "../components/Paragraph";
import BackButton from "../components/BackButton";
import TextInput from "../components/TextInput";
import Button from "../components/Button";

const JoinGroupScreen = ({ navigation }) => {
  const [groupName, setGroupName] = useState({ value: '', error: '' });
  const [passcode, setPasscode] = useState({ value: '', error: '' });
  const [loading, setLoading] = useState(false);

  const handleJoinGroup = async () => {
    try {
      setLoading(true);
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
        setLoading(false);
        return;
      }

      // Step 1: Check if the user is not already in a group with the same id
      const userDocRef = doc(db, "users", userUid);
      const userDocSnapshot = await getDoc(userDocRef);

      const userGroups = userDocSnapshot.data().userGroups;
      if (userGroups.some((groupRef) => groupRef.id === groupName.value)) {
        setGroupName({...groupName, error: "You are already in this group!"});
        setLoading(false);
        return;
      }
      // Step 2: Check if the group document with the id (groupName) exists
      const groupClassesDocRef = doc(db, "groupClasses", groupName.value);
      const groupClassesDocSnapshot = await getDoc(groupClassesDocRef);

      if (!groupClassesDocSnapshot.exists()) {
        setGroupName({...groupName, error: "Group does not exist."});
        setLoading(false);
        return;
      }
      // Step 3: Check if the passcode aligns with the passcode field in the group document
      const groupDocRef = doc(db, "groups", groupName.value);
      const groupDocSnapshot = await getDoc(groupDocRef);
      const actualPasscode = groupDocSnapshot.data().passcode;

      if (passcode.value !== actualPasscode) {
        setPasscode({...passcode, error: "Incorrect passcode"});
        setLoading(false);
        return;
      }
      // Step 4: Add the group reference to the user's userGroups
      await updateDoc(userDocRef, {
        userGroups: arrayUnion(groupDocRef),
      });
      // Step 5: Update the group document
      await updateDoc(groupDocRef, {
        groupCount: increment(1),
        groupUsers: arrayUnion(userDocRef),
      });
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
      setPasscode({ value: '', error: '' });
      setGroupName({ value: '', error: '' });
      setLoading(false);
      // Navigate back to the 'GroupsScreen'
      navigation.navigate("MainTabs", {
        screen: "GroupsScreen",
        params: { refresh: true },
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
          <View style={styles.headerContent}>
            <BackButton goBack={navigation.goBack}/>
            <Text style={styles.headerText}>Join Group</Text>
          </View>
          <TouchableOpacity onPress={() => handleLogoutPress()}>
            <Icon name="logout" size={24} style={styles.logoutIcon} />
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        // Render loading screen
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={styles.loadingText}>Joining Group...</Text>
        </View>
      ) : (

      <View style={styles.centeredContent}>
        <Paragraph>Join a group to see your friend's classes!</Paragraph>
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
        <Button mode="contained" onPress={handleJoinGroup}>
          Join Group
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
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

export default JoinGroupScreen;

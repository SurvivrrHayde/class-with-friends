import React, { useState, useEffect } from "react";
import { View, Text, StatusBar, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  getFirestore,
} from "firebase/firestore";
import Icon from "react-native-vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import TextInput from "../components/TextInput";
import Button from "../components/Button";
import BackButton from "../components/BackButton";
import { getAuth } from "firebase/auth";

const AddClassesScreen = ({ navigation }) => {
  const [classes, setClasses] = useState([]);
  const [className, setClassName] = useState({ value: '', error: '' });
  const [classSection, setClassSection] = useState({ value: '', error: '' });
  const [newClasses, setNewClasses] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCurrentUserClasses = async () => {
      const currentClasses = [];
      const userUid = await AsyncStorage.getItem("userUid");
      const db = getFirestore();

      const userClassesDocRef = doc(db, "userClasses", userUid);
      const userClassesDocSnapshot = await getDoc(userClassesDocRef);

      if (!userClassesDocSnapshot.exists()) {
        return;
      }

      const userClasses = userClassesDocSnapshot.data().classes;

      for (const userClass of userClasses) {
        const classDocRef = doc(db, "classes", userClass);
        const classDocSnapshot = await getDoc(classDocRef);
        const newClass = {
          className: classDocSnapshot.data().className,
          classSection: classDocSnapshot.data().classSection,
        };
        currentClasses.push(newClass);
      }
      setClasses(currentClasses);
    };
    fetchCurrentUserClasses();
  }, []);

  const addClass = () => {
    if (isValidInput()) {
      const newClass = {
        id: `${className.value}${classSection.value}`,
        className: className.value.toUpperCase(),
        classSection: classSection.value,
      };
      setNewClasses(newClasses + 1);
      setClasses([...classes, newClass]);
      // Clear input fields
      setClassName({ value: '', error: '' });
      setClassSection({ value: '', error: '' });
    }
  };

  const removeLastClass = () => {
    const updatedClasses = [...classes];
    updatedClasses.pop();
    setNewClasses(newClasses - 1);
    setClasses(updatedClasses);
  };

  const saveClasses = async () => {
    if (newClasses === 0) {
      navigation.goBack();
      return;
    }
    setLoading(true);
    const userUid = await AsyncStorage.getItem("userUid");
    const db = getFirestore();

    const userDocRef = doc(db, "users", userUid);
    const userDocSnapshot = await getDoc(userDocRef);

    const userGroups = userDocSnapshot.data().userGroups;

    const userClassesDocRef = doc(db, "userClasses", userUid);
    const userClassesDocSnapshot = await getDoc(userClassesDocRef);

    if (!userClassesDocSnapshot.exists()) {
      await setDoc(userClassesDocRef, {
        classes: [],
      });
    } else {
      await updateDoc(userClassesDocRef, {
        classes: [],
      });
    }

    // Iterate through entered classes
    for (const enteredClass of classes) {
      const classId = `${enteredClass.className}${enteredClass.classSection}`;

      const classesDocRef = doc(db, "classes", classId);
      const classesDocSnapshot = await getDoc(classesDocRef);

      // Add the class to the classes collection if not already there
      if (!classesDocSnapshot.exists()) {
        // If document doesn't exist, create it
        await setDoc(classesDocRef, {
          className: enteredClass.className,
          classSection: enteredClass.classSection,
        });
      }

      // Add the classes to the userClasses if not already there

      await updateDoc(userClassesDocRef, {
        classes: arrayUnion(classId),
      });

      // Add the classes to each group the user is apart of
      for (const groupRef of userGroups) {
        const groupDocSnapshot = await getDoc(groupRef);
        const groupName = groupDocSnapshot.data().groupName;

        const groupClassesDocRef = doc(db, "groupClasses", groupName);

        const specificGroupClassesCollectionRef = collection(
          groupClassesDocRef,
          "specificGroupClasses"
        );

        const classDocRef = doc(specificGroupClassesCollectionRef, classId);
        const classDocSnapshot = await getDoc(classDocRef);

        if (classDocSnapshot.exists()) {
          // If document exists, update the userCount field and add a reference to the classUsers array
          await updateDoc(classDocRef, {
            classUsers: arrayUnion(userDocRef),
          });
        } else {
          // If document doesn't exist, create it
          await setDoc(classDocRef, {
            classUsers: [userDocRef],
          });
        }
      }
    }
    setNewClasses(0);
    setLoading(false);
    navigation.navigate("MainTabs", {
      screen: "GroupsScreen",
      params: { refresh: false },
    });
  };

  const isValidInput = () => {
    if (!/^[a-zA-Z]+\s\d{4}$/.test(className.value)) {
      setClassName({ ...className, error: "Wrong format, look at example." })
      return false;
    }
    if (!/^\d{3}$/.test(classSection.value)) {
      setClassSection({ ...classSection, error: "Wrong format, look at example." })
      return false;
    }
    if (classes.find(
      (userClass) =>
        userClass.className === className.value && userClass.classSection === classSection.value
    )) {
      setClassName({ ...className, error: "You already entered this class." })
      return false;
    }
    return true;
  };

  const handleLogoutPress = async () => {
    const auth = getAuth();
    await auth.signOut();
    await AsyncStorage.removeItem("userUid");
    navigation.navigate("LoginScreen");
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.topContainer}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <BackButton goBack={navigation.goBack} />
            <Text style={styles.headerText}>Add Classes</Text>
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
          <Text style={styles.loadingText}>Saving Classes...</Text>
        </View>
      ) : (
        //input fields
        < View style={styles.centeredContent}>
          <View style={styles.inputContainer}>
            <TextInput
              label="Class Name (e.g., CS 1110)"
              returnKeyType="next"
              value={className.value}
              onChangeText={(text) => setClassName({ value: text, error: '' })}
              error={!!className.error}
              errorText={className.error}
              autoCapitalize="none"
            />
            <TextInput
              label="Class Section (e.g., 003)"
              returnKeyType="done"
              value={classSection.value}
              onChangeText={(text) => setClassSection({ value: text, error: '' })}
              error={!!classSection.error}
              errorText={classSection.error}
              autoCapitalize="none"
            />
          </View>

          {/* Buttons */}
          <View>
            <Button mode="outlined" onPress={addClass}>
              Add Class
            </Button>
            <Button
              mode="outlined"
              onPress={removeLastClass}
              disabled={newClasses === 0}
            >
              Remove Last Class
            </Button>
            <Button mode="contained" onPress={saveClasses}>Save Classes</Button>
          </View>

          {/* Display entered classes */}
          <View style={styles.scrollViewContainer}>
            <ScrollView style={styles.scrollView}>
              {classes.map((userClass) => (
                <View style={styles.cardContainer}>
                  <View style={styles.cardContent}>
                    <Text style={styles.userClass}>{userClass.className} </Text>
                    <Text style={styles.classSection}>Section {userClass.classSection}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>)
      }
    </View >
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
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
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
    justifyContent: "flex-start",
    paddingHorizontal: 15,
  },
  inputContainer: {
    marginBottom: 16,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardContainer: {
    borderRadius: 12,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    elevation: 3,
    padding: "2%",
    margin: "2%"
  },
  userClass: {
    fontWeight: "bold",
  },
  scrollViewContainer: {
    flex: 1,
  },
})

export default AddClassesScreen;

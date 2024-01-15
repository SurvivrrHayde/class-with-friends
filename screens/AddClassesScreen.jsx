import React, { useState, useEffect } from "react";
import { View, Text, StatusBar, StyleSheet, ScrollView, ActivityIndicator, Alert, TouchableOpacity } from "react-native";
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  getFirestore,
} from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LogoutButton, Button } from "../components";
import SearchableDropdown from 'react-native-searchable-dropdown';
import { useRoute } from "@react-navigation/native";
import { theme } from "../assets/theme";

const AddClassesScreen = ({ navigation }) => {
  const route = useRoute();
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState([]); // Your cached JSON array
  const [selectedClasses, setSelectedClasses] = useState([]);

  useEffect(() => {
    if (route.params?.promptToAddClasses) {
      Alert.alert(
        'Add Classes',
        'You need to add your classes before creating or joining any groups',
        [{ text: 'Close' }],
        { cancelable: false }
      );
    }
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
        const classDocRef = doc(db, "spring24Classes", userClass);
        const classDocSnapshot = await getDoc(classDocRef);
        const classData = classDocSnapshot.data();
        const newClass = {
          id: `${classData.subject}${classData.catalog_nbr}${classData.class_section}`,
          name: `${classData.subject} ${classData.catalog_nbr} - ${classData.descr} - Section ${classData.class_section}`,
          subject: classData.subject,
          catalog_nbr: classData.catalog_nbr,
          descr: classData.descr,
          class_section: classData.class_section,
        };
        currentClasses.push(newClass);
      }
      setSelectedClasses(currentClasses);
    };

    fetchCurrentUserClasses();

    const fetchClassesFromStorage = async () => {
      const storedClassesJSON = await AsyncStorage.getItem('spring24Classes');
      const storedClasses = JSON.parse(storedClassesJSON);
      setClasses(storedClasses);
    };

    fetchClassesFromStorage();
  }, []);

  // Convert classes data to the format expected by SearchableDropdown
  const classItems = classes.map(item => ({
    id: `${item.subject}${item.catalog_nbr}${item.class_section}`,
    name: `${item.subject} ${item.catalog_nbr} - ${item.descr} - Section ${item.class_section}`,
    subject: item.subject,
    catalog_nbr: item.catalog_nbr,
    descr: item.descr,
    class_section: item.class_section,
  }));

  // Custom search logic based on your specific criteria
  const customSearch = (text, item) => {
    const searchText = text.toLowerCase();
    return (
      item.name.toLowerCase().includes(searchText) ||
      item.subject.toLowerCase().includes(searchText) ||
      item.catalog_nbr.toLowerCase().includes(searchText) ||
      item.descr.toLowerCase().includes(searchText) ||
      item.class_section.toLowerCase().includes(searchText)
    );
  };

  const saveClasses = async () => {
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
    for (const enteredClass of selectedClasses) {
      const classId = `${enteredClass.subject}${enteredClass.catalog_nbr}${enteredClass.class_section}`;

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
    setLoading(false);
    navigation.navigate("MainTabs", {
      screen: "GroupsScreen",
    });
  };

  const handleDeleteClass = (index) => {
    const updatedClasses = [...selectedClasses];
    updatedClasses.splice(index, 1);
    setSelectedClasses(updatedClasses);
  };


  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.topContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerText}>Add Classes</Text>
          <LogoutButton navigation={navigation} />
        </View>
      </View>

      {loading ? (
        // Render loading screen
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={styles.loadingText}>Saving Classes...</Text>
        </View>
      ) : (
        < View style={styles.centeredContent}>
          {/* Dropdown menu */}
          <SearchableDropdown
            onTextChange={() => { }}
            onItemSelect={selectedClass => setSelectedClasses([...selectedClasses, selectedClass])}
            containerStyle={styles.dropdownContainer}
            textInputStyle={styles.dropdownInput}
            itemStyle={styles.dropdownItem}
            itemTextStyle={styles.dropdownItemText}
            itemsContainerStyle={styles.dropdownItemsContainer}
            items={classItems}
            defaultIndex={0}
            placeholder="Search for a class"
            resetValue={false}
            underlineColorAndroid="transparent"
            customSearch={customSearch} // Use the custom search function
          />

          {/* Display entered classes */}
          <View style={styles.scrollViewContainer}>
            <ScrollView style={styles.scrollView}>
              {selectedClasses.map((userClass, index) => (
                <View key={index} style={styles.cardContainer}>
                  <View style={styles.cardContent}>
                    <View style={styles.classInfo}>
                      <Text style={styles.userClass}>{`${userClass.subject} ${userClass.catalog_nbr} - ${userClass.descr}`}</Text>
                    </View>
                    <TouchableOpacity onPress={() => handleDeleteClass(index)}>
                      <Text style={styles.deleteButton}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>

          <View>
            <Button mode="contained" onPress={saveClasses}>Save Classes</Button>
          </View>

        </View>)
      }
    </View >
  );
};

const styles = StyleSheet.create({
  classInfo: {
    flex: 1,
  },
  userClass: {
    fontWeight: "bold",
  },
  deleteButton: {
    color: 'red',
    marginLeft: 10,
  },
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
  scrollViewContainer: {
    flex: 1,
  },
  dropdownContainer: {
    width: '100%',
    marginVertical: 6,
  },
  dropdownInput: {
    backgroundColor: theme.colors.surface,
    padding: 12,
    borderWidth: 1,
    borderRadius: 5,
    fontSize: 18,
  },
  dropdownItemText: {
    color: "black",
  },
  dropdownItem: {
    padding: 10,
    marginTop: 2,
    borderColor: '#bbb',
    borderWidth: 1,
    borderRadius: 5,
  },
  dropdownItemsContainer: {
    maxHeight: 140,
  },
})

export default AddClassesScreen;

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList } from 'react-native';
import {
    collection,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    arrayUnion,
    getFirestore,
} from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Assuming you have your Firebase Firestore instance as 'db'

const AddClassesScreen = ({ navigation }) => {
    const [classes, setClasses] = useState([]);
    const [className, setClassName] = useState('');
    const [classSection, setClassSection] = useState('');
    const [newClasses, setNewClasses] = useState(0);

    useEffect(() => {
        const fetchCurrentUserClasses = async () => {
            const currentClasses = [];
            const userUid = await AsyncStorage.getItem('userUid');
            const db = getFirestore();

            const userClassesDocRef = doc(db, 'userClasses', userUid);
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
                }
                currentClasses.push(newClass);
            }
            setClasses(currentClasses);
        }
        fetchCurrentUserClasses();
    }, []);

    const addClass = () => {
        if (isValidInput()) {
            const newClass = {
                className: className.toUpperCase(),
                classSection,
            };
            setNewClasses(newClasses + 1);
            setClasses([...classes, newClass]);
            // Clear input fields
            setClassName('');
            setClassSection('');
        }
    };

    const removeLastClass = () => {
        const updatedClasses = [...classes];
        updatedClasses.pop();
        setNewClasses(newClasses - 1);
        setClasses(updatedClasses);
    };

    const saveClasses = async () => {
        const userUid = await AsyncStorage.getItem('userUid');
        const db = getFirestore();

        const userDocRef = doc(db, 'users', userUid);
        const userDocSnapshot = await getDoc(userDocRef);

        const userGroups = userDocSnapshot.data().userGroups;

        const userClassesDocRef = doc(db, "userClasses", userUid);
        const userClassesDocSnapshot = await getDoc(userClassesDocRef);

        if (!userClassesDocSnapshot.exists()) {
            await setDoc(userClassesDocRef, {
                classes: []
            });
        } else {
            await updateDoc(userClassesDocRef, {
                classes: []
            })
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
            })

            // Add the classes to each group the user is apart of
            for (const groupRef of userGroups) {

                const groupDocSnapshot = await getDoc(groupRef);
                const groupName = groupDocSnapshot.data().groupName;

                const groupClassesDocRef = doc(db, "groupClasses", groupName);

                const specificGroupClassesCollectionRef = collection(groupClassesDocRef, 'specificGroupClasses');

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
        navigation.navigate("GroupsScreen");
    };

    const isValidInput = () => {
        // Add your validation logic for className and classSection format
        return /^[a-zA-Z]+\s\d{4}$/.test(className) && /^\d{3}$/.test(classSection);
    };

    return (
        <View>
            {/* Input fields */}
            <View>
                <Text>
                    Subject and Catalog (e.g., CS 1110):
                </Text>
                <TextInput
                    type="text"
                    value={className}
                    onChangeText={(text) => setClassName(text)}
                />
            </View>
            <View>
                <Text>
                    Class Section (e.g., 003):
                </Text>
                <TextInput
                    type="text"
                    value={classSection}
                    onChangeText={(text) => setClassSection(text)}
                />
            </View>

            {/* Buttons */}
            <View>
                <Button onPress={addClass} title="Add Class" />
                <Button onPress={removeLastClass} title="Remove Last Class" disabled={newClasses === 0} />
                <Button onPress={saveClasses} title="Save Classes" />
            </View>

            {/* Display entered classes */}
            <View>
                <Text>Entered Classes:</Text>
                <FlatList
                    data={classes}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <Text >{item.className} - {item.classSection}</Text>
                    )}
                />
            </View>
        </View>
    );
};

export default AddClassesScreen;

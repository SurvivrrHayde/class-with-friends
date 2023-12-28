import React, { useState } from 'react';
import { View, Text, TextInput, Button } from 'react-native';
import { getAuth } from 'firebase/auth';
import { collection, getFirestore, doc, setDoc } from 'firebase/firestore';

const CreateGroupScreen = ({ navigation }) => {
    const [groupName, setGroupName] = useState('');
    const [passcode, setPasscode] = useState('');

    const handleCreateGroup = async () => {
        try {
            const auth = getAuth();
            const userUid = auth.currentUser.uid;

            const db = getFirestore();
            const usersCollection = collection(db, "users");
            const userDocRef = doc(usersCollection, userUid);

            const groupData = {
                groupCount: 1,
                groupName: groupName,
                groupUsers: [userDocRef],
                passcode: passcode,
            };

            // Add the new group to the 'groups' collection
            const groupsCollection = collection(db, 'groups');
            const groupDocRef = doc(groupsCollection, groupData.groupName);

            //check if exists
            const groupDocSnapshot = await getDoc(groupDocRef);

            if (groupDocSnapshot.exists()) {
                console.error("Group already exists");
                return;
            }

            // Query userClasses collection to get the IDs of the user's classes
            const userClassesCollection = collection(db, "userClasses")
            const userClassesDocRef = doc(userClassesCollection, userUid)

            const userClassesSnapshot = await getDoc(userClassesDocRef);
            const userClasses = userClassesSnapshot.data().classes;

            //Add the new group to the 'groupClasses' collection

            const groupClassesDocRef = doc(db, "groupClasses", groupName);

            await setDoc(groupClassesDocRef);
            const specificGroupClassesCollectionRef = collection(groupClassesDocRef, "specificGroupClasses");

            for (const userClass of userClasses) {
                const classDocRef = doc(specificGroupClassesCollectionRef, userClass);

                await setDoc(classDocRef, {
                    userCount: 1,
                    classUsers: [userDocRef]
                })
            };

            await setDoc(groupDocRef, groupData);

            await updateDoc(userDocRef, {
                userGroups: arrayUnion(groupDocRef),
            })

            // Navigate back to the 'GroupsScreen'
            navigation.goBack();
        } catch (error) {
            console.error('Error creating group:', error.message);
        }
    };

    return (
        <View>
            <Text>Group Name</Text>
            <TextInput value={groupName} onChangeText={setGroupName} />

            <Text>Passcode</Text>
            <TextInput value={passcode} onChangeText={setPasscode} secureTextEntry />

            <Button title="Submit" onPress={handleCreateGroup} />
        </View>
    );
};

export default CreateGroupScreen;

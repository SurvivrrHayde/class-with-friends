import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore, doc, getDoc, deleteDoc, collection, updateDoc } from "firebase/firestore";

const deleteAccount = async () => {
  try {
    const userUid = await AsyncStorage.getItem('userUid');

    const db = getFirestore();

    // Delete user document from 'users' collection
    const userDocRef = doc(db, 'users', userUid);
    const userDocSnapshot = await getDoc(userDocRef);
    const userGroups = userDocSnapshot.data().userGroups;
    await deleteDoc(userDocRef);

    // Delete user document from 'userClasses' collection
    const userClassesDocRef = doc(db, 'userClasses', userUid);
    const userClassesDocSnapshot = await getDoc(userClassesDocRef);
    const classes = userClassesDocSnapshot.data().classes;
    await deleteDoc(userClassesDocRef);

    // Iterate through userGroups and update 'groups' collection
    for (const groupRef of userGroups) {
      const groupDocRef = doc(db, 'groups', groupRef.id);
      const groupDocSnapshot = await getDoc(groupDocRef);

      if (groupDocSnapshot.exists()) {
        const groupCount = groupDocSnapshot.data().groupCount - 1;
        const groupUsers = groupDocSnapshot.data().groupUsers.filter(
          (userRef) => userRef !== `/users/${userUid}`
        );

        // Update 'groups' collection
        await updateDoc(groupDocRef, {
          groupCount,
          groupUsers,
        });
      }
    }

    // Iterate through userGroups and update 'groupClasses' collection
    for (const groupRef of userGroups) {
      const groupDocSnapshot = await getDoc(groupRef);
      const groupName = groupDocSnapshot.data().groupName;

      const groupClassesDocRef = doc(db, "groupClasses", groupName);

      const specificGroupClassesCollectionRef = collection(
        groupClassesDocRef,
        "specificGroupClasses"
      );
        for (const userClass of classes) {
            const classDocRef = doc(specificGroupClassesCollectionRef, userClass);
            const classDocSnapshot = await getDoc(classDocRef);
            const classUsers = classDocSnapshot.data().classUsers.filter(
                (userRef) => userRef !== `/users/${userUid}`
            )
            await updateDoc(classDocRef, {
                classUsers,
            })
        }
    }
    // Now the account and associated data are deleted
  } catch (error) {
    console.error('Error deleting account:', error);
    // Handle errors as needed
  }
};

export default deleteAccount;

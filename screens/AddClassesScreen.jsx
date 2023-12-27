import React, { useState, useEffect } from 'react';
import {
    collection,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    arrayUnion,
    increment,
} from 'firebase/firestore';

// Assuming you have your Firebase Firestore instance as 'db'

const AddClassesScreen = () => {
    const [classes, setClasses] = useState([]);
    const [className, setClassName] = useState('');
    const [classSection, setClassSection] = useState('');

    const addClass = () => {
        if (isValidInput()) {
            const newClass = {
                className: className.toUpperCase(),
                classSection,
            };
            setClasses([...classes, newClass]);
            // Clear input fields
            setClassName('');
            setClassSection('');
        }
    };

    const removeLastClass = () => {
        if (classes.length > 0) {
            const updatedClasses = [...classes];
            updatedClasses.pop();
            setClasses(updatedClasses);
        }
    };

    const saveClasses = async () => {
        const auth = getAuth();
        const userUid = auth.currentUser.uid;
        const db = getFirestore();

        const userDocRef = doc(db, 'users', userUid);
        const userDocSnapshot = await getDoc(userDocRef);

        const userGroups = userDocSnapshot.data().userGroups;

        // Iterate through entered classes
        for (const enteredClass of classes) {
            const classId = `${enteredClass.className}${enteredClass.classSection}`;

            // Add the class to the classes collection if not already there
            const classesDocRef = doc(db, "classes", classId);
            const classesDocSnapshot = await getDoc(classesDocRef);

            if (!classesDocSnapshot.exists()) {
                // If document doesn't exist, create it
                await setDoc(classesDocRef, {
                    className: className,
                    classSection: classSection,
                });
            }

            // Add the classes to the userClasses if not already there
            const userClassesDocRef = doc(db, "userClasses", userUid);
            await updateDoc(userClassesDocRef, {
                classes: arrayUnion(classId),
            })

            // Add the classes to each group the user is apart of
            for (const groupRef of userGroups) {

                const groupDocSnapshot = await getDoc(groupRef);
                const groupName = groupDocSnapshot.data().groupName;

                const specificGroupClassesCollectionRef = collection(db, groupName, 'specificGroupClasses');

                const classDocRef = doc(specificGroupClassesCollectionRef, classId);
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
        }
    };

    const isValidInput = () => {
        // Add your validation logic for className and classSection format
        return /^[a-zA-Z]+\s\d{4}$/.test(className) && /^\d{3}$/.test(classSection);
    };

    return (
        <div>
            {/* Input fields */}
            <div>
                <label>
                    Subject and Catalog (e.g., CS 1110):
                    <input
                        type="text"
                        value={className}
                        onChange={(e) => setClassName(e.target.value)}
                    />
                </label>
            </div>
            <div>
                <label>
                    Class Section (e.g., 003):
                    <input
                        type="text"
                        value={classSection}
                        onChange={(e) => setClassSection(e.target.value)}
                    />
                </label>
            </div>

            {/* Buttons */}
            <div>
                <button onClick={addClass}>Add Class</button>
                <button onClick={removeLastClass} disabled={classes.length == 0}>Remove Last Class</button>
                <button onClick={saveClasses}>Save Classes</button>
            </div>

            {/* Display entered classes */}
            <div>
                <h2>Entered Classes:</h2>
                <ul>
                    {classes.map((c, index) => (
                        <li key={index}>{`${c.className} - ${c.classSection}`}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default AddClassesScreen;

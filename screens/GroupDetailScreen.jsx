import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import UserClassesTab from '../components/UserClassesTab';
import GroupClassesTab from '../components/GroupClassesTab';
import { collection, doc, getDoc, getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const Tab = createMaterialTopTabNavigator();

const GroupDetailScreen = ({ route }) => {
  const { groupId } = route.params;
  const [userClassesInfo, setUserClassesInfo] = useState([]);
  const [groupClassesInfo, setGroupClassesInfo] = useState([]);
  let userClasses;
  let groupClasses;

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const auth = getAuth();
        const userUid = auth.currentUser.uid;

        // Query userClasses collection to get the IDs of the user's classes
        const db = getFirestore();
        const userClassesCollection = collection(db, "userClasses")
        const userClassesDocRef = doc(userClassesCollection, userUid)

        const userClassesSnapshot = await getDoc(userClassesDocRef);
        const userClassFields = userClassesSnapshot.data();
        const enrolledClasses = Object.keys(userClassFields);

        const currentGroupId = groupId;

        // Get the groupClasses document for the current group
        const groupClassesCollection = collection(db, 'groupClasses', currentGroupId, 'specificGroupClasses');

        // Get all documents from the specificGroupClasses subcollection
        const querySnapshot = await getDocs(groupClassesCollection);

        // Extract data from each document
        const groupClassesData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

        groupClasses = groupClassesData;
        userClasses = enrolledClasses;

      } catch (error) {
        console.error('Error fetching user classes:', error.message);
      }
    };

    fetchClasses();

    const getGroupClassesInfo = () => {
      const classesInfo = [];

      groupClasses.forEach(async (groupClass) => {

        const { userCount, classUsers } = groupClass;

        // Get user names from the classUsers reference
        const userPromises = classUsers.map(async (userRef) => {
          const userDocSnapshot = await getDoc(userRef)
          const userDocData = userDocSnapshot.data();
          return userDocData;
        });

        const userDocs = await Promise.all(userPromises);

        const userNames = userDocs.map((user) => user.name);

        const classesCollection = collection(db, "classes");
        const classesDocRef = doc(classesCollection, groupClass);
        const classesSnapshot = await getDoc(classesDocRef);
        const classesFields = classesSnapshot.data();

        classesInfo.push({
          id: groupClass.id,
          userCount: userCount,
          userList: userNames,
          className: classesFields.className,
          classSection: classesFields.classSection,
        });
      });

      setGroupClassesInfo(classesInfo);
    }

    getGroupClassesInfo();

    const getUserClassesInfo = () => {
      const classesInfo = [];

      userClasses.forEach((userClass) => {
        const matchingClass = groupClassesInfo.find((groupClass) => groupClass.id === userClass);
        classesInfo.push(matchingClass);
      });

      setUserClassesInfo(classesInfo);
    }

    getUserClassesInfo();
  }, []);

  return (
    <Tab.Navigator>
      <Tab.Screen
        name="UserClasses"
        component={() => <UserClassesTab classesInfo={userClassesInfo} />}
        options={{ title: 'Your Classes' }}
      />
      <Tab.Screen
        name="GroupClasses"
        component={() => <GroupClassesTab classesInfo={groupClassesInfo} />}
        options={{ title: 'Group Classes' }}
      />
    </Tab.Navigator>
  );
};

export default GroupDetailScreen;

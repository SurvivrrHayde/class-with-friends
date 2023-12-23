import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import UserClassesTab from '../components/UserClassesTab';
import GroupClassesTab from '../components/GroupClassesTab';
import { collection, doc, getDoc, getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const Tab = createMaterialTopTabNavigator();

const GroupDetailScreen = ({ route }) => {
  const { groupId } = route.params;
  const [userClasses, setUserClasses] = useState([]);
  const [groupClasses, setGroupClasses] = useState([]);

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

        setGroupClasses(groupClassesData);
        setUserClasses(enrolledClasses);

      } catch (error) {
        console.error('Error fetching user classes:', error.message);
      }
    };

    fetchClasses();

    const getUserClassesInfo = () => {
      const classesInfo = [];

      userClasses.forEach((userClass) => {
        const matchingClass = groupClasses.find((groupClass) => groupClass.id === userClass);
    
        if (matchingClass) {
          const { userCount, classUsers } = matchingClass;
    
          // Get user names from the classUsers reference
          const userNames = classUsers.map((userId) => {
            // Assuming there's a collection called 'users' and 'userName' is a field in the user document
            const userName = groupClassesData.find((user) => user.id === userId)?.userName;
            return userName;
          });
    
          classesInfo.push({
            id: userClass,
            userCount,
            userNames,
          });
        }
      });
    
      return classesInfo;
    }

    getUserClassesInfo();
  }, []);

  return (
    <Tab.Navigator>
      <Tab.Screen
        name="UserClasses"
        component={() => <UserClassesTab groupId={groupId} />}
        options={{ title: 'Your Classes' }}
      />
      <Tab.Screen
        name="GroupClasses"
        component={() => <GroupClassesTab groupId={groupId} />}
        options={{ title: 'Group Classes' }}
      />
    </Tab.Navigator>
  );
};

export default GroupDetailScreen;

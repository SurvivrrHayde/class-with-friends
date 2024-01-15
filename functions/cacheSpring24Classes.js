import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const cacheSpring24Classes = async () => {
  const storedData = await AsyncStorage.getItem('spring24Classes');

  if (storedData) {
    return;
  }

  const db = getFirestore();
  const classesRef = collection(db, 'spring24Classes');

  try {
    const querySnapshot = await getDocs(classesRef);
    const results = [];
    querySnapshot.forEach((doc) => {
      results.push(doc.data());
    });

    await AsyncStorage.setItem('spring24Classes', JSON.stringify(results));
  } catch (error) {
    console.error('Error caching data:', error);
  }
};

export default cacheSpring24Classes;

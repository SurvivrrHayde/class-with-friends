import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const cacheSpring24Classes = async () => {
    console.log("here")
  const storedData = await AsyncStorage.getItem('huh');

  if (storedData) {
    console.log('Data already cached. Skipping Firestore fetch.');
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

    await AsyncStorage.setItem('huh', JSON.stringify(results));
    console.log('Data cached successfully');
  } catch (error) {
    console.error('Error caching data:', error);
  }
};

export default cacheSpring24Classes;

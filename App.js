import { initializeApp } from 'firebase/app';
import firebaseConfig from './firebaseConfig';
import { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './screens/LoginScreen';
import SignUpScreen from './screens/SignUpScreen';
import GroupsScreen from './screens/GroupsScreen';
import GroupDetailScreen from './screens/GroupDetailScreen';

export default function App() {
  const Stack = createStackNavigator();
  useEffect(() => {
    initializeApp(firebaseConfig);
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="LoginScreen">
        <Stack.Screen name="LoginScreen" component={LoginScreen} />
        <Stack.Screen name="SignUpScreen" component={SignUpScreen} />
        <Stack.Screen name="GroupsScreen" component={GroupsScreen} />
        <Stack.Screen name="GroupDetailScreen" component={GroupDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
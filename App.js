import { initializeApp } from 'firebase/app';
import firebaseConfig from './firebaseConfig';
import { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { LoginScreen, SignUpScreen, GroupsScreen, GroupDetailScreen, CreateGroupScreen, JoinGroupScreen } from './screens';

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
        <Stack.Screen name="CreateGroupScreen" component={CreateGroupScreen} />
        <Stack.Screen name="JoinGroupScreen" component={JoinGroupScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
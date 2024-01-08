import { initializeApp } from 'firebase/app';
import firebaseConfig from './firebaseConfig';
import { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { LoginScreen, SignUpScreen, GroupsScreen, GroupDetailScreen, CreateGroupScreen, JoinGroupScreen, AddClassesScreen } from './screens';

export default function App() {
  const Stack = createStackNavigator();
  useEffect(() => {
    initializeApp(firebaseConfig);
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="LoginScreen">
        <Stack.Screen name="LoginScreen" component={LoginScreen} options={{ headerShown: false }}/>
        <Stack.Screen name="SignUpScreen" component={SignUpScreen} options={{ headerShown: false }}/>
        <Stack.Screen name="GroupsScreen" component={GroupsScreen} options={{ headerShown: false }}/>
        <Stack.Screen name="GroupDetailScreen" component={GroupDetailScreen} options={{ headerShown: false }}/>
        <Stack.Screen name="CreateGroupScreen" component={CreateGroupScreen} options={{ headerShown: false }}/>
        <Stack.Screen name="JoinGroupScreen" component={JoinGroupScreen} options={{ headerShown: false }}/>
        <Stack.Screen name="AddClassesScreen" component={AddClassesScreen} options={{ headerShown: false }}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
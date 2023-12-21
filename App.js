import { initializeApp } from 'firebase/app';
import firebaseConfig from './firebaseConfig';
import { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './screens/LoginScreen';
import SignUpScreen from './screens/SignUpScreen';
import GroupsScreen from './screens/GroupsScreen';
import { AppRegistry } from 'react-native';

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
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// "project" is the name of the main react-native Folder 
// the second argument is an arrow function  
// returning myComponent defined above 
AppRegistry.registerComponent("class-with-friends", () => App);
  
// runApplication() loads the javascript bundle and runs the app. 
AppRegistry.runApplication("class-with-friends", {
  rootTag: document.getElementById("root")
});
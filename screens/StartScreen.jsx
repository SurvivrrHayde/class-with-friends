import React, { useEffect } from 'react'
import Logo from '../components/Logo'
import Header from '../components/Header'
import Button from '../components/Button'
import Paragraph from '../components/Paragraph'
import { View, StyleSheet, StatusBar } from 'react-native'
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function StartScreen({ navigation }) {

  useEffect(() => {
    const autoLogin = async () => {
      try {
        const notFirstTime = await AsyncStorage.getItem("firstTime?");
        if (notFirstTime) {
          navigation.navigate("LoginScreen");
        }
      } catch {
        const yes = true;
        await AsyncStorage.setItem("firstTime?", yes);
      }
    };

    autoLogin();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Logo />
      <Header>Class With Friends</Header>
      <Paragraph>
        Never sit alone in class again.
      </Paragraph>
      <Button
        mode="contained"
        onPress={() => navigation.navigate('LoginScreen')}
      >
        Login
      </Button>
      <Button
        mode="outlined"
        onPress={() => navigation.navigate('SignUpScreen')}
      >
        Sign Up
      </Button>
    </View>
  )
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      width: '100%',
      maxWidth: 340,
      alignSelf: 'center',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '30%'
    },
  });
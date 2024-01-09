import React from 'react'
import Logo from '../components/Logo'
import Header from '../components/Header'
import Button from '../components/Button'
import Paragraph from '../components/Paragraph'
import { theme } from '../assets/theme'
import { View } from 'react-native'

export default function StartScreen({ navigation }) {
  return (
    <View>
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
    header: {
        fontSize: 21,
        color: theme.colors.primary,
        fontWeight: 'bold',
        paddingVertical: 12,
      },
  })
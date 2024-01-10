import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, StyleSheet, StatusBar } from "react-native";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import Logo from '../components/Logo';
import Header from '../components/Header';
import Button from '../components/Button';
import TextInput from '../components/TextInput';
import { Text } from 'react-native-paper';
import { theme } from '../assets/theme';
import AsyncStorage from "@react-native-async-storage/async-storage";

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState({ value: '', error: '' })
  const [password, setPassword] = useState({ value: '', error: '' })

  useEffect(() => {
    const autoLogin = async () => {
      try {
        const storedUserUid = await AsyncStorage.getItem("userUid");
        if (storedUserUid) {
          navigation.navigate("MainTabs", {
            screen: "GroupsScreen",
            params: { refresh: true },
          });
        }
      } catch (error) {
        console.log("Error checking userUid:", error);
      }
    };

    autoLogin();
  }, []);

  const handleLogin = async () => {
    try {
      const emailError = emailValidator(email.value)
      const passwordError = passwordValidator(password.value)
      if (emailError || passwordError) {
        setEmail({ ...email, error: emailError })
        setPassword({ ...password, error: passwordError })
        return
      }
      const auth = getAuth();
      await signInWithEmailAndPassword(auth, email.value, password.value);
      const userUid = auth.currentUser.uid;
      await AsyncStorage.setItem("userUid", userUid);
      navigation.navigate("MainTabs", {
        screen: "GroupsScreen",
        params: { refresh: true },
      });
    } catch (error) {
      console.error("Login error:", error.message);
    }
  };

  const emailValidator = () => {
    const re = /.+\@.+\..+/;
    if (!email.value) return "Email can't be empty.";
    if (!re.test(email.value)) return "Ooops! We need a valid email address.";
    return "";
  };

  const passwordValidator = () => {
    if (!password.value) return "Password can't be empty.";
    return "";
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Logo />
      <Header>Welcome back.</Header>
      <TextInput
        label="Email"
        returnKeyType="next"
        value={email.value}
        onChangeText={(text) => setEmail({ value: text, error: '' })}
        error={!!email.error}
        errorText={email.error}
        autoCapitalize="none"
        autoCompleteType="email"
        textContentType="emailAddress"
        keyboardType="email-address"
      />
      <TextInput
        label="Password"
        returnKeyType="done"
        value={password.value}
        onChangeText={(text) => setPassword({ value: text, error: '' })}
        error={!!password.error}
        errorText={password.error}
        secureTextEntry
      />
      <View style={styles.forgotPassword}>
        <TouchableOpacity
          onPress={() => navigation.navigate('ResetPasswordScreen')}
        >
          <Text style={styles.forgot}>Forgot your password?</Text>
        </TouchableOpacity>
      </View>
      <Button mode="contained" onPress={handleLogin}>
        Login
      </Button>
      <View style={styles.row}>
        <Text>Don’t have an account? </Text>
        <TouchableOpacity onPress={() => navigation.replace('SignUpScreen')}>
          <Text style={styles.link}>Sign up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  forgotPassword: {
    width: '100%',
    alignItems: 'flex-end',
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    marginTop: 4,
  },
  forgot: {
    fontSize: 13,
    color: theme.colors.secondary,
  },
  link: {
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  container: {
    flex: 1,
    padding: 20,
    width: '100%',
    maxWidth: 340,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default LoginScreen;

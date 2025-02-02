import React, { useState, useEffect, useRef } from "react";
import { View, TouchableOpacity, StyleSheet, StatusBar } from "react-native";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { Text } from 'react-native-paper';
import { theme } from '../assets/theme';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Logo, Button, TextInput, Header } from "../components";
import cacheSpring24Classes from "../functions/cacheSpring24Classes";

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState({ value: '', error: '' })
  const [password, setPassword] = useState({ value: '', error: '' })

  useEffect(() => {
    const autoLogin = async () => {
      try {
        const storedUserUid = await AsyncStorage.getItem("userUid");
        if (storedUserUid) {
          await cacheSpring24Classes();
          navigation.navigate("MainTabs", {
            screen: "GroupsScreen",
          });
        }
      } catch {
        return;
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
      setEmail({ value: '', error: '' })
      setPassword({ value: '', error: '' })
      await cacheSpring24Classes();
      navigation.navigate("MainTabs", {
        screen: "GroupsScreen",
      });
    } catch (error) {
      setPassword({...password, error: "Credentials do not match."})
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
      <Logo/>
      <Header>Welcome Back</Header>
      <TextInput
        label="Email"
        returnKeyType="done"
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
        onSubmitEditing={handleLogin}
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
    marginTop: "20%",
  },
});

export default LoginScreen;

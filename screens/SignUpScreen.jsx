// SignUpScreen.js
import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity, StatusBar } from "react-native";
import { Text } from "react-native-paper";
import Logo from "../components/Logo";
import Header from "../components/Header";
import Button from "../components/Button";
import TextInput from "../components/TextInput";
import { theme } from "../assets/theme";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { collection, doc, getFirestore, setDoc } from "firebase/firestore";

const SignUpScreen = ({ navigation }) => {
  const [email, setEmail] = useState({ value: "", error: "" });
  const [password, setPassword] = useState({ value: "", error: "" });
  const [name, setName] = useState({ value: "", error: "" });

  const handleSignUp = async () => {
    try {
      const nameError = nameValidator(name.value);
      const emailError = emailValidator(email.value);
      const passwordError = passwordValidator(password.value);
      if (emailError || passwordError || nameError) {
        setName({ ...name, error: nameError });
        setEmail({ ...email, error: emailError });
        setPassword({ ...password, error: passwordError });
        return;
      }
      const auth = getAuth();
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email.value,
        password.value
      );
      const user = userCredential.user;

      const db = getFirestore();
      const usersCollection = collection(db, "users");

      // Use the UID (authentication token) as the document ID
      const userDocRef = doc(usersCollection, user.uid);

      // Set fields in the user document
      await setDoc(userDocRef, {
        userId: user.uid,
        name: name.value,
        email: email.value,
        userGroups: [],
      });

      navigation.navigate("LoginScreen");
    } catch (error) {
      setPassword({...password, error: "Unknown error signing up " + error.message + " Seek Developer."})
    }
  };

  const emailValidator = () => {
    const re = /.+\@.+\..+/;
    if (!email.value) return "Email can't be empty.";
    if (!re.test(email.value)) return "Ooops! We need a valid email address.";
    return "";
  };

  const nameValidator = () => {
    if (!name.value) return "Name can't be empty.";
    return "";
  };

  const passwordValidator = () => {
    if (!password.value) return "Password can't be empty.";
    if (password.value.length < 5)
      return "Password must be at least 5 characters long.";
    return "";
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Logo />
      <Header>Create Account</Header>
      <TextInput
        label="First Name and Last Name"
        returnKeyType="next"
        value={name.value}
        onChangeText={(text) => setName({ value: text, error: "" })}
        error={!!name.error}
        errorText={name.error}
      />
      <TextInput
        label="Email"
        returnKeyType="next"
        value={email.value}
        onChangeText={(text) => setEmail({ value: text, error: "" })}
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
        onChangeText={(text) => setPassword({ value: text, error: "" })}
        error={!!password.error}
        errorText={password.error}
        secureTextEntry
      />
      <Button mode="contained" onPress={handleSignUp} style={{ marginTop: 24 }}>
        Sign Up
      </Button>
      <View style={styles.row}>
        <Text>Already have an account? </Text>
        <TouchableOpacity onPress={() => navigation.replace("LoginScreen")}>
          <Text style={styles.link}>Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    marginTop: 4,
  },
  link: {
    fontWeight: "bold",
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

export default SignUpScreen;

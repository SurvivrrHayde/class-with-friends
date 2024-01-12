// SignUpScreen.js
import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity, StatusBar } from "react-native";
import { Text } from "react-native-paper";
import Header from "../components/Header";
import Button from "../components/Button";
import TextInput from "../components/TextInput";
import { theme } from "../assets/theme";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { collection, doc, getFirestore, setDoc } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SignUpScreen = ({ navigation }) => {
  const [email, setEmail] = useState({ value: "", error: "" });
  const [password, setPassword] = useState({ value: "", error: "" });
  const [firstName, setFirstName] = useState({ value: "", error: "" });
  const [lastName, setLastName] = useState({ value: "", error: "" });

  const handleSignUp = async () => {
    try {
      const firstNameError = nameValidator(firstName.value);
      const lastNameError = nameValidator(lastName.value);
      const emailError = emailValidator(email.value);
      const passwordError = passwordValidator(password.value);
      if (emailError || passwordError || firstNameError || lastNameError) {
        setFirstName({ ...firstName, error: firstNameError });
        setLastName({ ...lastName, error: lastNameError });
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
        name: firstName.value + " " + lastName.value,
        email: email.value,
        userGroups: [],
      });

      await signInWithEmailAndPassword(auth, email.value, password.value);
      const userUid = auth.currentUser.uid;
      await AsyncStorage.setItem("userUid", userUid);
      navigation.navigate("MainTabs", {
        screen: "GroupsScreen",
        params: { refresh: true },
      });
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

  const nameValidator = (name) => {
    if (!name) return "Name can't be empty.";
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
      <Header>Create Account</Header>
      <TextInput
        label="First Name"
        returnKeyType="done"
        value={firstName.value}
        onChangeText={(text) => setFirstName({ value: text, error: "" })}
        error={!!firstName.error}
        errorText={firstName.error}
      />
      <TextInput
        label="Last Name"
        returnKeyType="done"
        value={lastName.value}
        onChangeText={(text) => setLastName({ value: text, error: "" })}
        error={!!lastName.error}
        errorText={lastName.error}
      />
      <TextInput
        label="Email"
        returnKeyType="done"
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
        onSubmitEditing={handleSignUp}
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
    marginTop: "10%",
  },
});

export default SignUpScreen;

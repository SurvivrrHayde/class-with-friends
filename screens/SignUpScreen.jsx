// SignUpScreen.js
import React, { useState } from "react";
import { View, TextInput, Button, StyleSheet, Text } from "react-native";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

const SignUpScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const handleSignUp = async () => {
    try {

      if (!email.endsWith('@virginia.edu')) {
        console.error('Email must end with "@virginia.edu"');
        return;
      }

      const auth = getAuth();
      await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const db = getFirestore();
      const usersCollection = collection(db, "users");

      // Use the UID (authentication token) as the document ID
      const userDocRef = doc(usersCollection, user.uid);

      // Set fields in the user document
      await setDoc(userDocRef, {
        userId: user.uid,
        name: name,
        email: email,
      });

      console.log("User signed up successfully!");
      // You can navigate to the login screen or another screen after sign-up
      navigation.navigate("LoginScreen");
    } catch (error) {
      console.error("Sign up error:", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text>Sign Up</Text>
      <TextInput
        style={styles.input}
        placeholder="First Name and Last Name"
        onChangeText={(text) => setName(text)}
        value={name}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        onChangeText={(text) => setEmail(text)}
        value={email}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        onChangeText={(text) => setPassword(text)}
        value={password}
      />
      <Button title="Sign Up" onPress={handleSignUp} />
      <Button
        title="Go back to Login"
        onPress={() => navigation.navigate("LoginScreen")}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    width: "80%",
    marginBottom: 20,
    paddingLeft: 10,
  },
});

export default SignUpScreen;

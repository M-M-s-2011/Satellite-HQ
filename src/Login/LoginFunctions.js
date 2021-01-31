import React, { useState, useEffect } from "react";
import db from "../db";
import Login from "./Login";
import Game from "./Game";

const LoginFunc = () => {
  const [user, setUser] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [hasAccount, setHasAccount] = useState(false);

  const clearInputs = () => {
    setEmail("");
    setPassword("");
  };

  const clearErrors = () => {
    setEmailError("");
    setPasswordError("");
  };

  const handleLogin = () => {
    clearErrors();
    db.auth()
      .signInWithEmailPassword(email, password)
      .catch((err) => {
        // eslint-disable-next-line default-case
        switch (err.code) {
          case "auth/invalid-email":
          case "auth/user-disabled":
          case "auth/user-not-found":
            setEmailError(err.message);
            break;
          case "auth/wrong-passowrd":
            setPasswordError(err.message);
            break;
        }
      });
  };
  const handleSignUp = () => {
    clearErrors();
    db.auth()
      .createUserWithEmailAndPassword(email, password)
      .catch((err) => {
        // eslint-disable-next-line default-case
        switch (err.code) {
          case "auth/email-already-in-use":
          case "auth/invalid-email":
            setEmailError(err.message);
            break;
          case "auth/weak-passowrd":
            setPasswordError(err.message);
            break;
        }
      });
  };
  const handleLogout = () => {
    db.auth().signOut();
  };

  const authListener = () => {
    db.auth().onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
      } else {
        setUser("");
      }
    });
  };

  useEffect(() => {
    authListener();
  });
  return (
    <div>
      {/* {user ? (
        <Game />
      ) : ( */}
      <Login
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        handleLogin={handleLogin}
        handleSignUp={handleSignUp}
        hasAccount={hasAccount}
        emailError={emailError}
        passwordError={passwordError}
        setHasAccount={setHasAccount}
      />
      {/* )} */}
    </div>
  );
};

export default LoginFunc;

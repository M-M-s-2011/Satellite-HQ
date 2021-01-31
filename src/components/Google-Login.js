import React, { useState, useEffect } from "react";
import db from "../db";

const GoogleLogin = () => {
  const [isLogin, setIsLogin] = useState(false);
  const [user, setUser] = useState("");

  const onSubmit = () => {
    var provider = new db.auth.GoogleAuthProvider();
    db.auth()
      .signInWithPopup(provider)
      .then((result) => {
        /** @type {firebase.auth.OAuthCredential} */
        var credential = result.credential;
        var token = credential.accessToken;
        var user = result.user;
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const onLogout = () => {
    db.auth().signOut();
  };
  useEffect(() => {
    db.auth().onAuthStateChanged((user) => {
      if (user) {
        setIsLogin(true);
        setUser(user);
      } else {
        console.log("No User signed in!");
      }
    });
  });
  return (
    <div>
      {!isLogin ? (
        <button type="button" className="googleBtn" onClick={onSubmit}>
          Login with Google!
        </button>
      ) : (
        ""
      )}
    </div>
  );
};

export default GoogleLogin;

import React from "react";
import Game from "./components/Game";
import db from "./db";
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import Login from "./components/LoginFunctions";
import GoogleLogin from "./components/Google-Login";

function App() {
  return (
    <div className="App">
      <Login />
    </div>
  );
}

export default App;

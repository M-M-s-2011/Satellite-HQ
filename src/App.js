import React from "react";
import { ChatLobby } from "./components/ChatLobby";
import { Home } from "./components/Home";
import { Space } from "./components/Space";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import "./App.css";

function App() {
  return (
    <div className="App">
      <Router>
        <Switch>
          <Route exact path="/">
            <Home />
          </Route>
          <Route exact path="/chat" component={ChatLobby} />
          <Route exact path="/space/:id">
            <Space />
          </Route>
        </Switch>
      </Router>
    </div>
  );
}

export default App;

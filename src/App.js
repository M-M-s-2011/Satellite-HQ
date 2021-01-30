import React, { useState } from "react";
import Phaser from "phaser";
import { Game } from "./game";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  useParams,
} from "react-router-dom";
import "./App.css";

function App() {
  return (
    <div className="App">
      <Router>
        <Switch>
          <Route exact path="/">
            <Home />
          </Route>
          <Route exact path="/space/:id">
            <Space />
          </Route>
        </Switch>
      </Router>
    </div>
  );
}

function Home() {
  const [spaceId, setSpaceId] = useState("");
  return (
    <div>
      <input
        value={spaceId}
        onChange={(event) => setSpaceId(event.target.value)}
      />
      <Link to={`/space/${spaceId}`}>Go to space</Link>
    </div>
  );
}

function Space() {
  // We can use the `useParams` hook here to access
  // the space id
  let { id } = useParams();
  console.log(id);

  return <Game />;
}

export default App;

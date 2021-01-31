import React, { useState } from "react";
import Phaser from "phaser";
import { Game } from "./game";
import ChatLobby from "./components/ChatLobby";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  useParams,
} from "react-router-dom";
import "./App.css";
import "./App.css";
import Login from "./Login/LoginFunctions";
import GoogleLogin from "./Login/Google-Login";

// function App() {
//   return (
//     <div className='App'>
//       <Router>
//         <Switch>
//           <Route exact path='/'>
//             <Home />
//           </Route>
//           <Route exact path='/chat' component={ChatLobby} />
//           <Route exact path='/space/:id'>
//             <Space />
//           </Route>
//         </Switch>
//       </Router>

function App() {
  return (
    <div className="App">
      <Login />
      <GoogleLogin />
    </div>
  );
}

// {
/* function Home() {
  // Basic Home Page
  // React Hooks
  const [spaceId, setSpaceId] = useState('');
  return (
    <div>
      <input
        value={spaceId}
        onChange={(event) => setSpaceId(event.target.value)}
      />
      <Link to={`/space/${spaceId}`}>Go to space</Link>
    </div>
  );
} */
// }

// function Space() {
//   // We can use the `useParams` hook here to access
//   // the space id
//   let { id } = useParams();
//   return <Game spaceId={id} />;
// }

export default App;

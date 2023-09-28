import SignIn from "./SignIn";
import SignUp from "./SignUp";
import Home from "./Home";
import ProfilePage from "./ProfilePage"
import {useState} from 'react';

import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';

import ToolBar from "./ToolBar.js";

function App() {



  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState(null);
  const [following, setFollowing] = useState();


  console.log(`User: ${JSON.stringify(user)}`)
  console.log(`Posts ${JSON.stringify(posts)}`)
  console.log(`Following: ${following}`)



  return (
    <div className="App">

      <Router>
        <Routes>  
           <Route path="/signin" element={<SignIn/>}/>
           <Route path="/signup" element={<SignUp/>}/>
           <Route path="/" element={<><ToolBar setUser={setUser} setPosts={setPosts} setFollowing={setFollowing}/><Home/></>}/>
           <Route path="/profile" element={<><ToolBar setUser={setUser} setPosts={setPosts} setFollowing={setFollowing}/><ProfilePage/></>}/>
        </Routes>
      </Router>
    </div>
  );
}

export default App;

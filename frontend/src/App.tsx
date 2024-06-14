import { Routes, Route, useLocation } from "react-router-dom"
import Auth from "./Components/Authentication/Auth"
import Signin from "./Components/Authentication/Signin"
import HomePage from "./Components/Subscription/HomePage";
import useAuth from "./Components/Subscription/Home";
import Signup_otp from "./Components/Authentication/Signup_otp";


function App() {
  const location = useLocation();
  const isAuthenticated = useAuth();

  if (isAuthenticated === null) {
    // Render a loading indicator while checking authentication
    return <div>Loading...</div>;
  }
  return (
    <>
      {location.pathname == '/signin' || location.pathname == '/signup_otp' || location.pathname == '/signup_otp/credential' ? <Auth /> : ""}
      <Routes>
        <Route path="/*" element={<HomePage />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/Signup_otp/*" element={<Signup_otp />} />
      </Routes>
    </>
  )
}

export default App;

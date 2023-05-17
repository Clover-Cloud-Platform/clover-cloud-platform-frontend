// Importing necessary modules and components
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import {BrowserRouter as Router, Route, Routes} from "react-router-dom";
import Workspace from "./Components/Workspace";
import SignUp from "./Components/SignUp";
import SignIn from "./Components/SignIn";
import Instances from "./Components/Instances";
import NotFound from "./Components/NotFound";
import Action from "./Components/Action";
import ResetPassword from "./Components/ResetPassword";

// Importing firebase modules and initializing app with firebaseConfig
import {initializeApp} from "firebase/app";
import {getAnalytics} from "firebase/analytics";
import {getPerformance} from "firebase/performance";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: "clover-cloud-platform",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase and get performance
const app = initializeApp(firebaseConfig);
getPerformance(app);

// Rendering components through React router and ReactDOM
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <Router>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/clover" element={<Workspace />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/instances" element={<Instances />} />
      <Route path="/action" element={<Action />} />
      <Route path="/reset" element={<ResetPassword />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </Router>,
);

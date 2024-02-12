// App.js
import React, { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import PrivateRoutes from "./AdminPages/PrivateRoutes";
import AdminPanel from "./AdminPages/AdminPanel";
import School from "./AdminPages/School";
import Competitor from "./AdminPages/Competitor";
import Season from "./AdminPages/Season";
import CompetitionDay from "./AdminPages/CompetitionDay";
import Stages from "./AdminPages/Stages";
import Groups from "./AdminPages/Groups";
import Carts from "./AdminPages/Cart";
import Results from "./AdminPages/Results";
import LogIn from "./Pages/LogIn";
import Home from "./Pages/Home";
import Footer from "./components/Footer";
import NavBar from "./components/Navbar";
import { useAuth } from "./context/AuthProvider";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import 'bootstrap/dist/css/bootstrap.min.css';

export const globalUrl = {
    // url: 'https://resultsgsf.pythonanywhere.com'
    // url: 'http://localhost:8000'
    url: 'https://gsfresults-73ba263a2fd8.herokuapp.com'
};


export const notifyError = (text) => {
  toast.error(text, {
    position: toast.POSITION.TOP_RIGHT,
    autoClose: 3000
  });
};

export const notifySuccess = (text) => {
  toast.success(text, {
    position: toast.POSITION.TOP_RIGHT,
    autoClose: 3000
  });
};


function App() {
  const { isAuthenticated, setAuthenticated} = useAuth();
  useEffect(()=>{
   const tok = localStorage.getItem("token",);
    if(tok){
    setAuthenticated(true)
  }
  },[])
  
  toast.configure();

  return (
    <>
      <NavBar />
      <Routes>
        <Route element={<PrivateRoutes />}>
          <Route path="/admin" element={<Home />} />
          <Route path="/schools" element={<School />} />
          <Route path="/competitors" element={<Competitor />} />
          <Route path="/seasons" element={<Season />} />
          <Route path="/competitionDay" element={<CompetitionDay />} />
          <Route path="/stages" element={<Stages />} />
          <Route path="/groups" element={<Groups />} />
          <Route path="/cart" element={<Carts />} />
          <Route path="/results" element={<Results />} />
        </Route>
        <Route path="/login" element={<LogIn />} />
        <Route path="/" element={<Home />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;
import React from "react";
import { useAuth } from "../context/AuthProvider";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import myImage from '../Pages/Assets/GSF-Logo.png';

const NavBar = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const logOut = async () => {
    await logout();
    navigate("/");
  };
  if (isAuthenticated == true){
    return(
      <div className="navbar">
        <div className="logoDiv">
          <Link to="/admin">
            <img src={myImage} alt="Logo" className="gsfLogo" />
          </Link>
        </div>
        <div className="logoDiv">
          <Link to="/schools">
              <a className="loginLink">Schools</a>
          </Link>
        </div>
        <div className="logoDiv">
          <Link to="/competitors">
              <a className="loginLink">Competitors</a>
          </Link>
        </div>
        <div className="logoDiv">
          <Link to="/seasons">
              <a className="loginLink">Seasons</a>
          </Link>
        </div>
        <div className="logoDiv">
          <Link to="/disciplines">
              <a className="loginLink">Discipline</a>
          </Link>
        </div>
        <div className="logoDiv">
          <Link to="/stages">
              <a className="loginLink">Stages</a>
          </Link>
        </div>
        <div className="logoDiv">
          <Link to="/groups">
              <a className="loginLink">Groups</a>
          </Link>
        </div>
        <div className="logoDiv">
          <Link to="/cart">
              <a className="loginLink">Cart</a>
          </Link>
        </div>
        <div className="logoDiv">
          <Link to="/results">
              <a className="loginLink">Results</a>
          </Link>
        </div>
        <div className="linkDiv">
          <a className="loginLink" id="logout" onClick={logOut}>
            Logout
          </a>
        </div>
      </div>
    )
  }else{
    return(
      <div className="navbar">
        <div className="logoDiv">
          <Link to="/">
            <img src={myImage} alt="Logo" className="gsfLogo" />
          </Link>
        </div>
        <div className="linkDiv">
          <Link className="loginLink" to="/login">
            Login
          </Link>
        </div>
      </div>
    )
  }
};

export default NavBar;
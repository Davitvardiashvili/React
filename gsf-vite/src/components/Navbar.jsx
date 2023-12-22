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
          <Link className="loginLink" to="/schools">
              Schools
          </Link>
        </div>
        <div className="logoDiv">
          <Link className="loginLink"to="/competitors">
              Competitors
          </Link>
        </div>
        <div className="logoDiv">
          <Link className="loginLink" to="/seasons">
              Seasons
          </Link>
        </div>

        <div className="logoDiv">
          <Link className="loginLink" to="/stages">
              Stages
          </Link>
        </div>
        <div className="logoDiv">
          <Link className="loginLink" to="/competitionDay">
              Competition
          </Link>
        </div>
        <div className="logoDiv">
          <Link className="loginLink" to="/groups">
              Groups
          </Link>
        </div>
        <div className="logoDiv">
          <Link className="loginLink" to="/cart">
              Cart
          </Link>
        </div>
        <div className="logoDiv">
          <Link className="loginLink" to="/results">
              Results
          </Link>
        </div>
        <div className="linkDiv">
          <div className="loginLink"  id="logout" onClick={logOut}>
            Logout
          </div>
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
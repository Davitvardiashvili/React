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
  if (isAuthenticated) {
    return (
      <nav className="navbar navbar-expand-lg navbar-light bg-light" style={{ paddingLeft: 20, marginBottom: 40 }}>
        <Link className="navbar-brand" to="/admin">
          <img src={myImage} alt="Logo" style={{ width: '64px' }} />
        </Link>
        <div className="collapse navbar-collapse">
          <ul className="navbar-nav mr-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/schools">სკოლები</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/competitors">სპორტსმენები</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/seasons">სეზონები</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/stages">ეტაპები</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/competitionDay">შეჯიბრებები</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/groups">ჯგუფები</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/cart">კალათა</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/results">შედეგები</Link>
            </li>
          </ul>
          <ul className="navbar-nav ml-auto" style={{marginLeft: 'auto', marginRight: 20}}>
            <li className="nav-item">
              <div className="nav-link" id="logout" onClick={logOut}>გასვლა</div>
            </li>
          </ul>
        </div>

      </nav>
    )
  } else {
    return (
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <Link className="navbar-brand" to="/">
          <img src={myImage} alt="Logo" style={{ width: '30px', height: '30px' }} />
        </Link>
        <div className="collapse navbar-collapse">
          <ul className="navbar-nav ml-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/login">Login</Link>
            </li>
          </ul>
        </div>
      </nav>
    )
  }
};

export default NavBar;
import React from "react";
import { useAuth } from "../context/AuthProvider";
import { Link } from "react-router-dom";
import { NavLink } from "react-router-dom"; // Import NavLink
import { useNavigate } from "react-router-dom";
import myImage from '../Pages/Assets/GSF-Logo.png';

const NavBar = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const logOut = async () => {
    await logout();
    navigate("/");
  };

  const getNavLinkClass = isActive => {
    return isActive ? "nav-link active-link" : "nav-link";
  };
  if (isAuthenticated) {
    return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container-fluid">
        {/* Logo */}
        <Link className="navbar-brand" to={isAuthenticated ? "/admin" : "/"}>
          <img src={myImage} alt="Logo" style={{ width: '75px' }} />
        </Link>

        {/* Toggler/Collapsible Button */}
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Navbar links */}
        <div className="collapse navbar-collapse justify-content-center" id="navbarNav">
          {isAuthenticated && (
            <ul className="navbar-nav">
              <li className="nav-item"><NavLink className={({ isActive }) => getNavLinkClass(isActive)} to="/schools">სკოლები</NavLink></li>
              <li className="nav-item"><NavLink className={({ isActive }) => getNavLinkClass(isActive)} to="/competitors">სპორტსმენები</NavLink></li>
              <li className="nav-item"><NavLink className={({ isActive }) => getNavLinkClass(isActive)} to="/seasons">სეზონები</NavLink></li>
              <li className="nav-item"><NavLink className={({ isActive }) => getNavLinkClass(isActive)} to="/stages">ეტაპები</NavLink></li>
              <li className="nav-item"><NavLink className={({ isActive }) => getNavLinkClass(isActive)} to="/competitionDay">შეჯიბრებები</NavLink></li>
              <li className="nav-item"><NavLink className={({ isActive }) => getNavLinkClass(isActive)} to="/groups">ჯგუფები</NavLink></li>
              <li className="nav-item"><NavLink className={({ isActive }) => getNavLinkClass(isActive)} to="/cart">კალათა</NavLink></li>
              <li className="nav-item"><NavLink className={({ isActive }) => getNavLinkClass(isActive)} to="/results">შედეგები</NavLink></li>
            </ul>
          )}
        </div>

        {/* Logout */}
        {isAuthenticated && (
          <ul className="navbar-nav ml-auto">
            <li className="nav-item">
              <div className="nav-link" style={{ cursor: 'pointer' }} onClick={logOut}>გასვლა</div>
            </li>
          </ul>
        )}
      </div>
    </nav>
    )
  }else {
    return (
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <Link className="navbar-brand" to="/">
          <img src={myImage} alt="Logo" style={{ width: '75px' }} />
        </Link>
        <div className="collapse navbar-collapse">
          <ul className="navbar-nav ml-auto" style={{marginLeft: 'auto'}}>
            <li className="nav-item">
              <NavLink className={({ isActive }) => getNavLinkClass(isActive)} to="/login">შესვლა</NavLink>
            </li>
          </ul>
        </div>
      </nav>
    )
  }
};

export default NavBar;
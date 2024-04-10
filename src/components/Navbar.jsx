import React from "react";
import { useAuth } from "../context/AuthProvider";
import { Link } from "react-router-dom";
import { NavLink } from "react-router-dom"; // Import NavLink
import { useNavigate } from "react-router-dom";
import myImage from '../Pages/Assets/GSF-Logo.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSchoolFlag, faCalendar, faPersonSkiing, faMountain, faBarsStaggered, faPeopleGroup, faStopwatch,faDice, faArrowRightFromBracket } from '@fortawesome/free-solid-svg-icons';
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
              <li className="nav-item"><NavLink className={({ isActive }) => getNavLinkClass(isActive)} to="/schools">
              <FontAwesomeIcon icon={faSchoolFlag} className="me-2" />    
                სკოლები</NavLink></li>
              <li className="nav-item"><NavLink className={({ isActive }) => getNavLinkClass(isActive)} to="/competitors">
              <FontAwesomeIcon icon={faPersonSkiing} className="me-2" />    
                სპორტსმენები</NavLink></li>
              <li className="nav-item"><NavLink className={({ isActive }) => getNavLinkClass(isActive)} to="/seasons">
              <FontAwesomeIcon icon={faMountain} className="me-2" />    

                სეზონები</NavLink></li>
              <li className="nav-item"><NavLink className={({ isActive }) => getNavLinkClass(isActive)} to="/stages">
              <FontAwesomeIcon icon={faBarsStaggered} className="me-2" />    
                ეტაპები</NavLink></li>
              <li className="nav-item"><NavLink className={({ isActive }) => getNavLinkClass(isActive)} to="/competitionDay">
              <FontAwesomeIcon icon={faCalendar} className="me-2" />    
                შეჯიბრებები</NavLink></li>
              <li className="nav-item"><NavLink className={({ isActive }) => getNavLinkClass(isActive)} to="/groups">
              <FontAwesomeIcon icon={faPeopleGroup} className="me-2" />    
                ჯგუფები</NavLink></li>
              <li className="nav-item"><NavLink className={({ isActive }) => getNavLinkClass(isActive)} to="/cart">
              <FontAwesomeIcon icon={faDice} className="me-2" />    
                კალათა</NavLink></li>
              <li className="nav-item"><NavLink className={({ isActive }) => getNavLinkClass(isActive)} to="/results">
              <FontAwesomeIcon icon={faStopwatch} className="me-2" />    
                შედეგები</NavLink></li>
            </ul>
          )}
        </div>

        {/* Logout */}
        {isAuthenticated && (
          <ul className="navbar-nav">
            <li className="nav-item">
              <div className="nav-link" style={{ cursor: 'pointer' }} onClick={logOut}>გასვლა
              <FontAwesomeIcon icon={faArrowRightFromBracket} className="ms-2" />    
              </div>
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
          <ul className="navbar-nav ms-auto">
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
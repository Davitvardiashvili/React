import React from "react";
import { useAuth } from "../context/AuthProvider";
import { Link, NavLink, useNavigate } from "react-router-dom";
import myImage from '../Pages/Assets/GSF-Logo.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSchoolFlag, 
  faCalendar, 
  faPersonSkiing, 
  faMountain, 
  faBarsStaggered, 
  faPeopleGroup, 
  faStopwatch,
  faDice, 
  faArrowRightFromBracket 
} from '@fortawesome/free-solid-svg-icons';

const NavBar = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const logOut = async () => {
    await logout();
    navigate("/");
  };

  // Helper to set active link style
  const getNavLinkClass = (isActive) => {
    return isActive ? "nav-link active-link" : "nav-link";
  };

  return (
    <>
      {/* TOP NAV: Only Login / Logout */}
      <nav className="navbar top-nav py-2">
        <div className="container-fluid d-flex justify-content-end">
          {isAuthenticated ? (
            <div
              className="nav-link text-white"
              style={{ cursor: 'pointer', fontSize: 12, padding:'0.5rem' }}
              onClick={logOut}
            >
              Logout
              <FontAwesomeIcon icon={faArrowRightFromBracket} className="ms-2" />
            </div>
          ) : (
            <NavLink
              className={({ isActive }) => getNavLinkClass(isActive)}
              style={{ color: 'white', fontSize: 12, padding:'0.5rem' }}
              to="/login"
            >
              Login
            </NavLink>
          )}
        </div>
      </nav>

      {/* BOTTOM NAV: Logo on the left, links on the right */}
      <nav className="navbar navbar-expand-lg bottom-nav">
        <div className="container-fluid">
          {/* LOGO on the left */}
          <Link className="" to={isAuthenticated ? "/admin" : "/"}>
            <img src={myImage} alt="Logo" style={{ width: '80px' }} />
          </Link>

          {/* Toggler for small screens */}
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarPages"
            aria-controls="navbarPages"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon" />
          </button>

          {/* Collapsible area with page links, aligned to the right */}
          <div className="collapse navbar-collapse justify-content-end" id="navbarPages">
            {isAuthenticated && (
              <ul className="navbar-nav">
                <li className="nav-item">
                  <NavLink
                    className={({ isActive }) => getNavLinkClass(isActive)}
                    to="/schools"
                  >
                    <FontAwesomeIcon icon={faSchoolFlag} className="me-2" />
                    Schools
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    className={({ isActive }) => getNavLinkClass(isActive)}
                    to="/competitors"
                  >
                    <FontAwesomeIcon icon={faPersonSkiing} className="me-2" />
                    Athlets
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    className={({ isActive }) => getNavLinkClass(isActive)}
                    to="/seasons"
                  >
                    <FontAwesomeIcon icon={faMountain} className="me-2" />
                    Seasons
                  </NavLink>
                </li>

                <li className="nav-item">
                  <NavLink
                    className={({ isActive }) => getNavLinkClass(isActive)}
                    to="/groups"
                  >
                    <FontAwesomeIcon icon={faPeopleGroup} className="me-2" />
                    Age Groups
                  </NavLink>
                </li>

                <li className="nav-item">
                  <NavLink
                    className={({ isActive }) => getNavLinkClass(isActive)}
                    to="/stages"
                  >
                    <FontAwesomeIcon icon={faBarsStaggered} className="me-2" />
                    Stages
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    className={({ isActive }) => getNavLinkClass(isActive)}
                    to="/competitionDay"
                  >
                    <FontAwesomeIcon icon={faCalendar} className="me-2" />
                    Competition Day
                  </NavLink>
                </li>

                <li className="nav-item">
                  <NavLink
                    className={({ isActive }) => getNavLinkClass(isActive)}
                    to="/cart"
                  >
                    <FontAwesomeIcon icon={faDice} className="me-2" />
                    Registration
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    className={({ isActive }) => getNavLinkClass(isActive)}
                    to="/results"
                  >
                    <FontAwesomeIcon icon={faStopwatch} className="me-2" />
                    Results
                  </NavLink>
                </li>
              </ul>
            )}
          </div>
        </div>
      </nav>
    </>
  );
};

export default NavBar;

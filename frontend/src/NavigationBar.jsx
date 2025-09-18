import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./NavigationBar.css";
import logo from "./assets/gobearlogo.png";
import { IoSettingsOutline, IoSettings } from "react-icons/io5";
import firebaseApp from "./Firebase.js";
import { getAuth, signOut } from "firebase/auth";

function NavigationBar() {
  const location = useLocation(); 
  const [activeIndex, setActiveIndex] = useState(0);
  const itemRefs = useRef([]);
  const lineRef = useRef(null);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();
  const previousPathRef = useRef(null);

  useEffect(() => {
    const activeEl = itemRefs.current[activeIndex];
    if (activeEl && lineRef.current) {
      const link = activeEl.querySelector("a");
      const { offsetTop, offsetHeight, offsetLeft, offsetWidth } = link;

      lineRef.current.style.top = `${offsetTop}px`;
      lineRef.current.style.left = `0px`;
      lineRef.current.style.width = `100%`;
      lineRef.current.style.height = `3px`;
    }
  }, [activeIndex]);

  const handleClick = (index) => {
    setActiveIndex(index);
  };

  const auth = getAuth(firebaseApp);
  const [error, setError] = useState(null);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="navbar-container">
      <div className="navbar-header">
        <div
          className="navbar-bg"
          onClick={() => {
            setActiveIndex(0);
            navigate("/dashboard");
          }}
          style={{ cursor: "pointer" }}
        >
          <img src={logo} alt="Go Bear Logo" className="logo" />
        </div>
      </div>

      <nav className="navbar-nav">
        <ul>
          {["Dashboard", "Teams", "Friends", "Tasks", "Rewards", "Chat"].map(
            (label, index) => {
              const path = `/${label.toLowerCase()}`;
              const isActive = location.pathname === path;

              return (
                <li key={index} ref={(el) => (itemRefs.current[index] = el)}>
                  <Link
                    to={path}
                    className={isActive ? "active-link" : ""}
                    onClick={() => handleClick(index)}
                  >
                    {label}
                    {isActive && (
                      <span ref={lineRef} className="underline-line"></span>
                    )}
                  </Link>
                </li>
              );
            }
          )}
          <a
            href="#logout"
            className={location.pathname === "/logout" ? "active-link" : ""}
            onClick={(e) => {
              e.preventDefault();
              handleLogout();
            }}
          >
            Logout
          </a>
        </ul>
      </nav>

      <div
        className="navbar-footer"
        onClick={() => {
          if (location.pathname === "/settings") {
            navigate(previousPathRef.current || "/dashboard");
          } else {
            previousPathRef.current = location.pathname;
            navigate("/settings");
            setActiveIndex(-1);
          }
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {(location.pathname === "/settings" && hovered) ||
        (location.pathname !== "/settings" && !hovered) ? (
          <IoSettingsOutline size={45} color="#F3E7D3" />
        ) : (
          <IoSettings size={45} color="#F3E7D3" />
        )}
      </div>
    </div>
  );
}

export default NavigationBar;

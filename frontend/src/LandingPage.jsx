import React from "react";
import styles from "./LandingPage.module.css";
import { useNavigate } from "react-router-dom";
import logo from "./assets/gobearlogo.png";
import logoHead from "./assets/GoBearHead.png";

function LandingPage() {
  const navigate = useNavigate();
  return (
    <div className={styles.landingCont}>
      <nav className={styles.nav}>
        <div className={styles.navLeft}>
          <img src={logo} alt="Go Bear Logo" className={styles.navLogo} />
        </div>
        <div className={styles.navCenter}>
          <ul>
            <li>
              <a href="https://gobear.me" target="_blank" rel="noreferrer">
                About Go Bear
              </a>
            </li>
          </ul>
        </div>
        <div className={styles.navRight}>
          <button
            onClick={() => navigate("/login")}
            className={styles.loginBtn}
          >
            Sign In
          </button>
          <button
            onClick={() => navigate("/signup")}
            className={styles.signupBtn}
          >
            Sign Up
          </button>
        </div>
      </nav>
      <div className={styles.landingBody}>
        <img src={logoHead} alt="Go Bear Head" className={styles.bodyLogo} />
        <div className={styles.bodyTitle}>
          <h1>Go bear AUT Research and Development Project</h1>
        </div>
        <div className={styles.cta}>
          <p>
            Join the Go Bear AI Project, where underdogs turn into trailblazers.
            Harness AI to land your dream role faster, smarter, and with
            confidence.
          </p>
        </div>
        <div className={styles.ctaBtns}>
          <button
            onClick={() => navigate("/login")}
            className={styles.loginBtn}
          >
            Sign In
          </button>
          <button
            onClick={() => navigate("/signup")}
            className={styles.signupBtn}
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;

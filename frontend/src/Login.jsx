import React from "react";
import firebaseApp from "./Firebase.js";
import styles from "./Login.module.css";
import logo from "./assets/gobearlogo.png";
import googleicon from "./assets/Google Icon.png";
import githubicon from "./assets/GitHub Icon.png";
import linkedinicon from "./assets/LinkedIn Icon.png";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "./Firebase";
function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
    } catch (error) {
      let message = error.message;
      if (error.code === "auth/invalid-credential") {
        message = `Incorrect Password or Email`;
      }
      alert(message);
    }
  };
  return (
    <div className={styles.loginBody}>
      <img src={logo} alt="GoBear Logo" className={styles.titleLogo} />{" "}
      <div className={styles.formCont}>
        <h1>Login</h1>
        <form onSubmit={handleLogin}>
          <label htmlFor="email">Email</label>{" "}
          <input
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className={styles.loginInputEmail}
          />
          <label htmlFor="pword">Password</label>{" "}
          <input
            type="password"
            name="pword"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={styles.loginInput}
          />
          <p className={styles.forgotPass}>
            <a href="./Resetpass">Forgot Password?</a>
          </p>{" "}
          <button type="submit" className={styles.loginBtn}>
            Sign In
          </button>
          {error && <p className="error">{error}</p>}
        </form>
        <p className={styles.continuePara}>or continue with</p>
        <div className={styles.socialIconsCont}>
          {" "}
          <img
            src={googleicon}
            alt="Continue with Google"
            className={styles.socialIcons}
          />{" "}
          <img
            src={githubicon}
            alt="Continue with GitHub"
            className={styles.socialIcons}
          />{" "}
          <img
            src={linkedinicon}
            alt="Continue with LinkedIn"
            className={styles.socialIcons}
          />{" "}
        </div>
        <p className={styles.accountPara}>Don't have an account?</p>{" "}
        <button
          onClick={() => navigate("/signup")}
          className={styles.signupBtn}
        >
          Sign Up{" "}
        </button>
      </div>{" "}
    </div>
  );
}
export default Login;

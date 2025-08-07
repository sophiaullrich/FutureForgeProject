import React from "react";
import firebaseApp from "./Firebase.js";
import "./Login.css";
import logo from "./assets/gobearlogo.png";
import googleicon from "./assets/Google Icon.png";
import githubicon from "./assets/GitHub Icon.png";
import linkedinicon from "./assets/LinkedIn Icon.png";
import {
  getAuth,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const auth = getAuth(firebaseApp);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch (error) {
      let message = error.message;

      if (error.code === "auth/invalid-credential") {
        message = `Incorrect Password or Email`;
      }
      alert(message);
    }
  };

  return (
    <div id="body">
      <div id="title-cont">
        <img src={logo} alt="GoBear Logo" />
      </div>

      <div id="form-cont">
        <h1>Login</h1>
        <form onSubmit={handleLogin}>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
          />
          <br />
          <label htmlFor="pword">Password:</label>
          <input
            type="password"
            id="pword"
            name="pword"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <br />
          <input type="submit" value="Login" />
          {error && <p className="error">{error}</p>}
        </form>

        <a href="./Resetpass">Forgot Password?</a>

        <p>or continue with</p>
        <img src={googleicon} alt="Continue with Google" />
        <img src={githubicon} alt="Continue with GitHub" />
        <img src={linkedinicon} alt="Continue with LinkedIn" />
        <br />

        <p>Don't have an account?</p>
        <a href="./Signup" className="button-link">
          Sign Up
        </a>
      </div>
    </div>
  );
}

export default Login;

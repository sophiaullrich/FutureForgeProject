import React from "react";
import "./Login.css";
import logo from "./assets/gobearlogo.png";
import googleicon from "./assets/Google Icon.png";
import githubicon from "./assets/GitHub Icon.png";
import linkedinicon from "./assets/LinkedIn Icon.png";

const Login = () => (
  <div id="body">
    <div id="title-cont">
      <img src={logo} alt="GoBear Logo" />
    </div>

    <div id="form-cont">
      <h1>Login</h1>
      <form>
        <label for="email">Email:</label>
        <input
          type="email"
          id="email"
          name="email"
          placeholder="Email"
          required
        />
        <br />
        <label for="pword">Password:</label>
        <input
          type="password"
          id="pword"
          name="pword"
          placeholder="Password"
          required
        />
        <br />
        <input type="submit" value="Sign In" />
      </form>

      <a href="./Resetpass">Forgot Password?</a>

      <p>or continue with</p>
      <img src={googleicon} alt="Continue with Google" />
      <img src={githubicon} alt="Continue with GitHub" />
      <img src={linkedinicon} alt="Continue with LinkedIn" />
      <br />

      <p>Don't have an account?</p>
      <a href="./Signup" class="button-link">
        Sign Up
      </a>
    </div>
  </div>
);

export default Login;

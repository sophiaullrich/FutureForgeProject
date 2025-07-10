import React from "react";
import "./Signup.css";
import logo from "./assets/gobearlogo.png";

const Signup = () => (
  <div id="body">
    <div id="title-cont">
      <img src={logo} alt="GoBear Logo" />
    </div>

    <div id="form-cont">
      <h1>Sign Up</h1>
      <form>
        <label for="fname">Firstname:</label>
        <input
          type="text"
          id="fname"
          name="fname"
          placeholder="First Name"
          required
        />
        <br />
        <label for="lname">Last Name:</label>
        <input
          type="text"
          id="lname"
          name="lname"
          placeholder="Last Name"
          required
        />
        <br />
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
        <label for="pword2">Password:</label>
        <input
          type="password"
          id="pword2"
          name="pword2"
          placeholder="Confirm Password"
          required
        />
        <br />
        <input type="submit" value="Sign Up" />
      </form>

      <a href="./Login" class="button-link">
        Back To Login
      </a>
    </div>
  </div>
);

export default Signup;

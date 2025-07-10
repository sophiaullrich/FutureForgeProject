import React from "react";
import "./Resetpass.css";
import logo from "./assets/gobearlogo.png";

const Resetpass = () => (
  <div id="body">
    <div id="title-cont">
      <img src={logo} alt="GoBear Logo" />
    </div>

    <div id="form-cont">
      <h1>Forgot Password</h1>
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
        <input type="submit" value="Send Email" />
      </form>

      <a href="./Login" class="button-link">
        Cancel
      </a>
    </div>
  </div>
);

export default Resetpass;

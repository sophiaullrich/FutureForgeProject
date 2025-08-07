import React, { use } from "react";
import "./Resetpass.css";
import logo from "./assets/gobearlogo.png";
import firebaseApp from "./Firebase.js";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Resetpass() {
  const auth = getAuth(firebaseApp);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      await sendPasswordResetEmail(auth, email);
      navigate("/login");
      alert(
        "If an account with that email exists, a password reset email has been sent."
      );
    } catch (error) {
      alert(
        "If an account with that email exists, a password reset email has been sent."
      );
    }
  };

  return (
    <div id="body">
      <div id="title-cont">
        <img src={logo} alt="GoBear Logo" />
      </div>

      <div id="form-cont">
        <h1>Forgot Password</h1>
        <form onSubmit={handleResetPassword}>
          <label for="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
}

export default Resetpass;

import React from "react";
import firebaseApp from "./Firebase.js";
import "./Signup.css";
import logo from "./assets/GoBearLogo.png";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getDatabase, ref, set } from "firebase/database";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Signup() {
  const auth = getAuth(firebaseApp);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error] = useState(null);
  const navigate = useNavigate();

  const handleSignup = (e) => {
    e.preventDefault();
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        const db = getDatabase();
        set(ref(db, "users/" + user.uid), {
          email: user.email,
          firstName: firstName,
          lastName: lastName,
        });
        navigate("/Login");
      })
      .catch((error) => {
        let message = error.message;

        if (error.code === "auth/password-does-not-meet-requirements") {
          message = `Your password must:
   - Be at least 6 characters long
   - Include at least one uppercase letter
   - Include at least one number
   - Include at least one special character (e.g. !@#$%)`;
        }
        alert(message);
      });
  };

  return (
    <div id="body">
      <div id="title-cont">
        <img src={logo} alt="GoBear Logo" />
      </div>

      <div id="form-cont">
        <h1>Sign Up</h1>
        <form onSubmit={handleSignup}>
          <label htmlFor="fname">Firstname:</label>
          <input
            type="text"
            id="fname"
            name="fname"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
          <br />
          <label htmlFor="lname">Last Name:</label>
          <input
            type="text"
            id="lname"
            name="lname"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
          <br />
          <label htmlFor="email">Email:</label>
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
          <label htmlFor="pword2">Password:</label>
          <input
            type="password"
            id="pword2"
            name="pword2"
            placeholder="Confirm Password"
            required
          />
          <br />
          <input type="submit" value="Sign Up" />
          {error && <p className="error">{error}</p>}
        </form>

        <a href="./Login" className="button-link">
          Back To Login
        </a>
      </div>
    </div>
  );
}

export default Signup;

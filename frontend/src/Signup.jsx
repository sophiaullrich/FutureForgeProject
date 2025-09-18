import React from "react";
import firebaseApp from "./Firebase.js";
import styles from"./Signup.module.css";
import logo from "./assets/gobearlogo.png";
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
    <div className={styles.signupBody}>
      <div className={styles.titleCont}>
        <img src={logo} alt="GoBear Logo" />
      </div>

      <div className={styles.formCont}>
        <h1>Sign Up</h1>
        <form onSubmit={handleSignup}>
          <label htmlFor="fname" className={styles.formLabel}>Firstname</label>
          <input
            type="text"
            id="fname"
            name="fname"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            className={styles.formInput}
          />
          <label htmlFor="lname" className={styles.formLabel}>Last Name</label>
          <input
            type="text"
            id="lname"
            name="lname"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            className={styles.formInput}
          />
          <label htmlFor="email" className={styles.formLabel}>Email</label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={styles.formInput}
          />
          <label htmlFor="pword" className={styles.formLabel}>Password</label>
          <input
            type="password"
            id="pword"
            name="pword"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={styles.formInput}
          />
          <label htmlFor="pword2" className={styles.formLabel}>Confirm Password</label>
          <input
            type="password"
            id="pword2"
            name="pword2"
            placeholder="Confirm Password"
            required
            className={styles.formInput}
          />
          <button type="submit" className={styles.signupBtn}>Sign Up</button>
          {error && <p className="error">{error}</p>}
        </form>

        <button onClick={() => navigate("/login")} className={styles.backBtn}>Back To Login</button>
      </div>
    </div>
  );
}

export default Signup;

import React, { use } from "react";
import styles from"./Resetpass.module.css";
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
    <div className={styles.resetBody}>
      <div className={styles.titleCont}>
        <img src={logo} alt="GoBear Logo" />
      </div>

      <div className={styles.formCont}>
        <h1>Forgot Password</h1>
        <form onSubmit={handleResetPassword}>
          <label for="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={styles.emailInput}
          />
          <br />
          <button type="submit" className={styles.resetBtn}>Send Email</button>
        </form>
        <button onClick={() => navigate("/login")} className={styles.cancelBtn}>Cancel</button>
      </div>
    </div>
  );
}

export default Resetpass;

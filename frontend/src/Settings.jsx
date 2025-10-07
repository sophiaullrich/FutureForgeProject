import React, { useEffect, useState } from "react";
import "./Settings.css";
import googleicon from "./assets/Google Icon.png";
import { db, auth } from "./Firebase";
import { getDoc, doc, updateDoc } from "firebase/firestore";
import { sendPasswordResetEmail, GoogleAuthProvider, linkWithPopup } from "firebase/auth";
import { useNavigate, useOutletContext } from "react-router-dom";
import { IoPencilSharp } from "react-icons/io5";

function Settings() {
  const { currentUser } = useOutletContext();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  const [originalDisplayName, setOriginalDisplayName] = useState("");
  const [originalFirstName, setOriginalFirstName] = useState("");
  const [originalLastName, setOriginalLastName] = useState("");

  const [isEditingDisplayName, setIsEditingDisplayName] = useState(false);
  const [isEditingFirstName, setIsEditingFirstName] = useState(false);
  const [isEditingLastName, setIsEditingLastName] = useState(false);

  const [linkedProviders, setLinkedProviders] = useState([]);

  useEffect(() => {
    if (!currentUser) return;

    setEmail(currentUser.email || "");
    setLinkedProviders(currentUser.providerData.map(p => p.providerId));

    const fetchProfile = async () => {
      try {
        const profileRef = doc(db, "profiles", currentUser.uid);
        const docSnap = await getDoc(profileRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setDisplayName(data.displayName || "");
          setFirstName(data.firstName || "");
          setLastName(data.lastName || "");
          setOriginalDisplayName(data.displayName || "");
          setOriginalFirstName(data.firstName || "");
          setOriginalLastName(data.lastName || "");
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };

    fetchProfile();
  }, [currentUser]);

  const saveProfile = async () => {
    if (!currentUser) return;
    try {
      const profileRef = doc(db, "profiles", currentUser.uid);
      await updateDoc(profileRef, { displayName, firstName, lastName });
      setOriginalDisplayName(displayName);
      setOriginalFirstName(firstName);
      setOriginalLastName(lastName);
      setIsEditingDisplayName(false);
      setIsEditingFirstName(false);
      setIsEditingLastName(false);
      alert("Profile updated!");
    } catch (err) {
      console.error(err);
      alert("Failed to update profile.");
    }
  };

  const cancelEdits = () => {
    setDisplayName(originalDisplayName);
    setFirstName(originalFirstName);
    setLastName(originalLastName);
    setIsEditingDisplayName(false);
    setIsEditingFirstName(false);
    setIsEditingLastName(false);
  };

  const linkGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await linkWithPopup(currentUser, provider);
      setLinkedProviders(currentUser.providerData.map(p => p.providerId));
      alert("Google account linked!");
    } catch (err) {
      console.error(err);
      alert("Failed to link Google account.");
    }
  };

  const isProviderLinked = (providerId) => linkedProviders.includes(providerId);

  if (!currentUser) return <div>Loading...</div>;

  return (
    <div id="body">
      <h1>Settings</h1>

      <div id="account-info">
        <h2>Account Information</h2>
        <hr />
        <div className="info-container">
          <div id="form-inputs">
            {/* Display Name */}
            <label>Display Name</label>
            {isEditingDisplayName ? (
              <div>
                <input value={displayName} onChange={e => setDisplayName(e.target.value)} />
                <div>
                  <button onClick={saveProfile} className="save-btn">Save</button>
                  <button onClick={cancelEdits} className="cancel-btn">Cancel</button>
                </div>
              </div>
            ) : (
              <p className="displayName">
                {displayName || "Loading..."}
                <IoPencilSharp className="desc-inline-icon" onClick={() => setIsEditingDisplayName(true)} />
              </p>
            )}

            {/* First Name */}
            <label>First Name</label>
            {isEditingFirstName ? (
              <div>
                <input value={firstName} onChange={e => setFirstName(e.target.value)} />
                <div>
                  <button onClick={saveProfile} className="save-btn">Save</button>
                  <button onClick={cancelEdits} className="cancel-btn">Cancel</button>
                </div>
              </div>
            ) : (
              <p className="displayName">
                {firstName || "Loading..."}
                <IoPencilSharp className="desc-inline-icon" onClick={() => setIsEditingFirstName(true)} />
              </p>
            )}

            {/* Last Name */}
            <label>Last Name</label>
            {isEditingLastName ? (
              <div>
                <input value={lastName} onChange={e => setLastName(e.target.value)} />
                <div>
                  <button onClick={saveProfile} className="save-btn">Save</button>
                  <button onClick={cancelEdits} className="cancel-btn">Cancel</button>
                </div>
              </div>
            ) : (
              <p className="displayName">
                {lastName || "Loading..."}
                <IoPencilSharp className="desc-inline-icon" onClick={() => setIsEditingLastName(true)} />
              </p>
            )}

            {/* Email */}
            <label>Email</label>
            <input value={email || "Loading..."} readOnly />

            {/* Password Reset */}
            <label>Password</label>
            <button
              className="resetBtn"
              onClick={() => {
                sendPasswordResetEmail(auth, currentUser.email);
                alert("Password reset email sent.");
                navigate("/login");
              }}
            >
              Reset Password
            </button>
          </div>

          {/* Linked Accounts */}
          <div id="linked-accounts">
            <h3>Linked Accounts</h3>
            <div className="account-row">
              <img src={googleicon} alt="Google Icon" />
              <p
                className={isProviderLinked("google.com") ? "connected-btn" : "connect-btn"}
                onClick={!isProviderLinked("google.com") ? linkGoogle : undefined}
              >
                {isProviderLinked("google.com") ? "Connected" : "Connect…"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;

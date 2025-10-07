import React, { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import "./ProfilePage.css";
import { FaGoogle, FaGithub, FaLinkedin } from "react-icons/fa";
import { IoPencilSharp, IoCloseSharp } from "react-icons/io5";

function ProfilePage() {
  const defaultImg = "/profileImages/defaultImage.png";
  const profileImages = [
    defaultImg,
    "/profileImages/profileImage2.png",
    "/profileImages/profileImage3.png",
    "/profileImages/profileImage4.png",
    "/profileImages/profileImage5.png",
    "/profileImages/profileImage6.png",
  ];

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Consolidated profile state
  const [profile, setProfile] = useState({
    displayName: "",
    firstName: "",
    lastName: "",
    photoURL: defaultImg,
    description: "",
    socials: { google: "", github: "", linkedin: "" },
    interests: [],
    careerGoals: [],
  });

  // Editing states
  const [editing, setEditing] = useState({
    description: false,
    socials: false,
    interests: false,
    careerGoals: false,
  });

  const [temp, setTemp] = useState({
    description: "",
    socials: { google: "", github: "", linkedin: "" },
    interests: [],
    newInterest: "",
    careerGoalsText: "",
  });

  const [showImageSelector, setShowImageSelector] = useState(false);
  const [isHoveringGoals, setIsHoveringGoals] = useState(false);
  const [isHoveringSocials, setIsHoveringSocials] = useState(false);

  // Firebase Auth listener
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Fetch profile from backend
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const token = await user.getIdToken();
        const res = await fetch("http://localhost:5001/api/profile/me", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        setProfile({
          displayName: data.displayName || "",
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          photoURL: data.photoURL || defaultImg,
          description: data.description || "",
          socials: data.socials || { google: "", github: "", linkedin: "" },
          interests: data.interests || [],
          careerGoals: data.careerGoals || [],
        });

        // Initialize temp editing states
        setTemp({
          description: data.description || "",
          socials: data.socials || { google: "", github: "", linkedin: "" },
          interests: data.interests || [],
          newInterest: "",
          careerGoalsText: (data.careerGoals || []).join("\n"),
        });
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  // Helper to get token
  const getToken = async () => (await getAuth().currentUser.getIdToken());

  // Generic PATCH function
  const patchProfile = async (update) => {
    try {
      const token = await getToken();
      await fetch("http://localhost:5001/api/profile/me", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(update),
      });
      setProfile((prev) => ({ ...prev, ...update }));
    } catch (err) {
      console.error("Error updating profile:", err);
    }
  };

  // Profile image
  const selectProfileImage = (img) => {
    patchProfile({ photoURL: img });
    setShowImageSelector(false);
  };

  // Description handlers
  const startEditDescription = () => setEditing({ ...editing, description: true });
  const cancelEditDescription = () => {
    setTemp({ ...temp, description: profile.description });
    setEditing({ ...editing, description: false });
  };
  const saveDescription = () => {
    patchProfile({ description: temp.description });
    setEditing({ ...editing, description: false });
  };

  // Socials handlers
  const startEditSocials = () => setEditing({ ...editing, socials: true });
  const cancelEditSocials = () => {
    setTemp({ ...temp, socials: profile.socials });
    setEditing({ ...editing, socials: false });
    setIsHoveringSocials(false);
  };
  const saveSocials = () => {
    patchProfile({ socials: temp.socials });
    setEditing({ ...editing, socials: false });
    setIsHoveringSocials(false);
  };

  // Interests handlers
  const addInterest = () => {
    const interest = temp.newInterest.trim();
    if (!interest || profile.interests.includes(interest)) return;
    const updated = [...profile.interests, interest];
    patchProfile({ interests: updated });
    setTemp({ ...temp, newInterest: "", interests: updated });
  };
  const deleteInterest = (idx) => {
    const updated = profile.interests.filter((_, i) => i !== idx);
    patchProfile({ interests: updated });
    setTemp({ ...temp, interests: updated });
  };

  // Career goals handlers
  const startEditGoals = () => {
    setTemp({ ...temp, careerGoalsText: profile.careerGoals.join("\n") });
    setEditing({ ...editing, careerGoals: true });
    setIsHoveringGoals(false);
  };
  const cancelEditGoals = () => setEditing({ ...editing, careerGoals: false });
  const saveGoals = () => {
    const updated = temp.careerGoalsText.split("\n").map((g) => g.trim()).filter(Boolean);
    patchProfile({ careerGoals: updated });
    setTemp({ ...temp, careerGoalsText: updated.join("\n") });
    setEditing({ ...editing, careerGoals: false });
  };

  if (!user) return <div>Please log in to view your profile</div>;
  if (loading) return <div>Loading profile...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="profile-page">
      <div className="top-header"><h1>My Profile</h1></div>

      <div className="profile-section">
        {/* Left - Image and Info */}
        <div className="profile-left">
          <div className="profile-img-container">
            <img src={profile.photoURL} alt="Profile" className="profile-img" />
            {!showImageSelector && <IoPencilSharp className="edit-img-btn" onClick={() => setShowImageSelector(true)} />}
            {showImageSelector && (
              <div className="profile-images-selector">
                {profileImages.map((img, idx) => (
                  <img key={idx} src={img} alt={`Profile ${idx}`} className="profile-image-option" onClick={() => selectProfileImage(img)} />
                ))}
              </div>
            )}
          </div>

          <div className="profile-info">
            <h2>{profile.displayName || `${profile.firstName} ${profile.lastName}`}</h2>
            {editing.description ? (
              <div>
                <textarea
                  value={temp.description}
                  placeholder="Write a short description..."
                  onChange={(e) => setTemp({ ...temp, description: e.target.value })}
                />
                <div className="profile-info-button-container">
                  <button onClick={saveDescription} className="save-btn">Save</button>
                  <button onClick={cancelEditDescription} className="cancel-btn">Cancel</button>
                </div>
              </div>
            ) : (
              <p className="desc-inline">
                {profile.description || "Add a description..."}
                <IoPencilSharp className="desc-inline-icon" onClick={startEditDescription} />
              </p>
            )}
          </div>
        </div>

        {/* Right - Socials */}
        <div className="social-section" onMouseEnter={() => setIsHoveringSocials(true)} onMouseLeave={() => setIsHoveringSocials(false)}>
          <div className="social-header">
            {isHoveringSocials && !editing.socials && <IoPencilSharp className="socials-edit-icon" onClick={startEditSocials} />}
            <h4>Social Accounts</h4>
          </div>

          {editing.socials ? (
            <>
              <div className="social-link">
                <FaGoogle className="icon" />
                <input type="text" value={temp.socials.google} placeholder="Gmail" onChange={(e) => setTemp({ ...temp, socials: { ...temp.socials, google: e.target.value } })} />
              </div>
              <div className="social-link">
                <FaGithub className="icon" />
                <input type="text" value={temp.socials.github} placeholder="Github" onChange={(e) => setTemp({ ...temp, socials: { ...temp.socials, github: e.target.value } })} />
              </div>
              <div className="social-link">
                <FaLinkedin className="icon" />
                <input type="text" value={temp.socials.linkedin} placeholder="Linkedin" onChange={(e) => setTemp({ ...temp, socials: { ...temp.socials, linkedin: e.target.value } })} />
              </div>
              <div className="social-buttons">
                <button onClick={saveSocials} className="save-btn">Save</button>
                <button onClick={cancelEditSocials} className="cancel-btn">Cancel</button>
              </div>
            </>
          ) : (
            <>
              <div className="social-link"><FaGoogle className="icon" /><input type="text" readOnly value={profile.socials.google} /></div>
              <div className="social-link"><FaGithub className="icon" /><input type="text" readOnly value={profile.socials.github} /></div>
              <div className="social-link"><FaLinkedin className="icon" /><input type="text" readOnly value={profile.socials.linkedin} /></div>
            </>
          )}
        </div>
      </div>

      {/* Interests */}
      <div className="interests-wrapper">
        {editing.interests ? (
          <div className="interests-edit-container">
            <div className="editable-interests">
              {profile.interests.map((interest, idx) => (
                <div key={idx} className="editable-interest-tag">
                  <span>{interest}</span>
                  <IoCloseSharp className="delete-icon" onClick={() => deleteInterest(idx)} />
                </div>
              ))}
            </div>
            <div className="add-interest-container">
              <input
                type="text"
                placeholder="Add new interest..."
                value={temp.newInterest}
                onChange={(e) => setTemp({ ...temp, newInterest: e.target.value })}
                onKeyPress={(e) => e.key === "Enter" && addInterest()}
              />
              <button onClick={addInterest}>Add</button>
              <button onClick={() => setEditing({ ...editing, interests: false })}>Save</button>
            </div>
          </div>
        ) : (
          <>
            <div className="scrollable-row interests-row">
              {profile.interests.map((interest, idx) => <div key={idx} className="interest-tag">{interest}</div>)}
            </div>
            <IoPencilSharp className="interests-edit-icon" onClick={() => setEditing({ ...editing, interests: true })} />
          </>
        )}
      </div>

      {/* Career Goals */}
      <div className="career-goals" onMouseEnter={() => setIsHoveringGoals(true)} onMouseLeave={() => setIsHoveringGoals(false)}>
        <h3>Career Goals</h3>
        {editing.careerGoals ? (
          <div className="career-goals-edit-container">
            <textarea className="editable-goals-textarea" value={temp.careerGoalsText} onChange={(e) => setTemp({ ...temp, careerGoalsText: e.target.value })} />
            <div className="career-goals-buttons">
              <button onClick={saveGoals} className="save-btn">Save</button>
              <button onClick={cancelEditGoals} className="cancel-btn">Cancel</button>
            </div>
          </div>
        ) : (
          <div className="career-goals-textbox">
            <ul>{profile.careerGoals.map((goal, idx) => <li key={idx}>{goal}</li>)}</ul>
            {isHoveringGoals && <IoPencilSharp className="edit-icon" onClick={startEditGoals} />}
          </div>
        )}
      </div>

      {/* Badges */}
      <div className="badge-box-name">{profile.displayName ? `${profile.displayName}'s Badges` : "My Badges"}</div>
      <div className="scrollable-row badges-row">{[...Array(8)].map((_, idx) => <div key={idx} className="badge-box" />)}</div>
    </div>
  );
}

export default ProfilePage;

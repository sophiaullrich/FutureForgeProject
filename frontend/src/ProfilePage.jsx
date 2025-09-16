import React, { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import "./ProfilePage.css";
import { FaGoogle, FaGithub, FaLinkedin } from "react-icons/fa";
import { IoPencilSharp, IoCloseSharp } from "react-icons/io5";

function ProfilePage() {
  const defaultImg = "/defaultImage.png";

  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [isEditingInterests, setIsEditingInterests] = useState(false);
  const [interests, setInterests] = useState(["example"]);
  const [newInterest, setNewInterest] = useState("");

  const [isEditingGoals, setIsEditingGoals] = useState(false);
  const [isHoveringGoals, setIsHoveringGoals] = useState(false);
  const [careerGoals, setCareerGoals] = useState([]);
  const [tempGoalsText, setTempGoalsText] = useState("");

  const [profileImg, setProfileImg] = useState(defaultImg);

  const [isHoveringSocials, setIsHoveringSocials] = useState(false);
  const [isEditingSocials, setIsEditingSocials] = useState(false);
  const [socials, setSocials] = useState({ google: "", github: "", linkedin: "" });

  // Fetch profile data from backend on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const auth = getAuth();
        const token = await auth.currentUser.getIdToken();

        const res = await fetch("http://localhost:5000/api/profile/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        setName(data.displayName || "");
        setDescription(data.description || "");
        setInterests(data.interests || []);
        setCareerGoals(data.careerGoals || []);
        setSocials({
          google: data.socials?.google || "",
          github: data.socials?.github || "",
          linkedin: data.socials?.linkedin || "",
        });
        setProfileImg(data.photoURL || defaultImg);
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };
    fetchProfile();
  }, []);

  // Image handlers
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) setProfileImg(URL.createObjectURL(file));
  };
  const handleImageError = () => setProfileImg(defaultImg);

  // Socials
  const handleSocialChange = (key, value) => setSocials(prev => ({ ...prev, [key]: value }));

  const handleSaveSocials = async () => {
    try {
      const auth = getAuth();
      const token = await auth.currentUser.getIdToken();

      await fetch("http://localhost:5000/api/profile/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ socials }),
      });

      setIsEditingSocials(false);
      setIsHoveringSocials(false);
    } catch (err) {
      console.error("Error saving socials:", err);
    }
  };
  
  const handleCancelSocials = () => {
    setIsEditingSocials(false);
    setIsHoveringSocials(false);
  };

  // Interests
  const handleAddInterest = async () => {
    if (!newInterest.trim() || interests.includes(newInterest.trim())) return;

    const updated = [...interests, newInterest.trim()];
    setInterests(updated);
    setNewInterest("");

    try {
      const auth = getAuth();
      const token = await auth.currentUser.getIdToken();
      await fetch("http://localhost:5000/api/profile/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ interests: updated }),
      });
    } catch (err) {
      console.error("Error updating interests:", err);
    }
  };

  const handleDeleteInterest = async (index) => {
    const updated = interests.filter((_, i) => i !== index);
    setInterests(updated);

    try {
      const auth = getAuth();
      const token = await auth.currentUser.getIdToken();
      await fetch("http://localhost:5000/api/profile/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ interests: updated }),
      });
    } catch (err) {
      console.error("Error deleting interest:", err);
    }
  };

  // Career Goals
  const handleEditGoalsClick = () => {
    setTempGoalsText(careerGoals.join("\n"));
    setIsEditingGoals(true);
    setIsHoveringGoals(false);
  };

  const handleSaveGoals = async () => {
    const updatedGoals = tempGoalsText.split("\n").map(g => g.trim()).filter(Boolean);
    setCareerGoals(updatedGoals);
    setIsEditingGoals(false);

    try {
      const auth = getAuth();
      const token = await auth.currentUser.getIdToken();
      await fetch("http://localhost:5000/api/profile/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ careerGoals: updatedGoals }),
      });
    } catch (err) {
      console.error("Error updating goals:", err);
    }
  };
  const handleCancelGoals = () => setIsEditingGoals(false);

  return (
    <div className="profile-page">
      {/* Top heading */}
      <div className="top-header">
        <h1>My Profile</h1>
      </div>

      {/* Profile section */}
      <div className="profile-section">
        {/* Left - Image and Info */}
        <div className="profile-left">
          <div className="profile-img-container">
            <img src={profileImg} alt="Profile" className="profile-img" onError={handleImageError} />
            <label htmlFor="imgUpload" className="edit-img-btn">
              <IoPencilSharp />
            </label>
            <input id="imgUpload" type="file" accept="image/*" onChange={handleImageUpload} style={{ display: "none" }} />
          </div>

          <div className="profile-info">
            <h2>{name}</h2>
            {isEditingInfo ? (
              <div>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
                <div className="profile-info-button-container">
                  <button onClick={() => setIsEditingInfo(false)}>Save</button>
                </div>
              </div>
            ) : (
              <p className="desc-inline">
                {description}
                <IoPencilSharp className="desc-inline-icon" onClick={() => setIsEditingInfo(true)} />
              </p>
            )}
          </div>
        </div>

        {/* Right - Social accounts */}
        <div className="social-section" onMouseEnter={() => setIsHoveringSocials(true)} onMouseLeave={() => setIsHoveringSocials(false)}>
          <div className="social-header">
            {isHoveringSocials && !isEditingSocials && <IoPencilSharp className="socials-edit-icon" onClick={() => setIsEditingSocials(true)} />}
            <h4>Social Accounts</h4>
          </div>

          {isEditingSocials ? (
            <>
              <div className="social-link">
                <FaGoogle className="icon" />
                <input type="text" value={socials.google} onChange={(e) => handleSocialChange("google", e.target.value)} />
              </div>
              <div className="social-link">
                <FaGithub className="icon" />
                <input type="text" value={socials.github} onChange={(e) => handleSocialChange("github", e.target.value)} />
              </div>
              <div className="social-link">
                <FaLinkedin className="icon" />
                <input type="text" value={socials.linkedin} onChange={(e) => handleSocialChange("linkedin", e.target.value)} />
              </div>
              <div className="social-buttons">
                <button onClick={handleSaveSocials} className="save-btn">Save</button>
                <button onClick={handleCancelSocials} className="cancel-btn">Cancel</button>
              </div>
            </>
          ) : (
            <>
              <div className="social-link"><FaGoogle className="icon" /><input type="text" readOnly value={socials.google} /></div>
              <div className="social-link"><FaGithub className="icon" /><input type="text" readOnly value={socials.github} /></div>
              <div className="social-link"><FaLinkedin className="icon" /><input type="text" readOnly value={socials.linkedin} /></div>
            </>
          )}
        </div>
      </div>

      {/* Interests */}
      <div className="interests-wrapper">
        {isEditingInterests ? (
          <div className="interests-edit-container">
            <div className="editable-interests">
              {interests.map((interest, index) => (
                <div key={index} className="editable-interest-tag">
                  <span>{interest}</span>
                  <IoCloseSharp className="delete-icon" onClick={() => handleDeleteInterest(index)} />
                </div>
              ))}
            </div>
            <div className="add-interest-container">
              <input
                type="text"
                placeholder="Add new interest...e.g. Cooking"
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAddInterest()}
              />
              <div><button onClick={handleAddInterest}>Add</button></div>
              <div><button onClick={() => setIsEditingInterests(false)}>Save</button></div>
            </div>
          </div>
        ) : (
          <>
            <div className="scrollable-row interests-row">
              {interests.map((interest, index) => <div key={index} className="interest-tag">{interest}</div>)}
            </div>
            <IoPencilSharp className="interests-edit-icon" onClick={() => setIsEditingInterests(true)} />
          </>
        )}
      </div>

      {/* Career Goals */}
      <div className="career-goals" onMouseEnter={() => setIsHoveringGoals(true)} onMouseLeave={() => setIsHoveringGoals(false)}>
        <h3>Career Goals</h3>
        {isEditingGoals ? (
          <div className="career-goals-edit-container">
            <textarea className="editable-goals-textarea" value={tempGoalsText} onChange={(e) => setTempGoalsText(e.target.value)} />
            <div className="career-goals-buttons">
              <button onClick={handleSaveGoals} className="save-btn">Save</button>
              <button onClick={handleCancelGoals} className="cancel-btn">Cancel</button>
            </div>
          </div>
        ) : (
          <div className="career-goals-textbox">
            <ul>{careerGoals.map((goal, idx) => <li key={idx}>{goal}</li>)}</ul>
            {isHoveringGoals && <IoPencilSharp className="edit-icon" onClick={handleEditGoalsClick} />}
          </div>
        )}
      </div>

      {/* Badges */}
      <div className="badge-box-name">{name ? `${name}'s Badges` : "My Badges"}</div>
      <div className="scrollable-row badges-row">{[...Array(8)].map((_, idx) => <div key={idx} className="badge-box" />)}</div>
    </div>
  );
}

export default ProfilePage;

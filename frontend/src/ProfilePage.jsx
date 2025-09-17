import React, { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import "./ProfilePage.css";
import { FaGoogle, FaGithub, FaLinkedin } from "react-icons/fa";
import { IoPencilSharp, IoCloseSharp } from "react-icons/io5";

function ProfilePage() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [user, setUser] = useState(null);

    // Auth listener
    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    // Fetch profile
    useEffect(() => {
        const fetchProfile = async () => {
            if (!user) {
                setLoading(false);
                return;
            }

            try {
                const token = await user.getIdToken();
                const response = await fetch('http://localhost:5001/api/profile/me', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const data = await response.json();
                setProfile(data);
                setProfileImg(data.photoURL || defaultImg);
                setDescription(data.description || "");
                setOriginalDescription(data.description || "");
                setInterests(data.interests || ["interests..."]);
                setCareerGoals(data.careerGoals || []);
                setSocials(data.socials || { google: "", github: "", linkedin: "" });
            } catch (err) {
                console.error('Fetch error:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [user]);

    const defaultImg = "/profileImages/defaultImage.png";
    const profileImages = [
        defaultImg,
        "/profileImages/profileImage2.png",
        "/profileImages/profileImage3.png",
        "/profileImages/profileImage4.png",
        "/profileImages/profileImage5.png",
        "/profileImages/profileImage6.png"
    ];

    const [profileImg, setProfileImg] = useState(defaultImg);
    const [showImageSelector, setShowImageSelector] = useState(false);

    const [isEditingInfo, setIsEditingInfo] = useState(false);
    const [description, setDescription] = useState("");
    const [originalDescription, setOriginalDescription] = useState("");

    const [isEditingInterests, setIsEditingInterests] = useState(false);
    const [interests, setInterests] = useState(["interests..."]);
    const [newInterest, setNewInterest] = useState("");

    const [isEditingGoals, setIsEditingGoals] = useState(false);
    const [isHoveringGoals, setIsHoveringGoals] = useState(false);
    const [careerGoals, setCareerGoals] = useState([]);
    const [tempGoalsText, setTempGoalsText] = useState("");

    const [isHoveringSocials, setIsHoveringSocials] = useState(false);
    const [isEditingSocials, setIsEditingSocials] = useState(false);
    const [socials, setSocials] = useState({ google: "", github: "", linkedin: "" });

    const [name, setName] = useState("");

    const selectProfileImage = (imgPath) => {
        setProfileImg(imgPath);
        setShowImageSelector(false);
        setProfile(prev => ({ ...prev, photoURL: imgPath }));
        // Optional: save to backend with PATCH
    };

    if (!user) return <div>Please log in to view your profile</div>;
    if (loading) return <div>Loading profile...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!profile) return <div>No profile data available</div>;

    // Description handlers
    const handleEditDescription = () => {
        setOriginalDescription(description);
        setIsEditingInfo(true);
    };
    const handleCancelDescription = () => {
        setDescription(originalDescription);
        setIsEditingInfo(false);
    };
    const handleSaveDescription = async () => {
        try {
            const auth = getAuth();
            const token = await auth.currentUser.getIdToken();
            await fetch("http://localhost:5001/api/profile/me", {
                method: "PATCH",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ description }),
            });
            setIsEditingInfo(false);
        } catch (err) {
            console.error("Error saving description:", err);
        }
    };

    // Socials
    const handleSocialChange = (key, value) => setSocials(prev => ({ ...prev, [key]: value }));
    const handleSaveSocials = async () => {
        try {
            const auth = getAuth();
            const token = await auth.currentUser.getIdToken();
            await fetch("http://localhost:5001/api/profile/me", {
                method: "PATCH",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
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
            await fetch("http://localhost:5001/api/profile/me", {
                method: "PATCH",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
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
            await fetch("http://localhost:5001/api/profile/me", {
                method: "PATCH",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
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
            await fetch("http://localhost:5001/api/profile/me", {
                method: "PATCH",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ careerGoals: updatedGoals }),
            });
        } catch (err) {
            console.error("Error updating goals:", err);
        }
    };
    const handleCancelGoals = () => setIsEditingGoals(false);

    return (
        <div className="profile-page">
            <div className="top-header">
                <h1>My Profile</h1>
            </div>

            <div className="profile-section">
                {/* Left - Image and Info */}
                <div className="profile-left">
                    <div className="profile-img-container">
                    <img
                        src={profileImg || defaultImg}
                        alt="Profile"
                        className="profile-img"
                    />

                    {/* Edit pencil on top of the profile image */}
                    {!showImageSelector && (
                        <IoPencilSharp
                        className="edit-img-btn"
                        onClick={() => setShowImageSelector(true)}
                        />
                    )}

                    {showImageSelector && (
                        <div className="profile-images-selector">
                        {profileImages.map((img, idx) => (
                            <img
                            key={idx}
                            src={img}
                            alt={`Profile ${idx}`}
                            className="profile-image-option"
                            onClick={() => {
                                selectProfileImage(img);
                                setIsEditingInfo(false); // exit edit mode
                            }}
                            />
                        ))}
                        </div>
                    )}
                    </div>

                    <div className="profile-info">
                        <h2>{profile.displayName || `${profile.firstName} ${profile.lastName}`}</h2>
                        {isEditingInfo ? (
                            <div>
                                <textarea 
                                    value={description} 
                                    placeholder="Write a short description about yourself..." 
                                    onChange={(e) => setDescription(e.target.value)} 
                                />
                                <div className="profile-info-button-container">
                                    <button onClick={handleSaveDescription} className="save-btn">Save</button>
                                    <button onClick={handleCancelDescription} className="cancel-btn">Cancel</button>
                                </div>
                            </div>
                        ) : (
                            <p className="desc-inline">
                                {description || "Add a description..."}
                                <IoPencilSharp className="desc-inline-icon" onClick={handleEditDescription} />
                            </p>
                        )}
                    </div>
                </div>

                {/* Right - Socials */}
                <div className="social-section" onMouseEnter={() => setIsHoveringSocials(true)} onMouseLeave={() => setIsHoveringSocials(false)}>
                    <div className="social-header">
                        {isHoveringSocials && !isEditingSocials && <IoPencilSharp className="socials-edit-icon" onClick={() => setIsEditingSocials(true)} />}
                        <h4>Social Accounts</h4>
                    </div>

                    {isEditingSocials ? (
                        <>
                          <div className="social-link">
                            <FaGoogle className="icon" />
                            <input type="text" value={socials.google} placeholder="Gmail" onChange={(e) => handleSocialChange("google", e.target.value)} />
                          </div>
                          <div className="social-link">
                            <FaGithub className="icon" />
                            <input type="text" value={socials.github} placeholder="Github Portfolio" onChange={(e) => handleSocialChange("github", e.target.value)} />
                          </div>
                          <div className="social-link">
                            <FaLinkedin className="icon" />
                            <input type="text" value={socials.linkedin} placeholder="Linkedin" onChange={(e) => handleSocialChange("linkedin", e.target.value)} />
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

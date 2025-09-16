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

    // Listen for auth state changes
    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });

        return () => unsubscribe();
    }, []);

    // Fetch profile after auth is confirmed
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

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                setProfile(data);
                setDescription(data.description || "");
                setOriginalDescription(data.description || "");
                setInterests(data.interests || ["interests..."]);
                setCareerGoals(data.careerGoals || []);
                setSocials(data.socials || { google: "", github: "", linkedin: "" });
            } catch (error) {
                console.error('Fetch error:', error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [user]); // Depend on user state

    const defaultImg = "/defaultImage.png";
    const [isEditingInfo, setIsEditingInfo] = useState(false);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [originalDescription, setOriginalDescription] = useState("");

    const [isEditingInterests, setIsEditingInterests] = useState(false);
    const [interests, setInterests] = useState(["interests..."]);
    const [newInterest, setNewInterest] = useState("");

    const [isEditingGoals, setIsEditingGoals] = useState(false);
    const [isHoveringGoals, setIsHoveringGoals] = useState(false);
    const [careerGoals, setCareerGoals] = useState([]);
    const [tempGoalsText, setTempGoalsText] = useState("");

    const [profileImg, setProfileImg] = useState(null);

    const [isHoveringSocials, setIsHoveringSocials] = useState(false);
    const [isEditingSocials, setIsEditingSocials] = useState(false);
    const [socials, setSocials] = useState({ google: "", github: "", linkedin: "" });

    if (!user) {
        return <div>Please log in to view your profile</div>;
    }

    if (loading) {
        return <div>Loading profile...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (!profile) {
        return <div>No profile data available</div>;
    }

    // Description
    const handleSaveDescription = async () => {
        try {
            const auth = getAuth();
            const token = await auth.currentUser.getIdToken();

            await fetch("http://localhost:5001/api/profile/me", {
                method: "PATCH",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ description }),
            });

            setIsEditingInfo(false);
        } catch (err) {
            console.error("Error saving description:", err);
        }
    };

    const handleEditDescription = () => {
        setOriginalDescription(description); // Store current description
        setIsEditingInfo(true);
    };

    const handleCancelDescription = () => {
        setDescription(originalDescription); // Reset to original
        setIsEditingInfo(false);
    };

    // Image handlers
    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const auth = getAuth();
            const token = await auth.currentUser.getIdToken();

            // Create temporary URL for immediate display
            const tempURL = URL.createObjectURL(file);
            setProfileImg(tempURL);

            // Create FormData for file upload
            const formData = new FormData();
            formData.append('photo', file);

            const response = await fetch("http://localhost:5001/api/profile/me/photo", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) throw new Error('Failed to upload image');

            const { photoURL } = await response.json();
            setProfileImg(photoURL);
            setProfile(prev => ({ ...prev, photoURL }));
        } catch (error) {
            console.error("Error uploading image:", error);
            // Revert to previous image if upload fails
            setProfileImg(profile?.photoURL || defaultImg);
        }
    };
    const handleImageError = () => setProfileImg(defaultImg);

    // Socials
    const handleSocialChange = (key, value) => setSocials(prev => ({ ...prev, [key]: value }));

    const handleSaveSocials = async () => {
        try {
            const auth = getAuth();
            const token = await auth.currentUser.getIdToken();

            await fetch("http://localhost:5001/api/profile/me", {
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
            await fetch("http://localhost:5001/api/profile/me", {
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
            await fetch("http://localhost:5001/api/profile/me", {
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
            await fetch("http://localhost:5001/api/profile/me", {
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
                        <img 
                            src={profileImg || profile?.photoURL || defaultImg} 
                            alt="Profile" 
                            className="profile-img" 
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = defaultImg;
                            }}
                        />
                        <label htmlFor="photo-upload" className="edit-img-btn">
                            <IoPencilSharp />
                        </label>
                        <input
                            id="photo-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            style={{ display: 'none' }}
                        />
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

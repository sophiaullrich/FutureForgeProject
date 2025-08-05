import React, { useState } from "react";
import "./ProfilePage.css";
import { FaGoogle, FaGithub, FaLinkedin } from "react-icons/fa";
import { IoPencilSharp, IoCloseSharp} from 'react-icons/io5';
function ProfilePage() {
    const [isEditingInfo, setIsEditingInfo] = useState(false);
    const [name, setName] = useState("Diya Topiwala");
    const [description, setDescription] = useState("Hi! My name is Diya and I am a software developer with an interest in photography and astronomy!");
    
    const [isEditingInterests, setIsEditingInterests] = useState(false);
    const [interests, setInterests] = useState([
        "React", "Java", "Python", "TypeScript", "PHP", "HTML", "CSS", "AI", "Astronomy", "Baking"
    ]);
    const [newInterest, setNewInterest] = useState('');

    const [editingGoals, setEditingGoals] = useState(false);
    const [careerGoals, setCareerGoals] = useState([
        "Learn a new programming language",
        "Build a project portfolio",
        "Contribute to open source projects",
        "Earn Certifications",
        "Become proficient in Git Version Control",
    ]);

    const defaultImg = "/defaultImage.png"; 
    const [profileImg, setProfileImg] = useState(defaultImg);

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
        setProfileImg(URL.createObjectURL(file));
        }
    };

    const handleImageError = () => {
        setProfileImg(defaultImg)
    };

    const handleAddInterest = () => {
        if (newInterest.trim() !== '' && !interests.includes(newInterest.trim())) {
            setInterests([...interests, newInterest.trim()]);
            setNewInterest('');
        }
    };

    const handleDeleteInterest = (index) => {
        const newInterests = interests.filter((_, i) => i !== index);
        setInterests(newInterests);
    };

    return(
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
            <img src={profileImg} alt="Profile" className="profile-img" onError={handleImageError}/>
            <label htmlFor="imgUpload" className="edit-img-btn">
              <IoPencilSharp />
            </label>
            <input
              id="imgUpload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: "none" }}
            />
          </div>

        <div className="profile-info">
            <h2>{name}</h2>
            {isEditingInfo ? (
            <div>
                {/* Input fields for editing */}
                <textarea 
                value={description} 
                onChange={(e) => setDescription(e.target.value)}
                />
                <div class="saveButton">
                    {/* Save button for editing */}
                    <button onClick={() => setIsEditingInfo(false)}>Save</button>
                </div>
            </div>
            ) : (
            // View mode
            <>
                <p>{description}</p>
                {/* The new pen icon */}
                <IoPencilSharp 
                className="description-edit-icon" 
                onClick={() => setIsEditingInfo(true)} 
                />
            </>
            )}
            </div>
        </div>

        {/* Right - Social accounts */}
        <div className="social-section">
          <h4>Social Accounts</h4>
          <div className="social-link">
            <FaGoogle className="icon" />
            <input type="text" readOnly value="diyatopiwala@gmail.com" />
          </div>
          <div className="social-link">
            <FaGithub className="icon" />
            <input type="text" readOnly value="diyatop1204" />
          </div>
          <div className="social-link">
            <FaLinkedin className="icon" />
            <input type="text" readOnly value="diya-t-0pc130219" />
          </div>
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
                    placeholder="Add new interest..." 
                    value={newInterest} 
                    onChange={(e) => setNewInterest(e.target.value)} 
                    onKeyPress={(e) => {
                    if (e.key === 'Enter') handleAddInterest();
                    }}
                />
                <button onClick={handleAddInterest}>Add</button>
                </div>
                <div className="profile-info-button-container">
                <button onClick={() => setIsEditingInterests(false)}>Save</button>
                </div>
            </div>
            ) : (
            <>
                <div className="scrollable-row interests-row">
                {interests.map((interest, index) => (
                    <div key={index} className="interest-tag">
                    {interest}
                    </div>
                ))}
                </div>
                <IoPencilSharp className="interests-edit-icon" onClick={() => setIsEditingInterests(true)} />
            </>
            )}
      </div>

      {/* Career Goals */}
      <div
        className="career-goals"
        onMouseEnter={() => setEditingGoals(true)}
        onMouseLeave={() => setEditingGoals(false)}
      >
        <h3>Career Goals</h3>
        <ul>
          {careerGoals.map((goal, index) => (
            <li key={index}>{goal}</li>
          ))}
        </ul>
        {editingGoals && <IoPencilSharp className="edit-icon" />}
      </div>

      {/* Badges */}
        <div className="badge-box-name">
            Diya's Badges
        </div>
      <div className="scrollable-row badges-row">
        {[...Array(8)].map((_, idx) => (
          <div key={idx} className="badge-box" />
        ))}
      </div>
    </div>
    );
}
export default ProfilePage;
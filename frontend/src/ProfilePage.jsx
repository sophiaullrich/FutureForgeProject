import React, { useState } from "react";
import "./ProfilePage.css";
import { FaGoogle, FaGithub, FaLinkedin } from "react-icons/fa";
import { IoPencilSharp } from 'react-icons/io5';
function ProfilePage() {
    const interestsList = ["React", "Java", "Python", "TypeScript", "PHP", "HTML", "CSS", "AI"];
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
            <h2>Diya Topiwala</h2>
            <p>
              Hi! My name is Diya and I am a software developer with an interest in photography and astronomy!
            </p>
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
      <div className="scrollable-row interests-row">
        {interestsList.map((interest, index) => (
          <div key={index} className="interest-tag">
            {interest}
          </div>
        ))}
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
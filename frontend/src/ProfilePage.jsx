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

    const [isEditingGoals, setIsEditingGoals] = useState(false); // Renamed for clarity
    const [isHoveringGoals, setIsHoveringGoals] = useState(false); // New state for hover
    const [careerGoals, setCareerGoals] = useState([
        "Learn a new programming language",
        "Build a project portfolio",
        "Contribute to open source projects",
        "Earn Certifications",
        "Become proficient in Git Version Control",
    ]);
    const [tempGoalsText, setTempGoalsText] = useState('');

    const defaultImg = "/defaultImage.png"; 
    const [profileImg, setProfileImg] = useState(defaultImg);

    const [isHoveringSocials, setIsHoveringSocials] = useState(false);
    const [isEditingSocials, setIsEditingSocials] = useState(false);
    const [socials, setSocials] = useState({
        google: "diyatopiwala@gmail.com",
        github: "diyatop1204",
        linkedin: "diya-t-0pc130219"
    });


    // image handlers
    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
        setProfileImg(URL.createObjectURL(file));
        }
    };

    const handleImageError = () => {
        setProfileImg(defaultImg)
    };

    // social media handlers
    const handleSocialChange = (key, value) => {
        setSocials(prev => ({ ...prev, [key]: value }));
    };

    const handleSaveSocials = () => {
        setIsEditingSocials(false);
        setIsHoveringSocials(false); 
    };

    const handleCancelSocials = () => {
        setIsEditingSocials(false);
        setIsHoveringSocials(false);
    };

    // interest handlers
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

    // career goals handlers
    const handleEditGoalsClick = () => {
        // Join the array into a single string for editing
        setTempGoalsText(careerGoals.join('\n'));
        setIsEditingGoals(true); // Toggle to edit mode
        setIsHoveringGoals(false); // Hide the hover icon
    };

    const handleSaveGoals = () => {
        // Split the text back into an array, filter out empty lines
        const updatedGoals = tempGoalsText.split('\n').map(goal => goal.trim()).filter(goal => goal !== '');
        setCareerGoals(updatedGoals);
        setIsEditingGoals(false);
    };

    const handleCancelGoals = () => {
        setIsEditingGoals(false);
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
                <div class="profile-info-button-container">
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
        <div 
        className="social-section"
        onMouseEnter={() => setIsHoveringSocials(true)}
        onMouseLeave={() => setIsHoveringSocials(false)}
        >
        <div className="social-header">
            {isHoveringSocials && !isEditingSocials && (
            <IoPencilSharp 
                className="socials-edit-icon" 
                onClick={() => setIsEditingSocials(true)} 
            />
            )}
            <h4>Social Accounts</h4>
        </div>

        {isEditingSocials ? (
            <>
            <div className="social-link">
                <FaGoogle className="icon" />
                <input 
                type="text" 
                value={socials.google} 
                onChange={(e) => handleSocialChange('google', e.target.value)} 
                />
            </div>
            <div className="social-link">
                <FaGithub className="icon" />
                <input 
                type="text" 
                value={socials.github} 
                onChange={(e) => handleSocialChange('github', e.target.value)} 
                />
            </div>
            <div className="social-link">
                <FaLinkedin className="icon" />
                <input 
                type="text" 
                value={socials.linkedin} 
                onChange={(e) => handleSocialChange('linkedin', e.target.value)} 
                />
            </div>
            <div className="social-buttons">
                <button onClick={handleSaveSocials} className="save-btn">Save</button>
                <button onClick={handleCancelSocials} className="cancel-btn">Cancel</button>
            </div>
            </>
        ) : (
            <>
            <div className="social-link">
                <FaGoogle className="icon" />
                <input type="text" readOnly value={socials.google} />
            </div>
            <div className="social-link">
                <FaGithub className="icon" />
                <input type="text" readOnly value={socials.github} />
            </div>
            <div className="social-link">
                <FaLinkedin className="icon" />
                <input type="text" readOnly value={socials.linkedin} />
            </div>
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
                    onKeyPress={(e) => {
                    if (e.key === 'Enter') handleAddInterest();
                    }}
                />
                    {/* Add Button */}
                    <div>
                        <button onClick={handleAddInterest}>Add</button>
                    </div>
                    {/* Save Button */}
                    <div>
                    <button onClick={() => setIsEditingInterests(false)}>Save</button>
                    </div>
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
        onMouseEnter={() => setIsHoveringGoals(true)} // Change state on hover
        onMouseLeave={() => setIsHoveringGoals(false)} // Change state on un-hover
      >
        <h3>Career Goals</h3>
        {isEditingGoals ? (
          <div className="career-goals-edit-container">
            <textarea
              className="editable-goals-textarea"
              value={tempGoalsText}
              onChange={(e) => setTempGoalsText(e.target.value)}
            />
            <div className="career-goals-buttons">
              <button onClick={handleSaveGoals} className="save-btn">Save</button>
              <button onClick={handleCancelGoals} className="cancel-btn">Cancel</button>
            </div>
          </div>
        ) : (
          <>
            <div className="career-goals-textbox">
            <ul>
                {careerGoals.map((goal, index) => (
                <li key={index}>{goal}</li>
                ))}
            </ul>

            {isHoveringGoals && (
                <IoPencilSharp className="edit-icon" onClick={handleEditGoalsClick} />
            )}
            </div>
          </>
        )}
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
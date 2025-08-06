import React from "react";
import "./Settings.css";
import googleicon from "./assets/Google Icon.png";
import githubicon from "./assets/GitHub Icon.png";
import linkedinicon from "./assets/LinkedIn Icon.png";

const Settings = () => (
  <div id="body">
    <h1>Settings</h1>
    <div id="account-info">
      <h2>Account Information</h2>
      <hr />
      <div className="info-container">
        <div id="form-inputs">
          <label>First Name</label>
          <input placeholder="First Name" />

          <label>Last Name</label>
          <input placeholder="Last Name" />

          <label>Email</label>
          <input placeholder="Email" />

          <label>Password</label>
          <input placeholder="********" />
        </div>

        <div id="linked-accounts">
          <h3>Linked Accounts</h3>

          <div className="account-row connected">
            <img src={googleicon} alt="Google Icon" />
            <p className="connected-btn">Connected</p>
          </div>

          <div className="account-row connected">
            <img src={githubicon} alt="GitHub Icon" />
            <p className="connected-btn">Connected</p>
          </div>

          <div className="account-row not-connected">
            <img src={linkedinicon} alt="LinkedIn Icon" />
            <p className="connect-btn">Connect...</p>
          </div>
        </div>
      </div>
    </div>
    <div id="accessibility-settings">
      <h2>Accessibility</h2>
      <hr />

      <div className="accessibility-option">
        <div>
          <h4>Font Size</h4>
          <p>Increase the text size for better readability.</p>
        </div>
        <label className="switch">
          <input type="checkbox" />
          <span className="slider"></span>
        </label>
      </div>

      <div className="accessibility-option">
        <div>
          <h4>High Contrast Mode</h4>
          <p>Toggle to turn on high constrast.</p>
        </div>
        <label className="switch">
          <input type="checkbox" />
          <span className="slider"></span>
        </label>
      </div>

      <div className="accessibility-option">
        <div>
          <h4>Enlarge Cursor</h4>
          <p>Make the cursor larger for better visibility.</p>
        </div>
        <label className="switch">
          <input type="checkbox" />
          <span className="slider"></span>
        </label>
      </div>

      <div className="accessibility-option">
        <div>
          <h4>Dark Mode</h4>
          <p>Toggle to turn on Dark Mode.</p>
        </div>
        <label className="switch">
          <input type="checkbox" />
          <span className="slider"></span>
        </label>
      </div>
    </div>
  </div>
);

export default Settings;

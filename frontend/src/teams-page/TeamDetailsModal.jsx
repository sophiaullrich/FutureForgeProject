import React from "react";

const TeamDetailsModal = ({ teamName, onClose }) => {
  return (
    <div className="modal">
      <h2>{teamName}</h2>
      <p>This team focuses on learning marketing and designing principles using user feedback.</p>
      <h3>Team Members</h3>
      <div>Diya Topiwala</div>
      <div>Sophia Sue Ullrich</div>
      <div>Joseph Esguerra</div>

      <h3>Team Tasks</h3>
      <table>
        <thead>
          <tr>
            <th>Done?</th>
            <th>Task Name</th>
            <th>Due Date</th>
            <th>Assigned To</th>
          </tr>
        </thead>
        <tbody>
          <tr><td><input type="checkbox" /></td><td>Create Visuals</td><td>June 12</td><td>Diya Topiwala</td></tr>
          <tr><td><input type="checkbox" /></td><td>Page Descriptions</td><td>June 16</td><td>Joseph Esguerra</td></tr>
          <tr><td><input type="checkbox" /></td><td>Get User Feedback</td><td>June 22</td><td>Sophia Ullrich</td></tr>
        </tbody>
      </table>

      <button>Add New Task</button>
      <button onClick={onClose}>Close</button>
    </div>
  );
};

export default TeamDetailsModal;

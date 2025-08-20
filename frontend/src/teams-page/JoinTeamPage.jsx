// src/teams-page/JoinTeamPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { db, auth } from "../Firebase";

/**
 * This page is used for accepting invites via shared links.
 * It assumes the user is signed in.
 */
export default function JoinTeamPage() {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const [teamName, setTeamName] = useState("");
  const [loading, setLoading] = useState(true);
  const [joined, setJoined] = useState(false);
  const [error, setError] = useState("");

  const uid = auth.currentUser?.uid;

  useEffect(() => {
    const fetchTeam = async () => {
      if (!uid) {
        setError("You must be signed in to accept an invite.");
        setLoading(false);
        return;
      }

      try {
        const teamRef = doc(db, "teams", teamId);
        const teamSnap = await getDoc(teamRef);

        if (!teamSnap.exists()) {
          setError("This team does not exist.");
          setLoading(false);
          return;
        }

        const teamData = teamSnap.data();
        setTeamName(teamData.name || "Unnamed Team");

        // If already a member, redirect
        if (teamData.members.includes(uid)) {
          setJoined(true);
          setTimeout(() => navigate("/teams"), 2000);
          return;
        }

        // Join team
        await updateDoc(teamRef, {
          members: arrayUnion(uid),
        });

        setJoined(true);
        setTimeout(() => navigate("/teams"), 2000);
      } catch (err) {
        console.error("Error joining team:", err);
        setError("Something went wrong while joining the team.");
      } finally {
        setLoading(false);
      }
    };

    fetchTeam();
  }, [teamId, uid, navigate]);

  if (loading) return <p>Loading invite...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="join-team-page">
      {joined ? (
        <div>
          <h2>Welcome to {teamName}!</h2>
          <p>You've successfully joined the team. Redirecting...</p>
        </div>
      ) : (
        <div>
          <h2>Joining {teamName}...</h2>
        </div>
      )}
    </div>
  );
}

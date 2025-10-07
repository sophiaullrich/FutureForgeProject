// page for joining a team from an invite link
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { db, auth } from "../Firebase";

export default function JoinTeamPage() {
  // get team id from url
  const { teamId } = useParams();
  const navigate = useNavigate();

  // state
  const [teamName, setTeamName] = useState("");
  const [loading, setLoading] = useState(true);
  const [joined, setJoined] = useState(false);
  const [error, setError] = useState("");

  const uid = auth.currentUser?.uid;

  // fetch and join team
  useEffect(() => {
    const fetchTeam = async () => {
      if (!uid) {
        setError("you must be signed in to accept an invite.");
        setLoading(false);
        return;
      }

      try {
        const teamRef = doc(db, "teams", teamId);
        const teamSnap = await getDoc(teamRef);

        if (!teamSnap.exists()) {
          setError("this team does not exist.");
          setLoading(false);
          return;
        }

        const teamData = teamSnap.data();
        setTeamName(teamData.name || "unnamed team");

        // if already a member
        if (Array.isArray(teamData.members) && teamData.members.includes(uid)) {
          setJoined(true);
          setTimeout(() => navigate("/teams"), 2000);
          return;
        }

        // join team
        await updateDoc(teamRef, {
          members: arrayUnion(uid),
        });

        setJoined(true);
        setTimeout(() => navigate("/teams"), 2000);
      } catch (err) {
        console.error("error joining team:", err);
        setError("something went wrong while joining the team.");
      } finally {
        setLoading(false);
      }
    };

    fetchTeam();
  }, [teamId, uid, navigate]);

  // show loading or error
  if (loading) return <p>loading invite...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  // show join result
  return (
    <div className="join-team-page">
      {joined ? (
        <div>
          <h2>welcome to {teamName}!</h2>
          <p>you've successfully joined the team. redirecting...</p>
        </div>
      ) : (
        <div>
          <h2>joining {teamName}...</h2>
        </div>
      )}
    </div>
  );
}

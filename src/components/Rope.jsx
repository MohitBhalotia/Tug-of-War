import React, { useEffect, useState } from "react";

export default function Rope({
  team1Score,
  team2Score,
  prevDifference,
  team1Position,
  team2Position,
  setTeam1Position,
  setTeam2Position,
}) {
  const scoreDifference = team1Score - team2Score;
  const [ropePosition, setRopePosition] = useState(50); // Start at center

  useEffect(() => {
    const diffChange = scoreDifference - prevDifference;

    if (diffChange > 0) {
      // Team 1 scored -> move rope left (toward Team 1)
      setRopePosition(prev => Math.max(prev - diffChange * 5, 0));
    } else if (diffChange < 0) {
      // Team 2 scored -> move rope right (toward Team 2)
      setRopePosition(prev => Math.min(prev + Math.abs(diffChange) * 5, 100));
    }

    // Update the previous difference in localStorage
    localStorage.setItem("prevDifference", scoreDifference);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [team1Score, team2Score, prevDifference]);

  return (
    <div className="w-full h-screen flex flex-col justify-center items-center p-4">
      <div className="relative w-full h-64">
        {/* Rope Container */}
        <div className="absolute left-[15%] right-[15%] top-1/2 h-12 -translate-y-1/2 overflow-hidden">
          {/* Rope */}
          <div
            className="absolute h-full w-[200%] transition-all duration-500"
            style={{
              left: `${ropePosition}%`,
              transform: 'translateX(-50%)',
              background: `linear-gradient(to right, 
                #8B4513,
                #A0522D,
                #8B4513
              )`,
              backgroundImage: `
                repeating-linear-gradient(
                  45deg,
                  transparent,
                  transparent 10px,
                  rgba(0,0,0,0.2) 10px,
                  rgba(0,0,0,0.2) 20px
                ),
                linear-gradient(to right, 
                  #8B4513,
                  #A0522D,
                  #8B4513
                )
              `,
              boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)',
            }}
          />

          {/* Rope texture overlay */}
          <div
            className="absolute h-full w-[200%]"
            style={{
              left: `${ropePosition}%`,
              transform: 'translateX(-50%)',
              backgroundImage: `
                repeating-linear-gradient(
                  90deg,
                  transparent,
                  transparent 4px,
                  rgba(0,0,0,0.15) 4px,
                  rgba(0,0,0,0.15) 8px
                ),
                linear-gradient(
                  to bottom,
                  rgba(255,255,255,0.1),
                  transparent
                )
              `
            }}
          />

          {/* Center Marker */}
          <div className="absolute left-1/2 top-0 h-full w-1 bg-red-500 -translate-x-1/2 z-10">
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-red-500 rounded-full"></div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-red-500 rounded-full"></div>
          </div>
        </div>

        {/* Team 1 Name (Fixed at left) */}
        <div
          className="absolute -top-10 transition-all duration-500 bg-slate-800 text-white px-3 py-1 rounded-md text-sm font-bold shadow-lg z-20"
          style={{
            left: '15%',
            transform: 'translateX(-50%)',
          }}
        >
          {localStorage.getItem("team1") || "Team 1"}
        </div>

        {/* Team 2 Name (Fixed at right) */}
        <div
          className="absolute -top-10 transition-all duration-500 bg-slate-800 text-white px-3 py-1 rounded-md text-sm font-bold shadow-lg z-20"
          style={{
            left: '85%',
            transform: 'translateX(-50%)',
          }}
        >
          {localStorage.getItem("team2") || "Team 2"}
        </div>
      </div>
    </div>
  );
}

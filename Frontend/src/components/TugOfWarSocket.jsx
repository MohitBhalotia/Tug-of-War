import { useState, useEffect } from "react";

export default function TugOfWarSocket({ teamAnswering, ropePosition, team1, team2, winner, onReset, myTeam, team1Score = 0, team2Score = 0 }) {
  // State to track winner and messages
  const [message, setMessage] = useState("");

  // Check for winner when ropePosition changes
  useEffect(() => {
    if (ropePosition <= -50) {
      setMessage(`${team1} wins!`);
    } else if (ropePosition >= 50) {
      setMessage(`${team2} wins!`);
    } else {
      setMessage("");
    }
  }, [ropePosition, team1, team2]);

  return (
    <div className="w-full max-w-4xl mx-auto p-3 sm:p-6 bg-gray-100 rounded-lg shadow-lg">
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-4 sm:mb-6 text-black">Tug of War Quiz</h1>

      {/* Team names and score display */}
      <div className="flex justify-between mb-2 sm:mb-4">
        <div className="flex flex-col items-start">
          <div className="flex items-center">
            <div className="text-lg sm:text-xl md:text-2xl font-bold text-blue-600">
              {team1}{ropePosition <= -50 && "🏆"}
            </div>
            {myTeam === team1 && (
              <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded">You</span>
            )}
          </div>
          <div className="text-sm sm:text-base text-blue-700 font-semibold">
            Score: {team1Score}
          </div>
        </div>
        
        <div className="flex flex-col items-end">
          <div className="flex items-center">
            <div className="text-lg sm:text-xl md:text-2xl font-bold text-red-600">
              {team2}{ropePosition >= 50 && "🏆"}
            </div>
            {myTeam === team2 && (
              <span className="ml-2 bg-red-100 text-red-800 text-xs font-medium px-2 py-0.5 rounded">You</span>
            )}
          </div>
          <div className="text-sm sm:text-base text-red-700 font-semibold">
            Score: {team2Score}
          </div>
        </div>
      </div>

      {/* Tug of war rope visualization */}
      <div className="relative h-16 sm:h-20 mb-4 sm:mb-8">
        {/* Field */}
        <div className="absolute w-full h-6 sm:h-8 bg-green-200 rounded-lg top-5 sm:top-6 border-2 border-green-600">
          {/* Center line */}
          <div className="absolute left-1/2 h-full w-1 bg-green-800 transform -translate-x-1/2"></div>

          {/* Team A side */}
          <div className="absolute left-0 top-0 h-full w-1/2 flex items-center justify-start pl-2 sm:pl-4">
            <span className="font-bold text-blue-600 text-xs sm:text-sm md:text-base truncate max-w-[90%]">{team1}</span>
          </div>

          {/* Team B side */}
          <div className="absolute right-0 top-0 h-full w-1/2 flex items-center justify-end pr-2 sm:pr-4">
            <span className="font-bold text-red-600 text-xs sm:text-sm md:text-base truncate max-w-[90%]">{team2}</span>
          </div>
        </div>

        {/* The rope with handles - properly centered */}
        <div className="absolute w-full h-16 sm:h-20 flex items-center justify-center">
          {/* This container helps position the rope system */}
          <div
            className="relative w-3/4 h-16 sm:h-20 flex items-center transition-transform duration-1000 ease-in-out"
            style={{
              transform: `translateX(${ropePosition}%)`
            }}
          >
            {/* The rope itself */}
            <div className="absolute w-full h-2 sm:h-3 bg-amber-800 rounded-full"></div>

            {/* Team A handle (left) */}
            <div className="absolute left-0 h-12 sm:h-16 w-4 sm:w-6 bg-amber-900 rounded-lg transform -translate-x-4 sm:-translate-x-6"></div>

            {/* Team B handle (right) */}
            <div className="absolute right-0 h-12 sm:h-16 w-4 sm:w-6 bg-amber-900 rounded-lg transform translate-x-4 sm:translate-x-6"></div>
          </div>
        </div>
      </div>

      {/* Display winner message and reset button if applicable */}
      {winner && (
        <div className="text-center">
          <div className="text-lg sm:text-xl font-bold text-green-600 mb-2 sm:mb-4">
            {message}
          </div>
          <button
            onClick={onReset}
            className="bg-blue-500 text-white px-3 sm:px-4 py-1 sm:py-2 rounded hover:bg-blue-600 text-sm sm:text-base"
          >
            Start New Game
          </button>
        </div>
      )}
    </div>
  );
}

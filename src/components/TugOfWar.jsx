import { useState, useEffect } from "react";

export default function TugOfWarQuiz({ teamAnswering }) {
  // State to track the position of the rope (-50 to 50, 0 is center)
  const [ropePosition, setRopePosition] = useState(() => {
    const saved = localStorage.getItem('ropePosition');
    return saved ? parseInt(saved) : 0;
  });

  // State to track winner and messages
  const [winner, setWinner] = useState(null);
  const [message, setMessage] = useState("");

  // Pull strength - how much the rope moves when a team answers correctly
  const pullStrength = 5;

  // Save rope position to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('ropePosition', ropePosition.toString());
  }, [ropePosition]);

  // Move rope when teamAnswering prop changes
  useEffect(() => {
    if (teamAnswering && !winner) {
      // Only move the rope if there's a valid team and no winner yet
      setRopePosition((prev) =>
        teamAnswering === "A"
          ? Math.max(prev - pullStrength, -50)
          : Math.min(prev + pullStrength, 50)
      );
    }
  }, [teamAnswering, winner, pullStrength]);

  // Check for winner when ropePosition changes
  useEffect(() => {
    if (ropePosition <= -50) {
      setWinner("Team A");
      setMessage("Team A wins!");
    } else if (ropePosition >= 50) {
      setWinner("Team B");
      setMessage("Team B wins!");
    }
  }, [ropePosition]);

  // Reset game function
  const resetGame = () => {
    setRopePosition(0);
    setWinner(null);
    setMessage("");
    localStorage.removeItem('ropePosition');
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-gray-100 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-center mb-6">Tug of War Quiz</h1>

      {/* Team names and score display */}
      <div className="flex justify-between mb-4">
        <div className="text-2xl font-bold text-blue-600">
          Team A {ropePosition <= -50 && "🏆"}
        </div>
        <div className="text-2xl font-bold text-red-600">
          Team B {ropePosition >= 50 && "🏆"}
        </div>
      </div>

      {/* Tug of war rope visualization */}
      <div className="relative h-20 mb-8">
        {/* Field */}
        <div className="absolute w-full h-8 bg-green-200 rounded-lg top-6 border-2 border-green-600">
          {/* Center line */}
          <div className="absolute left-1/2 h-full w-1 bg-green-800 transform -translate-x-1/2"></div>

          {/* Team A side */}
          <div className="absolute left-0 top-0 h-full w-1/2 flex items-center justify-start pl-4">
            <span className="font-bold text-blue-600">Team A</span>
          </div>

          {/* Team B side */}
          <div className="absolute right-0 top-0 h-full w-1/2 flex items-center justify-end pr-4">
            <span className="font-bold text-red-600">Team B</span>
          </div>
        </div>

        {/* The rope with handles - properly centered */}
        <div className="absolute w-full h-20 flex items-center justify-center">
          {/* This container helps position the rope system */}
          <div
            className="relative w-3/4 h-20 flex items-center"
            style={{
              transform: `translateX(${ropePosition}%)`
            }}
          >
            {/* The rope itself */}
            <div className="absolute w-full h-3 bg-amber-800 rounded-full"></div>

            {/* Team A handle (left) */}
            <div className="absolute left-0 h-16 w-6 bg-amber-900 rounded-lg transform -translate-x-6"></div>

            {/* Team B handle (right) */}
            <div className="absolute right-0 h-16 w-6 bg-amber-900 rounded-lg transform translate-x-6"></div>
          </div>
        </div>
      </div>

      {/* Display winner message and reset button if applicable */}
      {winner && (
        <div className="text-center">
          <div className="text-xl font-bold text-green-600 mb-4">
            {message}
          </div>
          <button
            onClick={resetGame}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Start New Game
          </button>
        </div>
      )}
    </div>
  );
}
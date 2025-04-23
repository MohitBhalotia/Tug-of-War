import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function JoinInfo() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f172a] to-[#1e293b] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl bg-white rounded-lg shadow-xl overflow-hidden"
      >
        <div className="bg-purple-600 p-6">
          <h2 className="text-2xl font-bold text-white">Join a Game</h2>
          <p className="text-purple-100 mt-1">How to join an existing Tug of War Quiz game</p>
        </div>

        <div className="p-6">
          <div className="space-y-6">
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
              <h3 className="text-lg font-semibold text-purple-800 mb-2">Important Information</h3>
              <p className="text-gray-700">
                To join a Tug of War Quiz game, you need a team-specific invitation link from the game admin. Each team has their own unique link that cannot be used by others.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">How to Join:</h3>
              
              <div className="flex items-start space-x-3">
                <div className="bg-purple-100 text-purple-800 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <p className="text-gray-700">
                    <strong>Get your team link</strong> - The game admin will share a unique link for your team.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="bg-purple-100 text-purple-800 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <p className="text-gray-700">
                    <strong>Click the link</strong> - The link will take you directly to the game room with your team already selected.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="bg-purple-100 text-purple-800 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <p className="text-gray-700">
                    <strong>Wait for the game to start</strong> - Once both teams are connected, the admin will start the game.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-100">
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">Note:</h3>
              <p className="text-gray-700">
                You cannot join a game without a team-specific invitation link. If you don't have a link, please contact the game admin.
              </p>
            </div>

            <div className="flex justify-center pt-4">
              <button
                onClick={() => navigate("/")}
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-8 rounded-lg shadow-md transition-all duration-200"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CONFIG } from "../config";

export default function HomePage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("howToPlay");
  const [animateRope, setAnimateRope] = useState(false);
  const [ropePosition, setRopePosition] = useState(50);
  
  // Animate the rope demonstration
  useEffect(() => {
    if (animateRope) {
      const interval = setInterval(() => {
        setRopePosition(prev => {
          // Move rope back and forth for demonstration
          if (prev >= 80) return 20;
          return prev + 2;
        });
      }, 200);
      
      return () => clearInterval(interval);
    }
  }, [animateRope]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f172a] to-[#1e293b] text-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600 pb-12">
              Tug of War Quiz
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-6">
              A real-time competitive quiz game where teams battle for knowledge supremacy
            </p>
            
            <motion.div 
              className="w-16 h-16 mx-auto mb-8 cursor-pointer"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                const element = document.getElementById('how-it-works');
                element.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full text-blue-400 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 mt-2"
          >
            <motion.button
              onClick={() => navigate("/admin-login")}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-lg text-lg font-semibold shadow-lg transition-all duration-200 flex items-center justify-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Admin Login
            </motion.button>
            <motion.button
              onClick={() => navigate("/join-info")}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 rounded-lg text-lg font-semibold shadow-lg transition-all duration-200 flex items-center justify-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Join a Game
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12" id="how-it-works">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="bg-gray-800 bg-opacity-50 p-6 rounded-lg shadow-lg"
          >
            <div className="text-blue-400 text-4xl font-bold mb-4 flex items-center">
              <span className="mr-4">01</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-3">Create a Room</h3>
            <p className="text-gray-300 mb-4">
              Admins can create a new game room and set up team names for the competition. Each team gets a unique link to join.
            </p>
            <ul className="text-gray-400 text-sm space-y-2 list-disc pl-5">
              <li>Log in with admin credentials</li>
              <li>Name both competing teams</li>
              <li>Share unique team links with participants</li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="bg-gray-800 bg-opacity-50 p-6 rounded-lg shadow-lg"
          >
            <div className="text-blue-400 text-4xl font-bold mb-4 flex items-center">
              <span className="mr-4">02</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-3">Teams Join</h3>
            <p className="text-gray-300 mb-4">
              Teams use their unique links to join the game room and prepare for the quiz competition.
            </p>
            <ul className="text-gray-400 text-sm space-y-2 list-disc pl-5">
              <li>Click team-specific invitation link</li>
              <li>Wait for both teams to connect</li>
              <li>Admin starts the game when ready</li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            viewport={{ once: true }}
            className="bg-gray-800 bg-opacity-50 p-6 rounded-lg shadow-lg"
          >
            <div className="text-blue-400 text-4xl font-bold mb-4 flex items-center">
              <span className="mr-4">03</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-3">Battle of Knowledge</h3>
            <p className="text-gray-300 mb-4">
              Teams answer questions to pull the rope to their side. First team to pull it completely wins!
            </p>
            <ul className="text-gray-400 text-sm space-y-2 list-disc pl-5">
              <li>Answer questions correctly to score points</li>
              <li>Each correct answer pulls the rope toward your team</li>
              <li>First team to pull the rope completely wins</li>
            </ul>
          </motion.div>
        </div>
      </div>

      {/* Interactive Game Instructions */}
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="bg-gray-800 bg-opacity-30 p-8 rounded-2xl shadow-xl"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">Game Instructions</h2>
          
          <div className="flex flex-wrap mb-8">
            <div className="w-full md:w-1/2 lg:w-1/3 p-4">
              <div 
                className="bg-gray-700 bg-opacity-50 p-6 rounded-xl h-full hover:bg-opacity-70 transition-all cursor-pointer"
                onClick={() => setActiveTab("howToPlay")}
              >
                <div className={`h-2 w-full rounded-full mb-4 ${activeTab === "howToPlay" ? "bg-blue-500" : "bg-gray-600"}`}></div>
                <h3 className="text-xl font-semibold mb-3 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  How To Play
                </h3>
                <p className="text-gray-300">Learn the basic rules and gameplay mechanics</p>
              </div>
            </div>
            
            <div className="w-full md:w-1/2 lg:w-1/3 p-4">
              <div 
                className="bg-gray-700 bg-opacity-50 p-6 rounded-xl h-full hover:bg-opacity-70 transition-all cursor-pointer"
                onClick={() => setActiveTab("scoring")}
              >
                <div className={`h-2 w-full rounded-full mb-4 ${activeTab === "scoring" ? "bg-blue-500" : "bg-gray-600"}`}></div>
                <h3 className="text-xl font-semibold mb-3 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Scoring System
                </h3>
                <p className="text-gray-300">Understand how points and rope movement work</p>
              </div>
            </div>
            
            <div className="w-full md:w-1/2 lg:w-1/3 p-4">
              <div 
                className="bg-gray-700 bg-opacity-50 p-6 rounded-xl h-full hover:bg-opacity-70 transition-all cursor-pointer"
                onClick={() => setActiveTab("tips")}
              >
                <div className={`h-2 w-full rounded-full mb-4 ${activeTab === "tips" ? "bg-blue-500" : "bg-gray-600"}`}></div>
                <h3 className="text-xl font-semibold mb-3 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  Pro Tips
                </h3>
                <p className="text-gray-300">Strategic advice to help your team win</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-900 bg-opacity-50 p-6 rounded-xl">
            <AnimatePresence mode="wait">
              {activeTab === "howToPlay" && (
                <motion.div
                  key="howToPlay"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="text-gray-300"
                >
                  <h4 className="text-xl font-semibold mb-4 text-blue-300">Basic Rules</h4>
                  <ol className="list-decimal pl-5 space-y-3 mb-6">
                    <li>Two teams compete by answering quiz questions</li>
                    <li>Each team sees a random question</li>
                    <li>Teams must select an answer to proceed</li>
                    <li>Correct answers pull the rope toward your team's side</li>
                    <li>First team to pull the rope completely to their side wins</li>
                  </ol>
                  
                  <div className="flex items-center justify-center mt-6">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 bg-blue-600 rounded-lg text-white font-medium flex items-center"
                      onClick={() => setAnimateRope(!animateRope)}
                    >
                      {animateRope ? (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Stop Animation
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                          See Animation
                        </>
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              )}
              
              {activeTab === "scoring" && (
                <motion.div
                  key="scoring"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="text-gray-300"
                >
                  <h4 className="text-xl font-semibold mb-4 text-blue-300">Scoring System</h4>
                  <ul className="space-y-4 mb-6">
                    <li className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span><strong className="text-green-400">Correct answers:</strong> Pull the rope toward your team by 10% of the total distance</span>
                    </li>
                    <li className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span><strong className="text-red-400">Incorrect answers:</strong> No movement, the rope stays at the same place</span>
                    </li>
                    <li className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-yellow-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span><strong className="text-yellow-400">Time limit:</strong> There is no limit for a question</span>
                    </li>
                    <li className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span><strong className="text-blue-400">Winning:</strong> Pull the rope completely to your side (100% in your direction)</span>
                    </li>
                  </ul>
                </motion.div>
              )}
              
              {activeTab === "tips" && (
                <motion.div
                  key="tips"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="text-gray-300"
                >
                  <h4 className="text-xl font-semibold mb-4 text-blue-300">Pro Tips</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* <div className="bg-gray-800 bg-opacity-50 p-4 rounded-lg">
                      <h5 className="font-semibold text-purple-300 mb-2">Speed Matters</h5>
                      <p>Answer quickly but accurately. If both teams answer correctly, the faster team gets an advantage.</p>
                    </div> */}
                    <div className="bg-gray-800 bg-opacity-50 p-4 rounded-lg">
                      <h5 className="font-semibold text-purple-300 mb-2">Team Communication</h5>
                      <p>Coordinate with your teammates to discuss answers quickly before submitting.</p>
                    </div>
                    {/* <div className="bg-gray-800 bg-opacity-50 p-4 rounded-lg">
                      <h5 className="font-semibold text-purple-300 mb-2">Watch the Timer</h5>
                      <p>Don't let time run out! It's better to make an educated guess than to miss answering.</p>
                    </div> */}
                    <div className="bg-gray-800 bg-opacity-50 p-4 rounded-lg">
                      <h5 className="font-semibold text-purple-300 mb-2">Learn from Mistakes</h5>
                      <p>Pay attention to explanations after each question to improve your knowledge.</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* Game Preview Section */}
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="bg-gray-800 bg-opacity-30 p-8 rounded-2xl shadow-xl"
        >
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-8 md:mb-0 md:pr-8">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Real-time Tug of War</h2>
              <p className="text-xl text-gray-300 mb-6">
                Watch the rope move in real-time as teams answer questions correctly. The first team to pull the rope completely to their side wins!
              </p>
              <div className="flex flex-wrap gap-3">
                <div className="bg-blue-900 bg-opacity-50 px-4 py-2 rounded-lg">
                  <span className="text-blue-300 font-semibold">Real-time Updates</span>
                </div>
                <div className="bg-purple-900 bg-opacity-50 px-4 py-2 rounded-lg">
                  <span className="text-purple-300 font-semibold">Socket.io Powered</span>
                </div>
                <div className="bg-green-900 bg-opacity-50 px-4 py-2 rounded-lg">
                  <span className="text-green-300 font-semibold">Interactive UI</span>
                </div>
              </div>
            </div>
            <div className="md:w-1/2 bg-gray-900 bg-opacity-70 rounded-xl p-4 shadow-inner">
              <div className="w-full h-48 bg-gray-800 rounded-lg flex items-center justify-center relative overflow-hidden">
                <div className="absolute w-full h-8 bg-green-900 opacity-30"></div>
                <div className="absolute left-0 h-full w-1/2 flex items-center justify-start pl-4">
                  <span className="font-bold text-blue-400">Team A</span>
                </div>
                <div className="absolute right-0 h-full w-1/2 flex items-center justify-end pr-4">
                  <span className="font-bold text-red-400">Team B</span>
                </div>
                <div className="w-3/4 h-3 bg-amber-700 rounded-full relative">
                  <motion.div 
                    className="absolute -left-3 h-12 w-4 bg-amber-800 rounded-lg"
                    style={{ 
                      left: `calc(${animateRope ? ropePosition : 50}% - 8px)` 
                    }}
                    transition={{ type: "spring", stiffness: 100 }}
                  ></motion.div>
                  <div className="absolute -right-3 h-12 w-4 bg-amber-800 rounded-lg"></div>
                </div>
              </div>
              <div className="mt-4 text-center text-sm text-gray-400">
                {animateRope ? (
                  <p>Live demonstration: Watch the rope move as teams answer correctly!</p>
                ) : (
                  <p>Click "See Animation" above to watch a demo of the rope movement</p>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 py-8 mt-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="text-xl font-bold">Tug of War Quiz</h3>
              <p className="text-gray-400 text-sm"> 2025 All Rights Reserved</p>
            </div>
            <div className="flex gap-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                About
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Help
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Privacy
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

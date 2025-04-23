import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { io } from "socket.io-client";
import TugOfWarQuiz from "@/components/TugOfWarSocket";
import questions from "../../questions_40.json";
import { CONFIG } from "../config";

const SOCKET_SERVER_URL = CONFIG.SOCKET_SERVER_URL;

export default function GameRoom() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [socket, setSocket] = useState(null);
  const [roomInfo, setRoomInfo] = useState({ gameStarted: false, winner: null });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminName, setAdminName] = useState(localStorage.getItem("adminName") || "Admin");
  const [myTeam, setMyTeam] = useState(localStorage.getItem("myTeam") || "");
  const [team1Token, setTeam1Token] = useState(localStorage.getItem("team1Token") || "");
  const [team2Token, setTeam2Token] = useState(localStorage.getItem("team2Token") || "");
  const [teamToken, setTeamToken] = useState(localStorage.getItem("teamToken") || "");
  
  const [question, setQuestion] = useState(null);
  const [selected, setSelected] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [lastCorrectTeam, setLastCorrectTeam] = useState(null);
  const [countdown, setCountdown] = useState(5);
  const [isPaused, setIsPaused] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [waitingForOtherTeam, setWaitingForOtherTeam] = useState(true);
  const [prevQuestions, setPrevQuestions] = useState(() => {
    // Load previously asked questions from localStorage
    const savedQuestions = localStorage.getItem(`prevQuestions-${roomId}`);
    return savedQuestions ? JSON.parse(savedQuestions) : [];
  });
  
  const intervalRef = useRef(null);
  const socketRef = useRef(null);

  // Check admin authentication using token
  useEffect(() => {
    const adminToken = localStorage.getItem("adminToken");
    
    if (adminToken) {
      try {
        // Decode the token
        const tokenData = atob(adminToken);
        const [storedToken, timestamp] = tokenData.split(":");
        
        // Check if the token is valid
        if (storedToken !== CONFIG.ADMIN_ACCESS_TOKEN) {
          throw new Error("Invalid admin token");
        }
        
        // Check if the token has expired (e.g., after 24 hours)
        const tokenTime = parseInt(timestamp, 10);
        const currentTime = new Date().getTime();
        const tokenAge = currentTime - tokenTime;
        const maxTokenAge = 24 * 60 * 60 * 1000; // 24 hours
        
        if (tokenAge > maxTokenAge) {
          throw new Error("Admin token has expired");
        }
        
        // Token is valid, set admin status
        setIsAdmin(true);
      } catch (error) {
        // Invalid or expired token
        localStorage.removeItem("adminToken");
        setIsAdmin(false);
        toast.error("Admin authentication failed", {
          description: error.message || "Please log in again with your admin access token",
        });
      }
    } else {
      // No admin token found
      setIsAdmin(false);
    }
  }, []);

  // Connect to socket server and join room
  useEffect(() => {
    const newSocket = io(SOCKET_SERVER_URL);
    setSocket(newSocket);
    socketRef.current = newSocket;
    
    // Join the room
    if (isAdmin) {
      newSocket.emit("join_room", { 
        roomId, 
        team: adminName,
        isAdmin: true,
        adminToken: localStorage.getItem("adminToken") // Send admin token for server-side verification
      });
    } else {
      newSocket.emit("join_room", { 
        roomId, 
        team: myTeam,
        isAdmin: false,
        teamToken: teamToken // Include the team token for secure access
      });
    }
    
    // Set up event listeners
    newSocket.on("joined_room", ({ roomId, roomInfo, isAdmin }) => {
      setRoomInfo(roomInfo);
      setIsLoading(false);
      setIsAdmin(isAdmin);
      
      // If admin, store team tokens
      if (isAdmin && roomInfo.team1Token && roomInfo.team2Token) {
        setTeam1Token(roomInfo.team1Token);
        setTeam2Token(roomInfo.team2Token);
        localStorage.setItem("team1Token", roomInfo.team1Token);
        localStorage.setItem("team2Token", roomInfo.team2Token);
      }
      
      // Check if both teams are connected
      if (roomInfo.team1Connected && roomInfo.team2Connected) {
        setWaitingForOtherTeam(false);
      } else {
        setWaitingForOtherTeam(true);
      }
      
      // If game is already in progress and we're refreshing the page,
      // fetch a new question immediately (but not for admin)
      if (roomInfo.gameStarted && !question && !isAdmin && !roomInfo.winner) {
        fetchQuestion();
      }
    });
    
    newSocket.on("room_update", (updatedRoomInfo) => {
      setRoomInfo(updatedRoomInfo);
      
      // Check if both teams are connected
      if (updatedRoomInfo.team1Connected && updatedRoomInfo.team2Connected) {
        setWaitingForOtherTeam(false);
        toast.success("Both teams are connected!");
      }
    });
    
    newSocket.on("game_started", (updatedRoomInfo) => {
      setRoomInfo(updatedRoomInfo);
      fetchQuestion();
      toast.success("Game started!");
    });
    
    newSocket.on("rope_updated", (updatedRoomInfo) => {
      setRoomInfo(updatedRoomInfo);
      
      // Check if there's a winner
      if (updatedRoomInfo.winner) {
        // Clear any existing countdown timer
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        
        // Show the winner announcement to all players
        setShowResults(true);
        setSubmitted(true); // Prevent further answers
        
        // Show different messages based on whether you won or lost
        if (myTeam === updatedRoomInfo.winner) {
          toast.success("Your team wins! 🎉", {
            description: "Congratulations! Your team has won the game!"
          });
        } else if (!isAdmin) {
          toast.error(`${updatedRoomInfo.winner} wins the game!`, {
            description: "Game Over! Your team has lost the quiz."
          });
        } else {
          toast.success(`${updatedRoomInfo.winner} wins the game!`, {
            description: "Game Over! The quiz has ended."
          });
        }
      }
    });
    
    newSocket.on("game_reset", (updatedRoomInfo) => {
      setRoomInfo(updatedRoomInfo);
      setLastCorrectTeam(null);
      setQuestion(null);
      setSelected("");
      setSubmitted(false);
      setShowResults(false);
      
      // Clear previously asked questions when game is reset
      setPrevQuestions([]);
      localStorage.removeItem(`prevQuestions-${roomId}`);
      
      toast.success("Game has been reset");
    });
    
    newSocket.on("error", ({ message }) => {
      toast.error("Error", {
        description: message,
      });
      setError(message);
    });
    
    return () => {
      newSocket.disconnect();
    };
  }, [roomId, isAdmin, myTeam]);

  useEffect(() => {
    if (!socket || !roomInfo) return;
    
    // Fetch a question when the game starts or when the page is refreshed
    if (roomInfo.gameStarted && !question && !isAdmin && !roomInfo.winner) {
      fetchQuestion();
    }
  }, [roomInfo, socket, question]);

  const startGame = () => {
    if (!socket) return;
    
    socket.emit("start_game", { roomId });
  };

  const fetchQuestion = () => {
    const allQuestions = questions.technical_questions_json.quiz;
    const totalQuestions = allQuestions.length;
    
    // Reset previously asked questions if all questions have been used
    if (prevQuestions.length >= totalQuestions - 1) {
      setPrevQuestions([]);
      localStorage.removeItem(`prevQuestions-${roomId}`);
      toast.info("All questions have been used. Starting fresh!");
    }
    
    // Find a question that hasn't been asked before
    let randomIndex;
    let attempts = 0;
    const maxAttempts = 50; // Prevent infinite loop
    
    do {
      randomIndex = Math.floor(Math.random() * totalQuestions);
      attempts++;
    } while (prevQuestions.includes(randomIndex) && attempts < maxAttempts);
    
    // Update the list of previously asked questions
    const updatedPrevQuestions = [...prevQuestions, randomIndex];
    setPrevQuestions(updatedPrevQuestions);
    
    // Store in localStorage with room-specific key
    localStorage.setItem(`prevQuestions-${roomId}`, JSON.stringify(updatedPrevQuestions));
    
    // Set the new question
    setQuestion(allQuestions[randomIndex]);
    setSelected("");
    setSubmitted(false);
    setShowResults(false);
  };

  const handleSubmit = () => {
    if (!question || !selected) return;
    
    const isCorrect = selected === question.options[question.correctOption];
    
    if (isCorrect) {
      // Determine which team answered correctly
      const teamAnswering = myTeam === roomInfo.team1 ? "A" : "B";
      setLastCorrectTeam(teamAnswering);
      
      // Update the rope position via socket
      socket.emit("update_rope", { 
        roomId, 
        teamAnswering 
      });
    }
    
    setSubmitted(true);
    
    // Add a 2-second delay before showing the results overlay
    // This allows time for the rope animation to complete
    setTimeout(() => {
      setShowResults(true);
      
      // Check if there's a winner after the rope update
      // We need to check the updated roomInfo from the socket event
      if (roomInfo.winner) {
        // Game is over, don't start the timer or fetch new questions
        return;
      }
      
      // Start the countdown timer immediately when overlay appears
      setCountdown(5);
      setIsPaused(false);
      
      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            fetchQuestion();
            setShowResults(false); // Hide the overlay when fetching new question
            return 5;
          }
          return prev - 1;
        });
      }, 1000);
    }, 2000); // 2-second delay for rope animation
  };

  const resetGame = () => {
    if (!socket) return;
    
    // Clear previously asked questions when resetting the game
    setPrevQuestions([]);
    localStorage.removeItem(`prevQuestions-${roomId}`);
    
    socket.emit("reset_game", { roomId });
  };

  const togglePause = () => {
    if (isPaused) {
      // Resume timer
      intervalRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            fetchQuestion();
            return 10;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      // Pause timer
      clearInterval(intervalRef.current);
    }
    setIsPaused(!isPaused);
  };

  // Clean up interval on component unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0f172a] to-[#1e293b] text-white">
        <div className="flex flex-col items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-xl text-gray-300">Connecting to room...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0f172a] to-[#1e293b] text-white">
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <div className="bg-red-500 bg-opacity-20 p-4 rounded-lg mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className="text-xl font-bold text-center mb-2">Error</h2>
            <p className="text-center text-sm sm:text-base">{error}</p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f172a] to-[#1e293b] text-white">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 flex flex-col min-h-screen">
        {/* Room Header */}
        <div className="bg-gray-800 bg-opacity-50 p-3 sm:p-4 rounded-lg mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 sm:mb-0">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-0">
                Room: <span className="text-blue-400">{roomId}</span>
              </h1>
              <div className="flex items-center space-x-2 text-sm sm:text-base text-gray-300">
                <span>Status:</span>
                {roomInfo.gameStarted ? (
                  <span className="text-green-400 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Game in Progress
                  </span>
                ) : (
                  <span className="text-yellow-400 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Waiting to Start
                  </span>
                )}
              </div>
            </div>
            <div className="flex mt-2 sm:mt-0">
              {isAdmin && (
                <button
                  onClick={startGame}
                  disabled={roomInfo.gameStarted || waitingForOtherTeam}
                  className={`mr-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-sm sm:text-base font-medium flex items-center ${
                    roomInfo.gameStarted || waitingForOtherTeam
                      ? "bg-gray-600 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  </svg>
                  Start Game
                </button>
              )}
              {isAdmin && roomInfo.gameStarted && (
                <button
                  onClick={resetGame}
                  className="px-3 sm:px-4 py-1.5 bg-red-600 hover:bg-red-700 rounded-lg text-sm sm:text-base font-medium flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Reset Game
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Teams Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className={`bg-gray-800 bg-opacity-50 p-3 sm:p-4 rounded-lg ${roomInfo.team1Connected ? "border-l-4 border-green-500" : "border-l-4 border-red-500"}`}>
            <div className="flex justify-between items-center">
              <h2 className="text-lg sm:text-xl font-semibold text-blue-400 flex items-center">
                {roomInfo.team1}
                {myTeam === roomInfo.team1 && !isAdmin && (
                  <span className="ml-2 bg-blue-600 text-white text-xs font-medium px-2 py-0.5 rounded">You</span>
                )}
              </h2>
              <div className="flex items-center">
                {roomInfo.team1Connected ? (
                  <span className="text-green-400 text-sm sm:text-base flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Connected
                  </span>
                ) : (
                  <span className="text-red-400 text-sm sm:text-base flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Waiting
                  </span>
                )}
              </div>
            </div>
            {isAdmin && (
              <div className="mt-2 text-xs sm:text-sm text-gray-400 flex items-center gap-4">
                Share link: 
                <button
                  onClick={() => {
                    const team1Link = `${window.location.origin}/join/${roomId}?token=${team1Token}`;
                    navigator.clipboard.writeText(team1Link);
                    toast.success(`${roomInfo.team1} link copied!`);
                  }}
                  className="ml-1 text-blue-400 hover:text-blue-300"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                </button>
              </div>
            )}
          </div>
          <div className={`bg-gray-800 bg-opacity-50 p-3 sm:p-4 rounded-lg ${roomInfo.team2Connected ? "border-r-4 border-green-500" : "border-r-4 border-red-500"}`}>
            <div className="flex justify-between items-center">
              <h2 className="text-lg sm:text-xl font-semibold text-red-400 flex items-center">
                {roomInfo.team2}
                {myTeam === roomInfo.team2 && !isAdmin && (
                  <span className="ml-2 bg-red-600 text-white text-xs font-medium px-2 py-0.5 rounded">You</span>
                )}
              </h2>
              <div className="flex items-center">
                {roomInfo.team2Connected ? (
                  <span className="text-green-400 text-sm sm:text-base flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Connected
                  </span>
                ) : (
                  <span className="text-red-400 text-sm sm:text-base flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Waiting
                  </span>
                )}
              </div>
            </div>
            {isAdmin && (
              <div className="mt-2 text-xs sm:text-sm text-gray-400 flex items-center gap-4">
                Share link: 
                <button
                  onClick={() => {
                    const team2Link = `${window.location.origin}/join/${roomId}?token=${team2Token}`;
                    navigator.clipboard.writeText(team2Link);
                    toast.success(`${roomInfo.team2} link copied!`);
                  }}
                  className="ml-1 text-blue-400 hover:text-blue-300"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Waiting for Teams */}
        {waitingForOtherTeam && !roomInfo.gameStarted && (
          <div className="bg-yellow-900 bg-opacity-20 p-4 rounded-lg mb-6 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-yellow-500 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-xl font-bold mb-2">Waiting for both teams to connect</h2>
            <p className="text-gray-300 mb-4">The game will be ready to start once both teams have joined the room.</p>
            {isAdmin && (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                <button
                  onClick={() => {
                    const team1Link = `${window.location.origin}/join/${roomId}?token=${team1Token}`;
                    navigator.clipboard.writeText(team1Link);
                    toast.success(`${roomInfo.team1} link copied!`);
                  }}
                  className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors"
                >
                  Copy Team 1 Link
                </button>
                <button
                  onClick={() => {
                    const team2Link = `${window.location.origin}/join/${roomId}?token=${team2Token}`;
                    navigator.clipboard.writeText(team2Link);
                    toast.success(`${roomInfo.team2} link copied!`);
                  }}
                  className="w-full sm:w-auto px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white font-medium transition-colors"
                >
                  Copy Team 2 Link
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tug of War Game */}
        <div className="flex-grow">
          {roomInfo.gameStarted ? (
            <>
              {/* Tug of War Visualization */}
              <TugOfWarQuiz
                teamAnswering={lastCorrectTeam}
                ropePosition={roomInfo.ropePosition}
                team1={roomInfo.team1}
                team2={roomInfo.team2}
                winner={roomInfo.winner}
                onReset={resetGame}
                myTeam={myTeam}
                team1Score={roomInfo.team1Score || 0}
                team2Score={roomInfo.team2Score || 0}
              />

              {/* Quiz Section */}
              {!isAdmin && !roomInfo.winner && (
                <div className="mt-6 bg-gray-800 bg-opacity-50 p-4 rounded-lg">
                  {question ? (
                    <>
                      {/* Question */}
                      <div className="mb-4">
                        <h3 className="text-lg sm:text-xl font-semibold mb-2">Question:</h3>
                        <p className="text-base sm:text-lg bg-gray-700 bg-opacity-50 p-3 rounded-lg">{question.question}</p>
                      </div>

                      {/* Options */}
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold mb-2">Options:</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                          {question.options?.map((opt, index) => (
                            <button
                              key={index}
                              onClick={() => setSelected(opt)}
                              disabled={submitted}
                              className={`p-3 rounded-lg text-left transition-all ${
                                selected === opt
                                  ? "bg-blue-600 text-white"
                                  : "bg-gray-700 hover:bg-gray-600 text-gray-200"
                              } ${submitted ? "cursor-not-allowed opacity-70" : ""}`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Submit Button */}
                      <div className="flex justify-center">
                        <button
                          onClick={handleSubmit}
                          disabled={!selected || submitted}
                          className={`px-6 py-2 rounded-lg font-semibold ${
                            !selected || submitted
                              ? "bg-gray-600 cursor-not-allowed"
                              : "bg-green-600 hover:bg-green-700"
                          }`}
                        >
                          {submitted ? "Submitting..." : "Submit Answer"}
                        </button>
                      </div>

                      {/* Results */}
                      {showResults && (
                        <div className={`mt-4 p-3 rounded-lg ${
                          selected === question.options[question.correctOption] ? "bg-green-900 bg-opacity-30" : "bg-red-900 bg-opacity-30"
                        }`}>
                          <h3 className="font-semibold mb-2">Result:</h3>
                          {selected === question.options[question.correctOption] ? (
                            <p className="text-green-400 flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Correct! The answer is: {question.options[question.correctOption]}
                            </p>
                          ) : (
                            <p className="text-red-400 flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              Incorrect. The correct answer is: {question.options[question.correctOption]}
                            </p>
                          )}
                          {question.explanation && (
                            <div className="mt-2 text-gray-300 text-sm">
                              <p><strong>Explanation:</strong> {question.explanation}</p>
                            </div>
                          )}
                          <div className="mt-3 text-center">
                            <p className="text-sm text-gray-400 mb-2">Next question in {countdown} seconds...</p>
                            <div className="w-full bg-gray-700 rounded-full h-2.5">
                              <div
                                className="bg-blue-600 h-2.5 rounded-full transition-all duration-1000"
                                style={{ width: `${(countdown / 5) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                      <p className="text-lg text-gray-300">Loading question...</p>
                    </div>
                  )}
                </div>
              )}

              {/* Admin View */}
              {isAdmin && !roomInfo.winner && (
                <div className="mt-6 bg-gray-800 bg-opacity-50 p-4 rounded-lg">
                  <h3 className="text-xl font-semibold mb-4">Admin Controls</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div className="bg-gray-700 bg-opacity-50 p-3 rounded-lg">
                      <h4 className="font-semibold mb-2 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Game Status
                      </h4>
                      <ul className="text-sm space-y-2">
                        <li className="flex justify-between">
                          <span>Team 1 ({roomInfo.team1}):</span>
                          <span className={roomInfo.team1Connected ? "text-green-400" : "text-red-400"}>
                            {roomInfo.team1Connected ? "Connected" : "Disconnected"}
                          </span>
                        </li>
                        <li className="flex justify-between">
                          <span>Team 2 ({roomInfo.team2}):</span>
                          <span className={roomInfo.team2Connected ? "text-green-400" : "text-red-400"}>
                            {roomInfo.team2Connected ? "Connected" : "Disconnected"}
                          </span>
                        </li>
                        <li className="flex justify-between">
                          <span>Rope Position:</span>
                          <span>{roomInfo.ropePosition}</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div className="bg-gray-700 bg-opacity-50 p-3 rounded-lg">
                      <h4 className="font-semibold mb-2 flex items-center justify-center pt-10">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Game Controls
                      </h4>
                      <div className="space-y-2 px-40 pb-10">
                        
                        <button
                          onClick={resetGame}
                          className="w-full px-3 py-1.5 bg-red-600 hover:bg-red-700 rounded text-sm font-medium"
                        >
                          Reset Game
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Game Log */}
                  {/* <div className="bg-gray-700 bg-opacity-50 p-3 rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      Game Log
                    </h4>
                    <div className="max-h-40 overflow-y-auto text-sm bg-gray-800 p-2 rounded">
                      {prevQuestions.length > 0 ? (
                        <ul className="space-y-2">
                          {prevQuestions.map((q, index) => (
                            <li key={index} className="border-b border-gray-700 pb-1">
                              <p><strong>Q{index + 1}:</strong> {q.question}</p>
                              <p className={`text-xs ${q.team1Correct ? "text-green-400" : "text-red-400"}`}>
                                {roomInfo.team1}: {q.team1Correct ? "Correct" : "Incorrect"}
                              </p>
                              <p className={`text-xs ${q.team2Correct ? "text-green-400" : "text-red-400"}`}>
                                {roomInfo.team2}: {q.team2Correct ? "Correct" : "Incorrect"}
                              </p>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-400 italic">No questions answered yet</p>
                      )}
                    </div>
                  </div> */}
                </div>
              )}
            </>
          ) : (
            <div className="bg-gray-800 bg-opacity-50 p-4 rounded-lg text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-blue-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-2xl font-bold mb-2">Ready to Start</h2>
              <p className="text-gray-300 mb-6">The game is ready to begin. Wait for the admin to start the game.</p>
              
              {isAdmin && !waitingForOtherTeam && (
                <button
                  onClick={startGame}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg text-white font-semibold transition-colors"
                >
                  Start Game
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

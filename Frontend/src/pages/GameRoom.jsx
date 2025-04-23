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
    // Enhanced Socket.io configuration for better compatibility with serverless platforms
    const newSocket = io(SOCKET_SERVER_URL, {
      transports: ['websocket', 'polling'], // Try WebSocket first, fallback to polling
      reconnectionAttempts: 5,             // Try to reconnect 5 times
      reconnectionDelay: 1000,             // Start with 1s delay between reconnection attempts
      reconnectionDelayMax: 5000,          // Maximum delay between reconnections
      timeout: 20000,                      // Connection timeout
      forceNew: true                       // Force a new connection
    });
    
    setSocket(newSocket);
    socketRef.current = newSocket;
    
    // Connection event handlers
    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
      
      // Join the room after successful connection
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
    });
    
    newSocket.on('connect_error', (err) => {
      console.error('Connection error:', err);
      toast.error("Connection error", {
        description: "Could not connect to the game server. Retrying..."
      });
    });
    
    newSocket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      if (reason === 'io server disconnect') {
        // The server has forcefully disconnected the socket
        toast.error("Disconnected from server", {
          description: "The server has disconnected. Attempting to reconnect..."
        });
        newSocket.connect(); // Manually reconnect
      }
    });
    
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
      <div className="h-screen bg-gradient-to-b from-[#0f172a] to-[#1e293b] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6 text-center">
          <p className="text-xl">Connecting to room...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen bg-gradient-to-b from-[#0f172a] to-[#1e293b] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6 text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-xl mb-6">{error}</p>
          <button
            onClick={() => navigate("/")}
            className="bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold py-2 px-6 rounded-lg shadow-md transition-all duration-200"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 overflow-hidden">
      <div className="h-full px-2 py-2">
        <div className="grid grid-cols-12 gap-4 h-full">
          {/* Team A Column */}
          <div className="col-span-2 bg-white rounded-lg shadow-lg p-2">
            <div className="text-center">
              <h2 className="text-xl font-bold text-blue-600 mb-1">{roomInfo.team1}</h2>
              <div className="text-4xl font-bold text-blue-700">{roomInfo.team1Score}</div>
              <p className="text-blue-500 text-sm">Points</p>
              <div className="mt-2 text-sm">
                {roomInfo.team1Connected ? (
                  <span className="inline-block px-2 py-1 bg-green-100 text-green-800 rounded-full">Connected</span>
                ) : (
                  <span className="inline-block px-2 py-1 bg-red-100 text-red-800 rounded-full">Waiting</span>
                )}
              </div>
              {myTeam === roomInfo.team1 && !isAdmin && (
                <div className="mt-2 text-sm">
                  <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded-full">You</span>
                </div>
              )}
            </div>
          </div>

          {/* Middle Column - Game Content */}
          <div className="col-span-8 flex flex-col">
            {/* Room Info */}
            <div className="bg-white rounded-lg shadow-md p-2 mb-2 flex justify-between items-center">
              <div>
                <span className="text-sm text-gray-500">Room ID:</span>
                <span className="ml-2 font-semibold">{roomId}</span>
              </div>
              <div>
                <span className="text-sm text-gray-500">Your Role:</span>
                <span className="ml-2 font-semibold">
                  {isAdmin ? (
                    <span className="text-purple-600">{adminName} (Admin)</span>
                  ) : (
                    <span className="text-blue-600">{myTeam}</span>
                  )}
                </span>
              </div>
              <button
                onClick={() => {
                  // Clear admin token if present
                  if (localStorage.getItem("adminToken")) {
                    localStorage.removeItem("adminToken");
                  }
                  navigate("/");
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-sm font-semibold shadow-md transition-all duration-200"
              >
                Leave Room
              </button>
            </div>

            {/* Tug of War Component */}
            <div className="mb-2">
              <TugOfWarQuiz 
                teamAnswering={lastCorrectTeam} 
                ropePosition={roomInfo.ropePosition}
                team1={roomInfo.team1}
                team2={roomInfo.team2}
                winner={roomInfo.winner}
                onReset={resetGame}
              />
            </div>

            {/* Admin Panel */}
            {isAdmin && (
              <div className="bg-white rounded-lg shadow-lg p-4 mb-4 max-w-md mx-auto w-full">
                <h3 className="text-xl font-semibold text-gray-800 mb-3 text-center">Admin Panel</h3>
                <div className="grid grid-cols-1 gap-3 mb-3">
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <p className="text-sm font-medium text-gray-500 mb-1">Room Status:</p>
                    <p className="text-base font-bold">
                      {roomInfo.gameStarted ? (
                        <span className="text-green-600">Game In Progress</span>
                      ) : (
                        <span className="text-yellow-600">Waiting to Start</span>
                      )}
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <p className="text-sm font-medium text-gray-500 mb-2">Teams Connected:</p>
                    <div className="flex flex-col space-y-2">
                      <div className={`flex items-center justify-between p-2 rounded-lg ${
                        roomInfo.team1Connected ? "bg-green-100" : "bg-red-50"
                      }`}>
                        <div className="flex items-center">
                          <div className={`w-2.5 h-2.5 rounded-full mr-2 ${
                            roomInfo.team1Connected ? "bg-green-500" : "bg-red-500"
                          }`}></div>
                          <span className="font-medium text-sm">{roomInfo.team1}</span>
                        </div>
                        <span className={`text-xs font-medium ${
                          roomInfo.team1Connected ? "text-green-600" : "text-red-600"
                        }`}>
                          {roomInfo.team1Connected ? "Connected" : "Waiting"}
                        </span>
                      </div>
                      
                      <div className={`flex items-center justify-between p-2 rounded-lg ${
                        roomInfo.team2Connected ? "bg-green-100" : "bg-red-50"
                      }`}>
                        <div className="flex items-center">
                          <div className={`w-2.5 h-2.5 rounded-full mr-2 ${
                            roomInfo.team2Connected ? "bg-green-500" : "bg-red-500"
                          }`}></div>
                          <span className="font-medium text-sm">{roomInfo.team2}</span>
                        </div>
                        <span className={`text-xs font-medium ${
                          roomInfo.team2Connected ? "text-green-600" : "text-red-600"
                        }`}>
                          {roomInfo.team2Connected ? "Connected" : "Waiting"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-3 flex justify-center">
                  {!roomInfo.gameStarted && roomInfo.team1Connected && roomInfo.team2Connected ? (
                    <button
                      onClick={startGame}
                      className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg text-sm font-semibold shadow-md transition-all duration-200 w-full"
                    >
                      Start Game
                    </button>
                  ) : !roomInfo.gameStarted ? (
                    <div className="grid grid-cols-2 gap-2 w-full">
                      <button
                        onClick={() => {
                          const team1Link = `${window.location.origin}/join/${roomId}?token=${team1Token}`;
                          navigator.clipboard.writeText(team1Link);
                          toast.success(`${roomInfo.team1} link copied!`);
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1.5 rounded-lg text-xs font-semibold shadow-md transition-all duration-200 flex items-center justify-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Copy {roomInfo.team1} Link
                      </button>
                      <button
                        onClick={() => {
                          const team2Link = `${window.location.origin}/join/${roomId}?token=${team2Token}`;
                          navigator.clipboard.writeText(team2Link);
                          toast.success(`${roomInfo.team2} link copied!`);
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white px-2 py-1.5 rounded-lg text-xs font-semibold shadow-md transition-all duration-200 flex items-center justify-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Copy {roomInfo.team2} Link
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={resetGame}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white px-5 py-2 rounded-lg text-sm font-semibold shadow-md transition-all duration-200 w-full flex items-center justify-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Reset Game
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Waiting message for teams */}
            {!isAdmin && waitingForOtherTeam && (
              <div className="bg-white rounded-lg shadow-lg p-4 text-center">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Waiting for the other team to connect</h3>
                <p className="text-gray-600">The admin will start the game once both teams are ready</p>
              </div>
            )}
            
            {!isAdmin && !waitingForOtherTeam && !roomInfo.gameStarted && (
              <div className="bg-white rounded-lg shadow-lg p-4 text-center">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Both teams are connected!</h3>
                <p className="text-gray-600">Waiting for the admin to start the game</p>
              </div>
            )}
            
            {/* Winner Announcement for teams when not in overlay */}
            {!isAdmin && roomInfo.winner && !showResults && (
              <div className="bg-white rounded-lg shadow-lg p-4 text-center">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  {myTeam === roomInfo.winner ? (
                    <span className="text-green-600">Your team has won! 🎉</span>
                  ) : (
                    <span className="text-red-600">Your team has lost!</span>
                  )}
                </h3>
                <p className="text-gray-600 mb-4">
                  {myTeam === roomInfo.winner
                    ? "Congratulations! Your team pulled the rope all the way!"
                    : `${roomInfo.winner} has won the game by pulling the rope all the way.`}
                </p>
                <button
                  onClick={() => {
                    // Clear all game-related localStorage items
                    localStorage.removeItem(`prevQuestions-${roomId}`);
                    localStorage.removeItem('teamToken');
                    localStorage.removeItem('myTeam');
                    localStorage.removeItem('roomId');
                    localStorage.removeItem('adminToken');
                    
                    // Navigate to home page
                    navigate('/');
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-md transition-all duration-200"
                >
                  Return to Home
                </button>
              </div>
            )}

            {/* Question Section */}
            {roomInfo.gameStarted && question && !isAdmin && !roomInfo.winner && (
              <div className="bg-white rounded-lg shadow-lg p-3 flex-1 overflow-y-auto px-10">
                <h3 className="text-lg font-bold text-gray-800 mb-1 py-2 ">Question:</h3>
                <p className="text-base text-gray-700 mb-2">{question.question}</p>

                {/* Options */}
                <div className="space-y-1 mb-2">
                  {question.options?.map((opt, index) => (
                    <label
                      key={index}
                      className={`flex items-center p-2 rounded-lg border-2 cursor-pointer transition-colors ${
                        selected === opt
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-blue-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="question"
                        value={opt}
                        checked={selected === opt}
                        onChange={(e) => setSelected(e.target.value)}
                        disabled={submitted}
                        className="mr-2 h-4 w-4 text-blue-600"
                      />
                      <span className="text-sm text-gray-700">{opt}</span>
                    </label>
                  ))}
                </div>

                {/* Submit Button */}
                <div className="text-center mt-4">
                  <button
                    onClick={handleSubmit}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg text-base font-semibold shadow-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    disabled={submitted || !selected}
                  >
                    Submit Answer
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Team B Column */}
          <div className="col-span-2 bg-white rounded-lg shadow-lg p-2">
            <div className="text-center">
              <h2 className="text-xl font-bold text-red-600 mb-1">{roomInfo.team2}</h2>
              <div className="text-4xl font-bold text-red-700">{roomInfo.team2Score}</div>
              <p className="text-red-500 text-sm">Points</p>
              <div className="mt-2 text-sm">
                {roomInfo.team2Connected ? (
                  <span className="inline-block px-2 py-1 bg-green-100 text-green-800 rounded-full">Connected</span>
                ) : (
                  <span className="inline-block px-2 py-1 bg-red-100 text-red-800 rounded-full">Waiting</span>
                )}
              </div>
              {myTeam === roomInfo.team2 && !isAdmin && (
                <div className="mt-2 text-sm">
                  <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded-full">You</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Results Overlay */}
        {showResults && (
          <div className="fixed inset-0 bg-white bg-opacity-95 flex flex-col items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-4 max-w-3xl w-full">
              {roomInfo.winner ? (
                <div className="text-center py-4">
                  <h2 className="text-4xl font-bold mb-2 text-green-600">
                    {roomInfo.winner} Wins!
                  </h2>
                  <div className="py-4 px-6 bg-green-50 rounded-lg border border-green-100 mb-6">
                    <p className="text-xl text-gray-700 mb-2">
                      Final Score: <span className="font-bold text-blue-600">{roomInfo.team1Score}</span> - <span className="font-bold text-red-600">{roomInfo.team2Score}</span>
                    </p>
                    <p className="text-gray-600">
                      The quiz has ended. {roomInfo.winner} has pulled the rope all the way to their side!
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      // Clear all game-related localStorage items
                      localStorage.removeItem(`prevQuestions-${roomId}`);
                      localStorage.removeItem('teamToken');
                      localStorage.removeItem('myTeam');
                      localStorage.removeItem('roomId');
                      localStorage.removeItem('adminToken');
                      
                      // Navigate to home page
                      navigate('/');
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-lg font-semibold shadow-lg transition-all duration-200"
                  >
                    Go to Home
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xl font-bold text-gray-800">
                      Next question in: <span className="text-blue-600">{countdown}</span>
                    </p>
                    <button
                      onClick={togglePause}
                      className="px-4 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      {isPaused ? "Resume" : "Pause"}
                    </button>
                  </div>

                  {submitted && (
                    <div className="mt-2">
                      <h4 className="text-xl font-bold text-gray-800 mb-2">Results:</h4>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-base mb-1">
                          Your answer: <strong className="text-gray-800">{selected}</strong>
                        </p>
                        {selected === question.options[question.correctOption] ? (
                          <div className="text-green-600">
                            <p className="text-lg font-bold mb-1">✅ Correct!</p>
                            <p className="text-base mb-1">
                              +1 point for{" "}
                              <strong className="text-gray-800">
                                {myTeam}
                              </strong>
                            </p>
                            <p className="text-sm text-gray-700">{question.explanation}</p>
                          </div>
                        ) : (
                          <div className="text-red-600">
                            <p className="text-lg font-bold mb-1">❌ Incorrect</p>
                            <p className="text-base mb-1">
                              Correct answer:{" "}
                              <strong className="text-gray-800">
                                {question.options[question.correctOption]}
                              </strong>
                            </p>
                            <p className="text-sm text-gray-700">{question.explanation}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

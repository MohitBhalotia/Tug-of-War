import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { io } from "socket.io-client";
import { CONFIG } from "../config";
import { motion } from "framer-motion";

const SOCKET_SERVER_URL = CONFIG.SOCKET_SERVER_URL;

const FormSchema = z.object({
  team1: z.string().min(2, {
    message: "Team 1 name must be at least 2 characters.",
  }),
  team2: z.string().min(2, {
    message: "Team 2 name must be at least 2 characters.",
  }),
});

export default function RegisterTeams() {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState("");
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [adminName, setAdminName] = useState("Admin");
  
  // Check if admin is authenticated using token
  useEffect(() => {
    const adminToken = localStorage.getItem("adminToken");
    
    if (!adminToken) {
      toast.error("Admin authentication required", {
        description: "Please log in with your admin access token",
      });
      navigate("/admin-login");
      return;
    }
    
    // Verify the admin token
    try {
      // Decode the token
      const tokenData = atob(adminToken);
      const [storedToken, timestamp] = tokenData.split(":");
      
      // Check if the token is valid
      if (storedToken !== CONFIG.ADMIN_ACCESS_TOKEN) {
        throw new Error("Invalid admin token");
      }
      
      // Optional: Check if the token has expired (e.g., after 24 hours)
      const tokenTime = parseInt(timestamp, 10);
      const currentTime = new Date().getTime();
      const tokenAge = currentTime - tokenTime;
      const maxTokenAge = 24 * 60 * 60 * 1000; // 24 hours
      
      if (tokenAge > maxTokenAge) {
        throw new Error("Admin token has expired");
      }
    } catch (error) {
      toast.error("Admin authentication failed", {
        description: error.message || "Please log in again with your admin access token",
      });
      localStorage.removeItem("adminToken");
      navigate("/admin-login");
    }
  }, [navigate]);
  
  const form = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      team1: "",
      team2: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      setIsCreatingRoom(true);
      
      // Connect to socket server
      const socket = io(SOCKET_SERVER_URL);
      
      // Create a new room
      socket.emit("create_room", { 
        team1: data.team1, 
        team2: data.team2 
      });
      
      // Wait for room creation confirmation
      socket.on("room_created", ({ roomId, roomInfo, team1Token, team2Token }) => {
        setRoomId(roomId);
        
        // Store team names and admin info in localStorage
        localStorage.setItem("team1", data.team1);
        localStorage.setItem("team2", data.team2);
        localStorage.setItem("roomId", roomId);
        localStorage.setItem("adminName", adminName);
        localStorage.setItem("team1Token", team1Token);
        localStorage.setItem("team2Token", team2Token);
        
        toast.success("Room created successfully!", {
          description: `Room ID: ${roomId}`,
        });
        
        setIsCreatingRoom(false);
      });
      
      socket.on("error", ({ message }) => {
        toast.error("Error creating room", {
          description: message,
        });
        setIsCreatingRoom(false);
      });
    } catch (error) {
      toast.error("Failed to create room", {
        description: error.message,
      });
      setIsCreatingRoom(false);
    }
  };

  const shareTeam1Link = () => {
    const team1Token = localStorage.getItem("team1Token");
    // Create a shareable link
    const shareableLink = `${window.location.origin}/join/${roomId}?token=${team1Token}`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(shareableLink)
      .then(() => {
        toast.success(`${localStorage.getItem("team1")} link copied!`, {
          description: "Share this link with Team 1",
        });
      })
      .catch(() => {
        toast.error("Failed to copy link");
      });
  };

  const shareTeam2Link = () => {
    const team2Token = localStorage.getItem("team2Token");
    // Create a shareable link
    const shareableLink = `${window.location.origin}/join/${roomId}?token=${team2Token}`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(shareableLink)
      .then(() => {
        toast.success(`${localStorage.getItem("team2")} link copied!`, {
          description: "Share this link with Team 2",
        });
      })
      .catch(() => {
        toast.error("Failed to copy link");
      });
  };

  const startGame = () => {
    navigate(`/room/${roomId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f172a] to-[#1e293b] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Tug of War</h1>
          <p className="text-blue-200">Game Setup</p>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-xl shadow-2xl overflow-hidden"
        >
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-5">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Team Registration</h2>
                  <p className="text-blue-100 text-sm">Create a new game room</p>
                </div>
              </div>
              <button
                onClick={() => {
                  localStorage.removeItem("adminToken");
                  navigate("/");
                }}
                className="text-blue-100 hover:text-white text-sm bg-blue-700 hover:bg-blue-800 px-3 py-1.5 rounded-lg transition-colors flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>

          <div className="p-6">
            {!roomId ? (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="mb-4">
                    <label className="text-gray-700 text-sm font-semibold">Admin Name</label>
                    <div className="relative mt-1">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        value={adminName}
                        onChange={(e) => setAdminName(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all rounded-lg text-sm"
                        placeholder="Enter your name (Admin)"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      You will host the game as admin
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="team1"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 text-sm font-semibold">Team 1</FormLabel>
                          <div className="relative mt-1">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                            </div>
                            <FormControl>
                              <Input
                                placeholder="Enter name of team 1"
                                className="pl-10 h-10 text-sm border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all rounded-lg"
                                {...field}
                              />
                            </FormControl>
                          </div>
                          <FormMessage className="text-red-500 text-xs mt-1" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="team2"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 text-sm font-semibold">Team 2</FormLabel>
                          <div className="relative mt-1">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                            </div>
                            <FormControl>
                              <Input
                                placeholder="Enter name of team 2"
                                className="pl-10 h-10 text-sm border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all rounded-lg"
                                {...field}
                              />
                            </FormControl>
                          </div>
                          <FormMessage className="text-red-500 text-xs mt-1" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex items-center justify-center mt-6">
                    <Button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white text-base font-semibold py-2.5 px-6 rounded-lg shadow-md transition-all duration-200 flex items-center justify-center"
                      disabled={isCreatingRoom}
                    >
                      {isCreatingRoom ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Creating Room...
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          Create Room
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            ) : (
              <div className="space-y-5">
                <div className="p-4 bg-blue-50 rounded-lg text-center border border-blue-100">
                  <p className="text-sm text-gray-600 mb-1">Room ID:</p>
                  <div className="flex items-center justify-center">
                    <p className="text-xl font-bold text-blue-600 mr-2">{roomId}</p>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(roomId);
                        toast.success("Room ID copied to clipboard");
                      }}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <p className="text-gray-700 font-medium text-sm">Share team links:</p>
                  
                  <button
                    onClick={shareTeam1Link}
                    className="w-full flex items-center justify-between bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 text-blue-800 px-4 py-3 rounded-lg transition-colors"
                  >
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                      <span className="font-medium">{localStorage.getItem("team1")}</span>
                    </div>
                    <span className="text-sm flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy Link
                    </span>
                  </button>
                  
                  <button
                    onClick={shareTeam2Link}
                    className="w-full flex items-center justify-between bg-gradient-to-r from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 text-red-800 px-4 py-3 rounded-lg transition-colors"
                  >
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                      <span className="font-medium">{localStorage.getItem("team2")}</span>
                    </div>
                    <span className="text-sm flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy Link
                    </span>
                  </button>
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <button
                    onClick={startGame}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-all duration-200 flex items-center justify-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Go to Game Room
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
        
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-400">
            Version {CONFIG.VERSION} | 2025 Tug of War
          </p>
        </div>
      </div>
    </div>
  );
}

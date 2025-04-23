import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { io } from "socket.io-client";
import { CONFIG } from "../config";

const SOCKET_SERVER_URL = CONFIG.SOCKET_SERVER_URL;

const FormSchema = z.object({
  teamName: z.string().min(2, {
    message: "Team name must be at least 2 characters.",
  }),
});

export default function JoinRoom() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [isJoining, setIsJoining] = useState(false);
  const [roomInfo, setRoomInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [teamToken, setTeamToken] = useState("");
  const [teamName, setTeamName] = useState("");

  const form = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      teamName: "",
    },
  });

  useEffect(() => {
    // Check if the room exists and extract token from URL if present
    const checkRoom = async () => {
      try {
        // Extract token from URL query parameters if present
        const queryParams = new URLSearchParams(window.location.search);
        const token = queryParams.get('token');
        
        if (!token) {
          setError("Team token is required to join a room");
          setIsLoading(false);
          return;
        }
        
        setTeamToken(token);
        localStorage.setItem("teamToken", token);
        
        const response = await fetch(`${SOCKET_SERVER_URL}/api/room/${roomId}`);
        const data = await response.json();
        
        if (data.exists) {
          setRoomInfo(data.room);
          
          // Determine the team name based on the token
          if (token === data.room.team1Token) {
            setTeamName(data.room.team1);
            form.setValue("teamName", data.room.team1);
          } else if (token === data.room.team2Token) {
            setTeamName(data.room.team2);
            form.setValue("teamName", data.room.team2);
          } else {
            setError("Invalid team token");
          }
        } else {
          setError("Room not found");
        }
      } catch (err) {
        setError("Failed to connect to server");
      } finally {
        setIsLoading(false);
      }
    };
    
    if (roomId) {
      checkRoom();
    } else {
      setError("Invalid room ID");
      setIsLoading(false);
    }
  }, [roomId]);

  const onSubmit = async (data) => {
    try {
      setIsJoining(true);
      
      // Connect to socket server
      const socket = io(SOCKET_SERVER_URL);
      
      // Join the room with team token if available
      socket.emit("join_room", { 
        roomId, 
        team: data.teamName,
        teamToken: teamToken
      });
      
      // Wait for join confirmation
      socket.on("joined_room", ({ roomId, roomInfo }) => {
        // Store team name in localStorage
        localStorage.setItem("myTeam", data.teamName);
        localStorage.setItem("roomId", roomId);
        localStorage.setItem("isAdmin", "false");
        
        toast.success("Joined room successfully!", {
          description: `Waiting for the admin to start the game`,
        });
        
        // Navigate to the game room
        navigate(`/room/${roomId}`);
      });
      
      socket.on("error", ({ message }) => {
        toast.error("Error joining room", {
          description: message,
        });
        setIsJoining(false);
      });
    } catch (error) {
      toast.error("Failed to join room", {
        description: error.message,
      });
      setIsJoining(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-gradient-to-b from-[#0f172a] to-[#1e293b] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6 text-center">
          <p className="text-xl">Loading room information...</p>
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
          {error === "Team token is required to join a room" && (
            <p className="text-sm text-gray-600 mb-4">
              Please use the team-specific link provided by the admin to join this room.
            </p>
          )}
          <Button
            onClick={() => navigate("/")}
            className="bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold py-2 px-6 rounded-lg shadow-md transition-all duration-200"
          >
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-b from-[#0f172a] to-[#1e293b] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Join Quiz Room</h2>
          <p className="text-gray-600">Room ID: {roomId}</p>
          
          <div className="mt-4 p-3 bg-gray-100 rounded-lg">
            <p className="text-sm text-gray-600">Teams in this room:</p>
            <p className="text-lg font-semibold text-blue-600">{roomInfo.team1}</p>
            <p className="text-lg font-semibold text-red-600">{roomInfo.team2}</p>
            <p className="text-sm text-gray-500 mt-2">Game hosted by an admin</p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="mb-6 text-center">
              <h3 className="text-xl font-bold text-gray-800 mb-2">Team Verification</h3>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-700">
                  You are joining as <strong className="text-green-800">{teamName}</strong>
                </p>
                <p className="text-sm text-green-600 mt-2">
                  Your team has been verified with a secure token
                </p>
              </div>
              <input type="hidden" name="teamName" value={teamName} />
            </div>

            <div className="flex items-center justify-center mt-8">
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold py-3 px-6 rounded-lg shadow-md transition-all duration-200"
                disabled={isJoining}
              >
                {isJoining ? "Joining..." : "Join Room"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}

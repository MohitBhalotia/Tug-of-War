import React, { useState } from "react";
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

const SOCKET_SERVER_URL = CONFIG.SOCKET_SERVER_URL;

const FormSchema = z.object({
  team1: z.string().min(2, {
    message: "Team 1 name must be at least 2 characters.",
  }),
  team2: z.string().min(2, {
    message: "Team 2 name must be at least 2 characters.",
  }),
});

export default function LandingPage() {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState("");
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [adminName, setAdminName] = useState("Admin");
  
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
      socket.on("room_created", ({ roomId, roomInfo }) => {
        setRoomId(roomId);
        
        // Store team names and admin info in localStorage
        localStorage.setItem("team1", data.team1);
        localStorage.setItem("team2", data.team2);
        localStorage.setItem("roomId", roomId);
        localStorage.setItem("isAdmin", "true");
        localStorage.setItem("adminName", adminName);
        
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

  const shareRoom = () => {
    // Create a shareable link
    const shareableLink = `${window.location.origin}/join/${roomId}`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(shareableLink)
      .then(() => {
        toast.success("Link copied to clipboard!", {
          description: "Share this link with the other team",
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
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-4 sm:p-6">
        <div className="text-center mb-4 sm:mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Tug of War Quiz</h2>
          <p className="text-gray-600 text-sm sm:text-base">Enter team names to create a room</p>
          <p className="text-xs sm:text-sm text-blue-600 mt-1">You will be the admin (not part of any team)</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4">
            <div className="mb-2">
              <label className="text-gray-700 text-base sm:text-lg font-semibold">Admin Name</label>
              <input
                type="text"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                className="w-full h-10 sm:h-12 text-base sm:text-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all rounded-md px-3 mt-1"
                placeholder="Enter your name (Admin)"
              />
              <p className="text-xs sm:text-sm text-gray-500 mt-1">You will host the game as admin</p>
            </div>
            <FormField
              control={form.control}
              name="team1"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 text-base sm:text-lg font-semibold">Team 1</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter name of team 1"
                      className="h-10 sm:h-12 text-base sm:text-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 text-xs sm:text-sm" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="team2"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 text-base sm:text-lg font-semibold">Team 2</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter name of team 2"
                      className="h-10 sm:h-12 text-base sm:text-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 text-xs sm:text-sm" />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-center mt-6 sm:mt-8">
              {!roomId ? (
                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white text-base sm:text-lg font-semibold py-2 sm:py-3 px-4 sm:px-6 rounded-lg shadow-md transition-all duration-200"
                  disabled={isCreatingRoom}
                >
                  {isCreatingRoom ? "Creating Room..." : "Create Room"}
                </Button>
              ) : (
                <div className="w-full space-y-3 sm:space-y-4">
                  <div className="p-2 sm:p-3 bg-gray-100 rounded-lg text-center">
                    <p className="text-xs sm:text-sm text-gray-600">Room ID:</p>
                    <p className="text-lg sm:text-xl font-bold text-blue-600">{roomId}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    <Button
                      type="button"
                      className="bg-green-600 hover:bg-green-700 text-white text-sm sm:text-md font-semibold py-1.5 sm:py-2 rounded-lg shadow-md transition-all duration-200"
                      onClick={shareRoom}
                    >
                      Share Link
                    </Button>
                    <Button
                      type="button"
                      className="bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-md font-semibold py-1.5 sm:py-2 rounded-lg shadow-md transition-all duration-200"
                      onClick={startGame}
                    >
                      Start Game
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}

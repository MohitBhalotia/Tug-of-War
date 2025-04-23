import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";

import Quiz from "./components/Quiz";
import Login from "./components/Login";
import Register from "./components/Register";
import HomePage from "./pages/HomePage";
import AdminLogin from "./pages/AdminLogin";
import RegisterTeams from "./pages/RegisterTeams";
import JoinRoom from "./pages/JoinRoom";
import JoinInfo from "./pages/JoinInfo";
import GameRoom from "./pages/GameRoom";

export default function App() {
  const [auth, setAuth] = useState(localStorage.getItem("auth") === "true");

  return (
    <Router>
      <div className="w-full overflow-x-hidden">
        <div className="App min-h-screen bg-gradient-to-b from-[#0f172a] to-[#1e293b] w-full">
          <Routes>
            {/* Original routes */}
            {/* <Route 
              path="/classic" 
              element={auth ? <Quiz setAuth={setAuth} /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/login" 
              element={!auth ? <Login setAuth={setAuth} /> : <Navigate to="/" />} 
            /> */}
            
            {/* New production routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/register-teams" element={<RegisterTeams />} />
            <Route path="/join-info" element={<JoinInfo />} />
            <Route path="/join/:roomId" element={<JoinRoom />} />
            <Route path="/room/:roomId" element={<GameRoom />} />
          </Routes>
        </div>
        <Toaster position="top-right" richColors />
      </div>
    </Router>
  );
}

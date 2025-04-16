import React, { useState, useEffect } from "react";
import { Toaster } from "sonner";

import Quiz from "./components/Quiz";
import Login from "./components/Login";
import Register from "./components/Register";

export default function App() {
  const [auth, setAuth] = useState(localStorage.getItem("auth") === "true");
  const [registered, setRegistered] = useState(localStorage.getItem("register") === "true");

  return (
    <div>
      <div className="App flex min-h-screen w-screen items-center justify-center bg-gradient-to-b from-[#0f172a] to-[#1e293b]">
        {!registered ? (
          <Register setAuth={setAuth} setRegistered={setRegistered} />
        ) : auth ? (
          <Quiz />
        ) : (
          <Login setAuth={setAuth} />
        )}
      </div>
      <Toaster
        position="top-right"
        richColors
      />
    </div>
  );
}

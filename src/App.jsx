import React, { useState, useEffect } from "react";
import { Toaster } from "sonner";

import Quiz from "./components/Quiz";
import Login from "./components/Login";
import Register from "./components/Register";

export default function App() {
  const [auth, setAuth] = useState(localStorage.getItem("auth") === "true");

  return (
    <div>
      <div className="App min-h-screen bg-gradient-to-b from-[#0f172a] to-[#1e293b]">
        {auth ? <Quiz setAuth={setAuth} /> : <Login setAuth={setAuth} />}
      </div>
      <Toaster position="top-right" richColors />
    </div>
  );
}

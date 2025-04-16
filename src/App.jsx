import React, { useState } from "react";
import { Toaster } from "sonner";

import Quiz from "./components/Quiz";
import Login from "./components/Login";

export default function App() {
  const [auth, setAuth] = useState(localStorage.getItem("auth") === "true");
  return (
    <div>
      <div className="App flex min-h-screen w-screen items-center justify-center bg-gradient-to-b from-[#0f172a] to-[#1e293b]">
        {auth ? <Quiz /> : <Login setAuth={setAuth} />}
      </div>
      <Toaster
        position="top-right"
        richColors
        
      />
    </div>
  );
}

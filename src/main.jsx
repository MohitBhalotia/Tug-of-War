import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import Rope from "./components/Rope.jsx";
import TugOfWar from "./components/TugOfWar.jsx";
createRoot(document.getElementById("root")).render(
  <>
    {/* <App /> */}
    <TugOfWar />
  </>
);

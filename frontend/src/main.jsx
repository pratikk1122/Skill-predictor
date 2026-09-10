window.global = window;

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

/* ===== VITE + SIMPLE PEER POLYFILL FIX ===== */
import { Buffer } from "buffer";
import process from "process";

window.Buffer = Buffer;
window.process = process;
/* ============================================ */

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
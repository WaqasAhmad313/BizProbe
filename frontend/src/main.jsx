/* eslint-disable no-unused-vars */
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import "./index.css";

try {
  ReactDOM.createRoot(document.getElementById("root")).render(
    <BrowserRouter>
      {" "}
      {/* ✅ Place Router here only */}
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  );
} catch (error) {
  console.error("Error rendering the application:", error);
}

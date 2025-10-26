import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/tailwind.css";
import "./styles/index.css";

// Add error logging
console.log("Starting to mount React app...");

try {
  const container = document.getElementById("root");
  if (!container) {
    throw new Error("Could not find root element");
  }
  console.log("Root element found");
  
  const root = createRoot(container);
  console.log("Root created");
  
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log("App rendered");
} catch (error) {
  console.error("Error mounting React app:", error);
  // Display error on page
  document.body.innerHTML = `
    <div style="color: red; padding: 20px;">
      <h1>Error mounting application</h1>
      <pre>${error.message}</pre>
    </div>
  `;
}

import React from "react";
import { BrowserRouter } from "react-router-dom";
import Routes from "./Routes";

function App() {
  return (
    <React.StrictMode>
      <BrowserRouter>
        <div className="min-h-screen bg-background">
          <Routes />
        </div>
      </BrowserRouter>
    </React.StrictMode>
  );
}

export default App;

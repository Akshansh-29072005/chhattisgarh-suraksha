import React from "react";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from 'sonner';
import { AuthProvider } from './contexts/AuthContext';
import { LocationProvider } from './contexts/LocationContext';
import Routes from "./Routes";

function App() {
  return (
    <React.StrictMode>
      <BrowserRouter>
        <AuthProvider>
          <LocationProvider>
            <div className="min-h-screen bg-background">
              <Routes />
              <Toaster
                position="top-right"
                toastOptions={{
                  style: {
                    background: 'hsl(var(--popover))',
                    color: 'hsl(var(--popover-foreground))',
                    border: '1px solid hsl(var(--border))',
                  },
                }}
              />
            </div>
          </LocationProvider>
        </AuthProvider>
      </BrowserRouter>
    </React.StrictMode>
  );
}

export default App;


import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Games from "./pages/Games";
import GameDetail from "./pages/GameDetail";
import NotFound from "./pages/NotFound";
import Info from "./pages/Info";
import NavBarExtension from "./components/NavBarExtension";

const queryClient = new QueryClient();

// Protected route component to handle auth redirects more gracefully
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  
  // If auth is still loading, show nothing (or could show a loading spinner)
  if (isLoading) {
    return null;
  }
  
  // If user is not authenticated, redirect to home
  if (!user) {
    return <Navigate to="/" replace />;
  }
  
  // If user is authenticated, render the children
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index navBarExtension={<NavBarExtension />} />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard navBarExtension={<NavBarExtension />} />
              </ProtectedRoute>
            } />
            <Route path="/games" element={<Games navBarExtension={<NavBarExtension />} />} />
            <Route path="/game/:gameId" element={<GameDetail navBarExtension={<NavBarExtension />} />} />
            <Route path="/info" element={<Info navBarExtension={<NavBarExtension />} />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

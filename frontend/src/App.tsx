
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { SocketProvider } from "@/contexts/SocketContext";
import Index from "./pages/Index";
import Auctions from "./pages/Auctions";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import UserSignIn from "./pages/UserSignIn";
import UserSignUp from "./pages/UserSignUp";
import SellerSignIn from "./pages/SellerSignIn";
import SellerSignUp from "./pages/SellerSignUp";
import Profile from "./pages/Profile";
import UserProfile from "./pages/UserProfile";
import MakeBid from "./pages/MakeBid";
import ExternalAuctions from "./pages/ExternalAuctions";
import AuthPage from "./pages/AuthPage";
import SellerDashboard from "./pages/SellerDashboard";
import ProfileEdit from "./pages/ProfileEdit";
import WebSocketTest from "./pages/WebSocketTest";
import EditAuction from "./pages/EditAuction";
import { ThemeProvider } from "@/contexts/ThemeContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              
              {/* Main Pages */}
              <Route path="/auctions" element={<Auctions />} />
              <Route path="/about" element={<About />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/user-profile" element={<UserProfile />} />
              <Route path="/external-auctions" element={<ExternalAuctions />} />
              
              {/* Auction & Bidding Routes */}
              <Route path="/bid/:auctionId" element={<MakeBid />} />
              <Route path="/auction/:auctionId" element={<MakeBid />} />
              
              {/* Authentication Routes */}
              <Route path="/user-signin" element={<UserSignIn />} />
              <Route path="/user-signup" element={<UserSignUp />} />
              <Route path="/seller-signin" element={<SellerSignIn />} />
              <Route path="/seller-signup" element={<SellerSignUp />} />
              <Route path="/auth" element={<AuthPage />} />
              
              {/* Seller Routes */}
              <Route path="/seller-dashboard" element={<SellerDashboard />} />
              <Route path="/edit-auction/:auctionId" element={<EditAuction />} />
              
              {/* Profile Routes */}
              <Route path="/profile-edit" element={<ProfileEdit />} />
              
              {/* WebSocket Test Route */}
              <Route path="/websocket-test" element={<WebSocketTest />} />
              
              {/* Placeholder Routes */}
              <Route path="/notifications" element={<Index />} /> {/* Placeholder for future pages */}
              <Route path="/contact" element={<Index />} /> {/* Placeholder for future pages */}
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;

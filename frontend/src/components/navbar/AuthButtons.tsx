
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const AuthButtons = () => {
  const navigate = useNavigate();

  const handleSignInClick = () => {
    navigate("/auth");
  };

  const handleSignUpClick = () => {
    navigate("/auth");
  };

  return (
    <>
      <Button 
        variant="outline" 
        className="rounded-full"
        onClick={handleSignInClick}
      >
        Sign In
      </Button>
      
      <Button 
        className="rounded-full"
        onClick={handleSignUpClick}
      >
        Sign Up
      </Button>
    </>
  );
};

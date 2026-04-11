
import { Link } from "react-router-dom";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  footer: {
    text: string;
    linkText: string;
    linkTo: string;
  };
  userType: "user" | "seller";
  isLogin?: boolean;
}

const AuthLayout = ({ 
  children, 
  title, 
  subtitle, 
  footer, 
  userType, 
  isLogin = true 
}: AuthLayoutProps) => {
  const otherUserType = userType === "user" ? "seller" : "user";
  const otherUserTypeLabel = userType === "user" ? "Seller" : "User";
  const otherAuthPath = isLogin 
    ? `/${otherUserType}-signin` 
    : `/${otherUserType}-signup`;

  // Background pattern based on user type
  const bgPattern = userType === "user" 
    ? "radial-gradient(circle at 20% 70%, rgba(0, 123, 255, 0.15) 0%, transparent 40%), radial-gradient(circle at 80% 40%, rgba(255, 215, 0, 0.1) 0%, transparent 30%)"
    : "radial-gradient(circle at 80% 70%, rgba(0, 123, 255, 0.15) 0%, transparent 40%), radial-gradient(circle at 20% 30%, rgba(255, 215, 0, 0.1) 0%, transparent 30%)";

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 relative overflow-hidden"
      style={{ 
        backgroundImage: bgPattern,
        backgroundAttachment: "fixed"
      }}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -left-20 -top-20 w-60 h-60 rounded-full bg-trustBlue/5 backdrop-blur-3xl animate-float"></div>
        <div className="absolute right-10 bottom-10 w-80 h-80 rounded-full bg-gold/5 backdrop-blur-3xl animate-float" style={{ animationDelay: "2s" }}></div>
        <div className="absolute left-1/4 bottom-10 w-40 h-40 rounded-full bg-trustBlue/5 backdrop-blur-3xl animate-float" style={{ animationDelay: "1s" }}></div>
        
        {/* Tech lines */}
        <div className="absolute top-[20%] left-0 w-full h-px bg-gradient-to-r from-transparent via-trustBlue/20 to-transparent techline"></div>
        <div className="absolute top-[80%] left-0 w-full h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent techline" style={{ animationDelay: "1.5s" }}></div>
      </div>
      
      <Link
        to="/"
        className="absolute top-6 left-6 text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-gray-300 transition-colors z-10"
      >
        ← Back to Home
      </Link>
      
      <div className="w-full max-w-md bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-lg shadow-lg p-8 space-y-6 relative z-10 border border-white/20 dark:border-gray-700/30">
        {/* Glow effect */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-trustBlue/10 to-gold/10 rounded-lg blur-xl opacity-50"></div>
        
        <div className="text-center">
          <Link 
            to="/" 
            className="inline-flex items-center justify-center gap-2 mb-4 group"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-blue-500 flex items-center justify-center animate-pulse-light">
              <span className="text-white font-bold text-xl">B</span>
            </div>
            <span className="font-semibold text-xl tracking-tight">
              <span className="text-primary">Bid</span>
              <span className="text-gray-800 dark:text-gray-200">Blaze</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{title}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">{subtitle}</p>
        </div>
        
        {/* Horizontal tech line */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-trustBlue/30 to-transparent my-4"></div>
        
        {children}
        
        <div className="pt-4 text-center text-sm">
          <span className="text-gray-600 dark:text-gray-400">{footer.text}</span>{" "}
          <Link to={footer.linkTo} className="text-primary hover:underline font-medium">
            {footer.linkText}
          </Link>
        </div>
        
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700 mt-6 text-center">
          <span className="text-gray-600 dark:text-gray-400 text-sm">
            {isLogin ? "Sign in" : "Sign up"} as a{" "}
          </span>
          <Link 
            to={otherAuthPath} 
            className="text-primary hover:underline font-medium text-sm"
          >
            {otherUserTypeLabel}
          </Link>
        </div>
      </div>
      
      {/* Footer tech details */}
      <div className="mt-6 text-xs text-gray-500 dark:text-gray-600 flex items-center gap-2">
        <div className="w-2 h-2 bg-trustBlue/30 rounded-full animate-pulse"></div>
        {userType === "user" ? "Personal Account System" : "Business Account System"} • Secured with Advanced Encryption
      </div>
    </div>
  );
};

export default AuthLayout;

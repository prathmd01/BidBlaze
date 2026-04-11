
import { Link } from "react-router-dom";

export const Logo = () => {
  return (
    <Link 
      to="/" 
      className="flex items-center space-x-2 group"
    >
      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-blue-500 flex items-center justify-center animate-pulse-light">
        <span className="text-white font-bold text-xl">B</span>
      </div>
      <span className="font-semibold text-xl tracking-tight">
        <span className="text-gradient">Bid</span>
        <span className="text-gray-800 dark:text-gray-200">Blaze</span>
      </span>
    </Link>
  );
};

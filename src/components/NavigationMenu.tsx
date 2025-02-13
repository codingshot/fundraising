
import { Link, useLocation } from "react-router-dom";
import { Send } from "lucide-react";

export const NavigationMenu = () => {
  const location = useLocation();

  return (
    <nav className="bg-background border-b">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center gap-2 text-xl font-bold">
              <img 
                src="/lovable-uploads/454b69ec-0f29-4a39-8bc2-14cd2dad0ef5.png" 
                alt="CryptoFundraises Logo" 
                className="w-6 h-6" 
              />
              CryptoFundraises
            </Link>
            <div className="hidden md:flex space-x-4">
              <Link
                to="/data"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  location.pathname === "/data"
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-accent"
                }`}
              >
                Fundraising Data
              </Link>
              <Link
                to="/csv"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  location.pathname === "/csv"
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-accent"
                }`}
              >
                CSV
              </Link>
              <Link
                to="/docs"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  location.pathname === "/docs"
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-accent"
                }`}
              >
                API Docs
              </Link>
            </div>
          </div>
          <a
            href="https://t.me/cryptofundraises"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors"
          >
            <Send className="h-5 w-5 rotate-45" />
          </a>
        </div>
      </div>
    </nav>
  );
};

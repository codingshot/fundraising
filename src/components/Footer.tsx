
import { Twitter, Github, Linkedin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t py-6 mt-auto">
      <div className="container flex items-center justify-center space-x-2 text-sm text-muted-foreground">
        <span>Built with ❤️ by</span>
        <a 
          href="https://potlock.org" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          🫕 POTLOCK
        </a>
        <span>powered by curate.fun</span>
        <div className="flex items-center gap-2 ml-2">
          <a
            href="https://twitter.com/potlock_"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors"
          >
            <Twitter size={16} />
          </a>
          <a
            href="https://linkedin.com/company/potlock"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors"
          >
            <Linkedin size={16} />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

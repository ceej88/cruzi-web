import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X, ArrowRight } from "lucide-react";

const LandingNavbar: React.FC = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background shadow-md py-4"
          : "bg-background py-6"
      }`}
    >
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-primary-foreground font-black text-xl shadow-lg shadow-primary/20">
              C
            </div>
            <span className="text-2xl font-extrabold font-outfit text-foreground tracking-tight">
              Cruzi
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-10">
            <a href="#features" className="text-muted-foreground hover:text-primary font-semibold transition-colors">Features</a>
            <a href="#how-it-works" className="text-muted-foreground hover:text-primary font-semibold transition-colors">How It Works</a>
            <a href="/blog" className="text-muted-foreground hover:text-primary font-semibold transition-colors">Blog</a>
            <a href="#portals" className="text-muted-foreground hover:text-primary font-semibold transition-colors">Get Started</a>
          </div>

          <div className="hidden lg:flex items-center gap-4">
            <button
              onClick={() => navigate("/auth?mode=login")}
              className="px-6 py-2.5 text-muted-foreground font-bold hover:text-primary transition-colors"
            >
              Log In
            </button>
            <button
              onClick={() => navigate("/auth?role=instructor")}
              className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-bold shadow-lg shadow-primary/10 hover:opacity-90 transition-all flex items-center gap-2"
            >
              Get Started <ArrowRight size={18} />
            </button>
          </div>

          <button
            className="lg:hidden p-2 text-muted-foreground"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden fixed inset-0 top-[72px] bg-background transition-transform duration-300 transform ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-6 flex flex-col gap-8 h-full">
          <div className="flex flex-col gap-6">
            <a href="#features" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-bold text-foreground">Features</a>
            <a href="#how-it-works" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-bold text-foreground">How It Works</a>
            <a href="/blog" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-bold text-foreground">Blog</a>
            <a href="#portals" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-bold text-foreground">Get Started</a>
          </div>
          <div className="mt-auto flex flex-col gap-4 pb-8">
            <button
              onClick={() => { setIsMobileMenuOpen(false); navigate("/auth?mode=login"); }}
              className="w-full py-4 text-foreground font-bold text-lg border-2 border-border rounded-2xl"
            >
              Log In
            </button>
            <button
              onClick={() => { setIsMobileMenuOpen(false); navigate("/auth?role=instructor"); }}
              className="w-full py-4 bg-primary text-primary-foreground font-bold text-lg rounded-2xl"
            >
              Start Free Trial
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default LandingNavbar;

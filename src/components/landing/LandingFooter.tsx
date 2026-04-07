import React from "react";
import { Link } from "react-router-dom";

const LandingFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-background border-t border-border pt-20 pb-10">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-16">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-black text-lg">
                C
              </div>
              <span className="text-xl font-extrabold font-outfit text-foreground tracking-tight">
                Cruzi
              </span>
            </div>
            <p className="text-muted-foreground max-w-sm mb-8">
              The premium management tool for modern driving instructors. Build your brand, manage your students, and focus on what you do best: teaching.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-foreground mb-6 uppercase text-xs tracking-widest">Product</h4>
            <ul className="space-y-4">
              <li><a href="#features" className="text-muted-foreground hover:text-primary font-medium transition-colors">Features</a></li>
              <li><Link to="/savings" className="text-muted-foreground hover:text-primary font-medium transition-colors">Savings Calculator</Link></li>
              <li><Link to="/install" className="text-muted-foreground hover:text-primary font-medium transition-colors">Install App</Link></li>
              <li><Link to="/blog" className="text-muted-foreground hover:text-primary font-medium transition-colors">Blog</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-foreground mb-6 uppercase text-xs tracking-widest">Company</h4>
            <ul className="space-y-4">
              <li><Link to="/privacy" className="text-muted-foreground hover:text-primary font-medium transition-colors">Privacy</Link></li>
              <li><Link to="/terms" className="text-muted-foreground hover:text-primary font-medium transition-colors">Terms</Link></li>
              <li><Link to="/dpa" className="text-muted-foreground hover:text-primary font-medium transition-colors">DPA</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-foreground mb-6 uppercase text-xs tracking-widest">Support</h4>
            <ul className="space-y-4">
              <li><Link to="/help" className="text-muted-foreground hover:text-primary font-medium transition-colors">Help Centre</Link></li>
              <li><Link to="/cookies" className="text-muted-foreground hover:text-primary font-medium transition-colors">Cookies</Link></li>
              <li><Link to="/acceptable-use" className="text-muted-foreground hover:text-primary font-medium transition-colors">Acceptable Use</Link></li>
            </ul>
          </div>
        </div>
        <div className="pt-10 border-t border-border flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-muted-foreground text-sm">
            © {currentYear} Cruzi. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
            <Link to="/cookies" className="hover:text-primary transition-colors">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;

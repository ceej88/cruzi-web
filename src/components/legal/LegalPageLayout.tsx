import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Printer, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LegalPageLayoutProps {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}

const LegalPageLayout: React.FC<LegalPageLayoutProps> = ({
  title,
  lastUpdated,
  children,
}) => {
  const navigate = useNavigate();
  const [showScrollTop, setShowScrollTop] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <Link to="/" className="font-black text-lg text-primary">
            Cruzi
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePrint}
            className="gap-2 print:hidden"
          >
            <Printer className="h-4 w-4" />
            Print
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-black font-outfit tracking-tight mb-4">
            {title}
          </h1>
          <p className="text-muted-foreground text-sm">
            Last updated: {lastUpdated}
          </p>
        </div>

        <div className="prose prose-slate dark:prose-invert max-w-none">
          {children}
        </div>

        {/* Legal Footer Links */}
        <div className="mt-16 pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground mb-4">Related Policies</p>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/privacy"
              className="text-sm text-primary hover:underline"
            >
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-sm text-primary hover:underline">
              Terms of Service
            </Link>
            <Link
              to="/cookies"
              className="text-sm text-primary hover:underline"
            >
              Cookie Policy
            </Link>
            <Link
              to="/acceptable-use"
              className="text-sm text-primary hover:underline"
            >
              Acceptable Use
            </Link>
            <Link to="/dpa" className="text-sm text-primary hover:underline">
              Data Processing Addendum
            </Link>
          </div>
        </div>
      </main>

      {/* Scroll to top button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 p-3 bg-primary text-primary-foreground rounded-full shadow-lg hover:scale-110 transition-transform print:hidden"
          aria-label="Scroll to top"
        >
          <ChevronUp className="h-5 w-5" />
        </button>
      )}
    </div>
  );
};

export default LegalPageLayout;

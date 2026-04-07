import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const COOKIE_CONSENT_KEY = "cruzi_cookie_consent";

interface CookieConsent {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: number;
}

const CookieBanner: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState({
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!stored) {
      // Delay showing banner for better UX
      const timer = setTimeout(() => setShowBanner(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const saveConsent = (consent: CookieConsent) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consent));
    setShowBanner(false);
    setShowPreferences(false);
  };

  const acceptAll = () => {
    saveConsent({
      essential: true,
      analytics: true,
      marketing: true,
      timestamp: Date.now(),
    });
  };

  const acceptEssentialOnly = () => {
    saveConsent({
      essential: true,
      analytics: false,
      marketing: false,
      timestamp: Date.now(),
    });
  };

  const savePreferences = () => {
    saveConsent({
      essential: true,
      analytics: preferences.analytics,
      marketing: preferences.marketing,
      timestamp: Date.now(),
    });
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25 }}
          className="fixed bottom-0 left-0 right-0 z-[100] p-4 md:p-6"
        >
          <div className="max-w-4xl mx-auto bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
            {!showPreferences ? (
              // Main Banner
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                    <Cookie className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-2">
                      We value your privacy
                    </h3>
                    <p className="text-sm text-foreground mb-4">
                      We use cookies to enhance your experience, analyse site
                      traffic, and for marketing purposes. By clicking "Accept
                      All", you consent to our use of cookies.{" "}
                      <Link
                        to="/cookies"
                        className="text-primary hover:underline"
                      >
                        Learn more
                      </Link>
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <Button 
                        onClick={acceptAll} 
                        size="sm"
                        className="btn-gradient-accent shadow-[0_0_20px_hsl(var(--cruzi-indigo)/0.4)]"
                      >
                        Accept All
                      </Button>
                      <Button
                        onClick={acceptEssentialOnly}
                        variant="outline"
                        size="sm"
                      >
                        Essential Only
                      </Button>
                      <Button
                        onClick={() => setShowPreferences(true)}
                        variant="ghost"
                        size="sm"
                      >
                        Manage Preferences
                      </Button>
                    </div>
                  </div>
                  <button
                    onClick={acceptEssentialOnly}
                    className="p-2 hover:bg-muted rounded-lg transition-colors"
                    aria-label="Close"
                  >
                    <X className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>
              </div>
            ) : (
              // Preferences Panel
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-lg">Cookie Preferences</h3>
                  <button
                    onClick={() => setShowPreferences(false)}
                    className="p-2 hover:bg-muted rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4 mb-6">
                  {/* Essential - Always on */}
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                    <div>
                      <p className="font-medium">Essential Cookies</p>
                      <p className="text-sm text-muted-foreground">
                        Required for the site to function. Cannot be disabled.
                      </p>
                    </div>
                    <div className="w-12 h-6 bg-primary rounded-full flex items-center justify-end px-1">
                      <div className="w-4 h-4 bg-white rounded-full" />
                    </div>
                  </div>

                  {/* Analytics */}
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                    <div>
                      <p className="font-medium">Analytics Cookies</p>
                      <p className="text-sm text-muted-foreground">
                        Help us understand how visitors interact with our site.
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        setPreferences((p) => ({
                          ...p,
                          analytics: !p.analytics,
                        }))
                      }
                      className={`w-12 h-6 rounded-full flex items-center px-1 transition-colors ${
                        preferences.analytics ? "bg-primary justify-end" : "bg-muted justify-start"
                      }`}
                    >
                      <div className="w-4 h-4 bg-white rounded-full" />
                    </button>
                  </div>

                  {/* Marketing */}
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                    <div>
                      <p className="font-medium">Marketing Cookies</p>
                      <p className="text-sm text-muted-foreground">
                        Used to deliver relevant advertisements.
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        setPreferences((p) => ({
                          ...p,
                          marketing: !p.marketing,
                        }))
                      }
                      className={`w-12 h-6 rounded-full flex items-center px-1 transition-colors ${
                        preferences.marketing ? "bg-primary justify-end" : "bg-muted justify-start"
                      }`}
                    >
                      <div className="w-4 h-4 bg-white rounded-full" />
                    </button>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button onClick={savePreferences} className="flex-1">
                    Save Preferences
                  </Button>
                  <Button onClick={acceptAll} variant="outline">
                    Accept All
                  </Button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieBanner;

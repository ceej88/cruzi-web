import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Smartphone, Copy, Check, ExternalLink } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

const APP_STORE_URL = "https://apps.apple.com/gb/app/cruzi/id6759689036";
const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.cruzi.app";

type Platform = "ios" | "android" | "desktop";

function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return "desktop";
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/i.test(ua)) return "ios";
  if (/Android/i.test(ua)) return "android";
  return "desktop";
}

const InviteInstructorPage = () => {
  const { token } = useParams<{ token: string }>();
  const [platform, setPlatform] = useState<Platform>("desktop");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setPlatform(detectPlatform());
  }, []);

  const handleCopy = async () => {
    if (!token) return;
    try {
      await navigator.clipboard.writeText(token);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard not available — user can still read the token below.
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted px-4">
        <div className="max-w-md w-full bg-background border border-border rounded-2xl p-6 text-center">
          <h1 className="text-xl font-bold text-foreground mb-2">Invite link incomplete</h1>
          <p className="text-sm text-muted-foreground mb-4">
            This invite is missing its code. Ask the student to send a fresh link.
          </p>
          <a href="/" className="text-primary underline">Return to Home</a>
        </div>
      </div>
    );
  }

  const deepLink = `cruzi://i/${token}`;
  const fullUrl =
    typeof window !== "undefined"
      ? window.location.href
      : `https://cruzi.co.uk/i/${token}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-background to-purple-50 dark:from-purple-950/30 dark:via-background dark:to-purple-950/30 flex flex-col items-center px-4 py-10">
      <div className="max-w-md w-full bg-background border border-border rounded-3xl shadow-xl p-6 sm:p-8 text-center">
        <div className="w-20 h-20 mx-auto mb-6 bg-primary rounded-3xl flex items-center justify-center shadow-lg">
          <span className="text-white text-4xl font-black tracking-tight">C</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-foreground mb-3 tracking-tight">
          You have been invited to become a driving instructor on Cruzi
        </h1>
        <p className="text-base text-muted-foreground mb-8">
          Cruzi is the UK platform built for ADIs. Manage lessons, track student progress and run your business — all in one place.
        </p>

        {platform === "desktop" && (
          <div className="mb-8 p-6 bg-muted rounded-2xl">
            <p className="text-sm font-semibold text-foreground mb-4">
              Open this link on your phone
            </p>
            <div className="bg-white p-4 rounded-xl inline-block">
              <QRCodeSVG value={fullUrl} size={180} level="M" />
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Scan this code with your phone camera to continue on iOS or Android.
            </p>
          </div>
        )}

        {platform !== "desktop" && (
          <div className="space-y-3 mb-6">
            {platform === "ios" && (
              <a
                href={APP_STORE_URL}
                className="flex items-center justify-center gap-2 w-full bg-foreground text-background px-6 py-4 rounded-2xl font-bold text-base hover:opacity-90 active:scale-95 transition-all shadow-md"
              >
                <Smartphone size={20} />
                Get Cruzi on the App Store
              </a>
            )}
            {platform === "android" && (
              <a
                href={PLAY_STORE_URL}
                className="flex items-center justify-center gap-2 w-full bg-foreground text-background px-6 py-4 rounded-2xl font-bold text-base hover:opacity-90 active:scale-95 transition-all shadow-md"
              >
                <Smartphone size={20} />
                Get Cruzi on Google Play
              </a>
            )}
            <a
              href={deepLink}
              className="flex items-center justify-center gap-2 w-full bg-primary text-white px-6 py-4 rounded-2xl font-bold text-base hover:bg-primary/90 active:scale-95 transition-all shadow-md"
            >
              <ExternalLink size={18} />
              Already installed? Tap here
            </a>
          </div>
        )}

        <div className="border-t border-border pt-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Your invite code
          </p>
          <div className="flex items-center gap-2 bg-muted rounded-xl p-3">
            <code className="flex-1 text-sm font-mono text-foreground break-all text-left">
              {token}
            </code>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="shrink-0"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              <span className="ml-1">{copied ? "Copied" : "Copy"}</span>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
            If the link does not open the app automatically after install, tap the original text message link again, or share this code with the student who invited you.
          </p>
        </div>

        <div className="mt-8 pt-6 border-t border-border">
          <a href="/" className="text-xs text-muted-foreground hover:text-foreground underline">
            Learn more about Cruzi
          </a>
        </div>
      </div>
    </div>
  );
};

export default InviteInstructorPage;

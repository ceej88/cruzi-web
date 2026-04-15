import { useEffect, useState } from "react";

const APP_STORE_URL = "https://apps.apple.com/gb/app/cruzi/id6759689036";
const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.cruzi.app";

function detectPlatform(): "ios" | "android" | "unknown" {
  const ua = navigator.userAgent || "";
  if (/iPhone|iPad|iPod/i.test(ua)) return "ios";
  if (/Android/i.test(ua)) return "android";
  return "unknown";
}

export default function DownloadPage() {
  const [platform] = useState(() => detectPlatform());

  useEffect(() => {
    if (platform === "ios") {
      window.location.href = APP_STORE_URL;
    } else if (platform === "android") {
      window.location.href = PLAY_STORE_URL;
    }
  }, [platform]);

  if (platform !== "unknown") {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#060e20",
        color: "#fff",
        fontFamily: "Inter, system-ui, sans-serif",
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: "#7c3aed", margin: "0 auto 16px",
            animation: "pulse 1.5s infinite",
          }} />
          <p style={{ fontSize: 18, opacity: 0.8 }}>
            Redirecting to {platform === "ios" ? "App Store" : "Google Play"}...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#060e20",
      color: "#fff",
      fontFamily: "Inter, system-ui, sans-serif",
      padding: 24,
    }}>
      <div style={{ textAlign: "center", maxWidth: 400 }}>
        <h1 style={{
          fontSize: 32,
          fontWeight: 700,
          marginBottom: 8,
          color: "#fff",
        }}>
          Get Cruzi
        </h1>
        <p style={{
          fontSize: 18,
          color: "rgba(255,255,255,0.7)",
          marginBottom: 40,
          lineHeight: 1.5,
        }}>
          Download the Cruzi app for your device
        </p>

        <a
          href={APP_STORE_URL}
          data-testid="link-app-store"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            background: "#7c3aed",
            color: "#fff",
            fontSize: 18,
            fontWeight: 600,
            padding: "16px 32px",
            borderRadius: 14,
            textDecoration: "none",
            marginBottom: 16,
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
          </svg>
          Download for iPhone
        </a>

        <a
          href={PLAY_STORE_URL}
          data-testid="link-play-store"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            background: "rgba(124, 58, 237, 0.15)",
            border: "2px solid rgba(124, 58, 237, 0.4)",
            color: "#c4b5fd",
            fontSize: 18,
            fontWeight: 600,
            padding: "16px 32px",
            borderRadius: 14,
            textDecoration: "none",
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 20.5v-17c0-.59.34-1.11.84-1.35L13.69 12l-9.85 9.85c-.5-.24-.84-.76-.84-1.35m13.81-5.38L6.05 21.34l8.49-8.49 2.27 2.27m3.35-4.31c.34.27.56.69.56 1.19s-.22.92-.57 1.19l-1.69.95-2.5-2.5 2.5-2.5 1.7.95zM6.05 2.66l10.76 6.22-2.27 2.27-8.49-8.49z"/>
          </svg>
          Download for Android
        </a>
      </div>
    </div>
  );
}

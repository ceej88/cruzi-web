import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        outfit: ["Outfit", "sans-serif"],
        inter: ["Inter", "sans-serif"],
        // Cruzi Vision: Inter is the canonical brand font
        sans: ["Inter", "sans-serif"],
      },
      fontSize: {
        // ========== CRUZI VISION TYPOGRAPHY SCALE ==========
        // Bold editorial headlines, tight tracking, generous body line-height
        "headline-display": ["48px", { lineHeight: "1.1", letterSpacing: "-0.02em", fontWeight: "700" }],
        "headline-lg": ["32px", { lineHeight: "1.2", letterSpacing: "-0.01em", fontWeight: "700" }],
        "headline-lg-mobile": ["28px", { lineHeight: "1.2", letterSpacing: "-0.01em", fontWeight: "700" }],
        "headline-md": ["24px", { lineHeight: "1.3", fontWeight: "600" }],
        "body-lg": ["18px", { lineHeight: "1.6", fontWeight: "400" }],
        "body-md": ["16px", { lineHeight: "1.6", fontWeight: "400" }],
        "label-md": ["14px", { lineHeight: "1.4", letterSpacing: "0.05em", fontWeight: "600" }],
        "label-sm": ["12px", { lineHeight: "1.4", fontWeight: "500" }],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
          dark: "hsl(var(--card-dark))",
          "dark-foreground": "hsl(var(--card-dark-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        // ========== CRUZI VISION — M3 SURFACE LADDER ==========
        surface: {
          DEFAULT: "hsl(var(--surface))",
          dim: "hsl(var(--surface-dim))",
          bright: "hsl(var(--surface-bright))",
          variant: "hsl(var(--surface-variant))",
          tint: "hsl(var(--surface-tint))",
        },
        "surface-container": {
          DEFAULT: "hsl(var(--surface-container))",
          lowest: "hsl(var(--surface-container-lowest))",
          low: "hsl(var(--surface-container-low))",
          high: "hsl(var(--surface-container-high))",
          highest: "hsl(var(--surface-container-highest))",
        },
        "on-surface": {
          DEFAULT: "hsl(var(--on-surface))",
          variant: "hsl(var(--on-surface-variant))",
        },
        "inverse-surface": "hsl(var(--inverse-surface))",
        "inverse-on-surface": "hsl(var(--inverse-on-surface))",
        outline: {
          DEFAULT: "hsl(var(--outline))",
          variant: "hsl(var(--outline-variant))",
        },
        // ========== CRUZI VISION — PRIMARY / SECONDARY / TERTIARY ==========
        "on-primary": "hsl(var(--primary-foreground))",
        "primary-container": "hsl(var(--primary-container))",
        "on-primary-container": "hsl(var(--on-primary-container))",
        "inverse-primary": "hsl(var(--inverse-primary))",
        "secondary-container": "hsl(var(--secondary-container))",
        "on-secondary-container": "hsl(var(--on-secondary-container))",
        tertiary: {
          DEFAULT: "hsl(var(--tertiary))",
          container: "hsl(var(--tertiary-container))",
        },
        "on-tertiary": "hsl(var(--on-tertiary))",
        "on-tertiary-container": "hsl(var(--on-tertiary-container))",
        "error-container": "hsl(var(--error-container))",
        "on-error-container": "hsl(var(--on-error-container))",
        "primary-fixed": {
          DEFAULT: "hsl(var(--primary-fixed))",
          dim: "hsl(var(--primary-fixed-dim))",
        },
        "on-primary-fixed": {
          DEFAULT: "hsl(var(--on-primary-fixed))",
          variant: "hsl(var(--on-primary-fixed-variant))",
        },
        "secondary-fixed": {
          DEFAULT: "hsl(var(--secondary-fixed))",
          dim: "hsl(var(--secondary-fixed-dim))",
        },
        "on-secondary-fixed": {
          DEFAULT: "hsl(var(--on-secondary-fixed))",
          variant: "hsl(var(--on-secondary-fixed-variant))",
        },
        "tertiary-fixed": {
          DEFAULT: "hsl(var(--tertiary-fixed))",
          dim: "hsl(var(--tertiary-fixed-dim))",
        },
        "on-tertiary-fixed": {
          DEFAULT: "hsl(var(--on-tertiary-fixed))",
          variant: "hsl(var(--on-tertiary-fixed-variant))",
        },
        // ========== Cruzi legacy brand (retained for back-compat — values realigned to Vision) ==========
        cruzi: {
          blue: "hsl(var(--cruzi-blue))",
          cyan: "hsl(var(--cruzi-cyan))",
          indigo: "hsl(var(--cruzi-indigo))",
          violet: "hsl(var(--cruzi-violet))",
          purple: "hsl(var(--cruzi-purple))",
          success: "hsl(var(--cruzi-success))",
          gold: "hsl(var(--cruzi-gold))",
          danger: "hsl(var(--cruzi-danger))",
        },
        // Neural Gradient — realigned to Cruzi Vision purple ladder
        neural: {
          start: "#6D28D9",   // primary
          mid: "#7331DF",     // glow tint
          end: "#5300B7",     // primary-container
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        "2xl": "1rem",
        "3xl": "1.5rem",
        // ========== CRUZI VISION RADIUS SCALE ==========
        card: "1rem",        // cards / containers
        chip: "0.5rem",      // buttons, inputs, small tags
        pill: "9999px",      // pill chips
      },
      spacing: {
        safe: "env(safe-area-inset-bottom)",
        "nav-height": "80px",
        // ========== CRUZI VISION SPACING TOKENS ==========
        "base": "8px",                 // 8px base unit
        "gutter": "24px",              // desktop grid gutter
        "margin-mobile": "16px",       // mobile side margin
        "section-lg": "80px",          // section padding desktop
        "card-pad": "32px",            // card internal padding
        "container-max": "1280px",     // fixed max-width
      },
      boxShadow: {
        glass: "0 4px 30px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
        "glow-sm": "0 0 15px hsl(var(--surface-tint) / 0.25)",
        glow: "0 0 30px hsl(var(--surface-tint) / 0.35)",
        "glow-lg": "0 0 50px hsl(var(--surface-tint) / 0.45)",
        "cruzi-blue": "0 0 60px hsl(var(--primary) / 0.2)",
        // ========== CRUZI VISION GLOW SHADOWS ==========
        "purple-glow-sm": "0 0 12px 0 hsl(var(--surface-tint) / 0.25)",
        "purple-glow": "0 0 24px 0 hsl(var(--surface-tint) / 0.35)",
        "purple-glow-hover": "0 0 32px 4px hsl(var(--surface-tint) / 0.55)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-out": {
          from: { opacity: "1", transform: "translateY(0)" },
          to: { opacity: "0", transform: "translateY(10px)" },
        },
        "slide-in-right": {
          from: { transform: "translateX(100%)" },
          to: { transform: "translateX(0)" },
        },
        "slide-in-bottom": {
          from: { transform: "translateY(100%)" },
          to: { transform: "translateY(0)" },
        },
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "gradient-x": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        // Cruzi Neural Atmosphere Animations
        drift: {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "25%": { transform: "translate(5%, 5%) scale(1.02)" },
          "50%": { transform: "translate(-3%, 8%) scale(0.98)" },
          "75%": { transform: "translate(-5%, -3%) scale(1.01)" },
        },
        "drift-reverse": {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "25%": { transform: "translate(-5%, -5%) scale(0.98)" },
          "50%": { transform: "translate(3%, -8%) scale(1.02)" },
          "75%": { transform: "translate(5%, 3%) scale(0.99)" },
        },
        "drift-slow": {
          "0%, 100%": { transform: "translate(0, 0)" },
          "50%": { transform: "translate(-2%, 4%)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "fade-out": "fade-out 0.3s ease-out",
        "slide-in-right": "slide-in-right 0.3s ease-out",
        "slide-in-bottom": "slide-in-bottom 0.3s ease-out",
        pulse: "pulse 2s ease-in-out infinite",
        shimmer: "shimmer 2s linear infinite",
        "gradient-x": "gradient-x 5s ease infinite",
        drift: "drift 30s ease-in-out infinite",
        "drift-reverse": "drift-reverse 35s ease-in-out infinite",
        "drift-slow": "drift-slow 40s ease-in-out infinite",
      },
      transitionDuration: {
        // Cruzi Vision: 200ms ease-in-out is the canonical transition
        "200": "200ms",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
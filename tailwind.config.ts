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
        // Cruzi Brand Colors
        cruzi: {
          blue: "hsl(var(--cruzi-blue))",
          cyan: "hsl(var(--cruzi-cyan))",
          indigo: "hsl(var(--cruzi-indigo))",
          success: "hsl(var(--cruzi-success))",
          gold: "hsl(var(--cruzi-gold))",
          danger: "hsl(var(--cruzi-danger))",
        },
        // Neural Gradient Color Tokens
        neural: {
          start: "#8b5cf6",  // violet-500
          mid: "#a855f7",    // purple-500
          end: "#2dd4bf",    // teal-400
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        glass: "0 4px 30px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
        "glow-sm": "0 0 15px rgba(0, 102, 255, 0.3)",
        glow: "0 0 30px rgba(0, 102, 255, 0.4)",
        "glow-lg": "0 0 50px rgba(0, 102, 255, 0.5)",
        "cruzi-blue": "0 0 60px rgba(79, 70, 229, 0.2)",
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
      spacing: {
        safe: "env(safe-area-inset-bottom)",
        "nav-height": "80px",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

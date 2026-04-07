import React from "react";
import { motion } from "framer-motion";
import PhoneMockup from "./PhoneMockup";

interface FeatureSectionProps {
  title: string;
  subtitle: string;
  description: string;
  imageUrl: string;
  imageCaption?: string;
  reverse?: boolean;
  color: "purple" | "emerald" | "blue" | "amber";
  icon?: React.ReactNode;
  frameless?: boolean;
}

const colorMap: Record<string, string> = {
  purple: "bg-purple-50 text-purple-600",
  emerald: "bg-emerald-50 text-emerald-600",
  blue: "bg-blue-50 text-blue-600",
  amber: "bg-amber-50 text-amber-600",
};

const linkColorMap: Record<string, string> = {
  purple: "text-purple-600",
  emerald: "text-emerald-600",
  blue: "text-blue-600",
  amber: "text-amber-600",
};

const fadeIn = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

const FeatureSection: React.FC<FeatureSectionProps> = ({
  title,
  subtitle,
  description,
  imageUrl,
  imageCaption,
  reverse = false,
  color,
  icon,
  frameless = false,
}) => {
  return (
    <section className={`py-24 ${reverse ? "bg-muted/30" : "bg-background"} overflow-hidden`}>
      <div className="container mx-auto px-6">
        <div
          className={`flex flex-col lg:flex-row items-center gap-16 lg:gap-32 ${
            reverse ? "lg:flex-row-reverse" : ""
          }`}
        >
          <motion.div {...fadeIn} className="flex-1 space-y-8">
            <div
              className={`inline-flex items-center gap-3 px-4 py-2 rounded-2xl ${colorMap[color]} font-bold text-sm uppercase tracking-widest shadow-sm`}
            >
              {icon}
              {title}
            </div>
            <h2 className="text-4xl lg:text-5xl font-extrabold font-outfit text-foreground leading-tight">
              {subtitle}
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed">
              {description}
            </p>
            <div className="pt-4">
              <button
                className={`flex items-center gap-2 font-bold text-lg hover:underline transition-all ${linkColorMap[color]}`}
              >
                Learn how it works <span>→</span>
              </button>
            </div>
          </motion.div>
          <motion.div
            {...fadeIn}
            transition={{ duration: 0.6, delay: 0.2 }}
            className={`flex-1 w-full ${frameless ? "max-w-none lg:max-w-sm" : "max-w-sm lg:max-w-sm"}`}
          >
            {frameless ? (
              /\.(mp4|webm|mov)$/i.test(imageUrl) ? (
                <video
                  src={imageUrl}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="none"
                  className="block w-screen max-w-none relative left-1/2 -translate-x-1/2 lg:w-full lg:max-w-full lg:left-auto lg:translate-x-0 lg:rounded-3xl lg:shadow-xl"
                />
              ) : (
                <img
                  src={imageUrl}
                  alt={subtitle}
                  className="block w-screen max-w-none relative left-1/2 -translate-x-1/2 lg:w-full lg:max-w-full lg:left-auto lg:translate-x-0 lg:rounded-3xl lg:shadow-xl"
                />
              )
            ) : (
              <PhoneMockup src={imageUrl} title={subtitle} caption={imageCaption} />
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;

import React from "react";

interface PhoneMockupProps {
  src: string;
  title: string;
  caption?: string;
}

const PhoneMockup: React.FC<PhoneMockupProps> = ({ src, title, caption }) => {
  return (
    <div className="relative group w-full max-w-[320px] mx-auto">
      {/* Phone Case */}
      <div className="relative mx-auto border-slate-900 bg-slate-900 border-[8px] rounded-[3.5rem] h-[640px] w-full shadow-[0_50px_100px_-20px_rgba(0,0,0,0.25)] overflow-hidden transition-all duration-700 hover:rotate-1 hover:scale-[1.02] group-hover:shadow-primary/20">
        {/* Side Buttons */}
        <div className="absolute top-32 -left-2.5 w-1 h-12 bg-slate-800 rounded-r-sm" />
        <div className="absolute top-48 -left-2.5 w-1 h-12 bg-slate-800 rounded-r-sm" />
        <div className="absolute top-40 -right-2.5 w-1 h-16 bg-slate-800 rounded-l-sm" />

        {/* Screen */}
        <div className="relative h-full w-full bg-background rounded-[3rem] overflow-hidden">
          {/* Dynamic Island */}
          <div className="absolute top-0 inset-x-0 h-10 z-20 flex justify-center pointer-events-none">
            <div className="bg-black w-28 h-7 mt-3 rounded-full flex items-center justify-around px-4">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              <div className="w-6 h-1 rounded-full bg-slate-800" />
            </div>
          </div>

          {/* Screenshot */}
          <div className="h-full w-full relative">
            {/\.(mp4|webm|mov)$/i.test(src) ? (
              <video
                src={src}
                autoPlay
                muted
                loop
                playsInline
                preload="none"
                className="w-full h-full object-cover object-top transition-all duration-500 group-hover:opacity-95"
              />
            ) : (
              <img
                src={src}
                alt={title}
                className="w-full h-full object-cover object-top transition-all duration-500 group-hover:opacity-95"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent pointer-events-none" />
          </div>

          {/* Home Indicator */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-36 h-1 bg-slate-300 rounded-full" />
        </div>
      </div>

      {/* Shadow */}
      <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[90%] h-12 bg-black/5 blur-2xl rounded-full -z-10 transition-all duration-700 group-hover:blur-3xl group-hover:bg-primary/10" />

      {/* Caption */}
      {caption && (
        <div className="mt-8 text-center px-4">
          <p className="text-muted-foreground text-sm font-medium">{caption}</p>
        </div>
      )}
    </div>
  );
};

export default PhoneMockup;

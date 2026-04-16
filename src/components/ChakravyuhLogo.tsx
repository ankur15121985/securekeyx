import React from 'react';

export const ChakravyuhLogo = ({ className = "w-12 h-12" }: { className?: string }) => {
  return (
    <div className={`${className} relative flex items-center justify-center group`}>
      {/* Outer Orbital Rings */}
      <div className="absolute inset-0 border border-foreground/30 rounded-full scale-[1.4] animate-[spin_30s_linear_infinite]" />
      <div className="absolute inset-0 border border-foreground/20 rounded-full scale-[1.6] animate-[spin_45s_linear_infinite_reverse]" />
      
      {/* Glow Background */}
      <div className="absolute inset-0 bg-foreground/10 rounded-full blur-2xl group-hover:bg-foreground/20 transition-all" />
      
      {/* The Tactical Chakravyuh Formation */}
      <div className="relative z-10 w-full h-full rounded-full overflow-hidden border-2 border-foreground/60 shadow-[0_0_30px_rgba(var(--foreground),0.3)] bg-background/40 backdrop-blur-sm flex items-center justify-center p-2">
        <svg viewBox="0 0 100 100" className="w-full h-full text-foreground transition-transform duration-700 group-hover:rotate-90">
          {/* Concentric Rings with Gates (Chakravyuh Layers) */}
          {[10, 18, 26, 34, 42].map((radius, i) => (
            <circle
              key={i}
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeDasharray={i % 2 === 0 ? "80 20" : "60 40"}
              strokeDashoffset={i * 45}
              className="opacity-80"
            />
          ))}
          
          {/* Central Core */}
          <circle cx="50" cy="50" r="4" fill="currentColor" className="animate-pulse" />
          
          {/* Tactical Crosshair Lines */}
          <line x1="50" y1="5" x2="50" y2="15" stroke="currentColor" strokeWidth="1" className="opacity-40" />
          <line x1="50" y1="85" x2="50" y2="95" stroke="currentColor" strokeWidth="1" className="opacity-40" />
          <line x1="5" y1="50" x2="15" y2="50" stroke="currentColor" strokeWidth="1" className="opacity-40" />
          <line x1="85" y1="50" x2="95" y2="50" stroke="currentColor" strokeWidth="1" className="opacity-40" />
          
          {/* Spiral Entrance Path (Conceptual) */}
          <path
            d="M 50 10 Q 90 10 90 50 Q 90 90 50 90 Q 10 90 10 50 Q 10 20 40 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
            strokeDasharray="2 2"
            className="opacity-20"
          />
        </svg>
      </div>

      {/* Data Bits */}
      <div className="absolute -top-2 -right-2 w-1 h-1 bg-foreground rounded-full animate-pulse shadow-[0_0_10px_rgba(var(--foreground),0.5)]" />
      <div className="absolute -bottom-1 -left-3 w-1.5 h-1.5 bg-foreground rounded-full animate-pulse delay-700 shadow-[0_0_10px_rgba(var(--foreground),0.5)]" />
    </div>
  );
};

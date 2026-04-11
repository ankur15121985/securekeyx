import React from 'react';

export const BharatLogo = ({ className = "w-12 h-12" }: { className?: string }) => {
  return (
    <svg 
      viewBox="0 0 100 100" 
      className={className}
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Shield Base */}
      <path 
        d="M50 5 L10 25 V55 C10 75 50 95 50 95 C50 95 90 75 90 55 V25 L50 5Z" 
        className="fill-primary stroke-primary-foreground" 
        strokeWidth="2"
      />
      
      {/* Tricolor Stripes inside Shield */}
      <path d="M20 35 H80 V45 H20 V35Z" fill="hsl(var(--india-saffron))" />
      <path d="M20 45 H80 V55 H20 V45Z" fill="white" />
      <path d="M20 55 H80 V65 H20 V55Z" fill="hsl(var(--india-green))" />
      
      {/* Ashoka Chakra in the center stripe */}
      <circle cx="50" cy="50" r="4" stroke="hsl(var(--india-blue))" strokeWidth="0.5" />
      {[...Array(24)].map((_, i) => (
        <line 
          key={i}
          x1="50" y1="50" 
          x2={50 + 4 * Math.cos((i * 15 * Math.PI) / 180)} 
          y2={50 + 4 * Math.sin((i * 15 * Math.PI) / 180)} 
          stroke="hsl(var(--india-blue))" 
          strokeWidth="0.2" 
        />
      ))}
      
      {/* Tactical Crosshair Accents */}
      <path d="M50 15 V25 M50 75 V85 M25 50 H15 M85 50 H75" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
};

import React from 'react';

export const ChakravyuhLogo = ({ className = "w-12 h-12" }: { className?: string }) => {
  return (
    <div className={`${className} relative flex items-center justify-center group`}>
      <div className="absolute inset-0 bg-primary/20 rounded-full blur-md group-hover:blur-lg transition-all" />
      <img 
        src="https://images.unsplash.com/photo-1635350736475-c8cef4b21906?q=80&w=512&h=512&auto=format&fit=crop" 
        alt="Chakravyuh Labyrinth Logo" 
        className="w-full h-full object-cover rounded-full border-2 border-primary/40 shadow-2xl relative z-10 transition-transform group-hover:scale-110"
        referrerPolicy="no-referrer"
      />
    </div>
  );
};

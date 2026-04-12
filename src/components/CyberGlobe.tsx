import React, { useEffect, useState, useRef } from 'react';
import Globe from 'react-globe.gl';
import { motion } from 'motion/react';

interface Attack {
  id: string;
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  color: string;
  type: string;
  timestamp: string;
}

const ATTACK_COLORS = ['#ff0000', '#ff4d00', '#ff9900', '#ffcc00'];
const ATTACK_TYPES = [
  'DDoS Attack',
  'SQL Injection',
  'Brute Force',
  'Malware Injection',
  'Phishing Attempt',
  'Zero-Day Exploit',
  'Man-in-the-Middle',
  'Ransomware Payload'
];

const generateRandomAttack = (): Attack => {
  const startLat = (Math.random() - 0.5) * 180;
  const startLng = (Math.random() - 0.5) * 360;
  const endLat = (Math.random() - 0.5) * 180;
  const endLng = (Math.random() - 0.5) * 360;
  
  return {
    id: Math.random().toString(36).substr(2, 9),
    startLat,
    startLng,
    endLat,
    endLng,
    color: ATTACK_COLORS[Math.floor(Math.random() * ATTACK_COLORS.length)],
    type: ATTACK_TYPES[Math.floor(Math.random() * ATTACK_TYPES.length)],
    timestamp: new Date().toLocaleTimeString()
  };
};

export const CyberGlobe = () => {
  const [attacks, setAttacks] = useState<Attack[]>([]);
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: 800 });
  const globeRef = useRef<any>(null);

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerWidth < 768 ? 500 : 800
      });
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Initial attacks
    setAttacks(Array.from({ length: 15 }, generateRandomAttack));

    // Add new attacks periodically
    const interval = setInterval(() => {
      setAttacks(prev => {
        const next = [generateRandomAttack(), ...prev];
        if (next.length > 20) return next.slice(0, 20);
        return next;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (globeRef.current) {
      globeRef.current.controls().autoRotate = true;
      globeRef.current.controls().autoRotateSpeed = 0.5;
      globeRef.current.pointOfView({ lat: 20, lng: 78, altitude: 2.5 });
    }
  }, [dimensions]);

  return (
    <div className="relative w-full bg-black overflow-hidden border-y-4 border-primary/20" style={{ height: dimensions.height }}>
      {/* Tactical Overlay */}
      <div className="absolute inset-0 z-10 pointer-events-none p-4 md:p-10">
        {/* Top Left: Monitor */}
        <div className="absolute top-4 left-4 md:top-10 md:left-10 p-4 md:p-6 border-l-2 border-t-2 border-primary/40 bg-black/60 backdrop-blur-md max-w-[200px] md:max-w-none">
          <h3 className="text-primary font-black uppercase tracking-[0.2em] text-[10px] md:text-sm mb-2">Global Threat Monitor</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2 md:gap-3 text-[8px] md:text-[10px] font-bold text-muted-foreground uppercase">
              <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-red-500 animate-pulse" />
              Active Breaches: {Math.floor(Math.random() * 500) + 1200}
            </div>
            <div className="flex items-center gap-2 md:gap-3 text-[8px] md:text-[10px] font-bold text-muted-foreground uppercase">
              <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-orange-500 animate-pulse" />
              Intercepted: {Math.floor(Math.random() * 1000) + 5000}
            </div>
          </div>
        </div>

        {/* Top Right: Live Log */}
        <div className="absolute top-4 right-4 md:top-10 md:right-10 w-40 md:w-64 p-4 border-r-2 border-t-2 border-primary/40 bg-black/60 backdrop-blur-md hidden sm:block">
          <h4 className="text-primary font-black uppercase tracking-[0.2em] text-[8px] md:text-[10px] mb-3 border-b border-primary/20 pb-2">Live Attack Log</h4>
          <div className="space-y-2 max-h-[200px] overflow-hidden">
            {attacks.slice(0, 6).map((attack) => (
              <motion.div 
                key={attack.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col gap-0.5"
              >
                <div className="flex justify-between items-center">
                  <span className="text-[8px] font-black uppercase tracking-tighter" style={{ color: attack.color }}>{attack.type}</span>
                  <span className="text-[6px] text-muted-foreground font-mono">{attack.timestamp}</span>
                </div>
                <div className="w-full h-[1px] bg-primary/10" />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom Left: Mobile Log (Ticker) */}
        <div className="absolute bottom-4 left-4 right-4 p-3 border-2 border-primary/20 bg-black/80 backdrop-blur-md sm:hidden">
          <div className="flex items-center gap-3 overflow-hidden whitespace-nowrap">
            <span className="text-primary font-black text-[8px] uppercase tracking-widest flex-none">Live Feed:</span>
            <div className="flex gap-6 animate-marquee">
              {attacks.slice(0, 5).map(a => (
                <span key={a.id} className="text-[8px] font-bold uppercase tracking-tight" style={{ color: a.color }}>
                  [{a.timestamp}] {a.type}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Right: Node Info (Desktop) */}
        <div className="absolute bottom-10 right-10 p-6 border-r-2 border-b-2 border-primary/40 bg-black/60 backdrop-blur-md text-right hidden md:block">
          <div className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Node: CHAKRA_SEC_01</div>
          <div className="text-[10px] font-bold text-muted-foreground uppercase">Encryption Layer: ACTIVE</div>
          <div className="text-[8px] text-primary/60 font-mono mt-2">LAT: 28.6139 | LNG: 77.2090</div>
        </div>
      </div>

      <Globe
        ref={globeRef}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-dark.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        arcsData={attacks}
        arcColor={'color'}
        arcDashLength={0.4}
        arcDashGap={4}
        arcDashAnimateTime={1500}
        arcStroke={0.5}
        arcsTransitionDuration={1000}
        pointsData={attacks.map(a => ({ lat: a.endLat, lng: a.endLng, color: a.color }))}
        pointColor={'color'}
        pointRadius={0.5}
        pointAltitude={0}
        backgroundColor="rgba(0,0,0,0)"
        width={dimensions.width}
        height={dimensions.height}
      />
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';

export const ScrollButtons = () => {
  const [showUp, setShowUp] = useState(false);
  const [showDown, setShowDown] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      
      setShowUp(scrollY > 300);
      setShowDown(scrollY < maxScroll - 300);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToBottom = () => {
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
  };

  return (
    <div className="fixed bottom-8 right-8 z-[60] flex flex-col gap-3">
      <AnimatePresence>
        {showUp && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 20 }}
          >
            <Button
              variant="outline"
              size="icon"
              onClick={scrollToTop}
              className="w-12 h-12 rounded-none border-2 border-primary bg-background/80 backdrop-blur-md text-primary hover:bg-primary hover:text-primary-foreground shadow-[0_0_20px_rgba(var(--primary),0.2)] transition-all group relative overflow-hidden"
              aria-label="Scroll to top"
            >
              <ChevronUp className="w-6 h-6 relative z-10 transition-transform group-hover:-translate-y-1" />
              <div className="absolute inset-0 bg-primary/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDown && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: -20 }}
          >
            <Button
              variant="outline"
              size="icon"
              onClick={scrollToBottom}
              className="w-12 h-12 rounded-none border-2 border-primary bg-background/80 backdrop-blur-md text-primary hover:bg-primary hover:text-primary-foreground shadow-[0_0_20px_rgba(var(--primary),0.2)] transition-all group relative overflow-hidden"
              aria-label="Scroll to bottom"
            >
              <ChevronDown className="w-6 h-6 relative z-10 transition-transform group-hover:translate-y-1" />
              <div className="absolute inset-0 bg-primary/10 -translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

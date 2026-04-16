import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { motion } from 'motion/react';

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>(
    () => (localStorage.getItem('theme') as 'light' | 'dark') || 'dark'
  );

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <div className="flex items-center gap-4">
      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hidden lg:block">
        {theme === 'light' ? 'Light Ops' : 'Dark Ops'}
      </span>
      <button
        onClick={toggleTheme}
        className="relative h-10 w-20 border-2 border-border bg-muted/30 rounded-none p-1 transition-colors hover:border-primary/50 group"
        aria-label="Toggle Theme"
      >
        {/* Sliding Switch */}
        <motion.div
          animate={{ x: theme === 'light' ? 0 : 40 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="h-full w-8 bg-primary flex items-center justify-center relative z-10 shadow-[0_0_15px_rgba(var(--primary),0.3)]"
        >
          {theme === 'light' ? (
            <Sun className="h-4 w-4 text-primary-foreground" />
          ) : (
            <Moon className="h-4 w-4 text-primary-foreground" />
          )}
          
          {/* Switch Accents */}
          <div className="absolute top-0 left-0 w-1 h-1 border-t border-l border-white/50" />
          <div className="absolute bottom-0 right-0 w-1 h-1 border-b border-r border-white/50" />
        </motion.div>

        {/* Static Icons */}
        <div className="absolute inset-0 flex items-center justify-between px-3 pointer-events-none">
          <Sun className={`h-4 w-4 transition-opacity ${theme === 'light' ? 'opacity-0' : 'opacity-20'}`} />
          <Moon className={`h-4 w-4 transition-opacity ${theme === 'dark' ? 'opacity-0' : 'opacity-20'}`} />
        </div>

        {/* Corner Brackets for the whole switch */}
        <div className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 border-primary/30" />
        <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 border-primary/30" />
      </button>
    </div>
  );
}

import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

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
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="rounded-none border border-zinc-800 hover:bg-primary/10 hover:text-primary transition-all group relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-primary/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
      {theme === 'light' ? (
        <Moon className="h-4 w-4 relative z-10" />
      ) : (
        <Sun className="h-4 w-4 relative z-10" />
      )}
      <span className="sr-only">Toggle theme</span>
      
      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-1 h-1 border-t border-l border-primary/50" />
      <div className="absolute bottom-0 right-0 w-1 h-1 border-b border-r border-primary/50" />
    </Button>
  );
}

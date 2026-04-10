import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, Key, LayoutDashboard, LogOut, Lock, Terminal, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from './ThemeToggle';
import { motion, AnimatePresence } from 'motion/react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isAuthenticated, setIsAuthenticated] = React.useState(!!localStorage.getItem('token'));

  React.useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsAuthenticated(false);
        return;
      }

      try {
        const res = await fetch('/api/auth/verify', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) {
          handleLogout();
        } else {
          setIsAuthenticated(true);
        }
      } catch (err) {
        console.error('Auth verification failed', err);
      }
    };

    verifyToken();
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30 relative overflow-hidden">
      {/* Sci-Fi Background Elements */}
      <div className="scanlines" />
      <div className="fixed inset-0 tactical-grid opacity-20 pointer-events-none" />
      <div className="fixed inset-0 tactical-grid-fine pointer-events-none" />
      
      {/* Navigation */}
      <nav className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-primary rounded-none flex items-center justify-center group-hover:scale-110 transition-transform relative">
                <Shield className="w-6 h-6 text-primary-foreground" />
                <div className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 border-primary-foreground/50" />
                <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 border-primary-foreground/50" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tighter uppercase leading-none">
                  SECURE<span className="text-primary">KEY</span>X
                </span>
                <span className="text-[8px] font-bold tracking-[0.3em] text-muted-foreground uppercase">Tactical Node v4.0</span>
              </div>
            </Link>

            <div className="hidden md:flex items-center gap-6">
              {isAuthenticated ? (
                <>
                  <Link 
                    to="/dashboard" 
                    className={`text-[10px] font-bold uppercase tracking-widest transition-all hover:text-primary flex items-center gap-2 px-3 py-2 border border-transparent hover:border-border ${location.pathname === '/dashboard' ? 'text-primary border-border bg-primary/5' : 'text-muted-foreground'}`}
                  >
                    <LayoutDashboard className="w-3 h-3" />
                    Dashboard
                  </Link>
                  <Link 
                    to="/algorithms" 
                    className={`text-[10px] font-bold uppercase tracking-widest transition-all hover:text-primary flex items-center gap-2 px-3 py-2 border border-transparent hover:border-border ${location.pathname === '/algorithms' ? 'text-primary border-border bg-primary/5' : 'text-muted-foreground'}`}
                  >
                    <Key className="w-3 h-3" />
                    Key Gen
                  </Link>
                  <div className="h-4 w-[1px] bg-border mx-2" />
                  <ThemeToggle />
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleLogout} 
                    className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-none h-9"
                  >
                    <LogOut className="w-3 h-3 mr-2" />
                    Disconnect
                  </Button>
                </>
              ) : (
                <>
                  <ThemeToggle />
                  <Link to="/auth">
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-none px-6 h-9 font-bold uppercase tracking-widest text-[10px] border border-primary/50 shadow-[0_0_15px_rgba(var(--primary),0.2)]">
                      Initialize Access
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-4">
              <ThemeToggle />
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-muted-foreground hover:text-primary transition-colors"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-border bg-background/95 backdrop-blur-lg overflow-hidden"
            >
              <div className="px-4 py-6 space-y-4">
                {isAuthenticated ? (
                  <>
                    <Link 
                      to="/dashboard" 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-widest border border-border ${location.pathname === '/dashboard' ? 'text-primary bg-primary/5' : 'text-muted-foreground'}`}
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </Link>
                    <Link 
                      to="/algorithms" 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-widest border border-border ${location.pathname === '/algorithms' ? 'text-primary bg-primary/5' : 'text-muted-foreground'}`}
                    >
                      <Key className="w-4 h-4" />
                      Key Gen
                    </Link>
                    <Button 
                      variant="ghost" 
                      onClick={handleLogout} 
                      className="w-full justify-start text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-none h-12 border border-border"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Disconnect
                    </Button>
                  </>
                ) : (
                  <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-none h-12 font-bold uppercase tracking-widest text-xs border border-primary/50">
                      Initialize Access
                    </Button>
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Status Bar */}
        <div className="h-1 bg-border relative overflow-hidden">
          <motion.div 
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 w-1/3 bg-primary/30 skew-x-12"
          />
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-16 mt-auto relative bg-background/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 border border-primary/20">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <span className="text-lg font-black tracking-tighter uppercase">SECUREKEYX</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed uppercase tracking-wider font-medium">
                Military-grade cryptographic infrastructure for secure asset management and distributed node protection.
              </p>
              <div className="flex items-center gap-2 text-[10px] font-bold text-primary uppercase tracking-widest">
                <Terminal className="w-3 h-3" />
                <span>System Status: Operational</span>
              </div>
            </div>
            <div>
              <h4 className="text-[10px] font-black text-foreground mb-6 uppercase tracking-[0.3em]">Protocols</h4>
              <ul className="space-y-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                <li className="hover:text-primary transition-colors cursor-pointer flex items-center gap-2">
                  <div className="w-1 h-1 bg-primary" /> AES-256-GCM
                </li>
                <li className="hover:text-primary transition-colors cursor-pointer flex items-center gap-2">
                  <div className="w-1 h-1 bg-primary" /> RSA-4096-OAEP
                </li>
                <li className="hover:text-primary transition-colors cursor-pointer flex items-center gap-2">
                  <div className="w-1 h-1 bg-primary" /> CHACHA20-POLY1305
                </li>
                <li className="hover:text-primary transition-colors cursor-pointer flex items-center gap-2">
                  <div className="w-1 h-1 bg-primary" /> KYBER-1024 (PQC)
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-[10px] font-black text-foreground mb-6 uppercase tracking-[0.3em]">Security</h4>
              <ul className="space-y-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                <li className="hover:text-primary transition-colors cursor-pointer">Zero-Knowledge</li>
                <li className="hover:text-primary transition-colors cursor-pointer">E2E Encryption</li>
                <li className="hover:text-primary transition-colors cursor-pointer">Hardware Isolation</li>
                <li className="hover:text-primary transition-colors cursor-pointer">Audit Logs</li>
              </ul>
            </div>
            <div className="relative p-6 border border-border bg-primary/5 overflow-hidden group">
              <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-primary/30" />
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-primary/30" />
              <h4 className="text-[10px] font-black text-primary mb-4 uppercase tracking-[0.2em]">Network Node</h4>
              <p className="text-[9px] text-muted-foreground leading-relaxed uppercase tracking-widest mb-4">
                Connected to secure relay: <br/>
                <span className="text-foreground">192.168.1.104:443</span>
              </p>
              <div className="w-full h-1 bg-border relative">
                <div className="absolute inset-0 bg-primary/20 animate-pulse" />
              </div>
            </div>
          </div>
          <div className="border-t border-border mt-16 pt-8 flex justify-between items-center">
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
              © 2026 SECUREKEYX // ENCRYPTION CORE // ALL RIGHTS RESERVED
            </p>
            <div className="flex gap-6">
              <Lock className="w-3 h-3 text-muted-foreground hover:text-primary transition-colors cursor-pointer" />
              <Terminal className="w-3 h-3 text-muted-foreground hover:text-primary transition-colors cursor-pointer" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

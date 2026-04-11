import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Shield, Key, LayoutDashboard, LogOut, Lock, Terminal, Menu, X, ShieldCheck, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from './ThemeToggle';
import { motion, AnimatePresence } from 'motion/react';
import { BharatLogo } from './BharatLogo';

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isAuthenticated, setIsAuthenticated] = React.useState(!!localStorage.getItem('token'));

  const navigate = useNavigate();

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
    setIsAuthenticated(false);
    navigate('/auth');
  };

  return (
    <div className="min-h-screen text-foreground font-sans selection:bg-primary/30 relative overflow-hidden">
      {/* India Sci-Fi Background Elements */}
      <div className="fixed inset-0 z-[-10] pointer-events-none overflow-hidden">
        <div className="tactical-bg" />
        <div className="scanlines" />
        <div className="mandala-overlay" />
        <div className="absolute inset-0 tactical-grid opacity-20" />
        <div className="absolute inset-0 tactical-grid-fine opacity-30" />
      </div>
      
      {/* Navigation */}
      <nav className="border-b-4 border-primary bg-background/95 backdrop-blur-md sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <Link to="/" className="flex items-center gap-4 group" aria-label="Bharat Tactical Encryption Home">
              <BharatLogo className="w-12 h-12 transition-transform group-hover:scale-105" />
              <div className="flex flex-col">
                <span className="text-2xl font-black tracking-tight uppercase leading-none text-foreground">
                  BHARAT <span className="text-primary">TACTICAL</span>
                </span>
                <span className="text-[10px] font-bold tracking-[0.4em] text-muted-foreground uppercase">Military Grade Encryption</span>
              </div>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-10">
              {isAuthenticated ? (
                <>
                  <Link 
                    to="/dashboard" 
                    aria-label="Access Dashboard"
                    className={`text-base font-black uppercase tracking-widest transition-all hover:text-primary flex items-center gap-3 px-4 py-2 border-b-4 ${location.pathname === '/dashboard' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'}`}
                  >
                    <LayoutDashboard className="w-5 h-5" />
                    Dashboard
                  </Link>
                  <Link 
                    to="/algorithms" 
                    aria-label="Algorithm Selection"
                    className={`text-base font-black uppercase tracking-widest transition-all hover:text-primary flex items-center gap-3 px-4 py-2 border-b-4 ${location.pathname === '/algorithms' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'}`}
                  >
                    <Key className="w-5 h-5" />
                    Key Gen
                  </Link>
                  <div className="h-8 w-[2px] bg-border mx-2" />
                  <ThemeToggle />
                  <Button 
                    variant="destructive" 
                    size="lg" 
                    onClick={handleLogout} 
                    className="text-sm font-black uppercase tracking-widest rounded-none h-12 px-8"
                  >
                    <LogOut className="w-5 h-5 mr-3" />
                    Logout
                  </Button>
                </>
              ) : (
                <div className="flex items-center gap-6">
                  <ThemeToggle />
                  <Link to="/auth">
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-none px-10 font-black uppercase tracking-widest h-14 text-sm">
                      Initialize Access
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-4">
              <ThemeToggle />
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-foreground hover:text-primary transition-colors"
              >
                {isMobileMenuOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
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
              className="md:hidden border-t-4 border-primary bg-background/95 backdrop-blur-lg overflow-hidden"
            >
              <div className="px-4 py-8 space-y-6">
                {isAuthenticated ? (
                  <>
                    <Link 
                      to="/dashboard" 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-4 px-6 py-4 text-lg font-black uppercase tracking-widest border-2 ${location.pathname === '/dashboard' ? 'text-primary border-primary bg-primary/5' : 'text-muted-foreground border-border'}`}
                    >
                      <LayoutDashboard className="w-6 h-6" />
                      Dashboard
                    </Link>
                    <Link 
                      to="/algorithms" 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-4 px-6 py-4 text-lg font-black uppercase tracking-widest border-2 ${location.pathname === '/algorithms' ? 'text-primary border-primary bg-primary/5' : 'text-muted-foreground border-border'}`}
                    >
                      <Key className="w-6 h-6" />
                      Key Gen
                    </Link>
                    <Button 
                      variant="destructive" 
                      onClick={handleLogout} 
                      className="w-full justify-center text-lg font-black uppercase tracking-widest rounded-none h-16"
                    >
                      <LogOut className="w-6 h-6 mr-4" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-none h-16 font-black uppercase tracking-widest text-lg">
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
      <footer className="border-t-4 border-primary py-20 mt-auto relative bg-background/50 backdrop-blur-sm overflow-hidden">
        <div className="absolute inset-0 tactical-grid opacity-5" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-16">
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <BharatLogo className="w-10 h-10" />
                <span className="text-2xl font-black tracking-tight uppercase">BHARAT TACTICAL</span>
              </div>
              <p className="text-sm font-bold text-muted-foreground uppercase leading-relaxed tracking-wider">
                Sovereign cryptographic infrastructure for the protection of national digital assets.
              </p>
              <div className="flex items-center gap-3 text-xs font-black text-primary uppercase tracking-[0.2em]">
                <Terminal className="w-4 h-4" />
                <span>System Status: Operational</span>
              </div>
            </div>
            <div>
              <h4 className="text-xs font-black text-foreground mb-8 uppercase tracking-[0.4em] border-b-2 border-primary w-fit pb-2">Protocols</h4>
              <ul className="space-y-4 text-xs font-black text-muted-foreground uppercase tracking-widest">
                <li className="hover:text-primary transition-colors cursor-pointer flex items-center gap-3">
                  <ShieldCheck className="w-4 h-4 text-primary" /> AES-256-GCM
                </li>
                <li className="hover:text-primary transition-colors cursor-pointer flex items-center gap-3">
                  <ShieldCheck className="w-4 h-4 text-primary" /> RSA-4096-OAEP
                </li>
                <li className="hover:text-primary transition-colors cursor-pointer flex items-center gap-3">
                  <ShieldCheck className="w-4 h-4 text-primary" /> CHACHA20
                </li>
                <li className="hover:text-primary transition-colors cursor-pointer flex items-center gap-3">
                  <ShieldCheck className="w-4 h-4 text-primary" /> KYBER (PQC)
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-black text-foreground mb-8 uppercase tracking-[0.4em] border-b-2 border-primary w-fit pb-2">Security</h4>
              <ul className="space-y-4 text-xs font-black text-muted-foreground uppercase tracking-widest">
                <li className="hover:text-primary transition-colors cursor-pointer flex items-center gap-3">
                  <Lock className="w-4 h-4 text-primary" /> Zero-Knowledge
                </li>
                <li className="hover:text-primary transition-colors cursor-pointer flex items-center gap-3">
                  <Lock className="w-4 h-4 text-primary" /> E2E Encryption
                </li>
                <li className="hover:text-primary transition-colors cursor-pointer flex items-center gap-3">
                  <Lock className="w-4 h-4 text-primary" /> Hardware Isolation
                </li>
                <li className="hover:text-primary transition-colors cursor-pointer flex items-center gap-3">
                  <Lock className="w-4 h-4 text-primary" /> Audit Logs
                </li>
              </ul>
            </div>
            <div className="relative p-8 border-2 border-primary/20 bg-primary/5 overflow-hidden group">
              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary/40" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary/40" />
              <h4 className="text-xs font-black text-primary mb-6 uppercase tracking-[0.3em]">Force Readiness</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                  <span className="text-muted-foreground">Army Node</span>
                  <span className="text-[hsl(var(--army-olive))]">Active</span>
                </div>
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                  <span className="text-muted-foreground">Navy Node</span>
                  <span className="text-[hsl(var(--navy-blue))]">Active</span>
                </div>
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                  <span className="text-muted-foreground">Air Force Node</span>
                  <span className="text-[hsl(var(--airforce-blue))]">Active</span>
                </div>
              </div>
              <div className="w-full h-2 bg-border relative mt-6">
                <div className="absolute inset-0 bg-primary/30 animate-pulse" />
              </div>
            </div>
          </div>
          <div className="border-t-2 border-border mt-20 pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">
              © 2026 BHARAT TACTICAL ENCRYPTION // MINISTRY OF SECURE DATA
            </p>
            <div className="flex gap-8">
              <Globe className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors cursor-pointer" />
              <Terminal className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors cursor-pointer" />
              <Lock className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors cursor-pointer" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

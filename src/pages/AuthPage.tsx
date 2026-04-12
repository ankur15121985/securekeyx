import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Helmet } from 'react-helmet-async';
import { Shield, Smartphone, Lock, ArrowRight, Loader2, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

import { ChakravyuhLogo } from '../components/ChakravyuhLogo';

export default function AuthPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('token')) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return toast.error('Please enter credentials');

    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await res.text();
        console.error('[AUTH] Non-JSON response:', text);
        throw new Error(`Server returned non-JSON response (${res.status}).`);
      }

      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        toast.success('Access granted');
        navigate('/dashboard');
      } else {
        toast.error(data.error || 'Login failed');
      }
    } catch (err) {
      console.error('[AUTH] Login error:', err);
      toast.error(`Connection error: ${err instanceof Error ? err.message : 'Unknown'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-[80vh] flex items-center justify-center p-4">
      <Helmet>
        <title>Initialize Access | Chakravyuh</title>
        <meta name="description" content="Securely initialize your access to the Chakravyuh node. Sovereign authentication tunnel active." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-xl"
      >
        <Card className="bg-card border-4 border-primary rounded-none shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-2 bg-primary" />
          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white/20" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white/20" />
          
          <CardHeader className="space-y-4 text-center pt-12 pb-8">
            <div className="mx-auto mb-6">
              <ChakravyuhLogo className="w-24 h-24" />
            </div>
            <CardTitle className="text-4xl md:text-5xl font-black tracking-tight text-foreground uppercase leading-none">
              CHAKRAVYUH
            </CardTitle>
            <CardDescription className="text-muted-foreground text-sm font-black uppercase tracking-[0.4em] pt-2">
              Secure Authorization Tunnel
            </CardDescription>
          </CardHeader>
          <CardContent className="px-10 pb-12">
            <form onSubmit={handleLogin} className="space-y-8">
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-xs font-black text-muted-foreground uppercase tracking-[0.3em] ml-1">Node Identifier</label>
                  <div className="relative">
                    <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
                    <Input
                      type="text"
                      placeholder="ENTER USERNAME"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="bg-background border-2 border-border pl-14 h-16 rounded-none focus-visible:ring-primary font-black text-sm uppercase tracking-widest"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-black text-muted-foreground uppercase tracking-[0.3em] ml-1">Authorization Key</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
                    <Input
                      type="password"
                      placeholder="ENTER PASSWORD"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-background border-2 border-border pl-14 h-16 rounded-none focus-visible:ring-primary font-black text-sm uppercase tracking-widest"
                    />
                  </div>
                </div>
              </div>
              <Button 
                type="submit" 
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-20 rounded-none font-black uppercase tracking-[0.3em] text-sm shadow-[0_0_30px_rgba(var(--primary),0.3)]"
              >
                {loading ? (
                  <Loader2 className="w-8 h-8 animate-spin" />
                ) : (
                  <>
                    Initialize Handshake
                    <ArrowRight className="ml-3 w-6 h-6" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col gap-8 border-t-2 border-border py-10 bg-muted/30">
            <div className="flex flex-col items-center gap-6">
              <div className="flex items-center gap-3 text-xs font-black text-muted-foreground text-center uppercase tracking-widest">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <span>End-to-End Encrypted Authentication Tunnel</span>
              </div>
              <div className="px-6 py-2 bg-background border-2 border-border text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em]">
                NODE_ID: {window.location.hostname.toUpperCase()}
              </div>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}

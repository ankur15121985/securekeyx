import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Shield, Smartphone, Lock, ArrowRight, Loader2, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function AuthPage() {
  const [step, setStep] = useState<'mobile' | 'otp' | 'admin'>('mobile');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return toast.error('Please enter credentials');

    setLoading(true);
    try {
      const res = await fetch('/api/auth/admin-login', {
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
        toast.success('Admin access granted');
        navigate('/dashboard');
      } else {
        toast.error(data.error || 'Admin login failed');
      }
    } catch (err) {
      console.error('[AUTH] Admin login error:', err);
      toast.error(`Connection error: ${err instanceof Error ? err.message : 'Unknown'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobile) return toast.error('Please enter mobile number');
    
    setLoading(true);
    try {
      const res = await fetch('/api/auth/otp-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile }),
      });
      
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await res.text();
        console.error('[AUTH] Non-JSON response:', text);
        throw new Error(`Server returned non-JSON response (${res.status}).`);
      }

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        setStep('otp');
      } else {
        toast.error(data.error || 'Request failed');
      }
    } catch (err) {
      console.error('[AUTH] Handshake error:', err);
      toast.error(`Connection error: ${err instanceof Error ? err.message : 'Unknown'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return toast.error('Please enter OTP');

    setLoading(true);
    try {
      const res = await fetch('/api/auth/otp-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, otp }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        toast.success('Login successful');
        navigate('/dashboard');
      } else {
        toast.error(data.error || 'Verification failed');
      }
    } catch (err) {
      console.error('OTP verify error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown connection error';
      toast.error(`Connection error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <Card className="bg-zinc-900 border-zinc-800 rounded-none">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto w-14 h-14 bg-primary/10 border border-primary/20 rounded-none flex items-center justify-center mb-6 relative group">
              <Shield className="w-7 h-7 text-primary group-hover:scale-110 transition-transform" />
              <div className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 border-primary/50" />
              <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 border-primary/50" />
            </div>
            <CardTitle className="text-3xl font-extrabold tracking-tight text-foreground uppercase leading-none">
              {step === 'mobile' ? 'Access Control' : step === 'otp' ? 'Identity Verification' : 'Admin Access'}
            </CardTitle>
            <CardDescription className="text-muted-foreground text-xs font-medium pt-2">
              {step === 'mobile' 
                ? 'Initialize secure handshake via mobile node.' 
                : step === 'otp'
                ? `Enter 6-digit decryption code sent to node: ${mobile}`
                : 'Enter administrative credentials for node override.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={step === 'mobile' ? handleRequestOtp : step === 'otp' ? handleVerifyOtp : handleAdminLogin} className="space-y-6">
              {step === 'mobile' ? (
                <div className="space-y-2">
                  <div className="relative">
                    <Smartphone className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      className="bg-background border-border pl-10 h-12 rounded-none focus-visible:ring-primary font-medium text-sm"
                    />
                  </div>
                </div>
              ) : step === 'otp' ? (
                <div className="space-y-2">
                  <div className="relative">
                    <Lock className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="000000"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="bg-background border-border pl-10 h-12 rounded-none tracking-[0.8em] font-mono text-center focus-visible:ring-primary text-lg font-black"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative">
                    <Shield className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="ADMIN USERNAME"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="bg-background border-border pl-10 h-12 rounded-none focus-visible:ring-primary font-mono text-xs uppercase tracking-widest"
                    />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="password"
                      placeholder="ADMIN PASSWORD"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-background border-border pl-10 h-12 rounded-none focus-visible:ring-primary font-mono text-xs uppercase tracking-widest"
                    />
                  </div>
                </div>
              )}
              <Button 
                type="submit" 
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 rounded-none font-black uppercase tracking-[0.2em] text-[10px] shadow-[0_0_15px_rgba(var(--primary),0.2)]"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    {step === 'mobile' ? 'Request Handshake' : step === 'otp' ? 'Authorize Access' : 'Bypass Protocol'}
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col gap-6 border-t border-border pt-8 mt-4">
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-2 text-[10px] font-medium text-muted-foreground text-center">
                <ShieldCheck className="w-3 h-3 text-primary" />
                <span>End-to-End Encrypted Authentication Tunnel</span>
              </div>
              <div className="px-3 py-1 bg-zinc-800/50 border border-zinc-700 text-[8px] font-mono text-zinc-500 uppercase tracking-widest">
                Node: {window.location.hostname}
              </div>
            </div>
            <div className="flex flex-col gap-3 items-center">
              {step === 'otp' && (
                <button 
                  onClick={() => setStep('mobile')}
                  className="text-[10px] font-black text-primary hover:underline uppercase tracking-widest"
                >
                  Re-initialize Node Connection
                </button>
              )}
              {step !== 'admin' ? (
                <button 
                  onClick={() => setStep('admin')}
                  className="text-[10px] font-black text-zinc-500 hover:text-primary hover:underline uppercase tracking-widest"
                >
                  Admin Override Access
                </button>
              ) : (
                <button 
                  onClick={() => setStep('mobile')}
                  className="text-[10px] font-black text-zinc-500 hover:text-primary hover:underline uppercase tracking-widest"
                >
                  Return to Handshake Protocol
                </button>
              )}
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}

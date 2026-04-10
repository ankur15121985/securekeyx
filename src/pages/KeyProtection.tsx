import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Lock, Shield, ShieldCheck, Loader2, ArrowRight, Key } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import CryptoJS from 'crypto-js';

export default function KeyProtection() {
  const [searchParams] = useSearchParams();
  const algo = searchParams.get('algo') || 'AES-256';
  const rawKey = searchParams.get('key') || '';
  const [passphrase, setPassphrase] = useState('');
  const [confirmPassphrase, setConfirmPassphrase] = useState('');
  const [strength, setStrength] = useState({ score: 0, label: 'NONE', color: 'bg-zinc-800' });
  const [loading, setLoading] = useState(false);

  const calculateStrength = (val: string) => {
    if (!val) return { score: 0, label: 'NONE', color: 'bg-zinc-800' };
    
    let score = 0;
    if (val.length >= 8) score += 1;
    if (val.length >= 12) score += 1;
    if (val.length >= 16) score += 1;
    if (/[A-Z]/.test(val) && /[a-z]/.test(val)) score += 1;
    if (/[0-9]/.test(val)) score += 1;
    if (/[^A-Za-z0-9]/.test(val)) score += 1;

    if (score <= 2) return { score, label: 'WEAK', color: 'bg-red-500' };
    if (score <= 4) return { score, label: 'MEDIUM', color: 'bg-yellow-500' };
    if (score === 5) return { score, label: 'STRONG', color: 'bg-green-500' };
    return { score, label: 'TACTICAL', color: 'bg-blue-500' };
  };

  const handlePassphraseChange = (val: string) => {
    setPassphrase(val);
    setStrength(calculateStrength(val));
  };
  const [completed, setCompleted] = useState(false);
  const navigate = useNavigate();

  const handleProtect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passphrase) return toast.error('Passphrase required');
    if (passphrase !== confirmPassphrase) return toast.error('Passphrases do not match');
    if (passphrase.length < 8) return toast.error('Passphrase must be at least 8 characters');

    setLoading(true);
    try {
      // Client-side encryption of the generated key using the user's passphrase
      const encrypted = CryptoJS.AES.encrypt(rawKey, passphrase).toString();
      
      // Store the encrypted key in the backend (Redis)
      const res = await fetch('/api/keys/store', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ 
          encryptedKey: encrypted, 
          algorithm: algo,
          metadata: {
            protection: 'AES-256-Passphrase',
            clientSide: true
          }
        }),
      });

      if (res.ok) {
        setCompleted(true);
        toast.success('Key protected and stored securely');
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to store key');
      }
    } catch (err) {
      toast.error('Encryption or connection error');
    } finally {
      setLoading(false);
    }
  };

  if (completed) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center space-y-10">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto relative overflow-hidden"
        >
          <div className="absolute inset-0 tactical-grid opacity-20" />
          <ShieldCheck className="w-12 h-12 text-primary relative z-10" />
        </motion.div>
        <div className="space-y-4">
          <h1 className="text-5xl font-extrabold text-foreground uppercase tracking-tight leading-none">Mission Accomplished</h1>
          <p className="text-muted-foreground text-sm font-medium max-w-sm mx-auto leading-relaxed">
            Cryptographic asset has been encapsulated with personal passphrase and committed to the secure vault enclave.
          </p>
        </div>
        <Button 
          onClick={() => navigate('/dashboard')}
          className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-none h-14 px-12 font-black uppercase tracking-[0.2em] text-xs shadow-[0_0_20px_rgba(var(--primary),0.2)]"
        >
          Return to Command Center
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-10">
      <header className="text-center space-y-4">
        <h1 className="text-5xl font-extrabold tracking-tight text-foreground uppercase leading-none">Personal Protection</h1>
        <p className="text-muted-foreground text-sm font-medium max-w-md mx-auto leading-relaxed">
          Initialize personal encryption layer. Passphrase is never transmitted to the central node. Zero-knowledge protocol active.
        </p>
      </header>

      <Card className="bg-card border-border rounded-none overflow-hidden relative shadow-[0_0_30px_rgba(0,0,0,0.3)]">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-primary" />
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-white/20" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-white/20" />

        <CardHeader className="pt-10 px-10">
          <CardTitle className="text-2xl font-black text-foreground uppercase tracking-tighter flex items-center gap-3">
            <div className="p-2 bg-primary/10 border border-primary/20">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            Passphrase Setup
          </CardTitle>
          <CardDescription className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pt-2">
            Asset will be encapsulated using AES-256-CBC before commit.
          </CardDescription>
        </CardHeader>

        <CardContent className="px-10 pb-10">
          <form onSubmit={handleProtect} className="space-y-8">
            <div className="space-y-3">
              <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">Personal Passphrase</Label>
              <Input
                type="password"
                placeholder="••••••••••••"
                value={passphrase}
                onChange={(e) => handlePassphraseChange(e.target.value)}
                className="bg-background border-border h-14 rounded-none focus-visible:ring-primary uppercase font-bold tracking-widest text-xs"
              />
              {passphrase && (
                <div className="space-y-2 pt-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Strength Analysis</span>
                    <span className={`text-[9px] font-black uppercase tracking-widest ${strength.color.replace('bg-', 'text-')}`}>
                      {strength.label}
                    </span>
                  </div>
                  <div className="h-1 w-full bg-zinc-800/50 flex gap-1">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div 
                        key={i}
                        className={`h-full flex-1 transition-all duration-500 ${
                          i <= strength.score ? strength.color : 'bg-zinc-800'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-3">
              <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">Confirm Passphrase</Label>
              <Input
                type="password"
                placeholder="••••••••••••"
                value={confirmPassphrase}
                onChange={(e) => setConfirmPassphrase(e.target.value)}
                className="bg-background border-border h-14 rounded-none focus-visible:ring-primary uppercase font-bold tracking-widest text-xs"
              />
            </div>

            <div className="p-6 bg-muted/50 border border-border rounded-none flex gap-4 relative overflow-hidden">
              <div className="absolute inset-0 tactical-grid opacity-10" />
              <Key className="w-6 h-6 text-muted-foreground flex-none relative z-10" />
              <div className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.2em] leading-relaxed relative z-10">
                Protocol: {algo} <br />
                Protection: Client-Side AES-256-CBC
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-16 rounded-none font-black uppercase tracking-[0.2em] text-xs shadow-[0_0_20px_rgba(var(--primary),0.2)]"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                <>
                  Encrypt & Commit Asset
                  <ArrowRight className="ml-3 w-5 h-5" />
                </>
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="bg-muted/50 border-t border-border py-6 px-10">
          <div className="flex items-center gap-3 text-[10px] text-muted-foreground uppercase font-black tracking-[0.3em]">
            <Shield className="w-4 h-4 text-primary" />
            Zero-Knowledge Protocol // End-to-End Encapsulation
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

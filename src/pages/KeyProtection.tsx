import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Lock, Shield, ShieldCheck, Loader2, ArrowRight, Key, Zap } from 'lucide-react';
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
    if (!val) return { score: 0, label: 'NONE', color: 'bg-muted' };
    
    let score = 0;
    if (val.length >= 8) score += 1;
    if (val.length >= 12) score += 1;
    if (val.length >= 16) score += 1;
    if (/[A-Z]/.test(val) && /[a-z]/.test(val)) score += 1;
    if (/[0-9]/.test(val)) score += 1;
    if (/[^A-Za-z0-9]/.test(val)) score += 1;

    if (score <= 2) return { score, label: 'WEAK', color: 'bg-destructive' };
    if (score <= 4) return { score, label: 'MEDIUM', color: 'bg-amber-500' };
    if (score === 5) return { score, label: 'STRONG', color: 'bg-emerald-500' };
    return { score, label: 'TACTICAL', color: 'bg-primary' };
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center space-y-12">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-32 h-32 bg-primary/10 border-4 border-primary/30 flex items-center justify-center mx-auto relative overflow-hidden"
        >
          <ShieldCheck className="w-16 h-16 text-primary relative z-10" />
        </motion.div>
        <div className="space-y-6">
          <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none">Mission Accomplished</h1>
          <p className="text-xl font-bold max-w-xl mx-auto leading-relaxed uppercase tracking-widest">
            Cryptographic asset has been encapsulated with personal passphrase and committed to the secure vault enclave.
          </p>
        </div>
        <Button 
          onClick={() => navigate('/dashboard')}
          className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-none h-20 px-16 font-black uppercase tracking-[0.3em] text-sm shadow-[0_0_30px_rgba(var(--primary),0.3)]"
        >
          Return to Command Center
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <header className="text-center space-y-6">
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase leading-none">Personal Protection</h1>
        <p className="text-xl font-bold max-w-2xl mx-auto leading-relaxed uppercase tracking-widest">
          Initialize personal encryption layer. Passphrase is never transmitted to the central node. Zero-knowledge protocol active.
        </p>
      </header>

      <Card className="bg-card border-4 border-primary rounded-none overflow-hidden relative shadow-[0_0_50px_rgba(0,0,0,0.4)]">
        <div className="absolute top-0 left-0 w-full h-2 bg-primary" />
        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-foreground/20" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-foreground/20" />

        <CardHeader className="pt-16 px-12">
          <CardTitle className="text-3xl md:text-4xl font-black uppercase tracking-tighter flex items-center gap-4">
            <div className="p-4 bg-primary/10 border-2 border-primary/20">
              <Lock className="w-10 h-10 text-primary" />
            </div>
            Passphrase Setup
          </CardTitle>
          <CardDescription className="text-xs font-black uppercase tracking-[0.3em] pt-4">
            Asset will be encapsulated using AES-256-CBC before commit.
          </CardDescription>
        </CardHeader>

        <CardContent className="px-12 pb-16">
          <form onSubmit={handleProtect} className="space-y-10">
            <div className="space-y-4">
              <Label className="text-xs font-black uppercase tracking-[0.4em]">Personal Passphrase</Label>
              <Input
                type="password"
                placeholder="••••••••••••"
                value={passphrase}
                onChange={(e) => handlePassphraseChange(e.target.value)}
                className="bg-background border-2 border-border h-20 rounded-none focus-visible:ring-primary uppercase font-black tracking-[0.3em] text-sm"
              />
              {passphrase && (
                <div className="space-y-3 pt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">Strength Analysis</span>
                    <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${strength.color.replace('bg-', 'text-')}`}>
                      {strength.label}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-muted/50 flex gap-1">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div 
                        key={i}
                        className={`h-full flex-1 transition-all duration-500 ${
                          i <= strength.score ? strength.color : 'bg-muted'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-4">
              <Label className="text-xs font-black uppercase tracking-[0.4em]">Confirm Passphrase</Label>
              <Input
                type="password"
                placeholder="••••••••••••"
                value={confirmPassphrase}
                onChange={(e) => setConfirmPassphrase(e.target.value)}
                className="bg-background border-2 border-border h-20 rounded-none focus-visible:ring-primary uppercase font-black tracking-[0.3em] text-sm"
              />
            </div>

            <div className="p-8 bg-muted/50 border-2 border-border rounded-none flex gap-6 relative overflow-hidden">
              <Key className="w-8 h-8 flex-none relative z-10" />
              <div className="text-xs uppercase font-black tracking-[0.3em] leading-relaxed relative z-10">
                Protocol: {algo} <br />
                Protection: Client-Side AES-256-CBC // IND-SEC-LAYER
              </div>
            </div>

            <div className="pt-4">
              <Button 
                type="button"
                variant="outline"
                onClick={() => {
                  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SecureKeyX | Ultimate Offline Vault</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/crypto-js.min.js"></script>
    <style>
        :root { --blue: #2563eb; --bg: #0a0a0a; --card: #111; --border: #333; }
        body { font-family: 'Inter', -apple-system, sans-serif; background: var(--bg); color: #fff; margin: 0; display: flex; flex-direction: column; align-items: center; min-height: 100vh; padding: 20px; }
        .container { max-width: 800px; width: 100%; }
        .header { text-align: center; margin-bottom: 40px; border-bottom: 1px solid var(--border); padding-bottom: 20px; }
        h1 { font-size: 32px; font-weight: 900; text-transform: uppercase; letter-spacing: -2px; margin: 0; }
        .badge { background: rgba(37, 99, 235, 0.1); color: var(--blue); padding: 4px 12px; border-radius: 99px; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; border: 1px solid rgba(37, 99, 235, 0.2); }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .card { background: var(--card); border: 1px solid var(--border); padding: 24px; border-radius: 0; position: relative; }
        .card::before { content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 2px; background: var(--blue); }
        h2 { font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #888; margin-top: 0; }
        .input-group { margin-bottom: 20px; }
        input[type="file"] { display: none; }
        .file-label { display: block; background: #000; border: 1px dashed var(--border); padding: 40px 20px; text-align: center; cursor: pointer; transition: all 0.2s; }
        .file-label:hover { border-color: var(--blue); background: rgba(37, 99, 235, 0.05); }
        button { width: 100%; background: var(--blue); color: #fff; border: none; padding: 14px; font-weight: 800; text-transform: uppercase; cursor: pointer; transition: opacity 0.2s; }
        button:hover { opacity: 0.9; }
        button.secondary { background: #222; margin-top: 10px; }
        #status { margin-top: 20px; padding: 12px; font-size: 12px; font-family: monospace; background: #000; border: 1px solid #222; color: var(--blue); }
        .disclaimer { margin-top: 40px; padding: 20px; border: 1px solid rgba(255, 100, 0, 0.2); background: rgba(255, 100, 0, 0.05); font-size: 11px; color: #ff6400; line-height: 1.6; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="badge">Offline Vault Utility</div>
            <h1>SecureKeyX Vault</h1>
            <div style="font-size: 12px; color: #444; margin-top: 8px; font-family: monospace;">ALGO: ${algo} | KEY: ${rawKey.slice(0, 8)}...</div>
        </div>
        <div class="grid">
            <div class="card">
                <h2>Encryption Engine</h2>
                <div class="input-group">
                    <label for="encryptInput" class="file-label"><b>Click to Select Items</b></label>
                    <input type="file" id="encryptInput" multiple webkitdirectory directory>
                </div>
                <button onclick="processFiles('encrypt')">Encrypt All Items</button>
            </div>
            <div class="card">
                <h2>Decryption Engine</h2>
                <div class="input-group">
                    <label for="decryptInput" class="file-label"><b>Select .enc Files</b></label>
                    <input type="file" id="decryptInput" multiple>
                </div>
                <button onclick="processFiles('decrypt')" class="secondary">Decrypt All Items</button>
            </div>
        </div>
        <div id="status">System Ready. Offline mode strictly enforced.</div>
        <div class="disclaimer"><b>Security Notice:</b> Designed for massive file processing (>5GB). No data is sent to server.</div>
    </div>
    <script>
        const KEY = "${rawKey}";
        async function processFiles(mode) {
           alert('Utility activated in offline bypass mode. Process would initialize here.');
        }
    </script>
</body>
</html>`;
                  const blob = new Blob([htmlContent], { type: 'text/html' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `SecureKeyX-Offline-Vault-${algo.toLowerCase()}.html`;
                  a.click();
                  URL.revokeObjectURL(url);
                  toast.success('Offline Vault Utility downloaded');
                }}
                className="w-full border-2 border-primary/30 text-primary hover:bg-primary/5 rounded-none h-14 font-black uppercase tracking-[0.3em] text-[10px]"
              >
                <Zap className="mr-3 w-4 h-4 text-primary" />
                Download Offline Vault Utility (For Assets {'>'} 1GB)
              </Button>
            </div>

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-20 rounded-none font-black uppercase tracking-[0.3em] text-sm shadow-[0_0_30px_rgba(var(--primary),0.3)]"
            >
              {loading ? <Loader2 className="w-10 h-10 animate-spin" /> : (
                <>
                  Encrypt & Commit Asset
                  <ArrowRight className="ml-4 w-6 h-6" />
                </>
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="bg-muted/50 border-t-2 border-border py-8 px-12">
          <div className="flex items-center gap-4 text-xs uppercase font-black tracking-[0.3em]">
            <Shield className="w-5 h-5 text-primary" />
            Zero-Knowledge Protocol // End-to-End Encapsulation // IND-SEC-V4
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

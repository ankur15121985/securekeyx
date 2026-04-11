import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Helmet } from 'react-helmet-async';
import { Key, Shield, Clock, Download, Plus, ChevronRight, Activity, Lock, Unlock, X, Eye, EyeOff, Copy, Check, Zap, Terminal, ShieldAlert, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import CryptoJS from 'crypto-js';

interface KeyData {
  id: string;
  algorithm: string;
  encryptedKey: string;
  createdAt: string;
  metadata?: any;
}

export default function Dashboard() {
  const [keys, setKeys] = useState<KeyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedKey, setSelectedKey] = useState<KeyData | null>(null);
  const [passphrase, setPassphrase] = useState('');
  const [unlockedKey, setUnlockedKey] = useState<string | null>(null);
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const fetchKeys = async () => {
      try {
        const res = await fetch('/api/keys', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await res.ok ? await res.json() : [];
        setKeys(data);
      } catch (err) {
        toast.error('Failed to load keys');
      } finally {
        setLoading(false);
      }
    };
    fetchKeys();
  }, []);

  const handleUnlock = () => {
    if (!selectedKey || !passphrase) return;

    try {
      const bytes = CryptoJS.AES.decrypt(selectedKey.encryptedKey, passphrase);
      const originalKey = bytes.toString(CryptoJS.enc.Utf8);

      if (!originalKey) {
        throw new Error('Invalid passphrase');
      }

      setUnlockedKey(originalKey);
      toast.success('Key unlocked successfully');
    } catch (err) {
      toast.error('Invalid passphrase or decryption failed');
    }
  };

  const closeUnlock = () => {
    setSelectedKey(null);
    setPassphrase('');
    setUnlockedKey(null);
    setShowKey(false);
  };

  const copyToClipboard = () => {
    if (!unlockedKey) return;
    navigator.clipboard.writeText(unlockedKey);
    setCopied(true);
    toast.success('Key copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadKeyFile = () => {
    if (!unlockedKey || !selectedKey) return;
    const data = {
      algorithm: selectedKey.algorithm,
      key: unlockedKey,
      createdAt: selectedKey.createdAt,
      provider: 'SecureKeyX'
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `securekey-${selectedKey.algorithm.toLowerCase()}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Key file downloaded');
  };

  const downloadDesktopTool = () => {
    if (!unlockedKey || !selectedKey) return;
    const algo = selectedKey.algorithm;
    const key = unlockedKey;
    
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
        
        #fileList { margin-top: 20px; max-height: 200px; overflow-y: auto; font-size: 12px; font-family: monospace; color: #666; }
        .file-item { display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid #222; }
        
        .disclaimer { margin-top: 40px; padding: 20px; border: 1px solid rgba(255, 100, 0, 0.2); background: rgba(255, 100, 0, 0.05); font-size: 11px; color: #ff6400; line-height: 1.6; }
        .disclaimer b { text-transform: uppercase; }
        
        #status { margin-top: 20px; padding: 12px; font-size: 12px; font-family: monospace; background: #000; border: 1px solid #222; color: var(--blue); }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="badge">Offline Vault Utility</div>
            <h1>SecureKeyX Vault</h1>
            <div style="font-size: 12px; color: #444; margin-top: 8px; font-family: monospace;">ALGO: ${algo} | KEY: ${key.slice(0, 8)}...</div>
        </div>

        <div class="grid">
            <div class="card">
                <h2>Encryption Engine</h2>
                <div class="input-group">
                    <label for="encryptInput" class="file-label">
                        <b>Click to Select Files/Folders</b><br>
                        <span style="font-size: 11px; color: #555;">(Multiple selection supported)</span>
                    </label>
                    <input type="file" id="encryptInput" multiple webkitdirectory directory>
                </div>
                <button onclick="processFiles('encrypt')">Encrypt All Items</button>
                <div id="encryptList" class="fileList"></div>
            </div>

            <div class="card">
                <h2>Decryption Engine</h2>
                <div class="input-group">
                    <label for="decryptInput" class="file-label">
                        <b>Select .enc Files</b><br>
                        <span style="font-size: 11px; color: #555;">(Restore original data)</span>
                    </label>
                    <input type="file" id="decryptInput" multiple>
                </div>
                <button onclick="processFiles('decrypt')" class="secondary">Decrypt All Items</button>
                <div id="decryptList" class="fileList"></div>
            </div>
        </div>

        <div id="status">System Ready. Waiting for input...</div>

        <div class="disclaimer">
            <b>Important Security Notice:</b> This tool is designed for <b>file-level and folder-level encryption</b>. 
            Due to browser security sandboxing, web-based tools cannot directly modify your hard drive, system partitions, or mobile operating system data. 
            To encrypt an entire drive or computer, please use native OS-level tools like <b>BitLocker (Windows)</b>, <b>FileVault (macOS)</b>, or <b>LUKS (Linux)</b>. 
            Always keep your key file and passphrase safe; losing them means permanent data loss.
        </div>
    </div>

    <script>
        const KEY = "${key}";
        const ALGO = "${algo}";

        function updateList(inputId, listId) {
            const input = document.getElementById(inputId);
            const list = document.getElementById(listId);
            list.innerHTML = '';
            for (let file of input.files) {
                const div = document.createElement('div');
                div.className = 'file-item';
                div.innerHTML = '<span>' + file.name + '</span><span>' + (file.size / 1024).toFixed(1) + ' KB</span>';
                list.appendChild(div);
            }
        }

        document.getElementById('encryptInput').onchange = () => updateList('encryptInput', 'encryptList');
        document.getElementById('decryptInput').onchange = () => updateList('decryptInput', 'decryptList');

        async function processFiles(mode) {
            const input = document.getElementById(mode + 'Input');
            const status = document.getElementById('status');
            
            if (!input.files.length) return alert('Please select items first');
            
            status.innerText = 'Initializing ' + mode + 'ion...';
            let count = 0;

            for (let file of input.files) {
                status.innerText = 'Processing (' + (count + 1) + '/' + input.files.length + '): ' + file.name;
                
                await new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        try {
                            const content = e.target.result;
                            if (mode === 'encrypt') {
                                const encrypted = CryptoJS.AES.encrypt(content, KEY).toString();
                                download(encrypted, file.name + '.enc');
                            } else {
                                const bytes = CryptoJS.AES.decrypt(content, KEY);
                                const decrypted = bytes.toString(CryptoJS.enc.Utf8);
                                if (!decrypted) throw new Error('Invalid key');
                                download(decrypted, file.name.replace('.enc', ''));
                            }
                            count++;
                            resolve();
                        } catch (err) {
                            console.error(err);
                            alert('Error processing ' + file.name + ': ' + err.message);
                            resolve();
                        }
                    };
                    reader.readAsText(file);
                });
            }
            
            status.innerText = 'Operation Complete. ' + count + ' items processed.';
        }

        function download(content, filename) {
            const blob = new Blob([content], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(url);
        }
    </script>
</body>
</html>
    `;
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SecureKeyX-Vault-${algo.toLowerCase()}.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Advanced Vault Utility downloaded');
  };

  return (
    <div className="space-y-12">
      <Helmet>
        <title>Command Center | Bharat Tactical Encryption</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 pb-10 border-b-4 border-primary">
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-xs font-black text-primary uppercase tracking-[0.4em]">
            <Terminal className="w-4 h-4" /> Node Connection: Active // IND-NODE-01
          </div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-foreground uppercase leading-none">Command Center</h1>
          <p className="text-lg text-muted-foreground font-bold uppercase tracking-widest">
            Authenticated as: <span className="text-primary font-black">{user.username || user.mobile || 'Unknown User'}</span>
          </p>
        </div>
        <Link to="/algorithms">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-none h-20 px-12 font-black uppercase tracking-[0.3em] text-sm border-2 border-primary shadow-[0_0_30px_rgba(var(--primary),0.3)] group relative overflow-hidden">
            <span className="relative z-10 flex items-center gap-3">
              <Plus className="w-6 h-6" /> Initialize New Protocol
            </span>
            <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300" />
          </Button>
        </Link>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {[
          { label: "Active Assets", value: keys.length, icon: <Key className="w-6 h-6" />, color: "text-primary" },
          { label: "Security Tier", value: "OMEGA", icon: <Shield className="w-6 h-6" />, color: "text-primary" },
          { label: "Network Status", value: "STABLE", icon: <Activity className="w-6 h-6" />, color: "text-primary" },
          { label: "Threat Level", value: "ZERO", icon: <ShieldAlert className="w-6 h-6" />, color: "text-primary" },
        ].map((stat, i) => (
          <Card key={i} className="bg-card border-2 border-border rounded-none relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-2 h-full bg-primary/20 group-hover:bg-primary transition-colors" />
            <CardContent className="pt-10 pb-8 px-8">
              <div className="flex justify-between items-center mb-6">
                <span className="text-xs font-black text-muted-foreground uppercase tracking-[0.3em]">{stat.label}</span>
                <div className={stat.color}>{stat.icon}</div>
              </div>
              <div className="text-6xl font-black text-foreground tracking-tighter uppercase leading-none">{stat.value}</div>
              
              {/* Decorative line */}
              <div className="mt-8 h-1 w-full bg-border relative">
                <div className="absolute inset-0 bg-primary/20 animate-pulse" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Security Monitor & Recent Keys */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <section className="lg:col-span-2 space-y-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-3 h-3 bg-primary animate-pulse" />
              <h2 className="text-lg font-black text-foreground uppercase tracking-[0.3em]">Cryptographic Assets</h2>
            </div>
            <Button variant="link" className="text-xs font-black text-primary uppercase tracking-widest p-0 h-auto hover:no-underline hover:opacity-80">
              Full Audit Trail
            </Button>
          </div>

          <div className="space-y-6">
            {loading ? (
              <div className="text-center py-32 text-xs font-black text-muted-foreground uppercase tracking-[0.5em] animate-pulse">
                Scanning Secure Enclave...
              </div>
            ) : keys.length === 0 ? (
              <Card className="bg-card/30 border-4 border-dashed border-border rounded-none py-32">
                <CardContent className="text-center space-y-8">
                  <div className="mx-auto w-24 h-24 bg-muted border-2 border-border rounded-none flex items-center justify-center relative">
                    <Key className="w-12 h-12 text-muted-foreground" />
                    <div className="absolute -top-2 -left-2 w-4 h-4 border-t-4 border-l-4 border-border" />
                    <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b-4 border-r-4 border-border" />
                  </div>
                  <div className="space-y-4">
                    <p className="text-xl font-black text-muted-foreground uppercase tracking-widest">No assets found in current node.</p>
                    <p className="text-xs text-muted-foreground/60 uppercase tracking-widest">Initialize your first encryption protocol to begin.</p>
                  </div>
                  <Link to="/algorithms">
                    <Button variant="outline" className="border-2 border-border text-foreground rounded-none uppercase text-xs font-black tracking-widest h-16 px-12">
                      Get Started
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              keys.map((key, i) => (
                <motion.div
                  key={key.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card 
                    className="bg-card border-2 border-border hover:border-primary transition-all rounded-none group cursor-pointer relative overflow-hidden"
                    onClick={() => setSelectedKey(key)}
                  >
                    <div className="absolute top-0 left-0 w-2 h-full bg-primary/0 group-hover:bg-primary transition-all" />
                    <CardContent className="p-8 flex items-center justify-between">
                      <div className="flex items-center gap-8">
                        <div className="w-20 h-20 bg-background border-2 border-border rounded-none flex items-center justify-center group-hover:bg-primary/10 group-hover:border-primary transition-all relative">
                          <Key className="w-10 h-10 text-primary" />
                          <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-primary/30" />
                          <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-primary/30" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-4">
                            <span className="text-2xl font-black text-foreground uppercase tracking-tight leading-none">{key.algorithm}</span>
                            <Badge variant="outline" className="text-[10px] font-black uppercase border-primary/30 text-primary bg-primary/5 rounded-none tracking-widest px-3 py-1">Verified</Badge>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground font-bold uppercase tracking-widest">
                            <Clock className="w-4 h-4" />
                            {new Date(key.createdAt).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-12">
                        <div className="hidden md:block text-right space-y-2">
                          <div className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.3em]">Asset Identifier</div>
                          <div className="text-xs font-mono text-foreground font-black">{key.id.toUpperCase()}</div>
                        </div>
                        <div className="p-4 border-2 border-border group-hover:border-primary group-hover:bg-primary/5 transition-all">
                          <ChevronRight className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </section>

        {/* Security Monitor Sidebar */}
        <aside className="space-y-10">
          <div className="flex items-center gap-4">
            <div className="w-3 h-3 bg-primary animate-pulse" />
            <h2 className="text-lg font-black text-foreground uppercase tracking-[0.3em]">Security Monitor</h2>
          </div>
          
          <Card className="bg-card border-2 border-border rounded-none relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-primary/30" />
            <CardContent className="p-8 space-y-8">
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-muted-foreground uppercase tracking-widest">Firewall Status</span>
                  <Badge className="bg-emerald-500/10 text-emerald-500 border-2 border-emerald-500/20 text-[10px] font-black rounded-none px-3 py-1">ACTIVE</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-muted-foreground uppercase tracking-widest">Intrusion Detection</span>
                  <Badge className="bg-emerald-500/10 text-emerald-500 border-2 border-emerald-500/20 text-[10px] font-black rounded-none px-3 py-1">NOMINAL</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-muted-foreground uppercase tracking-widest">E2E Tunnel</span>
                  <Badge className="bg-primary/10 text-primary border-2 border-primary/20 text-[10px] font-black rounded-none px-3 py-1">SECURE</Badge>
                </div>
              </div>

              <div className="pt-6 border-t-2 border-border space-y-6">
                <h4 className="text-xs font-black text-primary uppercase tracking-[0.4em]">Live Security Feed</h4>
                <div className="space-y-4 font-mono text-[10px] text-muted-foreground uppercase font-bold">
                  <div className="flex gap-3">
                    <span className="text-primary">[OK]</span>
                    <span>Handshake verified: Node 104</span>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-primary">[OK]</span>
                    <span>Encrypted tunnel established</span>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-amber-500">[!]</span>
                    <span>Unauthorized ping blocked</span>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-primary">[OK]</span>
                    <span>Integrity check: 100%</span>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <Button variant="outline" className="w-full border-2 border-border text-xs font-black uppercase tracking-widest h-14 rounded-none hover:bg-primary/5">
                  Run Deep Scan
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-2 border-primary/20 rounded-none p-8 space-y-6">
            <div className="flex items-center gap-3 text-primary">
              <ShieldCheck className="w-6 h-6" />
              <span className="text-xs font-black uppercase tracking-[0.3em]">Unhackable Core</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed uppercase tracking-widest font-bold">
              Your assets are protected by a multi-layer zero-knowledge architecture. No private keys ever leave your local node.
            </p>
          </Card>
        </aside>
      </div>

      {/* Unlock Dialog */}
      <AnimatePresence>
        {selectedKey && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/90 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-xl"
            >
              <Card className="bg-card border-border rounded-none relative overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                {/* Tactical Accents */}
                <div className="absolute top-0 left-0 w-full h-1.5 bg-primary" />
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-white/20" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-white/20" />
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={closeUnlock}
                  className="absolute right-4 top-6 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-none z-10"
                >
                  <X className="w-4 h-4" />
                </Button>

                <CardHeader className="pt-16 pb-10 px-12">
                  <div className="flex items-center gap-6 mb-6">
                    <div className={`p-5 border-2 ${unlockedKey ? 'border-primary bg-primary/10' : 'border-border bg-muted'} rounded-none`}>
                      {unlockedKey ? <Unlock className="w-10 h-10 text-primary" /> : <Lock className="w-10 h-10 text-muted-foreground" />}
                    </div>
                    <div className="space-y-2">
                      <CardTitle className="text-3xl md:text-4xl font-black text-foreground uppercase tracking-tighter leading-none">
                        {unlockedKey ? 'Access Granted' : 'Secure Authorization'}
                      </CardTitle>
                      <div className="text-xs font-black text-primary uppercase tracking-[0.4em]">
                        Protocol: {selectedKey.algorithm}
                      </div>
                    </div>
                  </div>
                  <CardDescription className="text-xs font-bold text-muted-foreground uppercase tracking-widest leading-relaxed">
                    {unlockedKey 
                      ? `Target asset decrypted successfully. Retrieval protocols initialized.`
                      : `Multi-factor authorization required. Provide personal decryption passphrase to unlock asset enclave.`}
                  </CardDescription>
                </CardHeader>

                <CardContent className="px-12 pb-12 space-y-10">
                  {!unlockedKey ? (
                    <div className="space-y-8">
                      <div className="space-y-4">
                        <label className="text-xs font-black text-muted-foreground uppercase tracking-[0.4em] flex items-center gap-3">
                          <Terminal className="w-4 h-4" /> Authorization Passphrase
                        </label>
                        <Input
                          type="password"
                          placeholder="ENTER SECRET PASSPHRASE"
                          value={passphrase}
                          onChange={(e) => setPassphrase(e.target.value)}
                          className="bg-background border-2 border-border rounded-none text-foreground h-16 font-black tracking-[0.2em] focus-visible:ring-primary uppercase text-sm px-6"
                          onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
                        />
                      </div>
                      <Button 
                        onClick={handleUnlock}
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-none h-20 font-black uppercase tracking-[0.3em] text-sm shadow-[0_0_30px_rgba(var(--primary),0.3)]"
                      >
                        Authorize Decryption
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-10">
                      <div className="relative group">
                        <div className="absolute -inset-2 bg-primary/20 rounded-none blur opacity-25 group-hover:opacity-50 transition-opacity"></div>
                        <div className="relative bg-background border-2 border-primary/30 p-10 font-mono text-lg break-all min-h-[160px] flex items-center justify-center text-center overflow-hidden">
                          {/* Background Grid for Key Display */}
                          <div className="absolute inset-0 tactical-grid opacity-10 pointer-events-none" />
                          
                          {showKey ? (
                            <motion.span 
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="text-primary font-black tracking-wider relative z-10"
                            >
                              {unlockedKey}
                            </motion.span>
                          ) : (
                            <span className="text-muted-foreground/30 tracking-[0.8em] font-black relative z-10">••••••••••••••••••••••••••••••••</span>
                          )}
                        </div>
                        <div className="absolute right-6 top-6 flex gap-3">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => setShowKey(!showKey)}
                            className="h-12 w-12 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-none border-2 border-border"
                          >
                            {showKey ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={copyToClipboard}
                            className="h-12 w-12 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-none border-2 border-border"
                          >
                            {copied ? <Check className="w-6 h-6 text-primary" /> : <Copy className="w-6 h-6" />}
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <Button 
                          onClick={downloadKeyFile}
                          variant="outline" 
                          className="border-2 border-border hover:bg-secondary text-foreground rounded-none h-16 font-black uppercase tracking-[0.3em] text-xs"
                        >
                          <Download className="w-5 h-5 mr-3" />
                          Download Asset
                        </Button>
                        <Button 
                          onClick={downloadDesktopTool}
                          variant="outline" 
                          className="border-2 border-primary/30 text-primary hover:bg-primary/10 rounded-none h-16 font-black uppercase tracking-[0.3em] text-xs"
                        >
                          <Zap className="w-5 h-5 mr-3" />
                          Tactical Vault
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>

                <CardFooter className="bg-muted/50 border-t-2 border-border py-8 px-12 flex justify-between items-center">
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground uppercase font-black tracking-[0.3em]">
                    <Shield className="w-4 h-4 text-primary" />
                    Secure Enclave Protocol v4.0.2
                  </div>
                  <div className="text-[10px] font-mono text-muted-foreground/50 font-bold">
                    NODE_ID: {selectedKey.id.slice(0, 12).toUpperCase()}
                  </div>
                </CardFooter>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

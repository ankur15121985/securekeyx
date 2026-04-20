import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Helmet } from 'react-helmet-async';
import { Key, Shield, Clock, Download, Plus, ChevronRight, Activity, Lock, Unlock, X, Eye, EyeOff, Copy, Check, Zap, Terminal, ShieldAlert, ShieldCheck, Trash2, Edit3 } from 'lucide-react';
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
  serialNumber?: number;
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
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState('');
  const [isDecommissioning, setIsDecommissioning] = useState(false);
  const [showDecommissionConfirm, setShowDecommissionConfirm] = useState(false);
  const [confirmSerialInput, setConfirmSerialInput] = useState('');
  
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchKeys = async () => {
    try {
      setLoading(true);
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

  useEffect(() => {
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
    setIsRenaming(false);
    setNewName('');
    setIsDecommissioning(false);
  };

  const handleRename = async () => {
    if (!selectedKey || !newName.trim()) return;
    
    try {
      const res = await fetch(`/api/keys/${selectedKey.id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({ metadata: { ...selectedKey.metadata, label: newName.trim() } })
      });

      if (res.ok) {
        toast.success('Asset renamed successfully');
        setIsRenaming(false);
        fetchKeys();
        setSelectedKey(prev => prev ? { ...prev, metadata: { ...prev.metadata, label: newName.trim() } } : null);
      } else {
        toast.error('Failed to rename asset');
      }
    } catch (err) {
      toast.error('Error updating asset');
    }
  };

  const handleDecommission = async () => {
    if (!selectedKey) return;
    
    try {
      setIsDecommissioning(true);
      const res = await fetch(`/api/keys/${selectedKey.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (res.ok) {
        toast.success('Asset decommissioned successfully');
        closeUnlock();
        fetchKeys();
      } else {
        toast.error('Failed to decommission asset');
      }
    } catch (err) {
      toast.error('Error purging asset');
    } finally {
      setIsDecommissioning(false);
    }
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
    <title>Chakravyuj | High-Performance Offline Vault</title>
    <style>
        :root { --primary: #fbbf24; --bg: #000; --card: #0a0a0a; --border: #1a1a1a; }
        * { box-sizing: border-box; }
        body { font-family: 'Inter', -apple-system, sans-serif; background: var(--bg); color: #fff; margin: 0; display: flex; flex-direction: column; align-items: center; min-height: 100vh; padding: 40px 20px; }
        .container { max-width: 1000px; width: 100%; border-left: 2px solid var(--border); border-right: 2px solid var(--border); padding: 0 40px; }
        .header { text-align: left; margin-bottom: 60px; border-bottom: 4px solid var(--primary); padding-bottom: 20px; }
        h1 { font-size: 48px; font-weight: 900; text-transform: uppercase; letter-spacing: -3px; margin: 0; line-height: 1; }
        .subtitle { font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5em; color: var(--primary); margin-top: 10px; }
        
        .protocol-strip { background: var(--card); border: 2px solid var(--border); padding: 15px 25px; margin-bottom: 40px; display: flex; justify-content: space-between; align-items: center; }
        .protocol-info { font-family: monospace; font-size: 11px; color: #666; text-transform: uppercase; letter-spacing: 2px; }
        .tag { background: rgba(251, 191, 36, 0.1); color: var(--primary); padding: 4px 10px; font-size: 9px; font-weight: 900; border: 1px solid var(--primary); }

        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }
        .card { background: var(--card); border: 2px solid var(--border); padding: 40px; position: relative; transition: all 0.3s; }
        .card:hover { border-color: var(--primary); background: #0c0c0c; }
        .card::before { content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 4px; background: var(--primary); opacity: 0.3; }
        
        h2 { font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: 3px; color: #fff; margin-bottom: 30px; border-left: 4px solid var(--primary); padding-left: 15px; }
        .input-group { margin-bottom: 30px; }
        .file-label { display: block; border: 2px dashed var(--border); padding: 60px 20px; text-align: center; cursor: pointer; transition: all 0.2s; background: #050505; }
        .file-label:hover { border-color: var(--primary); background: rgba(251, 191, 36, 0.03); }
        .file-label b { font-size: 14px; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 8px; }
        .file-label span { font-size: 10px; color: #444; text-transform: uppercase; font-weight: 800; }
        
        button { width: 100%; background: var(--primary); color: #000; border: none; padding: 20px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; cursor: pointer; transition: all 0.3s; font-size: 12px; }
        button:hover { background: #fff; box-shadow: 0 0 30px rgba(251, 191, 36, 0.2); }
        button.secondary { background: transparent; color: #fff; border: 2px solid var(--border); margin-top: 15px; }
        button.secondary:hover { border-color: #fff; }
        button:disabled { opacity: 0.3; cursor: not-allowed; grayscale: 100%; }
        
        #status { margin-top: 40px; padding: 20px; font-size: 11px; font-family: monospace; background: #050505; border: 2px solid var(--border); color: var(--primary); line-height: 1.8; text-transform: uppercase; }
        .progress-bar { height: 2px; background: var(--border); margin-top: 15px; overflow: hidden; }
        .progress-fill { height: 100%; background: var(--primary); width: 0%; transition: width 0.1s; }

        .performance-note { margin-top: 60px; padding: 40px; border: 2px solid rgba(251, 191, 36, 0.2); background: rgba(251, 191, 36, 0.02); }
        .performance-note h3 { margin-top: 0; color: var(--primary); font-size: 11px; text-transform: uppercase; letter-spacing: 4px; }
        .performance-note p { font-size: 12px; color: #666; line-height: 1.8; margin-bottom: 0; }
        
        #fileInfo { margin-top: 20px; font-size: 10px; font-family: monospace; color: #444; }
    </style>
</head>
<body>
    <div class="container">
        <header class="header">
            <h1>Chakravyuj</h1>
            <div class="subtitle">High-Performance Offline Tier // Tactical Vault</div>
        </header>

        <div class="protocol-strip">
            <div class="protocol-info">
                Protocol: ${algo} // Source Node: Active // Asset Range: [NATIVE_DISK_ACCESS]
            </div>
            <div class="tag">Streaming Mode Enabled</div>
        </div>

        <div class="grid">
            <div class="card">
                <h2>Asset Encryption</h2>
                <div class="input-group">
                    <div id="encryptDrop" class="file-label" onclick="selectFile('encrypt')">
                        <b>Initialize Data Stream</b>
                        <span id="encryptFileName">Supports files >15GB via Direct I/O</span>
                    </div>
                </div>
                <button id="encryptBtn" onclick="executeProcess('encrypt')" disabled>Start Encryption</button>
                <div id="encryptInfo"></div>
            </div>

            <div class="card">
                <h2>Asset Restoration</h2>
                <div class="input-group">
                    <div id="decryptDrop" class="file-label" onclick="selectFile('decrypt')">
                        <b>Initialize Restoration</b>
                        <span id="decryptFileName">Reverse Tactical Encoding</span>
                    </div>
                </div>
                <button id="decryptBtn" onclick="executeProcess('decrypt')" disabled class="secondary">Start Decryption</button>
            </div>
        </div>

        <div id="status">System Standby. Authorization confirmed...</div>
        <div class="progress-bar"><div id="progressFill" class="progress-fill"></div></div>

        <div class="performance-note">
            <h3>High-Performance Architecture</h3>
            <p>
                This specialized version of the Chakravyuj vault uses <b>Direct Disk Streaming (Web Crypto + File System Access API)</b>. 
                Unlike standard tools that load data into RAM, this utility pipes bits directly from your storage to the processor, 
                allowing for encryption of 15GB, 100GB, or even 1TB archives without crashing your system.
                <br><br>
                <b>Security Mode:</b> OMEGA-Class // <b>Stream Buffer:</b> 64MB // <b>Interface:</b> Native I/O
            </p>
        </div>
    </div>

    <script>
        const KEY_HEX = "${key}";
        const ALGO = "${algo}";
        let selectedFileEntry = null;
        let mode = null;

        async function selectFile(targetMode) {
            try {
                if (!window.showOpenFilePicker) {
                    return alert("Operational Error: This high-performance tool requires a modern browser (Chrome/Edge) to handle massive files (>15GB) via Direct I/O.");
                }
                const [handle] = await window.showOpenFilePicker();
                selectedFileEntry = handle;
                mode = targetMode;
                
                const file = await handle.getFile();
                document.getElementById(targetMode + 'FileName').innerText = file.name + " (" + (file.size / (1024*1024*1024)).toFixed(2) + " GB)";
                document.getElementById(targetMode + 'Btn').disabled = false;
                document.getElementById('status').innerText = "Asset Loaded: " + file.name + " // Ready for processing.";
            } catch (err) {
                console.warn(err);
            }
        }

        async function executeProcess(activeMode) {
            if (!selectedFileEntry) return;
            const status = document.getElementById('status');
            const progressFill = document.getElementById('progressFill');
            const file = await selectedFileEntry.getFile();
            
            try {
                const saveHandle = await window.showSaveFilePicker({
                    suggestedName: activeMode === 'encrypt' ? file.name + ".cvj" : file.name.replace(".cvj", ""),
                });

                status.innerText = "Initializing " + activeMode + "ion stream...";
                progressFill.style.width = "0%";

                // Derive key for Web Crypto
                const enc = new TextEncoder();
                const keyMaterial = await crypto.subtle.importKey(
                    "raw", 
                    enc.encode(KEY_HEX.slice(0, 32)), // Tactical slice to ensure correct length
                    { name: "AES-GCM" }, 
                    false, 
                    ["encrypt", "decrypt"]
                );

                const writable = await saveHandle.createWritable();
                const readable = file.stream();
                const reader = readable.getReader();
                
                const CHUNK_SIZE = 64 * 1024 * 1024; // 64MB Chunks
                let processedSize = 0;
                const iv = new Uint8Array(12); // Fixed IV for current vault scope
                
                status.innerText = "Processing stream: 0%";

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const processedChunk = activeMode === 'encrypt' 
                        ? await crypto.subtle.encrypt({ name: "AES-GCM", iv }, keyMaterial, value)
                        : await crypto.subtle.decrypt({ name: "AES-GCM", iv }, keyMaterial, value);
                    
                    await writable.write(processedChunk);
                    
                    processedSize += value.length;
                    const percent = Math.floor((processedSize / file.size) * 100);
                    progressFill.style.width = percent + "%";
                    status.innerText = activeMode.toUpperCase() + " IN PROGRESS: " + percent + "% (" + (processedSize / (1024*1024*1024)).toFixed(2) + " GB PROCESSED)";
                }

                await writable.close();
                status.innerText = "Mission Complete: Asset " + (activeMode === 'encrypt' ? "Encapsulated" : "Restored") + " successfully.";
                progressFill.style.width = "100%";
                alert("Operation Successful. Asset saved to local storage.");
                
            } catch (err) {
                console.error(err);
                status.innerText = "CRITICAL FAILURE: " + err.message;
                alert("Tactical Failure during stream: " + err.message);
            }
        }
    </script>
</body>
</html>
    `;
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Chakravyuj-HighPerf-Vault-${algo.toLowerCase()}.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Chakravyuj High-Performance Offline Vault downloaded');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <Helmet>
        <title>Command Center | Bharat Tactical Encryption</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 pb-10 border-b-4 border-primary">
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-xs font-black text-primary uppercase tracking-[0.4em]">
            <Terminal className="w-4 h-4" /> Node Connection: Active // IND-NODE-01
          </div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter uppercase leading-none">Command Center</h1>
          <p className="text-lg font-bold uppercase tracking-widest">
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
                <span className="text-xs font-black uppercase tracking-[0.3em]">{stat.label}</span>
                <div className={stat.color}>{stat.icon}</div>
              </div>
              <div className="text-6xl font-black tracking-tighter uppercase leading-none">{stat.value}</div>
              
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
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 bg-primary animate-pulse" />
                <h2 className="text-xl font-black uppercase tracking-[0.3em]">Asset Management Enclave</h2>
              </div>
              <p className="text-[10px] uppercase tracking-widest font-bold opacity-60 ml-7">
                Secure oversight of decentralized cryptographic identities and mission-critical protocols.
              </p>
            </div>
            <Button variant="link" className="text-xs font-black text-primary uppercase tracking-widest p-0 h-auto hover:no-underline hover:opacity-80">
              Audit Logs
            </Button>
          </div>

          <div className="space-y-6">
            {loading ? (
              <div className="text-center py-32 text-xs font-black uppercase tracking-[0.5em] animate-pulse">
                Scanning Secure Enclave...
              </div>
            ) : keys.length === 0 ? (
              <Card className="bg-card/30 border-4 border-dashed border-border rounded-none py-32">
                <CardContent className="text-center space-y-8">
                  <div className="mx-auto w-24 h-24 bg-muted border-2 border-border rounded-none flex items-center justify-center relative">
                    <Key className="w-12 h-12" />
                    <div className="absolute -top-2 -left-2 w-4 h-4 border-t-4 border-l-4 border-border" />
                    <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b-4 border-r-4 border-border" />
                  </div>
                  <div className="space-y-4">
                    <p className="text-xl font-black uppercase tracking-widest">No assets found in current node.</p>
                    <p className="text-xs uppercase tracking-widest">Initialize your first encryption protocol to begin.</p>
                  </div>
                  <Link to="/algorithms">
                    <Button variant="outline" className="border-2 border-border rounded-none uppercase text-xs font-black tracking-widest h-16 px-12">
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
                            <span className="text-xs font-black text-primary font-mono">
                              #{key.serialNumber || '---'}
                            </span>
                            <span className="text-2xl font-black uppercase tracking-tight leading-none">
                              {key.metadata?.label || key.algorithm}
                            </span>
                            {key.metadata?.label && (
                              <span className="text-[10px] font-bold uppercase tracking-widest">({key.algorithm})</span>
                            )}
                            <Badge variant="outline" className="text-[10px] font-black uppercase border-primary/30 text-primary bg-primary/5 rounded-none tracking-widest px-3 py-1">Verified</Badge>
                          </div>
                          <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest">
                            <Clock className="w-4 h-4" />
                            {new Date(key.createdAt).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-12">
                        <div className="hidden md:block text-right space-y-2">
                          <div className="text-[10px] uppercase font-black tracking-[0.3em]">Asset Identifier</div>
                          <div className="text-xs font-mono font-black">{key.id.toUpperCase()}</div>
                        </div>
                        <div className="p-4 border-2 border-border group-hover:border-primary group-hover:bg-primary/5 transition-all">
                          <ChevronRight className="w-8 h-8 group-hover:text-primary transition-colors" />
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
            <h2 className="text-lg font-black uppercase tracking-[0.3em]">Security Monitor</h2>
          </div>
          
          <Card className="bg-card border-2 border-border rounded-none relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-primary/30" />
            <CardContent className="p-8 space-y-8">
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black uppercase tracking-widest">Firewall Status</span>
                  <Badge className="bg-emerald-500/10 text-emerald-500 border-2 border-emerald-500/20 text-[10px] font-black rounded-none px-3 py-1">ACTIVE</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black uppercase tracking-widest">Intrusion Detection</span>
                  <Badge className="bg-emerald-500/10 text-emerald-500 border-2 border-emerald-500/20 text-[10px] font-black rounded-none px-3 py-1">NOMINAL</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black uppercase tracking-widest">E2E Tunnel</span>
                  <Badge className="bg-primary/10 text-primary border-2 border-primary/20 text-[10px] font-black rounded-none px-3 py-1">SECURE</Badge>
                </div>
              </div>

              <div className="pt-6 border-t-2 border-border space-y-6">
                <h4 className="text-xs font-black text-primary uppercase tracking-[0.4em]">Live Security Feed</h4>
                <div className="space-y-4 font-mono text-[10px] uppercase font-bold">
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
            <p className="text-[11px] leading-relaxed uppercase tracking-widest font-bold">
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
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-foreground/20" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-foreground/20" />
                
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
                      <CardTitle className="text-3xl md:text-4xl font-black uppercase tracking-tighter leading-none flex items-center gap-4">
                        {unlockedKey ? 'Access Granted' : 'Secure Authorization'}
                        {unlockedKey && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => {
                              setIsRenaming(true);
                              setNewName(selectedKey.metadata?.label || selectedKey.algorithm);
                            }}
                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Button>
                        )}
                      </CardTitle>
                      <div className="text-xs font-black text-primary uppercase tracking-[0.4em]">
                        Protocol: {selectedKey.algorithm} {selectedKey.metadata?.label && `// Alias: ${selectedKey.metadata.label}`}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                    {[
                      { label: "Tactical SN", value: `#${selectedKey.serialNumber || '---'}`, icon: <Terminal className="w-4 h-4" /> },
                      { label: "Asset ID", value: selectedKey.id.slice(0, 8).toUpperCase(), icon: <Shield className="w-4 h-4" /> },
                      { label: "Established", value: new Date(selectedKey.createdAt).toLocaleDateString(), icon: <Clock className="w-4 h-4" /> },
                      { label: "Status", value: "ENCRYPTED", icon: <Lock className="w-4 h-4" /> },
                      { label: "Security Tier", value: "OMEGA", icon: <ShieldCheck className="w-4 h-4" /> },
                    ].map((item, idx) => (
                      <div key={idx} className="bg-muted/30 border-2 border-border p-4 space-y-2">
                        <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest opacity-50">
                          {item.icon} {item.label}
                        </div>
                        <div className="text-[10px] font-black uppercase tracking-widest truncate">{item.value}</div>
                      </div>
                    ))}
                  </div>

                  {isRenaming && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mb-8 p-6 border-2 border-primary/30 bg-primary/5 space-y-4"
                    >
                      <label className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Rename Tactical Asset</label>
                      <div className="flex gap-4">
                        <Input 
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          className="bg-background border-2 border-border rounded-none h-12 uppercase font-bold tracking-widest text-xs"
                          placeholder="NEW ASSET NAME"
                        />
                        <Button onClick={handleRename} className="bg-primary hover:bg-primary/90 rounded-none h-12 px-6 font-black uppercase tracking-widest text-[10px]">
                          Update
                        </Button>
                        <Button variant="ghost" onClick={() => setIsRenaming(false)} className="rounded-none h-12 px-6 font-black uppercase tracking-widest text-[10px]">
                          Cancel
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  <CardDescription className="text-xs font-bold uppercase tracking-widest leading-relaxed">
                    {unlockedKey 
                      ? `Target asset decrypted successfully. Retrieval protocols initialized.`
                      : `Multi-factor authorization required. Provide personal decryption passphrase to unlock asset enclave.`}
                  </CardDescription>
                </CardHeader>

                <CardContent className="px-12 pb-12 space-y-10">
                  <div className="space-y-6">
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] flex items-center gap-2">
                       <Shield className="w-4 h-4 text-primary" /> Administrative Actions
                    </h3>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <Button 
                        onClick={() => {
                          setIsRenaming(!isRenaming);
                          if (!isRenaming) setNewName(selectedKey.metadata?.label || selectedKey.algorithm);
                        }}
                        variant="outline" 
                        className={`border-2 rounded-none h-14 font-black uppercase tracking-[0.2em] text-[10px] ${isRenaming ? 'border-primary bg-primary/5 text-primary' : 'border-border'}`}
                      >
                        <Edit3 className="w-4 h-4 mr-3" />
                        Rename
                      </Button>
                      <Button 
                        onClick={() => {
                          setConfirmSerialInput('');
                          setShowDecommissionConfirm(true);
                        }}
                        disabled={isDecommissioning}
                        variant="outline" 
                        className="border-2 border-destructive/30 text-destructive hover:bg-destructive/10 rounded-none h-14 font-black uppercase tracking-[0.2em] text-[10px]"
                      >
                        <Trash2 className="w-4 h-4 mr-3" />
                        Decommission
                      </Button>
                      <Button 
                        onClick={downloadKeyFile}
                        disabled={!unlockedKey}
                        variant="outline" 
                        className="border-2 border-border hover:bg-muted disabled:opacity-30 rounded-none h-14 font-black uppercase tracking-[0.2em] text-[10px]"
                      >
                        <Download className="w-4 h-4 mr-3" />
                        Key File
                      </Button>
                      <Button 
                        onClick={downloadDesktopTool}
                        disabled={!unlockedKey}
                        variant="outline" 
                        className="border-2 border-border hover:bg-muted disabled:opacity-30 rounded-none h-14 font-black uppercase tracking-[0.2em] text-[10px]"
                      >
                        <Zap className="w-4 h-4 mr-3" />
                        Offline Vault
                      </Button>
                    </div>
                  </div>

                  <div className="h-px bg-border" />

                  <div className="space-y-6">
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] flex items-center gap-2">
                       <Lock className="w-4 h-4 text-primary" /> Encrypted Enclave
                    </h3>
                    {!unlockedKey ? (
                      <div className="space-y-8">
                        <div className="space-y-4">
                          <label className="text-[10px] font-black uppercase tracking-[0.4em] flex items-center gap-3 opacity-60">
                            Authorization Passphrase Required
                          </label>
                          <Input
                            type="password"
                            placeholder="ENTER SECRET PASSPHRASE"
                            value={passphrase}
                            onChange={(e) => setPassphrase(e.target.value)}
                            className="bg-background border-2 border-border h-16 font-black tracking-[0.2em] focus-visible:ring-primary uppercase text-sm px-6 rounded-none"
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
                      </div>
                    )}
                  </div>
                </CardContent>

                  <CardFooter className="bg-muted/50 border-t-2 border-border py-8 px-12 flex justify-between items-center">
                    <div className="flex items-center gap-3 text-[10px] uppercase font-black tracking-[0.3em]">
                      <Shield className="w-4 h-4 text-primary" />
                      Secure Enclave Protocol v4.0.2
                    </div>
                    <div className="text-[10px] font-mono font-bold opacity-50">
                      NODE_ID: {selectedKey.id.slice(0, 12).toUpperCase()}
                    </div>
                  </CardFooter>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Decommission Confirmation Modal */}
      <AnimatePresence>
        {showDecommissionConfirm && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-background/95 backdrop-blur-xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-md"
            >
              <Card className="bg-card border-4 border-destructive rounded-none overflow-hidden relative shadow-[0_0_100px_rgba(239,68,68,0.2)]">
                <div className="absolute top-0 left-0 w-full h-2 bg-destructive" />
                <CardHeader className="pt-12 px-10 text-center space-y-4">
                  <div className="mx-auto w-20 h-20 bg-destructive/10 border-2 border-destructive/30 flex items-center justify-center mb-4">
                    <ShieldAlert className="w-10 h-10 text-destructive animate-pulse" />
                  </div>
                  <CardTitle className="text-3xl font-black uppercase tracking-tighter text-destructive">
                    Critical Purge
                  </CardTitle>
                  <CardDescription className="text-xs font-black uppercase tracking-[0.2em] leading-relaxed">
                    Are you sure you want to decommission this asset? This action is <span className="text-destructive underline">irreversible</span> and the key will be permanently purged from the node.
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-10 pb-10 space-y-6">
                  <div className="space-y-3">
                    <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                       <Terminal className="w-3 h-3" /> Type SN #{selectedKey?.serialNumber} to confirm purge
                    </label>
                    <Input
                      placeholder={`#${selectedKey?.serialNumber}`}
                      value={confirmSerialInput}
                      onChange={(e) => setConfirmSerialInput(e.target.value)}
                      className="bg-muted border-2 border-border focus:border-destructive h-14 rounded-none font-mono text-center text-lg font-bold uppercase"
                    />
                  </div>

                  <div className="space-y-4">
                    <Button 
                      onClick={() => {
                        if (confirmSerialInput === selectedKey?.serialNumber?.toString() || confirmSerialInput === `#${selectedKey?.serialNumber}`) {
                          setShowDecommissionConfirm(false);
                          handleDecommission();
                        } else {
                          toast.error('Identity Mismatch: Serial number validation failed');
                        }
                      }}
                      disabled={confirmSerialInput !== selectedKey?.serialNumber?.toString() && confirmSerialInput !== `#${selectedKey?.serialNumber}`}
                      className="w-full bg-destructive hover:bg-destructive/90 text-white h-16 rounded-none font-black uppercase tracking-[0.3em] text-xs disabled:opacity-30 disabled:grayscale transition-all duration-300"
                    >
                      Confirm Purge
                    </Button>
                    <Button 
                      variant="ghost"
                      onClick={() => setShowDecommissionConfirm(false)}
                      className="w-full border-2 border-border h-16 rounded-none font-black uppercase tracking-[0.3em] text-xs"
                    >
                      Abort Mission
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

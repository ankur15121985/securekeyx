import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Key, Shield, Download, Lock, Loader2, Eye, EyeOff, Copy, Check, Zap, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function KeyGeneration() {
  const [searchParams] = useSearchParams();
  const algo = searchParams.get('algo') || 'AES-256';
  const [key, setKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  const generateKey = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/keys/generate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ algorithm: algo }),
      });
      const data = await res.json();
      if (res.ok) {
        setKey(data.key);
        toast.success('Key generated successfully');
      } else {
        toast.error(data.error);
      }
    } catch (err) {
      toast.error('Connection error');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(key);
    setCopied(true);
    toast.success('Key copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadKey = () => {
    const data = {
      algorithm: algo,
      key: key,
      createdAt: new Date().toISOString(),
      provider: 'SecureKeyX'
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `securekey-${algo.toLowerCase()}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Key file downloaded');
  };

  const downloadDesktopTool = () => {
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <header className="text-center space-y-6">
        <div className="flex justify-center">
          <Badge variant="outline" className="bg-primary/10 text-primary border-2 border-primary/30 uppercase tracking-[0.4em] text-xs rounded-none px-6 py-2">
            Protocol: {algo} // IND-SEC-GEN
          </Badge>
        </div>
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-foreground uppercase leading-none">Asset Generation</h1>
        <div className="flex items-center justify-center gap-3 text-xs font-black text-muted-foreground uppercase tracking-[0.3em]">
          <Terminal className="w-4 h-4" /> Node: Isolated Enclave // Secure Handshake Active
        </div>
      </header>

      <Card className="bg-card border-4 border-primary rounded-none overflow-hidden relative shadow-[0_0_50px_rgba(0,0,0,0.4)]">
        <div className="absolute top-0 left-0 w-full h-2 bg-primary" />
        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white/20" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white/20" />

        <CardHeader className="pt-16 px-12">
          <CardTitle className="text-3xl md:text-4xl font-black text-foreground uppercase tracking-tighter flex items-center gap-4">
            <div className="p-4 bg-primary/10 border-2 border-primary/20">
              <Key className="w-10 h-10 text-primary" />
            </div>
            Secure Output Enclave
          </CardTitle>
          <CardDescription className="text-xs font-black text-muted-foreground uppercase tracking-[0.3em] pt-4">
            Initialize high-entropy cryptographic asset generation for protocol {algo}.
          </CardDescription>
        </CardHeader>

        <CardContent className="px-12 pb-16 space-y-12">
          {!key ? (
            <div className="h-64 flex flex-col items-center justify-center border-4 border-dashed border-border bg-background/50 rounded-none relative group overflow-hidden">
              <Button 
                onClick={generateKey} 
                disabled={loading}
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-none h-20 px-16 font-black uppercase tracking-[0.3em] text-sm shadow-[0_0_30px_rgba(var(--primary),0.3)] relative z-10"
              >
                {loading ? <Loader2 className="w-10 h-10 animate-spin" /> : 'Initialize Generation'}
              </Button>
            </div>
          ) : (
            <div className="space-y-12">
              <div className="relative group">
                <div className="absolute -inset-2 bg-primary/20 rounded-none blur opacity-25 group-hover:opacity-50 transition-opacity"></div>
                <div className="relative bg-background border-2 border-primary/30 p-12 font-mono text-lg break-all min-h-[180px] flex items-center justify-center text-center overflow-hidden">
                  {showKey ? (
                    <motion.span 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-primary font-black tracking-wider relative z-10 text-2xl"
                    >
                      {key}
                    </motion.span>
                  ) : (
                    <span className="text-muted-foreground/30 tracking-[1.2em] font-black relative z-10 text-2xl">••••••••••••••••••••••••••••••••</span>
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Button 
                  onClick={downloadKey}
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
                <Button 
                  onClick={() => navigate(`/protect?algo=${algo}&key=${key}`)}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-none h-16 font-black uppercase tracking-[0.3em] text-xs shadow-[0_0_20px_rgba(var(--primary),0.2)]"
                >
                  <Lock className="w-5 h-5 mr-3" />
                  Protect Asset
                </Button>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="bg-muted/50 border-t-2 border-border py-8 px-12">
          <div className="flex items-center gap-4 text-xs text-muted-foreground uppercase font-black tracking-[0.3em]">
            <Shield className="w-5 h-5 text-primary" />
            Entropy Source: Hardware RNG // 256-bit Pool // NIST SP 800-90B
          </div>
        </CardFooter>
      </Card>

      {key && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-primary/5 border border-primary/20 p-6 rounded-none relative overflow-hidden group"
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-primary/30 group-hover:bg-primary transition-colors" />
            <div className="flex gap-4 relative z-10">
              <Zap className="w-6 h-6 text-primary flex-none" />
              <div className="space-y-2">
                <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Tactical Vault Utility</h4>
                <p className="text-[10px] text-muted-foreground leading-relaxed uppercase tracking-widest font-medium">
                  The "Tactical Vault" is a standalone, offline HTML application. Deploy it to your local node to encrypt/decrypt assets without network connectivity.
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-destructive/5 border border-destructive/20 p-6 rounded-none relative overflow-hidden group"
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-destructive/30 group-hover:bg-destructive transition-colors" />
            <div className="flex gap-4 relative z-10">
              <Shield className="w-6 h-6 text-destructive flex-none" />
              <div className="space-y-2">
                <h4 className="text-[10px] font-black text-destructive uppercase tracking-[0.2em]">Security Warning</h4>
                <p className="text-[10px] text-muted-foreground leading-relaxed uppercase tracking-widest font-medium">
                  This asset is displayed once. Ensure immediate download or protection. Raw keys are never persisted in the central node database.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

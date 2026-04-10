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
    <div className="max-w-3xl mx-auto space-y-10">
      <header className="text-center space-y-4">
        <div className="flex justify-center">
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 uppercase tracking-[0.3em] text-[10px] rounded-none px-4 py-1">
            Protocol: {algo}
          </Badge>
        </div>
        <h1 className="text-5xl font-extrabold tracking-tight text-foreground uppercase leading-none">Asset Generation</h1>
        <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
          <Terminal className="w-3 h-3" /> Node: Isolated Enclave
        </div>
      </header>

      <Card className="bg-card border-border rounded-none overflow-hidden relative shadow-[0_0_30px_rgba(0,0,0,0.3)]">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-primary" />
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-white/20" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-white/20" />

        <CardHeader className="pt-10 px-10">
          <CardTitle className="text-2xl font-black text-foreground uppercase tracking-tighter flex items-center gap-3">
            <div className="p-2 bg-primary/10 border border-primary/20">
              <Key className="w-6 h-6 text-primary" />
            </div>
            Secure Output Enclave
          </CardTitle>
          <CardDescription className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pt-2">
            Initialize high-entropy cryptographic asset generation for protocol {algo}.
          </CardDescription>
        </CardHeader>

        <CardContent className="px-10 pb-10 space-y-8">
          {!key ? (
            <div className="h-48 flex flex-col items-center justify-center border border-border bg-background/50 rounded-none relative group overflow-hidden">
              <div className="absolute inset-0 tactical-grid opacity-10" />
              <Button 
                onClick={generateKey} 
                disabled={loading}
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-none h-16 px-12 font-black uppercase tracking-[0.2em] text-xs shadow-[0_0_20px_rgba(var(--primary),0.2)] relative z-10"
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Initialize Generation'}
              </Button>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="relative group">
                <div className="absolute -inset-1 bg-primary/20 rounded-none blur opacity-25 group-hover:opacity-50 transition-opacity"></div>
                <div className="relative bg-background border border-primary/30 p-10 font-mono text-sm break-all min-h-[140px] flex items-center justify-center text-center overflow-hidden">
                  <div className="absolute inset-0 tactical-grid opacity-10 pointer-events-none" />
                  
                  {showKey ? (
                    <motion.span 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-primary font-black tracking-wider relative z-10 text-lg"
                    >
                      {key}
                    </motion.span>
                  ) : (
                    <span className="text-muted-foreground/30 tracking-[1em] font-black relative z-10 text-lg">••••••••••••••••••••••••••••••••</span>
                  )}
                </div>
                <div className="absolute right-4 top-4 flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setShowKey(!showKey)}
                    className="h-10 w-10 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-none border border-border"
                  >
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={copyToClipboard}
                    className="h-10 w-10 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-none border border-border"
                  >
                    {copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  onClick={downloadKey}
                  variant="outline" 
                  className="border-border hover:bg-secondary text-foreground rounded-none h-14 font-black uppercase tracking-[0.2em] text-[10px]"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Asset
                </Button>
                <Button 
                  onClick={downloadDesktopTool}
                  variant="outline" 
                  className="border-primary/30 text-primary hover:bg-primary/10 rounded-none h-14 font-black uppercase tracking-[0.2em] text-[10px]"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Tactical Vault
                </Button>
                <Button 
                  onClick={() => navigate(`/protect?algo=${algo}&key=${key}`)}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-none h-14 font-black uppercase tracking-[0.2em] text-[10px] shadow-[0_0_15px_rgba(var(--primary),0.2)]"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Protect Asset
                </Button>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="bg-muted/50 border-t border-border py-6 px-10">
          <div className="flex items-center gap-3 text-[10px] text-muted-foreground uppercase font-black tracking-[0.3em]">
            <Shield className="w-4 h-4 text-primary" />
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

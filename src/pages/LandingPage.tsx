import { motion } from 'motion/react';
import { Helmet } from 'react-helmet-async';
import { Shield, Key, Lock, Download, Zap, ShieldCheck, Terminal, Crosshair, Cpu, Globe, Smartphone, Apple, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="space-y-32 pb-32">
      <Helmet>
        <title>Chakravyuh | Sovereign Cryptographic Node</title>
        <meta name="description" content="Deploy high-entropy cryptographic assets across distributed networks with Chakravyuh. Sovereign architecture for mission-critical data protection." />
        <link rel="canonical" href="https://ais-dev-uxw6iknxmq2grdo4ugt4l7-356645113135.asia-east1.run.app/" />
      </Helmet>
      {/* Hero Section */}
      <section className="relative pt-20 pb-12">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-primary/5 blur-[120px] rounded-full -z-10" />
        
        <div className="text-center space-y-10 relative">
          {/* Corner Accents for Hero */}
          <div className="absolute -top-10 -left-10 w-20 h-20 border-t-2 border-l-2 border-primary/20 hidden lg:block" />
          <div className="absolute -top-10 -right-10 w-20 h-20 border-t-2 border-r-2 border-primary/20 hidden lg:block" />

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.3em] mb-4 corner-bracket corner-bracket-tl corner-bracket-br">
              System Status: Secure // IND-NODE
            </div>
            <h1 className="text-6xl sm:text-8xl md:text-[12rem] font-black tracking-tighter text-foreground leading-[0.85] uppercase">
              CHAKRA<br />
              <span className="text-primary">VYUH</span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-2xl md:text-3xl text-muted-foreground max-w-3xl mx-auto font-bold leading-relaxed uppercase tracking-tight"
          >
            Sovereign cryptographic infrastructure for the protection of national digital assets. 
            Zero-knowledge architecture for mission-critical data protection.
          </motion.p>

            <div className="flex flex-wrap justify-center gap-8 pt-12">
              <Link to="/auth">
                <Button size="lg" aria-label="Initialize Protocol" className="bg-primary hover:bg-primary/90 text-primary-foreground px-12 h-20 text-sm font-black uppercase tracking-[0.3em] rounded-none border-2 border-primary shadow-[0_0_30px_rgba(var(--primary),0.3)] group relative overflow-hidden">
                  <span className="relative z-10 flex items-center gap-3">
                    Initialize Protocol <Crosshair className="w-6 h-6" />
                  </span>
                  <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300" />
                </Button>
              </Link>
            </div>
        </div>
      </section>

      {/* Stats/Status Bar */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Active Nodes", value: "1,204", icon: <Globe className="w-4 h-4" /> },
          { label: "Uptime", value: "99.99%", icon: <Zap className="w-4 h-4" /> },
          { label: "Encryption", value: "AES-256", icon: <Lock className="w-4 h-4" /> },
          { label: "Entropy", value: "High", icon: <Cpu className="w-4 h-4" /> },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="p-6 border border-border bg-card/50 flex flex-col items-center text-center gap-2 relative group overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover:bg-primary transition-colors" />
            <div className="text-primary mb-1">{stat.icon}</div>
            <div className="text-2xl font-bold tracking-tight">{stat.value}</div>
            <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{stat.label}</div>
          </motion.div>
        ))}
      </section>

      {/* Workflow Section */}
      <section className="space-y-12">
        <div className="flex items-center gap-4">
          <div className="h-[1px] flex-grow bg-border" />
          <h2 className="text-xs font-black uppercase tracking-[0.5em] text-primary">Operational Workflow</h2>
          <div className="h-[1px] flex-grow bg-border" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: <Key className="w-8 h-8" />,
              title: "Protocol Selection",
              desc: "Choose from 100+ high-speed algorithms including PQC candidates for future-proof security."
            },
            {
              icon: <Cpu className="w-8 h-8" />,
              title: "Neural Generation",
              desc: "Cryptographically strong key generation using hardware-level entropy sources."
            },
            {
              icon: <ShieldCheck className="w-8 h-8" />,
              title: "Vault Protection",
              desc: "Multi-layered encryption with personal passphrase hashing for zero-knowledge storage."
            }
          ].map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="p-10 bg-card border border-border hover:border-primary/50 transition-all group relative corner-bracket corner-bracket-tl corner-bracket-br"
            >
              <div className="mb-8 p-4 w-fit bg-primary/5 border border-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                {step.icon}
              </div>
              <h3 className="text-xl font-black text-foreground mb-4 uppercase tracking-tight">{step.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed uppercase tracking-widest font-medium">{step.desc}</p>
              
              {/* Index Number */}
              <div className="absolute top-4 right-4 text-[40px] font-black text-primary/5 select-none">
                0{i + 1}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Visual Workflow / Security Section */}
      <section className="relative group">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-card border border-border p-16 relative overflow-hidden"
        >
          {/* Background Pattern */}
          <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity">
            <ShieldCheck className="w-96 h-96 text-primary" />
          </div>
          
          <div className="relative z-10 max-w-3xl space-y-12">
            <div className="space-y-4">
              <Badge variant="outline" className="text-primary border-primary/30 uppercase tracking-[0.2em] text-[10px] rounded-none">
                Security Level: Maximum
              </Badge>
              <h2 className="text-4xl md:text-6xl font-black text-foreground uppercase tracking-tighter leading-none">
                Hardened <span className="text-primary">Infrastructure</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-8">
                <div className="flex gap-6">
                  <div className="flex-none w-1 h-auto bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
                  <div className="space-y-2">
                    <h4 className="text-foreground font-black uppercase text-xs tracking-widest">Zero-Knowledge Core</h4>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest leading-relaxed font-medium">
                      Raw keys never touch our persistent storage. Decryption occurs exclusively in isolated client environments.
                    </p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="flex-none w-1 h-auto bg-border" />
                  <div className="space-y-2">
                    <h4 className="text-foreground font-black uppercase text-xs tracking-widest">Quantum Resistance</h4>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest leading-relaxed font-medium">
                      Deploying NIST-approved post-quantum algorithms to protect against future cryptographic threats.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="flex gap-6">
                  <div className="flex-none w-1 h-auto bg-border" />
                  <div className="space-y-2">
                    <h4 className="text-foreground font-black uppercase text-xs tracking-widest">Distributed Entropy</h4>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest leading-relaxed font-medium">
                      Multi-source randomness pooling ensures maximum key strength and resistance to predictive analysis.
                    </p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="flex-none w-1 h-auto bg-border" />
                  <div className="space-y-2">
                    <h4 className="text-foreground font-black uppercase text-xs tracking-widest">Real-time Auditing</h4>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest leading-relaxed font-medium">
                      Continuous monitoring of cryptographic operations with immutable tamper-proof logging.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8">
              <Link to="/auth">
                <Button className="bg-transparent border border-primary text-primary hover:bg-primary hover:text-primary-foreground rounded-none px-12 h-14 font-black uppercase tracking-[0.3em] text-[10px] transition-all">
                  Access Command Center
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Network Integrity Section */}
      <section className="space-y-12">
        <div className="flex items-center gap-4">
          <div className="h-[1px] flex-grow bg-border" />
          <h2 className="text-xs font-black uppercase tracking-[0.5em] text-primary">Network Integrity Protocols</h2>
          <div className="h-[1px] flex-grow bg-border" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: <Shield className="w-8 h-8" />,
              title: "Core Enclave",
              desc: "Isolated cryptographic environment for high-security key management and asset protection.",
              color: "var(--india-saffron)"
            },
            {
              icon: <Globe className="w-8 h-8" />,
              title: "Global Mesh",
              desc: "Distributed node network ensuring high availability and decentralized security across borders.",
              color: "var(--india-blue)"
            },
            {
              icon: <Zap className="w-8 h-8" />,
              title: "Rapid Response",
              desc: "Low-latency cryptographic operations for real-time data protection and secure tunneling.",
              color: "var(--india-green)"
            }
          ].map((force, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="p-10 bg-card border-2 border-border hover:border-primary/50 transition-all group relative overflow-hidden"
              style={{ borderColor: `hsla(${force.color}, 0.2)` }}
            >
              <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: `hsl(${force.color})` }} />
              <div className="mb-8 p-4 w-fit bg-primary/5 border border-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                {force.icon}
              </div>
              <h3 className="text-xl font-black text-foreground mb-4 uppercase tracking-tight">{force.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed uppercase tracking-widest font-medium">{force.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}

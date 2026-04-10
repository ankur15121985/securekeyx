import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Lock, Zap, ShieldAlert, ArrowRight, Info, Search, Filter, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { ALGORITHMS, Algorithm } from '../constants/algorithms';

export default function AlgorithmSelection() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const categories = ['All', 'Symmetric', 'Asymmetric', 'Stream', 'Quantum', 'Legacy'];

  const filteredAlgos = useMemo(() => {
    return ALGORITHMS.filter(algo => {
      const matchesSearch = algo.name.toLowerCase().includes(search.toLowerCase()) || 
                           algo.desc.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = activeCategory === 'All' || algo.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [search, activeCategory]);

  const handleSelect = (id: string) => {
    navigate(`/generate?algo=${id}`);
  };

  return (
    <div className="space-y-12 pb-20">
      <header className="text-center space-y-4 max-w-3xl mx-auto">
        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 uppercase tracking-[0.3em] text-[10px] rounded-none px-4 py-1">
          Cryptographic Library v4.0.2
        </Badge>
        <h1 className="text-6xl font-extrabold tracking-tight text-foreground uppercase leading-none">Protocol Library</h1>
        <p className="text-muted-foreground text-sm font-medium leading-relaxed">
          Explore our tactical repository of <span className="text-primary font-bold">100+</span> high-speed encryption protocols. 
          From military-grade AES to post-quantum neural candidates.
        </p>
      </header>

      {/* Search and Filter */}
      <div className="sticky top-20 z-30 bg-background/90 backdrop-blur-xl border border-border p-6 space-y-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-primary/30" />
        <div className="flex flex-col md:flex-row gap-6">
          <div className="relative flex-grow">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="SEARCH PROTOCOL REPOSITORY..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 bg-background border-border rounded-none h-14 text-foreground focus:ring-primary uppercase font-bold tracking-widest text-xs"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
            {categories.map(cat => (
              <Button
                key={cat}
                variant={activeCategory === cat ? 'default' : 'outline'}
                onClick={() => setActiveCategory(cat)}
                className={`rounded-none h-14 uppercase font-black text-[10px] tracking-[0.2em] px-8 transition-all ${
                  activeCategory === cat ? 'bg-primary text-primary-foreground shadow-[0_0_15px_rgba(var(--primary),0.3)]' : 'border-border text-muted-foreground hover:text-primary hover:border-primary/50'
                }`}
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>
        <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground">
          <div className="flex items-center gap-2">
            <Terminal className="w-3 h-3 text-primary" />
            <span>Active Protocols: {filteredAlgos.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-3 h-3" />
            <span>Filter: {activeCategory}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence mode="popLayout">
          {filteredAlgos.map((algo, i) => (
            <motion.div
              key={algo.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-card border-border hover:border-primary/50 transition-all rounded-none group h-full flex flex-col relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary/0 group-hover:bg-primary transition-all" />
                <div className={`absolute top-0 right-0 w-32 h-32 -mr-12 -mt-12 rotate-45 opacity-5 group-hover:opacity-10 transition-opacity ${algo.bg}`} />
                
                <CardHeader className="p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div className={`p-3 border border-border group-hover:border-primary/30 transition-all ${algo.bg} bg-opacity-5`}>
                      <Shield className={`w-6 h-6 ${algo.color}`} />
                    </div>
                    <Badge variant="outline" className="uppercase text-[8px] font-black border-border text-muted-foreground tracking-[0.2em] rounded-none px-2">
                      {algo.level}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl font-black text-foreground uppercase tracking-tight group-hover:text-primary transition-colors leading-none">
                    {algo.name}
                  </CardTitle>
                  <CardDescription className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold leading-relaxed line-clamp-2 pt-3">
                    {algo.desc}
                  </CardDescription>
                </CardHeader>

                <CardContent className="px-8 pb-8 flex-grow">
                  <div className="space-y-5">
                    <div className="flex items-start gap-3">
                      <div className="p-1.5 bg-muted border border-border">
                        <Info className="w-3 h-3 text-muted-foreground" />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em] block">Category</span>
                        <span className="text-[10px] text-foreground font-bold uppercase tracking-widest">{algo.category}</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="p-1.5 bg-primary/10 border border-primary/20">
                        <Zap className="w-3 h-3 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[8px] font-black text-primary uppercase tracking-[0.2em] block">Brute-Force Estimate</span>
                        <span className="text-[10px] text-foreground font-mono font-bold">{algo.crackTime} Hours</span>
                      </div>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="border-t border-border p-6 bg-muted/30">
                  <Button 
                    onClick={() => handleSelect(algo.id)}
                    className="w-full bg-background border border-border hover:bg-primary hover:border-primary hover:text-primary-foreground text-foreground rounded-none h-12 text-[10px] font-black uppercase tracking-[0.3em] transition-all relative overflow-hidden group/btn"
                  >
                    <span className="relative z-10 flex items-center">
                      Initialize Protocol
                      <ArrowRight className="ml-2 w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
                    </span>
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredAlgos.length === 0 && (
        <div className="text-center py-32 border border-dashed border-border bg-card/30">
          <ShieldAlert className="w-16 h-16 text-muted-foreground/20 mx-auto mb-6" />
          <h3 className="text-xl font-black text-muted-foreground uppercase tracking-[0.3em]">No Protocols Found</h3>
          <p className="text-[10px] text-muted-foreground/60 uppercase tracking-widest font-bold">Adjust search parameters or category filters.</p>
        </div>
      )}

      <div className="bg-primary/5 border border-primary/20 p-8 rounded-none flex items-start gap-6 relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-1 h-full bg-primary/30" />
        <ShieldAlert className="w-8 h-8 text-primary flex-none" />
        <div className="space-y-2 relative z-10">
          <h4 className="text-xs font-black text-primary uppercase tracking-[0.2em]">Security Advisory</h4>
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] leading-relaxed font-bold">
            This repository contains 100+ cryptographic configurations. While all are mathematically sound, 
            <span className="text-foreground font-black ml-1">AES-256-GCM</span> remains the recommended standard for mission-critical asset protection.
          </p>
        </div>
      </div>
    </div>
  );
}

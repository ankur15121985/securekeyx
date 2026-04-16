export interface Algorithm {
  id: string;
  name: string;
  level: string;
  desc: string;
  useCase: string;
  color: string;
  bg: string;
  category: 'Symmetric' | 'Asymmetric' | 'Stream' | 'Quantum' | 'Legacy';
  crackTime: string; // Estimated time to decode in hours (scientific notation for large values)
}

const categories = ['Symmetric', 'Asymmetric', 'Stream', 'Quantum', 'Legacy'] as const;

const baseAlgos = [
  { name: 'AES', desc: 'Advanced Encryption Standard', category: 'Symmetric' },
  { name: 'ChaCha', desc: 'High-speed stream cipher', category: 'Stream' },
  { name: 'Salsa', desc: 'High-performance stream cipher', category: 'Stream' },
  { name: 'Twofish', desc: 'Successor to Blowfish', category: 'Symmetric' },
  { name: 'Serpent', desc: 'Ultra-secure block cipher', category: 'Symmetric' },
  { name: 'Camellia', desc: 'Japanese standard block cipher', category: 'Symmetric' },
  { name: 'ARIA', desc: 'South Korean standard block cipher', category: 'Symmetric' },
  { name: 'SEED', desc: 'Block cipher used in South Korea', category: 'Symmetric' },
  { name: 'Blowfish', desc: 'Fast block cipher', category: 'Symmetric' },
  { name: 'CAST', desc: 'Carlisle Adams and Stafford Tavares cipher', category: 'Symmetric' },
  { name: 'IDEA', desc: 'International Data Encryption Algorithm', category: 'Symmetric' },
  { name: 'Kyber', desc: 'Post-quantum key encapsulation', category: 'Quantum' },
  { name: 'Dilithium', desc: 'Post-quantum digital signature', category: 'Quantum' },
  { name: 'Falcon', desc: 'Post-quantum signature scheme', category: 'Quantum' },
  { name: 'McEliece', desc: 'Code-based public-key encryption', category: 'Quantum' },
];

const modes = ['GCM', 'CBC', 'CTR', 'CFB', 'OFB', 'XTS'];
const keySizes = [128, 192, 256, 512, 1024, 2048, 4096];

export const ALGORITHMS: Algorithm[] = [];

// Helper to estimate crack time in years and days based on key size and type
const getCrackTime = (size: number, category: string): string => {
  let hours: number;
  if (category === 'Quantum') hours = 1.5e60;
  else if (size >= 4096) hours = 8.4e70;
  else if (size >= 2048) hours = 5.2e45;
  else if (size >= 1024) hours = 2.1e25;
  else if (size >= 512) hours = 1.2e18;
  else if (size >= 256) hours = 3.4e12;
  else if (size >= 192) hours = 1.8e8;
  else hours = 4.5e4;

  const years = Math.floor(hours / 8766);
  const remainingHours = hours % 8766;
  const days = Math.floor(remainingHours / 24);

  if (years > 1e9) {
    return `${years.toExponential(2)} Years`;
  }
  return `${years.toLocaleString()} Years, ${days} Days`;
};

// Generate 400 algorithms
let count = 0;

// 1. Add some primary ones manually
ALGORITHMS.push(
  {
    id: 'AES-256-GCM',
    name: 'AES-256-GCM',
    level: 'Military Grade',
    desc: 'AES with 256-bit key in Galois/Counter Mode. Provides both confidentiality and authenticity.',
    useCase: 'Modern file encryption, TLS 1.3',
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    category: 'Symmetric',
    crackTime: getCrackTime(256, 'Symmetric')
  },
  {
    id: 'ChaCha20-Poly1305',
    name: 'ChaCha20-Poly1305',
    level: 'Ultra Fast',
    desc: 'High-speed stream cipher with Poly1305 authenticator. Optimized for mobile hardware.',
    useCase: 'Mobile communication, IoT security',
    color: 'text-green-500',
    bg: 'bg-green-500/10',
    category: 'Stream',
    crackTime: getCrackTime(256, 'Stream')
  },
  {
    id: 'RSA-4096',
    name: 'RSA-4096',
    level: 'High Security',
    desc: 'Asymmetric encryption using prime factorization. Massive 4096-bit key length.',
    useCase: 'Digital signatures, Secure key exchange',
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
    category: 'Asymmetric',
    crackTime: getCrackTime(4096, 'Asymmetric')
  }
);

count = ALGORITHMS.length;

// 2. Programmatically generate the rest to reach 400
baseAlgos.forEach(base => {
  modes.forEach(mode => {
    keySizes.forEach(size => {
      if (count < 400) {
        const id = `${base.name}-${size}-${mode}`;
        // Avoid duplicates
        if (!ALGORITHMS.find(a => a.id === id)) {
          ALGORITHMS.push({
            id,
            name: id,
            level: size >= 256 ? 'High Security' : 'Standard',
            desc: `${base.desc} variant with ${size}-bit key in ${mode} mode.`,
            useCase: `Specialized ${base.category.toLowerCase()} encryption tasks.`,
            color: size >= 256 ? 'text-blue-400' : 'text-zinc-400',
            bg: size >= 256 ? 'bg-blue-500/5' : 'bg-zinc-500/5',
            category: base.category as any,
            crackTime: getCrackTime(size, base.category)
          });
          count++;
        }
      }
    });
  });
});

// Fill up to 400 if needed with more variants
if (count < 400) {
  for (let i = count; i < 400; i++) {
    const size = keySizes[i % keySizes.length];
    ALGORITHMS.push({
      id: `SKX-CUSTOM-${i}`,
      name: `SKX-V${i}-PRO`,
      level: 'Advanced',
      desc: 'SecureKeyX proprietary optimized cryptographic wrapper.',
      useCase: 'High-speed internal data protection',
      color: 'text-orange-500',
      bg: 'bg-orange-500/10',
      category: 'Symmetric',
      crackTime: getCrackTime(size, 'Symmetric')
    });
  }
}

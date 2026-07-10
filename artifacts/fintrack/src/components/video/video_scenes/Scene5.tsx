import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export function Scene5() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 2500),
      setTimeout(() => setPhase(3), 4500),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center overflow-hidden bg-[#0a0a0a]"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, filter: 'blur(20px)' }}
      transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_0%,transparent_70%)]" />

      <div className="relative z-10 w-full flex flex-col items-center justify-center text-center">
        <div className="overflow-hidden mb-16">
          <motion.h2
            className="text-[6vw] font-bold tracking-tighter text-white leading-[1.1]"
            initial={{ y: '100%', opacity: 0 }}
            animate={phase >= 1 ? { y: 0, opacity: 1 } : { y: '100%', opacity: 0 }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          >
            Build your edge.
          </motion.h2>
          <motion.h2
            className="text-[6vw] font-bold tracking-tighter text-white/40 leading-[1.1]"
            initial={{ y: '100%', opacity: 0 }}
            animate={phase >= 2 ? { y: 0, opacity: 1 } : { y: '100%', opacity: 0 }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          >
            Trade with clarity.
          </motion.h2>
        </div>

        <motion.div
          className="flex flex-col items-center gap-6 mt-8 pt-12 border-t border-white/10"
          initial={{ opacity: 0, y: 20 }}
          animate={phase >= 3 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex items-center gap-4">
            <div className="bg-white text-[#0a0a0a] h-12 w-12 rounded-xl flex items-center justify-center shrink-0">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 3v18h18" />
                <path d="m19 9-5 5-4-4-3 3" />
              </svg>
            </div>
            <span className="font-bold text-5xl tracking-tight text-white">Roxel</span>
          </div>
          <p className="text-white/40 font-medium tracking-widest text-[1.2vw] uppercase mt-2">
            The professional standard for trading journals
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export function Scene5() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 600),
      setTimeout(() => setPhase(2), 1500),
      setTimeout(() => setPhase(3), 2200),
      setTimeout(() => setPhase(4), 4500), // exit start
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex flex-col items-center justify-center bg-[#0a0a0a] z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1 }}
      transition={{ duration: 1 }}
    >
      <div className="relative z-20 flex flex-col items-center">
        {/* Massive Logo Mark */}
        <motion.div
          className="w-[12vw] h-[12vw] mb-[4vw] rounded-2xl flex items-center justify-center relative overflow-hidden bg-[#111] border border-[#00ff87]/30 shadow-[0_0_80px_rgba(0,255,135,0.15)]"
          initial={{ scale: 2, opacity: 0, rotateZ: 45 }}
          animate={phase >= 1 ? { scale: 1, opacity: 1, rotateZ: 0 } : { scale: 2, opacity: 0, rotateZ: 45 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.div 
            className="absolute inset-0 bg-gradient-to-tr from-[#00ff87]/20 to-transparent"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          <svg width="6vw" height="6vw" viewBox="0 0 24 24" fill="none" stroke="#00ff87" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
            <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
            <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
          </svg>
        </motion.div>

        {/* Brand Name */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-[6vw] font-bold text-white tracking-tight leading-none mb-[1vw]"
        >
          Roxel
        </motion.div>

        {/* CTA / Tagline */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={phase >= 3 ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 1 }}
          className="font-mono text-[#00ff87] text-[1.5vw] tracking-widest text-center"
        >
          START JOURNALING FOR FREE
        </motion.div>
        
        {/* Fine print */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={phase >= 3 ? { opacity: 0.4 } : { opacity: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="mt-[2vw] text-[1vw] text-white/50"
        >
          Crypto • Forex • Equities • Options
        </motion.div>
      </div>

      {/* Cinematic Flash at end before loop */}
      <motion.div 
        className="absolute inset-0 bg-white z-50 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={phase >= 4 ? { opacity: [0, 1, 0] } : { opacity: 0 }}
        transition={{ duration: 0.5, times: [0, 0.1, 1] }}
      />
    </motion.div>
  );
}
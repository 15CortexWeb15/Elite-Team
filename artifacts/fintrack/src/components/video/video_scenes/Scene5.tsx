import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export function Scene5() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 2500),
      setTimeout(() => setPhase(3), 4000),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex flex-col items-center justify-center z-30"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 1 }}
    >
      {/* Part 1: AI Coach Reveal */}
      <motion.div 
        className="absolute inset-0 flex flex-col items-center justify-center"
        initial={{ opacity: 1 }}
        animate={phase >= 2 ? { opacity: 0, scale: 1.5, filter: 'blur(20px)' } : { opacity: 1 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        style={{ pointerEvents: phase >= 2 ? 'none' : 'auto' }}
      >
        <motion.div 
          className="w-[8vw] h-[8vw] rounded-full border-[2px] border-[#ffb000] flex items-center justify-center relative mb-[3vw]"
          initial={{ scale: 0, rotate: -180 }}
          animate={phase >= 1 ? { scale: 1, rotate: 0 } : { scale: 0, rotate: -180 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
        >
          <div className="absolute inset-0 bg-[#ffb000]/20 blur-xl rounded-full" />
          <div className="w-[4vw] h-[4vw] bg-[#ffb000] rounded-full blur-[10px]" />
        </motion.div>

        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ delay: 0.4 }}
        >
          <div className="font-mono text-[#ffb000] text-[1.2vw] tracking-widest mb-[1vw]">YOUR AI TRADING COACH</div>
          <div className="text-[4vw] font-bold">Insights powered by Groq.</div>
        </motion.div>
      </motion.div>

      {/* Part 2: Outro Lockup */}
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center bg-[#050505]"
        initial={{ opacity: 0 }}
        animate={phase >= 2 ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 1.5 }}
        style={{ pointerEvents: phase >= 2 ? 'auto' : 'none' }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={phase >= 3 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
          transition={{ duration: 1, type: "spring" }}
          className="flex flex-col items-center"
        >
          <div className="flex items-center gap-[1.5vw] mb-[2vw]">
            {/* Logo Mark */}
            <div className="w-[4vw] h-[4vw] bg-white rounded-lg flex items-center justify-center rotate-45">
              <div className="w-[2vw] h-[2vw] bg-[#050505] rounded-sm -rotate-45" />
            </div>
            <span className="text-[5vw] font-black tracking-tight">Roxel</span>
          </div>
          
          <div className="font-mono text-[1.5vw] text-white/50 tracking-[0.2em]">
            TRADE SMARTER.
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
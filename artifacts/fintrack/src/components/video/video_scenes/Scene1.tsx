import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export function Scene1() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 800),
      setTimeout(() => setPhase(2), 1800),
      setTimeout(() => setPhase(3), 3200),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex flex-col items-center justify-center z-10"
      initial={{ opacity: 0, scale: 1.05 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, filter: 'blur(20px)', scale: 1.1 }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Decorative scanner line */}
      <motion.div 
        className="absolute top-1/2 left-0 right-0 h-[1px] bg-[#00ff87]/30"
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: phase >= 3 ? 0 : 1 }}
        transition={{ duration: 1.5, ease: "anticipate" }}
      />

      <div className="text-center tracking-tighter leading-tight relative z-20">
        <motion.div
          initial={{ opacity: 0, y: 40, rotateX: 20 }}
          animate={phase >= 1 ? { opacity: 1, y: 0, rotateX: 0 } : { opacity: 0, y: 40, rotateX: 20 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-[6vw] font-bold text-white/80"
        >
          Your trades.
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 40, rotateX: 20 }}
          animate={phase >= 2 ? { opacity: 1, y: 0, rotateX: 0 } : { opacity: 0, y: 40, rotateX: 20 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-[8vw] font-black text-[#00ff87]"
          style={{ textShadow: '0 0 60px rgba(0,255,135,0.4)' }}
        >
          Analyzed.
        </motion.div>
      </div>

      <motion.div 
        className="absolute bottom-[15vh] w-[1px] h-[10vh] bg-gradient-to-b from-[#00ff87] to-transparent"
        initial={{ scaleY: 0, opacity: 0 }}
        animate={phase >= 2 ? { scaleY: 1, opacity: 0.5 } : { scaleY: 0, opacity: 0 }}
        transition={{ duration: 1, delay: 0.5 }}
      />
    </motion.div>
  );
}
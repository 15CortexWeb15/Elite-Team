import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export function Scene3() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 400),
      setTimeout(() => setPhase(2), 1500),
      setTimeout(() => setPhase(3), 2200),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const pathVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: { 
      pathLength: 1, 
      opacity: 1, 
      transition: { duration: 2, ease: "easeInOut", delay: 0.8 } 
    }
  };

  return (
    <motion.div 
      className="absolute inset-0 flex flex-col items-center justify-center z-10"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, y: -50, filter: 'blur(10px)' }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="absolute top-[15vh] text-center">
        <motion.h2 
          className="text-[4vw] font-bold"
          initial={{ opacity: 0, y: 20 }}
          animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        >
          Deep Performance Analytics
        </motion.h2>
      </div>

      {/* Stylized Chart Area */}
      <div className="relative w-[70vw] h-[40vh] mt-[10vh]">
        {/* Grid lines */}
        {[...Array(5)].map((_, i) => (
          <div key={i} className="absolute w-full h-[1px] bg-white/10" style={{ top: `${i * 25}%` }} />
        ))}
        
        {/* SVG Profit Curve */}
        <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 1000 400">
          {/* Fill gradient */}
          <defs>
            <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00ff87" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#00ff87" stopOpacity="0" />
            </linearGradient>
          </defs>
          <motion.path
            d="M0,350 C150,320 250,380 400,250 C550,120 650,280 800,150 C900,50 1000,80 1000,80 L1000,400 L0,400 Z"
            fill="url(#profitGrad)"
            initial={{ opacity: 0 }}
            animate={phase >= 2 ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 1.5, delay: 1 }}
          />
          {/* Stroke line */}
          <motion.path
            d="M0,350 C150,320 250,380 400,250 C550,120 650,280 800,150 C900,50 1000,80 1000,80"
            fill="none"
            stroke="#00ff87"
            strokeWidth="6"
            style={{ filter: 'drop-shadow(0px 0px 12px rgba(0,255,135,0.8))' }}
            variants={pathVariants}
            initial="hidden"
            animate="visible"
          />
          
          {/* End point dot */}
          <motion.circle 
            cx="1000" cy="80" r="10" fill="#fff" stroke="#00ff87" strokeWidth="4"
            initial={{ scale: 0, opacity: 0 }}
            animate={phase >= 3 ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
            transition={{ type: 'spring', delay: 2.8 }}
            style={{ filter: 'drop-shadow(0px 0px 10px rgba(0,255,135,1))' }}
          />
        </svg>

        {/* Floating Stat */}
        <motion.div 
          className="absolute right-[5vw] top-[-5vh] bg-[#050505] border border-white/10 p-[1.5vw] rounded-xl shadow-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={phase >= 3 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="text-white/50 font-mono text-[0.9vw] mb-[0.5vw]">WIN RATE</div>
          <div className="text-[#00ff87] font-bold text-[3vw] leading-none">68.4%</div>
        </motion.div>
      </div>
    </motion.div>
  );
}
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export function Scene3() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 1200),
      setTimeout(() => setPhase(3), 2000),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex flex-col items-center justify-center pt-[5vh]"
      initial={{ opacity: 0, scale: 1.1 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ clipPath: 'circle(0% at 50% 50%)', opacity: 0 }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Background Heatmap Texture */}
      <motion.div
        className="absolute inset-0 opacity-20 mix-blend-screen pointer-events-none"
        style={{
          backgroundImage: `url(${import.meta.env.BASE_URL}images/heatmap.png)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
        initial={{ y: '5%', scale: 1.2 }}
        animate={{ y: '0%', scale: 1 }}
        transition={{ duration: 5, ease: "easeOut" }}
      />

      <div className="w-full px-[10vw] flex flex-col items-center z-20">
        <motion.div 
          className="font-mono text-[1.2vw] text-[#00ff87] mb-[2vw] text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
          transition={{ duration: 0.6 }}
        >
          02 / PERFORMANCE ANALYTICS
        </motion.div>

        <motion.h2 
          className="text-[4.5vw] font-bold text-center leading-[1.1] mb-[4vw]"
          initial={{ opacity: 0, y: 30 }}
          animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          Stop guessing.<br/>
          <span className="text-white/40">Know your numbers.</span>
        </motion.h2>

        {/* Big P&L Reveal */}
        <div className="relative w-full max-w-[60vw]">
          {/* Subtle grid frame */}
          <div className="absolute inset-0 border border-white/10 rounded-2xl bg-black/40 backdrop-blur-md" />
          
          <div className="relative p-[4vw] flex justify-between items-end">
            <div>
              <motion.div 
                className="font-mono text-white/50 text-[1.2vw] mb-[1vw]"
                initial={{ opacity: 0 }}
                animate={phase >= 2 ? { opacity: 1 } : { opacity: 0 }}
              >
                NET P&L (YTD)
              </motion.div>
              <div className="flex items-baseline gap-[1vw] overflow-hidden">
                <motion.div 
                  className="text-[8vw] font-bold text-[#00ff87] leading-none"
                  initial={{ y: '100%' }}
                  animate={phase >= 2 ? { y: 0 } : { y: '100%' }}
                  transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                  style={{ textShadow: '0 0 40px rgba(0,255,135,0.4)' }}
                >
                  +$42,850
                </motion.div>
                <motion.div 
                  className="text-[2vw] font-bold text-[#00ff87]/70 pb-[1vw]"
                  initial={{ opacity: 0 }}
                  animate={phase >= 2 ? { opacity: 1 } : { opacity: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  .00
                </motion.div>
              </div>
            </div>

            <div className="flex gap-[3vw] text-right">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={phase >= 3 ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
                transition={{ duration: 0.6 }}
              >
                <div className="font-mono text-white/50 text-[1vw] mb-[0.5vw]">WIN RATE</div>
                <div className="text-[2.5vw] font-bold">64.2%</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={phase >= 3 ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <div className="font-mono text-white/50 text-[1vw] mb-[0.5vw]">PROFIT FACTOR</div>
                <div className="text-[2.5vw] font-bold">2.1x</div>
              </motion.div>
            </div>
          </div>

          {/* Equity Curve SVG Drawing */}
          <motion.svg 
            className="absolute bottom-0 left-0 w-full h-[60%] z-0 opacity-30" 
            viewBox="0 0 100 40" 
            preserveAspectRatio="none"
          >
            <motion.path
              d="M0,35 L10,32 L20,38 L30,25 L40,28 L50,15 L60,18 L70,8 L80,12 L90,2 L100,5"
              fill="none"
              stroke="#00ff87"
              strokeWidth="1"
              initial={{ pathLength: 0 }}
              animate={phase >= 2 ? { pathLength: 1 } : { pathLength: 0 }}
              transition={{ duration: 2, ease: "easeInOut" }}
            />
            <motion.path
              d="M0,35 L10,32 L20,38 L30,25 L40,28 L50,15 L60,18 L70,8 L80,12 L90,2 L100,5 L100,40 L0,40 Z"
              fill="url(#grad)"
              initial={{ opacity: 0 }}
              animate={phase >= 2 ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 1, delay: 1 }}
            />
            <defs>
              <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00ff87" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#00ff87" stopOpacity="0" />
              </linearGradient>
            </defs>
          </motion.svg>
        </div>
      </div>
    </motion.div>
  );
}
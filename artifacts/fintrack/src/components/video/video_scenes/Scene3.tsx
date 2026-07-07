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
      className="absolute inset-0 flex flex-col items-center justify-center"
      initial={{ opacity: 0, scale: 1.1 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ clipPath: 'circle(0% at 50% 50%)', opacity: 0 }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Heatmap background */}
      <motion.div
        className="absolute inset-0 opacity-20 mix-blend-screen pointer-events-none"
        style={{
          backgroundImage: `url(${import.meta.env.BASE_URL}images/heatmap.png)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
        initial={{ y: '5%', scale: 1.2 }}
        animate={{ y: '0%', scale: 1 }}
        transition={{ duration: 5, ease: 'easeOut' }}
      />

      <div className="w-full px-[8vw] flex flex-col items-center z-20">
        <motion.div
          className="font-mono text-[#00ff87] tracking-widest uppercase text-center"
          style={{ fontSize: '1.6vh', marginBottom: '2vh' }}
          initial={{ opacity: 0, y: -20 }}
          animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
          transition={{ duration: 0.6 }}
        >
          02 / PERFORMANCE ANALYTICS
        </motion.div>

        <motion.h2
          className="font-bold text-center leading-[1.1]"
          style={{ fontSize: '7vh', marginBottom: '4vh' }}
          initial={{ opacity: 0, y: 30 }}
          animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          Stop guessing.<br />
          <span className="text-white/40">Know your numbers.</span>
        </motion.h2>

        {/* P&L card */}
        <div className="relative w-full">
          <div className="absolute inset-0 border border-white/10 rounded-2xl bg-black/40 backdrop-blur-md" />

          <div className="relative" style={{ padding: '3.5vh 5vw' }}>
            {/* Big P&L number */}
            <motion.div
              className="font-mono text-white/50 uppercase tracking-widest"
              style={{ fontSize: '1.5vh', marginBottom: '1vh' }}
              initial={{ opacity: 0 }}
              animate={phase >= 2 ? { opacity: 1 } : { opacity: 0 }}
            >
              NET P&amp;L (YTD)
            </motion.div>

            <div className="flex items-baseline overflow-hidden" style={{ gap: '1vw', marginBottom: '3vh' }}>
              <motion.div
                className="font-bold text-[#00ff87] leading-none"
                style={{ fontSize: '12vh', textShadow: '0 0 60px rgba(0,255,135,0.4)' }}
                initial={{ y: '100%' }}
                animate={phase >= 2 ? { y: 0 } : { y: '100%' }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              >
                +$42,850
              </motion.div>
              <motion.div
                className="font-bold text-[#00ff87]/70"
                style={{ fontSize: '3.5vh', paddingBottom: '1.5vh' }}
                initial={{ opacity: 0 }}
                animate={phase >= 2 ? { opacity: 1 } : { opacity: 0 }}
                transition={{ delay: 0.8 }}
              >
                .00
              </motion.div>
            </div>

            {/* Stats row */}
            <div className="flex gap-[8vw]">
              {[
                { label: 'WIN RATE',      value: '64.2%' },
                { label: 'PROFIT FACTOR', value: '2.1x'  },
                { label: 'TOTAL TRADES',  value: '214'   },
              ].map(({ label, value }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, x: 20 }}
                  animate={phase >= 3 ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                >
                  <div className="font-mono text-white/50 uppercase tracking-wider" style={{ fontSize: '1.2vh', marginBottom: '0.5vh' }}>
                    {label}
                  </div>
                  <div className="font-bold" style={{ fontSize: '3.5vh' }}>{value}</div>
                </motion.div>
              ))}
            </div>

            {/* Equity curve */}
            <motion.svg
              className="absolute bottom-0 left-0 w-full opacity-25 z-0 pointer-events-none"
              style={{ height: '40%' }}
              viewBox="0 0 100 40"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="grad3" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#00ff87" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#00ff87" stopOpacity="0"   />
                </linearGradient>
              </defs>
              <motion.path
                d="M0,35 L10,32 L20,38 L30,25 L40,28 L50,15 L60,18 L70,8 L80,12 L90,2 L100,5"
                fill="none"
                stroke="#00ff87"
                strokeWidth="1"
                initial={{ pathLength: 0 }}
                animate={phase >= 2 ? { pathLength: 1 } : { pathLength: 0 }}
                transition={{ duration: 2, ease: 'easeInOut' }}
              />
              <motion.path
                d="M0,35 L10,32 L20,38 L30,25 L40,28 L50,15 L60,18 L70,8 L80,12 L90,2 L100,5 L100,40 L0,40 Z"
                fill="url(#grad3)"
                initial={{ opacity: 0 }}
                animate={phase >= 2 ? { opacity: 1 } : { opacity: 0 }}
                transition={{ duration: 1, delay: 1 }}
              />
            </motion.svg>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export function Scene4() {
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
      className="absolute inset-0 flex flex-col justify-center bg-[#0a0a0a]"
      initial={{ clipPath: 'circle(0% at 50% 50%)' }}
      animate={{ clipPath: 'circle(150% at 50% 50%)' }}
      exit={{ opacity: 0, filter: 'blur(20px)', scale: 1.1 }}
      transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1] }}
    >
      <div className="w-full px-[8vw] z-20 flex flex-col" style={{ gap: '3vh' }}>

        {/* Label */}
        <motion.div
          className="font-mono text-[#00ff87] tracking-widest uppercase"
          style={{ fontSize: '1.6vh' }}
          initial={{ opacity: 0, x: -20 }}
          animate={phase >= 1 ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
          transition={{ duration: 0.6 }}
        >
          03 / LLAMA 3.3 INTELLIGENCE
        </motion.div>

        {/* Headline */}
        <motion.h2
          className="font-bold leading-[1.1] tracking-tight"
          style={{ fontSize: '7.5vh' }}
          initial={{ opacity: 0, y: 30 }}
          animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          Patterns<br />you're missing.
        </motion.h2>

        {/* Body */}
        <motion.p
          className="text-white/50 leading-snug"
          style={{ fontSize: '2.2vh' }}
          initial={{ opacity: 0 }}
          animate={phase >= 2 ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.8 }}
        >
          Your AI Trading Coach analyzes your history,<br />
          identifies tilts, and surfaces behavioral leaks.
        </motion.p>

        {/* AI visualizer bars */}
        <motion.div
          className="flex items-end"
          style={{ gap: '0.8vw', height: '4vh' }}
          initial={{ opacity: 0 }}
          animate={phase >= 2 ? { opacity: 1 } : { opacity: 0 }}
        >
          {[0.4, 0.7, 1, 0.6, 0.9, 0.5, 0.8, 0.3, 0.95, 0.55].map((h, i) => (
            <motion.div
              key={i}
              className="flex-1 bg-[#00ff87] rounded-sm"
              animate={{ scaleY: [h, h * 0.4, h * 1.2, h * 0.6, h] }}
              transition={{ duration: 1.2 + i * 0.12, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
              style={{ transformOrigin: 'bottom', height: '100%' }}
            />
          ))}
        </motion.div>

        {/* AI Insight Card */}
        <motion.div
          className="relative w-full bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl"
          style={{ padding: '2.5vh 5vw' }}
          initial={{ opacity: 0, y: 40, rotateX: 8 }}
          animate={phase >= 2 ? { opacity: 1, y: 0, rotateX: 0 } : { opacity: 0, y: 40, rotateX: 8 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Abstract data background */}
          <motion.div
            className="absolute inset-0 opacity-20 mix-blend-screen pointer-events-none rounded-2xl overflow-hidden"
            style={{
              backgroundImage: `url(${import.meta.env.BASE_URL}images/abstract-data.png)`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
            initial={{ opacity: 0 }}
            animate={phase >= 2 ? { opacity: 0.2 } : { opacity: 0 }}
            transition={{ duration: 2 }}
          />

          <div className="relative z-10">
            <div
              className="flex items-center gap-[2vw] border-b border-white/10"
              style={{ marginBottom: '2vh', paddingBottom: '1.5vh' }}
            >
              <svg width="2.5vh" height="2.5vh" viewBox="0 0 24 24" fill="none" stroke="#00ff87" strokeWidth="2">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
              <div className="font-mono text-[#00ff87] tracking-widest uppercase" style={{ fontSize: '1.4vh' }}>
                AI INSIGHT GENERATED
              </div>
            </div>

            <div className="text-white/90 leading-relaxed" style={{ fontSize: '2.4vh' }}>
              "You consistently take premature profits on{' '}
              <strong className="text-white">Friday mornings</strong>. Holding your NQ
              runners past 11:00 AM would have increased this week's P&amp;L by{' '}
              <strong className="text-[#00ff87]">$1,840</strong>."
            </div>

            {/* Progress bar */}
            <motion.div
              className="rounded-full overflow-hidden bg-white/10"
              style={{ marginTop: '2.5vh', height: '3px' }}
              initial={{ opacity: 0 }}
              animate={phase >= 3 ? { opacity: 1 } : { opacity: 0 }}
            >
              <motion.div
                className="h-full bg-[#00ff87] rounded-full"
                initial={{ width: 0 }}
                animate={phase >= 3 ? { width: '100%' } : { width: 0 }}
                transition={{ duration: 2, ease: 'linear' }}
              />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

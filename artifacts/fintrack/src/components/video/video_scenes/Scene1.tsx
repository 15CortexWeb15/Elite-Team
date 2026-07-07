import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export function Scene1() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 600),
      setTimeout(() => setPhase(2), 1600),
      setTimeout(() => setPhase(3), 2600),
      setTimeout(() => setPhase(4), 4000),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, filter: 'blur(20px)', scale: 1.1 }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Candlestick background texture */}
      <motion.div
        className="absolute inset-0 opacity-12 mix-blend-screen pointer-events-none"
        style={{
          backgroundImage: `url(${import.meta.env.BASE_URL}images/candlesticks.png)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 5, ease: 'easeOut' }}
      />

      <div className="relative z-20 flex flex-col items-center px-[8vw] text-center">
        {/* Logo mark */}
        <motion.div
          className="mb-[5vh] rounded-2xl flex items-center justify-center relative overflow-hidden"
          style={{ width: '14vh', height: '14vh' }}
          initial={{ opacity: 0, scale: 0.8, rotateX: -30 }}
          animate={{ opacity: 1, scale: 1, rotateX: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="absolute inset-0 bg-[#111] border border-white/10 rounded-2xl" />
          <motion.div
            className="absolute inset-0 bg-gradient-to-tr from-[#00ff87]/20 to-transparent rounded-2xl"
            initial={{ opacity: 0 }}
            animate={phase >= 1 ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 1 }}
          />
          <svg width="7vh" height="7vh" viewBox="0 0 24 24" fill="none" stroke="#00ff87" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
            <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
            <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
          </svg>
        </motion.div>

        {/* Main typography */}
        <div className="tracking-tight leading-[1.1]">
          <motion.div
            initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
            animate={phase >= 1 ? { opacity: 1, y: 0, filter: 'blur(0px)' } : { opacity: 0, y: 30, filter: 'blur(10px)' }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="font-bold text-white/90"
            style={{ fontSize: '8.5vh' }}
          >
            Track<br />performance.
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
            animate={phase >= 2 ? { opacity: 1, y: 0, filter: 'blur(0px)' } : { opacity: 0, y: 30, filter: 'blur(10px)' }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="font-bold text-[#00ff87] mt-[1vh]"
            style={{ fontSize: '8.5vh', textShadow: '0 0 40px rgba(0,255,135,0.3)' }}
          >
            Discover<br />your edge.
          </motion.div>
        </div>

        {/* Subline */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={phase >= 3 ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="mt-[4vh] font-mono text-white/50 tracking-widest uppercase"
          style={{ fontSize: '1.6vh' }}
        >
          The professional standard
        </motion.div>
      </div>

      {/* Wipe transition exit */}
      <motion.div
        className="absolute inset-0 bg-[#00ff87] z-50 origin-bottom"
        initial={{ scaleY: 0 }}
        animate={phase >= 4 ? { scaleY: 1 } : { scaleY: 0 }}
        transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
      />
    </motion.div>
  );
}

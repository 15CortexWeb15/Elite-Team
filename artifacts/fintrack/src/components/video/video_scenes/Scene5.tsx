import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export function Scene5() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 600),
      setTimeout(() => setPhase(2), 1500),
      setTimeout(() => setPhase(3), 2200),
      setTimeout(() => setPhase(4), 4500),
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
      <div className="relative z-20 flex flex-col items-center text-center px-[8vw]">

        {/* Big logo mark */}
        <motion.div
          className="rounded-3xl flex items-center justify-center relative overflow-hidden bg-[#111] border border-[#00ff87]/30"
          style={{
            width: '22vh',
            height: '22vh',
            marginBottom: '4vh',
            boxShadow: '0 0 80px rgba(0,255,135,0.15)',
          }}
          initial={{ scale: 2, opacity: 0, rotateZ: 45 }}
          animate={phase >= 1 ? { scale: 1, opacity: 1, rotateZ: 0 } : { scale: 2, opacity: 0, rotateZ: 45 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-tr from-[#00ff87]/20 to-transparent"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          <svg width="11vh" height="11vh" viewBox="0 0 24 24" fill="none" stroke="#00ff87" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
            <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
            <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
          </svg>
        </motion.div>

        {/* Brand name */}
        <motion.div
          className="font-bold text-white tracking-tight leading-none"
          style={{ fontSize: '12vh', marginBottom: '1.5vh' }}
          initial={{ opacity: 0, y: 20 }}
          animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          Roxel
        </motion.div>

        {/* Tagline */}
        <motion.div
          className="font-mono text-[#00ff87] tracking-widest uppercase"
          style={{ fontSize: '2vh', marginBottom: '2.5vh' }}
          initial={{ opacity: 0 }}
          animate={phase >= 3 ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 1 }}
        >
          START JOURNALING FOR FREE
        </motion.div>

        {/* Asset types */}
        <motion.div
          className="font-mono text-white/40"
          style={{ fontSize: '1.5vh' }}
          initial={{ opacity: 0 }}
          animate={phase >= 3 ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
        >
          Crypto · Forex · Equities · Options · Futures
        </motion.div>

        {/* Animated accent ring */}
        <motion.div
          className="absolute rounded-full border border-[#00ff87]/10 pointer-events-none"
          style={{ width: '50vh', height: '50vh' }}
          animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute rounded-full border border-[#00ff87]/05 pointer-events-none"
          style={{ width: '70vh', height: '70vh' }}
          animate={{ scale: [1.05, 1, 1.05], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Cinematic flash on loop */}
      <motion.div
        className="absolute inset-0 bg-white z-50 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={phase >= 4 ? { opacity: [0, 1, 0] } : { opacity: 0 }}
        transition={{ duration: 0.5, times: [0, 0.1, 1] }}
      />
    </motion.div>
  );
}

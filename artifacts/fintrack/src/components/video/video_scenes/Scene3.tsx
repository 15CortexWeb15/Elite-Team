import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export function Scene3() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 2000),
      setTimeout(() => setPhase(3), 8500),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center overflow-hidden"
      initial={{ opacity: 0, scale: 1.2 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
      transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Background Image Layer */}
      <motion.div
        className="absolute inset-0 z-0 opacity-40 mix-blend-screen"
        initial={{ scale: 1, x: '5%', y: '5%' }}
        animate={{ scale: 1.1, x: '-5%', y: '-5%' }}
        transition={{ duration: 10, ease: 'linear' }}
        style={{
          backgroundImage: `url(${import.meta.env.BASE_URL}images/video/scene3.jpg)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      <div className="absolute inset-0 z-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-[#0a0a0a] opacity-90" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-[80vw] mx-auto flex flex-col items-center justify-center text-center">
        <motion.div
          className="w-[6vw] h-[6vw] mb-8 rounded-2xl bg-white flex items-center justify-center shadow-[0_0_40px_rgba(255,255,255,0.3)]"
          initial={{ scale: 0, rotate: -45 }}
          animate={phase >= 1 ? { scale: 1, rotate: 0 } : { scale: 0, rotate: -45 }}
          transition={{ duration: 1, type: 'spring', bounce: 0.5 }}
        >
          <svg className="w-[3vw] h-[3vw]" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        </motion.div>

        <div className="overflow-hidden">
          <motion.h2
            className="text-[4.5vw] font-bold tracking-tight text-white leading-[1.1]"
            initial={{ y: '100%', opacity: 0 }}
            animate={phase >= 2 ? { y: 0, opacity: 1 } : { y: '100%', opacity: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          >
            AI-Powered Analysis
          </motion.h2>
        </div>
        
        <div className="overflow-hidden mt-[2vw] max-w-[50vw]">
          <motion.p
            className="text-[1.8vw] font-medium tracking-tight text-white/60 leading-[1.4]"
            initial={{ y: '100%', opacity: 0 }}
            animate={phase >= 2 ? { y: 0, opacity: 1 } : { y: '100%', opacity: 0 }}
            transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            Llama 3 identifies your behavioral leaks and psychological patterns instantly.
          </motion.p>
        </div>
      </div>
    </motion.div>
  );
}

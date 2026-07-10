import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export function Scene1() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 2500),
      setTimeout(() => setPhase(3), 5000),
      setTimeout(() => setPhase(4), 8500),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center overflow-hidden"
      initial={{ opacity: 0, scale: 1.1 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
      transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Background Image Layer */}
      <motion.div
        className="absolute inset-0 z-0 opacity-40 mix-blend-lighten"
        initial={{ scale: 1.2, x: '-5%' }}
        animate={{ scale: 1, x: '0%' }}
        transition={{ duration: 10, ease: 'linear' }}
        style={{
          backgroundImage: `url(${import.meta.env.BASE_URL}images/video/scene1.jpg)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* Vignette */}
      <div className="absolute inset-0 z-0 bg-gradient-to-r from-[#0a0a0a] via-transparent to-[#0a0a0a] opacity-80" />
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-[#0a0a0a] opacity-80" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-[80vw] mx-auto flex flex-col items-center justify-center text-center">
        <div className="overflow-hidden">
          <motion.h2
            className="text-[4vw] font-medium tracking-tight text-white/90 leading-[1.2]"
            initial={{ y: '100%', rotateX: -20, opacity: 0 }}
            animate={phase >= 1 ? { y: 0, rotateX: 0, opacity: 1 } : { y: '100%', rotateX: -20, opacity: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          >
            Most traders fail not because
          </motion.h2>
        </div>
        <div className="overflow-hidden mt-[1vw]">
          <motion.h2
            className="text-[4vw] font-medium tracking-tight text-white/60 leading-[1.2]"
            initial={{ y: '100%', rotateX: -20, opacity: 0 }}
            animate={phase >= 2 ? { y: 0, rotateX: 0, opacity: 1 } : { y: '100%', rotateX: -20, opacity: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          >
            of bad strategy —
          </motion.h2>
        </div>
        
        <div className="mt-[4vw] overflow-hidden">
          <motion.h1
            className="text-[5.5vw] font-bold tracking-tighter text-white leading-[1.1]"
            initial={{ y: '100%', opacity: 0, scale: 0.95 }}
            animate={phase >= 3 ? { y: 0, opacity: 1, scale: 1 } : { y: '100%', opacity: 0, scale: 0.95 }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          >
            but because they never <span className="text-red-500/80">review</span> their trades.
          </motion.h1>
        </div>
      </div>
      
      {/* Decorative accent */}
      <motion.div 
        className="absolute bottom-0 left-0 h-1 bg-white/20"
        initial={{ width: '0%' }}
        animate={{ width: '100%' }}
        transition={{ duration: 10, ease: 'linear' }}
      />
    </motion.div>
  );
}

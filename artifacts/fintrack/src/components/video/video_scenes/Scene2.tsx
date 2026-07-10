import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export function Scene2() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 800),
      setTimeout(() => setPhase(2), 2500),
      setTimeout(() => setPhase(3), 8500),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center overflow-hidden"
      initial={{ opacity: 0, x: '5%' }}
      animate={{ opacity: 1, x: '0%' }}
      exit={{ opacity: 0, x: '-5%', filter: 'blur(10px)' }}
      transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Background Image Layer */}
      <motion.div
        className="absolute inset-0 z-0 opacity-30 mix-blend-screen"
        initial={{ scale: 1 }}
        animate={{ scale: 1.15, rotateZ: 1 }}
        transition={{ duration: 10, ease: 'linear' }}
        style={{
          backgroundImage: `url(${import.meta.env.BASE_URL}images/video/scene2.jpg)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#0a0a0a] via-transparent to-[#0a0a0a] opacity-90" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-[80vw] mx-auto grid grid-cols-2 gap-12 items-center h-full">
        <div className="flex flex-col justify-center">
          <div className="overflow-hidden">
            <motion.div
              className="inline-block px-4 py-2 mb-6 rounded-full border border-white/20 bg-white/5 text-[1vw] font-mono text-white/80 tracking-widest uppercase"
              initial={{ y: 20, opacity: 0 }}
              animate={phase >= 1 ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            >
              Professional Journal
            </motion.div>
          </div>
          
          <div className="overflow-hidden">
            <motion.h2
              className="text-[4vw] font-bold tracking-tight text-white leading-[1.1]"
              initial={{ y: '100%', opacity: 0 }}
              animate={phase >= 2 ? { y: 0, opacity: 1 } : { y: '100%', opacity: 0 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            >
              Log every trade in <span className="text-white/50 block mt-2">under 60 seconds.</span>
            </motion.h2>
          </div>
        </div>
        
        {/* Fake UI Element on Right */}
        <motion.div
          className="relative w-full aspect-[4/3] rounded-2xl border border-white/10 bg-[#0a0a0a]/60 backdrop-blur-md overflow-hidden shadow-2xl shadow-white/5 flex flex-col"
          initial={{ opacity: 0, scale: 0.9, rotateY: 20 }}
          animate={phase >= 2 ? { opacity: 1, scale: 1, rotateY: 0 } : { opacity: 0, scale: 0.9, rotateY: 20 }}
          transition={{ duration: 1.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="h-10 border-b border-white/10 flex items-center px-4 gap-2 bg-white/[0.02]">
            <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
            <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
            <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
          </div>
          <div className="p-8 flex flex-col gap-6 flex-1">
            <motion.div 
              className="h-8 w-1/3 bg-white/10 rounded-md" 
              initial={{ width: 0 }} animate={phase >= 2 ? { width: '33%' } : { width: 0 }} transition={{ delay: 1, duration: 1 }}
            />
            <div className="flex gap-4">
              <motion.div 
                className="h-12 flex-1 bg-white/5 rounded-md border border-white/10"
                initial={{ opacity: 0 }} animate={phase >= 2 ? { opacity: 1 } : { opacity: 0 }} transition={{ delay: 1.2 }}
              />
              <motion.div 
                className="h-12 flex-1 bg-white/5 rounded-md border border-white/10"
                initial={{ opacity: 0 }} animate={phase >= 2 ? { opacity: 1 } : { opacity: 0 }} transition={{ delay: 1.4 }}
              />
            </div>
            <motion.div 
              className="flex-1 w-full bg-white/5 rounded-md border border-white/10"
              initial={{ opacity: 0 }} animate={phase >= 2 ? { opacity: 1 } : { opacity: 0 }} transition={{ delay: 1.6 }}
            />
          </div>
        </motion.div>
      </div>
      
      {/* Decorative accent */}
      <motion.div 
        className="absolute top-0 right-0 w-1 bg-white/20"
        initial={{ height: '0%' }}
        animate={{ height: '100%' }}
        transition={{ duration: 10, ease: 'linear' }}
      />
    </motion.div>
  );
}

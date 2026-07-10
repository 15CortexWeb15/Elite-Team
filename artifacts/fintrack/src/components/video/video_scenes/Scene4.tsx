import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export function Scene4() {
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
      className="absolute inset-0 flex flex-col justify-center overflow-hidden pl-[10vw]"
      initial={{ opacity: 0, y: '5%' }}
      animate={{ opacity: 1, y: '0%' }}
      exit={{ opacity: 0, y: '-5%', filter: 'blur(10px)' }}
      transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Background Image Layer */}
      <motion.div
        className="absolute inset-0 z-0 opacity-40 mix-blend-screen"
        initial={{ scale: 1.2 }}
        animate={{ scale: 1 }}
        transition={{ duration: 10, ease: 'linear' }}
        style={{
          backgroundImage: `url(${import.meta.env.BASE_URL}images/video/scene4.jpg)`,
          backgroundSize: 'cover',
          backgroundPosition: 'right center',
        }}
      />

      <div className="absolute inset-0 z-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-[40vw]">
        <div className="overflow-hidden">
          <motion.div
            className="inline-block px-4 py-2 mb-8 rounded-full border border-white/20 bg-white/5 text-[1vw] font-mono text-white/80 tracking-widest uppercase"
            initial={{ y: 20, opacity: 0 }}
            animate={phase >= 1 ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            Deep Analytics
          </motion.div>
        </div>

        <div className="flex flex-col gap-6">
          {['Equity Curve', 'Win Rate', 'Calendar Heatmap', 'Asset Breakdown'].map((item, i) => (
            <div key={item} className="overflow-hidden">
              <motion.h2
                className="text-[3.5vw] font-bold tracking-tight text-white/90 leading-[1.1]"
                initial={{ x: '-20%', opacity: 0 }}
                animate={phase >= 2 ? { x: 0, opacity: 1 } : { x: '-20%', opacity: 0 }}
                transition={{ duration: 1, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
              >
                {item}
              </motion.h2>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

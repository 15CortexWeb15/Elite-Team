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
      className="absolute inset-0 flex items-center bg-[#0a0a0a]"
      // Enters via the circle clip from Scene3
      initial={{ clipPath: 'circle(0% at 50% 50%)' }}
      animate={{ clipPath: 'circle(150% at 50% 50%)' }}
      exit={{ opacity: 0, filter: 'blur(20px)', scale: 1.1 }}
      transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1] }}
    >
      <div className="w-full px-[8vw] flex justify-between items-center z-20">
        
        {/* Left Side: Typography */}
        <div className="flex-1">
          <motion.div 
            className="font-mono text-[1.2vw] text-[#00ff87] mb-[2vw]"
            initial={{ opacity: 0, x: -20 }}
            animate={phase >= 1 ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
            transition={{ duration: 0.6 }}
          >
            03 / LLAMA 3.3 INTELLIGENCE
          </motion.div>

          <motion.h2 
            className="text-[4.5vw] font-bold leading-[1.1] tracking-tight mb-[2vw]"
            initial={{ opacity: 0, y: 30 }}
            animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            Patterns you're<br/>missing.
          </motion.h2>

          <motion.p
            className="text-[1.8vw] text-white/50 max-w-[35vw] leading-snug mb-[4vw]"
            initial={{ opacity: 0 }}
            animate={phase >= 2 ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            Your AI Trading Coach analyzes history, identifies tilts, and surfaces psychological leaks.
          </motion.p>
          
          {/* Decorative AI visualizer */}
          <motion.div 
            className="flex gap-2 items-end h-[4vw]"
            initial={{ opacity: 0 }}
            animate={phase >= 2 ? { opacity: 1 } : { opacity: 0 }}
          >
            {[1,2,3,4,5,6,7].map((i) => (
              <motion.div 
                key={i}
                className="w-1 bg-[#00ff87]"
                animate={{ height: ['20%', '100%', '30%', '80%', '40%'] }}
                transition={{ duration: 1.5 + (i * 0.1), repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
              />
            ))}
          </motion.div>
        </div>

        {/* Right Side: AI Insight Card */}
        <div className="flex-1 relative flex justify-end">
          {/* Abstract Data Background */}
          <motion.div
            className="absolute inset-0 opacity-30 mix-blend-screen pointer-events-none"
            style={{
              backgroundImage: `url(${import.meta.env.BASE_URL}images/abstract-data.png)`,
              backgroundSize: 'contain',
              backgroundPosition: 'right center',
              backgroundRepeat: 'no-repeat'
            }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={phase >= 1 ? { opacity: 0.3, scale: 1 } : { opacity: 0, scale: 0.9 }}
            transition={{ duration: 2 }}
          />

          <motion.div 
            className="relative z-10 w-[35vw] bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl p-[3vw]"
            initial={{ opacity: 0, y: 50, rotateX: 10 }}
            animate={phase >= 2 ? { opacity: 1, y: 0, rotateX: 0 } : { opacity: 0, y: 50, rotateX: 10 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center gap-[1vw] mb-[2vw] pb-[1vw] border-b border-white/10">
              <svg width="1.5vw" height="1.5vw" viewBox="0 0 24 24" fill="none" stroke="#00ff87" strokeWidth="2">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
              <div className="font-mono text-[#00ff87] text-[1vw]">AI INSIGHT GENERATED</div>
            </div>
            
            <div className="font-serif text-[1.8vw] leading-relaxed text-white/90">
              "You consistently take premature profits on <strong>Friday mornings</strong>. Holding your NQ runners past 11:00 AM would have increased this week's P&L by <strong>$1,840</strong>."
            </div>
            
            <motion.div 
              className="mt-[3vw] h-1 bg-white/10 rounded-full overflow-hidden"
              initial={{ opacity: 0 }}
              animate={phase >= 3 ? { opacity: 1 } : { opacity: 0 }}
            >
              <motion.div 
                className="h-full bg-[#00ff87]"
                initial={{ width: 0 }}
                animate={phase >= 3 ? { width: '100%' } : { width: 0 }}
                transition={{ duration: 2, ease: "linear" }}
              />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const MockTerminalRow = ({ time, asset, side, size, price, pnl, delay }: any) => (
  <motion.div 
    className="flex items-center justify-between py-[1vw] border-b border-white/5 font-mono text-[1.1vw]"
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
  >
    <div className="flex items-center gap-[2vw] text-white/60">
      <span className="w-[6vw]">{time}</span>
      <span className="w-[5vw] text-white font-bold">{asset}</span>
      <span className={`w-[4vw] ${side === 'LONG' ? 'text-[#00ff87]' : 'text-red-400'}`}>{side}</span>
      <span className="w-[5vw] text-right">{size}</span>
      <span className="w-[8vw] text-right">{price}</span>
    </div>
    <div className={`font-bold ${pnl.startsWith('+') ? 'text-[#00ff87]' : 'text-red-400'}`}>
      {pnl}
    </div>
  </motion.div>
);

export function Scene2() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 400),
      setTimeout(() => setPhase(2), 1000),
      setTimeout(() => setPhase(3), 1600),
      setTimeout(() => setPhase(4), 4200),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex items-center bg-[#0a0a0a]"
      // Scene enters from a full screen green wipe (from Scene1)
      initial={{ clipPath: 'inset(100% 0 0 0)' }}
      animate={{ clipPath: 'inset(0% 0 0 0)' }}
      exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
      transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
    >
      <div className="flex w-full px-[8vw] gap-[8vw] items-center">
        
        {/* Left Side: Typography */}
        <div className="flex-1 relative z-20">
          <motion.div 
            className="font-mono text-[1.2vw] text-[#00ff87] mb-[2vw]"
            initial={{ opacity: 0, y: 20 }}
            animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6 }}
          >
            01 / STRUCTURED JOURNAL
          </motion.div>
          
          <motion.h2 
            className="text-[4.5vw] font-bold leading-[1.1] tracking-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            Sub-60s<br/>entry.
          </motion.h2>

          <motion.p
            className="mt-[2vw] text-[1.8vw] text-white/50 max-w-[30vw] leading-snug"
            initial={{ opacity: 0 }}
            animate={phase >= 2 ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            Dense, distraction-free logging for crypto, equities, options, and futures.
          </motion.p>
        </div>

        {/* Right Side: Terminal UI Mockup */}
        <div className="flex-1 relative perspective-[1000px]">
          {/* Subtle green glow behind terminal */}
          <motion.div 
            className="absolute inset-0 bg-[#00ff87]/10 blur-[100px] rounded-full"
            initial={{ opacity: 0 }}
            animate={phase >= 2 ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 2 }}
          />

          <motion.div 
            className="relative z-10 bg-[#111] border border-white/10 rounded-xl p-[2vw] shadow-2xl"
            initial={{ opacity: 0, rotateY: 20, x: 50 }}
            animate={phase >= 2 ? { opacity: 1, rotateY: 0, x: 0 } : { opacity: 0, rotateY: 20, x: 50 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Terminal Header */}
            <div className="flex gap-2 mb-[2vw] pb-[1vw] border-b border-white/10">
              <div className="w-3 h-3 rounded-full bg-white/20" />
              <div className="w-3 h-3 rounded-full bg-white/20" />
              <div className="w-3 h-3 rounded-full bg-white/20" />
            </div>

            {/* Terminal Rows */}
            <div className="flex flex-col">
              <MockTerminalRow time="09:30:05" asset="ES=F" side="LONG" size="2" price="5120.25" pnl="+$450.00" delay={0.2} />
              <MockTerminalRow time="10:15:22" asset="NQ=F" side="SHORT" size="1" price="18045.50" pnl="-$125.00" delay={0.4} />
              <MockTerminalRow time="11:45:00" asset="BTC-PERP" side="LONG" size="0.5" price="64200.00" pnl="+$890.00" delay={0.6} />
              <MockTerminalRow time="14:20:10" asset="NVDA" side="SHORT" size="100" price="845.20" pnl="+$1,240.50" delay={0.8} />
              
              {/* Active Entry Row */}
              <motion.div 
                className="flex items-center justify-between py-[1vw] mt-[1vw] bg-[#00ff87]/5 border border-[#00ff87]/20 rounded-md px-[1vw] font-mono text-[1.1vw]"
                initial={{ opacity: 0, y: 10 }}
                animate={phase >= 3 ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                transition={{ duration: 0.5, delay: 1.2 }}
              >
                <div className="flex items-center gap-[2vw] text-white">
                  <span className="w-[6vw] text-white/50">15:00:--</span>
                  <span className="w-[5vw]">AAPL</span>
                  <motion.span 
                    className="w-[4vw] bg-[#00ff87] text-black px-1 rounded inline-block text-center"
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    LONG
                  </motion.span>
                  <span className="w-[5vw] text-right text-white/50 cursor-blink">_</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
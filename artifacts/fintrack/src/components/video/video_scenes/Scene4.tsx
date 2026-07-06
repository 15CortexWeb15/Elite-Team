import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const Candle = ({ delay, h, isGreen }: { delay: number, h: number, isGreen: boolean }) => (
  <motion.div 
    className="relative flex flex-col items-center justify-center w-[1.5vw]"
    initial={{ scaleY: 0, opacity: 0 }}
    animate={{ scaleY: 1, opacity: 1 }}
    transition={{ duration: 0.5, delay, ease: "easeOut" }}
  >
    <div className={`w-[2px] h-[8vw] ${isGreen ? 'bg-[#00ff87]' : 'bg-red-500'}`} />
    <div 
      className={`absolute w-full rounded-[2px] ${isGreen ? 'bg-[#00ff87]' : 'bg-red-500'}`}
      style={{ height: `${h}vw` }}
    />
  </motion.div>
);

export function Scene4() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 300),
      setTimeout(() => setPhase(2), 1000),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex items-center justify-center z-10 bg-gradient-to-r from-transparent via-[#050505]/80 to-transparent"
      initial={{ opacity: 0, filter: 'blur(20px)' }}
      animate={{ opacity: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, scale: 1.1 }}
      transition={{ duration: 1.2 }}
    >
      {/* Ticker tape background */}
      <div className="absolute top-[20vh] w-full overflow-hidden whitespace-nowrap opacity-20 font-mono text-[2vw]">
        <motion.div 
          className="inline-block"
          animate={{ x: [0, -1000] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        >
          {Array(20).fill("SPY 512.40 +1.2% • QQQ 180.20 -0.4% • AAPL 172.10 +0.8% • ").join('')}
        </motion.div>
      </div>

      <div className="flex w-[80vw] justify-between items-center z-20">
        <div className="w-[40vw]">
          <motion.div 
            className="font-mono text-[#ffb000] text-[1.5vw] mb-[1vw] tracking-widest"
            initial={{ opacity: 0, x: -20 }}
            animate={phase >= 1 ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
          >
            [ LIVE DATA FEEDS ]
          </motion.div>
          <motion.h2 
            className="text-[5vw] font-bold leading-[1.1]"
            initial={{ opacity: 0, y: 20 }}
            animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay: 0.2 }}
          >
            Real-time Edge.
          </motion.h2>
          <motion.p 
            className="text-white/50 text-[1.5vw] mt-[2vw] max-w-[30vw]"
            initial={{ opacity: 0 }}
            animate={phase >= 2 ? { opacity: 1 } : { opacity: 0 }}
          >
            Sync your brokerage. Watch the market adapt instantly.
          </motion.p>
        </div>

        {/* Dynamic Candlesticks Mockup */}
        <div className="flex items-end gap-[1vw] h-[20vw] border-b border-white/20 pb-[1vw] px-[2vw]">
          <Candle delay={0.6} h={4} isGreen={false} />
          <Candle delay={0.7} h={6} isGreen={false} />
          <Candle delay={0.8} h={3} isGreen={true} />
          <Candle delay={0.9} h={8} isGreen={true} />
          <Candle delay={1.0} h={12} isGreen={true} />
          <Candle delay={1.1} h={5} isGreen={false} />
          <Candle delay={1.2} h={10} isGreen={true} />
        </div>
      </div>
    </motion.div>
  );
}
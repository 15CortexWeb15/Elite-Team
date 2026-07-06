import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const TradeRow = ({ ticker, type, price, pnl, delay }: any) => (
  <motion.div 
    className="flex items-center justify-between p-[1.5vw] border-b border-white/5 bg-white/[0.02] backdrop-blur-md rounded-lg mb-[1vw]"
    initial={{ opacity: 0, x: -50 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
  >
    <div className="flex items-center gap-[2vw]">
      <div className="w-[3vw] h-[3vw] rounded-full bg-white/10 flex items-center justify-center font-mono text-[1vw]">
        {ticker[0]}
      </div>
      <div>
        <div className="font-bold text-[1.5vw]">{ticker}</div>
        <div className="font-mono text-[1vw] text-white/50">{type}</div>
      </div>
    </div>
    <div className="text-right">
      <div className="font-mono text-[1.2vw] text-white/80">{price}</div>
      <div className={`font-mono font-bold text-[1.5vw] ${pnl.startsWith('+') ? 'text-[#00ff87]' : 'text-red-500'}`}>
        {pnl}
      </div>
    </div>
  </motion.div>
);

export function Scene2() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 1200),
      setTimeout(() => setPhase(3), 4000),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex items-center justify-center px-[8vw] gap-[5vw]"
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100, filter: 'blur(10px)' }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="flex-1">
        <motion.h2 
          className="text-[4vw] font-bold leading-tight"
          initial={{ opacity: 0, y: 30 }}
          animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        >
          Log every execution <br/>
          <span className="text-white/50 font-mono text-[3vw]">with absolute precision.</span>
        </motion.h2>
        
        <motion.div 
          className="mt-[3vw] w-12 h-1 bg-[#00ff87]"
          initial={{ scaleX: 0 }}
          animate={phase >= 1 ? { scaleX: 1 } : { scaleX: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        />
      </div>

      <div className="flex-1 relative">
        <div className="absolute inset-0 bg-[#00ff87]/5 blur-[100px] rounded-full" />
        <div className="relative z-10 w-full max-w-[40vw]">
          <TradeRow ticker="NVDA" type="LONG • 100 SHARES" price="@ $845.20" pnl="+$1,240.50" delay={0.6} />
          <TradeRow ticker="AMD" type="SHORT • 50 SHARES" price="@ $175.40" pnl="+$420.00" delay={0.8} />
          <TradeRow ticker="TSLA" type="LONG • 200 SHARES" price="@ $195.10" pnl="-$150.00" delay={1.0} />
          <TradeRow ticker="AAPL" type="LONG • 50 SHARES" price="@ $170.80" pnl="+$85.00" delay={1.2} />
        </div>
      </div>
    </motion.div>
  );
}
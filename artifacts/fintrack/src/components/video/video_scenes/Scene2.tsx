import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const MockTerminalRow = ({ time, asset, side, pnl, delay }: any) => (
  <motion.div
    className="flex items-center justify-between border-b border-white/5 font-mono"
    style={{ paddingTop: '1.2vh', paddingBottom: '1.2vh', fontSize: '1.6vh' }}
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
  >
    <div className="flex items-center gap-[3vw] text-white/60">
      <span style={{ width: '9vw' }}>{time}</span>
      <span className="text-white font-bold" style={{ width: '12vw' }}>{asset}</span>
      <span className={side === 'LONG' ? 'text-[#00ff87]' : 'text-red-400'} style={{ width: '10vw' }}>{side}</span>
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
      className="absolute inset-0 flex flex-col justify-center bg-[#0a0a0a]"
      initial={{ clipPath: 'inset(100% 0 0 0)' }}
      animate={{ clipPath: 'inset(0% 0 0 0)' }}
      exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
      transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
    >
      <div className="flex flex-col w-full px-[8vw] z-20" style={{ gap: '3.5vh' }}>

        {/* Top: Typography */}
        <div>
          <motion.div
            className="font-mono text-[#00ff87] tracking-widest uppercase"
            style={{ fontSize: '1.6vh', marginBottom: '1.5vh' }}
            initial={{ opacity: 0, y: 20 }}
            animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6 }}
          >
            01 / STRUCTURED JOURNAL
          </motion.div>

          <motion.h2
            className="font-bold leading-[1.1] tracking-tight"
            style={{ fontSize: '7.5vh' }}
            initial={{ opacity: 0, y: 30 }}
            animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            Sub-60s<br />entry.
          </motion.h2>

          <motion.p
            className="text-white/50 leading-snug"
            style={{ fontSize: '2.2vh', marginTop: '1.5vh' }}
            initial={{ opacity: 0 }}
            animate={phase >= 2 ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            Dense, distraction-free logging for crypto,<br />equities, options &amp; futures.
          </motion.p>
        </div>

        {/* Bottom: Terminal UI */}
        <motion.div
          className="relative"
          initial={{ opacity: 0, y: 40, rotateX: 8 }}
          animate={phase >= 2 ? { opacity: 1, y: 0, rotateX: 0 } : { opacity: 0, y: 40, rotateX: 8 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Glow */}
          <motion.div
            className="absolute -inset-4 bg-[#00ff87]/8 blur-[60px] rounded-full"
            initial={{ opacity: 0 }}
            animate={phase >= 2 ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 2 }}
          />

          <div className="relative z-10 bg-[#111] border border-white/10 rounded-2xl" style={{ padding: '2.5vh 4vw' }}>
            {/* Terminal dots */}
            <div className="flex gap-2 border-b border-white/10" style={{ marginBottom: '2vh', paddingBottom: '1.5vh' }}>
              <div className="w-3 h-3 rounded-full bg-white/20" />
              <div className="w-3 h-3 rounded-full bg-white/20" />
              <div className="w-3 h-3 rounded-full bg-white/20" />
            </div>

            <MockTerminalRow time="09:30" asset="ES=F"     side="LONG"  pnl="+$450.00"   delay={0.2} />
            <MockTerminalRow time="10:15" asset="NQ=F"     side="SHORT" pnl="-$125.00"   delay={0.4} />
            <MockTerminalRow time="11:45" asset="BTC-PERP" side="LONG"  pnl="+$890.00"  delay={0.6} />
            <MockTerminalRow time="14:20" asset="NVDA"     side="SHORT" pnl="+$1,240.50" delay={0.8} />

            {/* Active blinking row */}
            <motion.div
              className="flex items-center justify-between font-mono bg-[#00ff87]/5 border border-[#00ff87]/20 rounded-xl"
              style={{ marginTop: '1.5vh', padding: '1.2vh 3vw', fontSize: '1.6vh' }}
              initial={{ opacity: 0, y: 10 }}
              animate={phase >= 3 ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
              transition={{ duration: 0.5, delay: 1.2 }}
            >
              <div className="flex items-center gap-[3vw] text-white">
                <span className="text-white/50">15:00</span>
                <span className="font-bold">AAPL</span>
                <motion.span
                  className="bg-[#00ff87] text-black px-2 rounded font-bold"
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  LONG
                </motion.span>
              </div>
              <motion.span
                className="text-[#00ff87]"
                animate={{ opacity: [1, 0, 1] }}
                transition={{ repeat: Infinity, duration: 0.8 }}
              >
                ▊
              </motion.span>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

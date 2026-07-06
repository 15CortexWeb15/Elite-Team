import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVideoPlayer } from '@/lib/video';
import { Scene1 } from './video_scenes/Scene1';
import { Scene2 } from './video_scenes/Scene2';
import { Scene3 } from './video_scenes/Scene3';
import { Scene4 } from './video_scenes/Scene4';
import { Scene5 } from './video_scenes/Scene5';

const SCENE_DURATIONS = { 
  open: 4000, 
  journal: 5000, 
  analytics: 5000, 
  markets: 5000, 
  coach: 6000 
};

// Background grid that persists and shifts perspective
const GridBackground = ({ currentScene }: { currentScene: number }) => {
  return (
    <div className="absolute inset-0 flex items-center justify-center perspective-[1000px] opacity-20 pointer-events-none">
      <motion.div 
        className="w-[200vw] h-[200vh] border-brand-green/20"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)
          `,
          backgroundSize: '4vw 4vw',
        }}
        animate={{
          rotateX: [60, 50, 65, 45, 60][currentScene],
          rotateZ: [0, 10, -5, 15, 0][currentScene],
          y: ['0%', '10%', '-5%', '5%', '0%'][currentScene],
          z: [-200, -100, -300, 0, -200][currentScene]
        }}
        transition={{ duration: 3, ease: 'easeInOut' }}
      />
      {/* Dynamic light sweeps */}
      <motion.div 
        className="absolute w-[80vw] h-[80vw] rounded-full blur-[100px] mix-blend-screen"
        animate={{
          background: [
            'radial-gradient(circle, rgba(0,255,135,0.05), transparent 60%)',
            'radial-gradient(circle, rgba(0,255,135,0.1), transparent 60%)',
            'radial-gradient(circle, rgba(255,176,0,0.08), transparent 60%)',
            'radial-gradient(circle, rgba(0,255,135,0.15), transparent 60%)',
            'radial-gradient(circle, rgba(0,255,135,0.08), transparent 60%)'
          ][currentScene],
          x: ['-20vw', '10vw', '20vw', '-10vw', '0vw'][currentScene],
          y: ['10vh', '-20vh', '0vh', '20vh', '0vh'][currentScene]
        }}
        transition={{ duration: 4, ease: 'easeInOut' }}
      />
    </div>
  );
};

export default function VideoTemplate() {
  const { currentScene } = useVideoPlayer({ durations: SCENE_DURATIONS });

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#020202] text-white font-sans">
      <GridBackground currentScene={currentScene} />
      
      <AnimatePresence mode="popLayout">
        {currentScene === 0 && <Scene1 key="open" />}
        {currentScene === 1 && <Scene2 key="journal" />}
        {currentScene === 2 && <Scene3 key="analytics" />}
        {currentScene === 3 && <Scene4 key="markets" />}
        {currentScene === 4 && <Scene5 key="coach" />}
      </AnimatePresence>
    </div>
  );
}
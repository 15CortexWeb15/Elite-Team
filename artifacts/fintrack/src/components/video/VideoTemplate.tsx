import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVideoPlayer } from '@/lib/video';
import { Scene1 } from './video_scenes/Scene1';
import { Scene2 } from './video_scenes/Scene2';
import { Scene3 } from './video_scenes/Scene3';
import { Scene4 } from './video_scenes/Scene4';
import { Scene5 } from './video_scenes/Scene5';
import { RecordOverlay } from './RecordOverlay';

// Total 25 seconds
const SCENE_DURATIONS = { 
  intro: 5000, 
  journal: 5000, 
  analytics: 5000, 
  coach: 5000, 
  outro: 5000 
};

// Global background that persists and subtly shifts, very dark and premium
const AmbientBackground = ({ currentScene }: { currentScene: number }) => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none bg-[#0a0a0a] z-0">
      {/* Very faint noise texture */}
      <div 
        className="absolute inset-0 opacity-[0.03]" 
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}
      />
      
      {/* Cinematic subtle glow */}
      <motion.div
        className="absolute inset-0 opacity-40 mix-blend-screen"
        style={{
          backgroundImage: `url(${import.meta.env.BASE_URL}images/glow.png)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
        animate={{
          scale: [1, 1.05, 1.1, 1.05, 1][currentScene],
          opacity: [0.3, 0.4, 0.2, 0.5, 0.3][currentScene],
        }}
        transition={{ duration: 4, ease: 'easeInOut' }}
      />

      {/* Abstract shifting grid for "Terminal" feel */}
      <div className="absolute inset-0 flex items-center justify-center perspective-[1200px] opacity-10 mix-blend-screen">
        <motion.div 
          className="w-[200vw] h-[200vh] border-[#00ff87]/10"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)
            `,
            backgroundSize: '3vw 3vw',
          }}
          animate={{
            rotateX: [70, 65, 75, 60, 70][currentScene],
            rotateZ: [0, 5, -5, 10, 0][currentScene],
            y: ['0%', '5%', '-5%', '10%', '0%'][currentScene],
            z: [-200, -150, -250, -100, -200][currentScene]
          }}
          transition={{ duration: 4, ease: [0.25, 0.1, 0.25, 1] }}
        />
      </div>
      
      {/* Persistent global accent line */}
      <motion.div 
        className="absolute left-[5vw] top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-[#00ff87]/20 to-transparent"
        animate={{
          height: ['0%', '100%', '100%', '100%', '100%'][currentScene],
          opacity: [0, 0.5, 0.3, 0.8, 0.2][currentScene]
        }}
        transition={{ duration: 2, ease: "easeOut" }}
      />
    </div>
  );
};

export default function VideoTemplate() {
  const { currentScene } = useVideoPlayer({ durations: SCENE_DURATIONS });
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 0.55;
    audio.loop = true;
    const play = () => audio.play().catch(() => {});
    play();
    document.addEventListener('click', play, { once: true });
    return () => document.removeEventListener('click', play);
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#0a0a0a] text-[#ededed] font-sans">
      <audio
        ref={audioRef}
        src={`${import.meta.env.BASE_URL}audio/bg-music.mp3`}
        preload="auto"
        loop
      />
      <RecordOverlay />
      
      <AmbientBackground currentScene={currentScene} />
      
      <div className="relative z-10 w-full h-full">
        <AnimatePresence mode="popLayout">
          {currentScene === 0 && <Scene1 key="intro" />}
          {currentScene === 1 && <Scene2 key="journal" />}
          {currentScene === 2 && <Scene3 key="analytics" />}
          {currentScene === 3 && <Scene4 key="coach" />}
          {currentScene === 4 && <Scene5 key="outro" />}
        </AnimatePresence>
      </div>
    </div>
  );
}

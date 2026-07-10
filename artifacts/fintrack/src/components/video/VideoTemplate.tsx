import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVideoPlayer } from '@/lib/video';
import { Scene1 } from './video_scenes/Scene1';
import { Scene2 } from './video_scenes/Scene2';
import { Scene3 } from './video_scenes/Scene3';
import { Scene4 } from './video_scenes/Scene4';
import { Scene5 } from './video_scenes/Scene5';
import { RecordOverlay } from './RecordOverlay';

// Total 50 seconds — 5 scenes × 10s each
const SCENE_DURATIONS = {
  intro:     10000,
  journal:   10000,
  analytics: 10000,
  coach:     10000,
  outro:     10000,
};

/** Persistent background layer — lives outside AnimatePresence for cross-scene continuity */
const AmbientBackground = ({ currentScene }: { currentScene: number }) => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none bg-[#0a0a0a] z-0">
    {/* Noise texture */}
    <div
      className="absolute inset-0 opacity-[0.035]"
      style={{
        backgroundImage:
          'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E")',
      }}
    />

    {/* Ambient glow */}
    <motion.div
      className="absolute inset-0 opacity-40 mix-blend-screen"
      style={{
        backgroundImage: `url(${import.meta.env.BASE_URL}images/glow.png)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
      animate={{
        scale:   [1, 1.05, 1.1, 1.05, 1][currentScene],
        opacity: [0.3, 0.4, 0.2, 0.5, 0.3][currentScene],
      }}
      transition={{ duration: 4, ease: 'easeInOut' }}
    />

    {/* Terminal perspective grid */}
    <div className="absolute inset-0 flex items-center justify-center perspective-[1200px] opacity-10 mix-blend-screen">
      <motion.div
        className="w-[300vh] h-[300vh]"
        style={{
          backgroundImage: `
            linear-gradient(to right,  rgba(255,255,255,0.04) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)
          `,
          backgroundSize: '6vh 6vh',
        }}
        animate={{
          rotateX: [70, 65, 75, 60, 70][currentScene],
          rotateZ: [0, 5, -5, 10, 0][currentScene],
          y:       ['0%', '5%', '-5%', '10%', '0%'][currentScene],
        }}
        transition={{ duration: 4, ease: [0.25, 0.1, 0.25, 1] }}
      />
    </div>

    {/* Persistent left accent line */}
    <motion.div
      className="absolute left-[6vw] top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-[#00ff87]/20 to-transparent"
      animate={{ opacity: [0, 0.5, 0.3, 0.8, 0.2][currentScene] }}
      transition={{ duration: 2, ease: 'easeOut' }}
    />
  </div>
);

export default function VideoTemplate() {
  const { currentScene } = useVideoPlayer({ durations: SCENE_DURATIONS });
  const audioRef = useRef<HTMLAudioElement>(null);
  const [muted, setMuted] = useState(true);

  // Attempt autoplay on mount; show unmute button if blocked
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 0.6;
    audio.loop = true;
    audio.muted = false;
    audio.play().then(() => setMuted(false)).catch(() => setMuted(true));
  }, []);

  const handleUnmute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = false;
    audio.play().catch(() => {});
    setMuted(false);
  };

  return (
    // Outer: full screen black background for letterbox on desktop
    <div className="w-full h-screen bg-black flex items-center justify-center">
      {/* Inner: 16:9 widescreen container */}
      <div
        className="relative overflow-hidden bg-[#0a0a0a] text-[#ededed]"
        style={{
          aspectRatio: '16 / 9',
          height: '100%',
          maxHeight: '100vh',
          maxWidth: 'calc(100vh * 16 / 9)',
          width: 'auto',
        }}
      >
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

        {/* Unmute button — shown when audio is blocked by browser */}
        <AnimatePresence>
          {muted && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              onClick={handleUnmute}
              className="absolute bottom-[10vh] left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-mono tracking-wider hover:bg-white/20 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11 5L6 9H2v6h4l5 4V5zM23 9l-6 6M17 9l6 6"/>
              </svg>
              TAP TO HEAR AUDIO
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

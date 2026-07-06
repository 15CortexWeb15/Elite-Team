import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TOTAL_DURATION_MS = 4000 + 5000 + 5000 + 5000 + 6000; // 25s

type State = 'idle' | 'waiting' | 'recording' | 'done';

export function RecordOverlay() {
  const [state, setState] = useState<State>('idle');
  const [progress, setProgress] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const blobUrlRef = useRef<string | null>(null);

  const startRecording = async () => {
    try {
      setState('waiting');
      const stream = await (navigator.mediaDevices as any).getDisplayMedia({
        video: { frameRate: 30, width: 1920, height: 1080 },
        audio: false,
        preferCurrentTab: true,
      });

      chunksRef.current = [];
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : 'video/webm';

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        stream.getTracks().forEach((t: MediaStreamTrack) => t.stop());
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        blobUrlRef.current = url;

        const a = document.createElement('a');
        a.href = url;
        a.download = 'roxel-promo.webm';
        a.click();

        if (intervalRef.current) clearInterval(intervalRef.current);
        setState('done');
      };

      stream.getVideoTracks()[0].onended = () => {
        if (recorder.state === 'recording') recorder.stop();
        if (intervalRef.current) clearInterval(intervalRef.current);
        setState('idle');
      };

      recorder.start(100);
      setState('recording');

      const startTime = Date.now();
      intervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const pct = Math.min(elapsed / TOTAL_DURATION_MS, 1);
        setProgress(pct);
        if (elapsed >= TOTAL_DURATION_MS) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          recorder.stop();
        }
      }, 100);

    } catch {
      setState('idle');
    }
  };

  const circumference = 2 * Math.PI * 18;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 pointer-events-none">
      <AnimatePresence mode="wait">
        {state === 'idle' && (
          <motion.button
            key="idle"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onClick={startRecording}
            className="pointer-events-auto flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-medium px-4 py-2 rounded-full backdrop-blur-md transition-colors cursor-pointer"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            Record & Download
          </motion.button>
        )}

        {state === 'waiting' && (
          <motion.div
            key="waiting"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="pointer-events-none bg-black/70 border border-white/20 text-white text-sm px-5 py-2.5 rounded-full backdrop-blur-md text-center"
          >
            Select <strong>this tab</strong> in the browser picker, then click Share
          </motion.div>
        )}

        {state === 'recording' && (
          <motion.div
            key="recording"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="pointer-events-none flex items-center gap-3 bg-black/70 border border-red-500/40 text-white text-sm px-5 py-2.5 rounded-full backdrop-blur-md"
          >
            <svg width="44" height="44" viewBox="0 0 44 44" className="-ml-1 -my-1">
              <circle cx="22" cy="22" r="18" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
              <circle
                cx="22" cy="22" r="18"
                fill="none"
                stroke="#00ff87"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={circumference * (1 - progress)}
                transform="rotate(-90 22 22)"
                style={{ transition: 'stroke-dashoffset 0.1s linear' }}
              />
            </svg>
            <span>
              Recording… <span className="font-mono text-[#00ff87]">{Math.round(progress * 100)}%</span>
            </span>
          </motion.div>
        )}

        {state === 'done' && (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="pointer-events-none flex items-center gap-2 bg-black/70 border border-[#00ff87]/40 text-white text-sm px-5 py-2.5 rounded-full backdrop-blur-md"
          >
            <span className="text-[#00ff87]">✓</span> Downloaded as <strong>roxel-promo.webm</strong>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

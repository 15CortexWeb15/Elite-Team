import { useState, useEffect } from 'react';

// Fallback implementation in case the environment doesn't provide it
export function useVideoPlayer({ durations }: { durations: Record<string, number> }) {
  const [currentScene, setCurrentScene] = useState(0);

  useEffect(() => {
    // Notify recording start
    if (typeof window !== 'undefined' && (window as any).startRecording) {
      (window as any).startRecording();
    }

    const sceneKeys = Object.keys(durations);
    const sceneValues = Object.values(durations);
    let totalTime = 0;
    const timeouts: ReturnType<typeof setTimeout>[] = [];

    sceneValues.forEach((duration, index) => {
      totalTime += duration;
      timeouts.push(
        setTimeout(() => {
          if (index === sceneValues.length - 1) {
            // Reached the end of the loop
            if (typeof window !== 'undefined' && (window as any).stopRecording) {
              (window as any).stopRecording();
            }
            setCurrentScene(0); // loop
          } else {
            setCurrentScene(index + 1);
          }
        }, totalTime)
      );
    });

    return () => timeouts.forEach(clearTimeout);
  }, [durations]);

  return { currentScene };
}
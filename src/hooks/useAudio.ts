import { useCallback } from "react";

// Global audio buffer cache
const audioBufferCache: Record<string, AudioBuffer> = {};
let webAudioContext: AudioContext | null = null;

const getAudioContext = () => {
  if (!webAudioContext) {
    webAudioContext = new (
      window.AudioContext || (window as any).webkitAudioContext
    )();
  }
  return webAudioContext;
};

export const useAudio = () => {
  const playSound = useCallback((audioPath: string) => {
    try {
      console.log("🔊 Playing audio:", audioPath);

      // Simple approach - just create and play audio element
      const audio = new Audio(audioPath);
      audio.volume = 0.5;

      const playPromise = audio.play();

      if (playPromise) {
        playPromise
          .then(() => {
            console.log("✅ Audio played:", audioPath);
          })
          .catch((error: Error) => {
            console.error("❌ Audio play failed:", audioPath, error.message);
          });
      }
    } catch (error) {
      console.error("❌ Audio error:", error);
    }
  }, []);

  return { playSound };
};

import { useEffect } from "react";

export default function AudioPreloader() {
  useEffect(() => {
    // Pre-load all audio files
    const audioFiles = [
      "/audio/click.mp3",
      "/audio/pilih.mp3",
      "/audio/start.mp3",
    ];

    console.log("🎵 Pre-loading audio files...");

    audioFiles.forEach((audioPath) => {
      try {
        const audio = new Audio(audioPath);
        audio.preload = "auto";
        audio.load();
        console.log("✅ Pre-loaded:", audioPath);
      } catch (error) {
        console.warn("⚠️ Could not pre-load:", audioPath, error);
      }
    });
  }, []);

  return null; // This component doesn't render anything
}

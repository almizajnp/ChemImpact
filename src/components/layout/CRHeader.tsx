import { Settings, User } from "lucide-react";
import React from "react";
import { useAudio } from "../../hooks/useAudio";

export default function CRHeader({
  title,
  onProfileClick,
  onSettingsClick,
  theme,
}: {
  title?: string;
  onProfileClick?: () => void;
  onSettingsClick?: () => void;
  theme?: { id: string; name: string; primary: string; secondary: string };
}) {
  const { playSound } = useAudio();
  return (
    <header
      className="fixed top-0 left-0 w-full z-50 px-4 py-3 pointer-events-none border-b"
      style={{
        backgroundColor: "#1a1a1a",
        borderColor: theme?.primary,
      }}
    >
      <div className="container mx-auto flex justify-between items-center pointer-events-auto gap-4">
        {/* Left: Logo - Desktop/Tablet Only */}
        <div className="hidden md:block flex-shrink-0">
          <img
            src="/images/logo2.png"
            alt="ChemImpact Logo"
            className="h-14 lg:h-24 w-auto object-cover"
          />
        </div>

        {/* Title - Desktop */}
        <div className="hidden md:flex flex-1 justify-center">
          <h1 className="font-clash text-white text-xl lg:text-2xl tracking-wide drop-shadow-md text-center">
            {title}
          </h1>
        </div>

        {/* Left: Player Info - Mobile Only */}
        <button
          className="md:hidden flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 shadow-lg hover:bg-white/10 transition focus:outline-none focus:ring-2 focus:ring-sky-400"
          onClick={() => {
            playSound("/audio/click.mp3");
            onProfileClick?.();
          }}
        >
          <div className="w-10 h-10 bg-blue-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center overflow-hidden">
            <User size={24} className="text-white" />
          </div>
          <span className="font-clash text-white text-base tracking-wide drop-shadow-md">
            Siswa
          </span>
        </button>

        {/* Center: Empty space for mobile, filled on desktop */}
        <div className="flex-1 md:flex-none"></div>

        {/* Right: Player Info + Settings - Visible on Desktop/Tablet */}
        <div className="hidden md:flex items-center gap-4">
          <button
            className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 shadow-lg hover:bg-white/10 transition focus:outline-none focus:ring-2 focus:ring-sky-400"
            onClick={() => {
              playSound("/audio/click.mp3");
              onProfileClick?.();
            }}
          >
            <div className="w-10 h-10 bg-blue-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center overflow-hidden">
              <User size={24} className="text-white" />
            </div>
            <span className="font-clash text-white text-lg tracking-wide drop-shadow-md">
              Siswa
            </span>
          </button>
          <button
            className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform"
            style={{
              backgroundColor: `${theme?.primary}40`,
              borderWidth: "2px",
              borderColor: theme?.primary,
            }}
            onClick={() => {
              playSound("/audio/click.mp3");
              onSettingsClick?.();
            }}
          >
            <Settings size={22} style={{ color: theme?.primary }} />
          </button>
        </div>

        {/* Right: Settings - Mobile Only */}
        <button
          className="md:hidden w-10 h-10 rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform"
          style={{
            backgroundColor: `${theme?.primary}40`,
            borderWidth: "2px",
            borderColor: theme?.primary,
          }}
          onClick={() => {
            playSound("/audio/click.mp3");
            onSettingsClick?.();
          }}
        >
          <Settings size={22} style={{ color: theme?.primary }} />
        </button>
      </div>
    </header>
  );
}

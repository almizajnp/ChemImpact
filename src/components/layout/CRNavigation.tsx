import { motion } from "motion/react";
import {
  Swords,
  Layers,
  ShoppingBag,
  Users,
  Trophy,
  Tv,
  Info,
  BookOpen,
} from "lucide-react";
import React from "react";
import { useAudio } from "../../hooks/useAudio";

interface CRNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  theme?: { id: string; name: string; primary: string; secondary: string };
}

export default function CRNavigation({
  activeTab,
  onTabChange,
  theme,
}: CRNavigationProps) {
  const { playSound } = useAudio();
  const tabs = [
    { id: "info", icon: <Info size={22} />, label: "Info" },
    { id: "materi", icon: <BookOpen size={22} />, label: "Materi" },
    { id: "battle", icon: <Swords size={32} />, label: "Battle", isMain: true },
    { id: "social", icon: <Users size={22} />, label: "Social" },
    { id: "events", icon: <Trophy size={22} />, label: "Leaderboard" },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 w-full border-t z-50 pb-safe shadow-2xl"
      style={{
        backgroundColor: "#1a1a1a",
        borderColor: theme?.primary,
      }}
    >
      <div className="container mx-auto max-w-lg flex justify-around items-end h-16 relative px-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => {
                playSound("/audio/click.mp3");
                onTabChange(tab.id);
              }}
              className={`
                relative flex flex-col items-center justify-center h-full transition-all duration-200
                ${tab.isMain ? "w-1/4 -mt-4" : "w-1/5 py-2"}
              `}
            >
              {/* Active Indicator Background */}
              {isActive && !tab.isMain && (
                <div
                  className="absolute inset-x-2 bottom-0 top-2 rounded-t-lg -z-10 border-t border-l border-r"
                  style={{
                    backgroundColor: `${theme?.primary}20`,
                    borderColor: theme?.primary,
                  }}
                ></div>
              )}

              <div
                className={`
                transition-transform duration-200 flex flex-col items-center
                ${isActive ? "scale-110" : "opacity-60 hover:opacity-80"}
                ${tab.isMain ? "p-3 rounded-full border-4 shadow-lg" : ""}
              `}
                style={{
                  backgroundColor: tab.isMain ? theme?.primary : "transparent",
                  borderColor: tab.isMain ? theme?.secondary : "transparent",
                  borderWidth: tab.isMain ? "4px" : "0px",
                }}
              >
                <div
                  className={tab.isMain ? "drop-shadow-md" : ""}
                  style={{
                    color: tab.isMain
                      ? "white"
                      : isActive
                        ? theme?.primary
                        : "#d1d5db",
                  }}
                >
                  {tab.icon}
                </div>

                {!tab.isMain && (
                  <span
                    className="text-[9px] font-bold mt-0.5 uppercase tracking-wide"
                    style={{
                      color: isActive ? theme?.primary : "#9ca3af",
                    }}
                  >
                    {tab.label}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

import CRButton from "../ui/CRButton";
import {
  Trophy,
  Settings,
  List,
  Award,
  Tv,
  Shield,
  BookOpen,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useAudio } from "../../hooks/useAudio";

interface ArenaProps {
  id: number;
  name: string;
  image: string;
  color?: string;
  isLocked?: boolean;
}

const arenas = [
  {
    id: 1,
    name: "Sungai Berbusa",
    image: "/images/bersih.png",
    color: "#3498db",
  },
  {
    id: 2,
    name: "Cooming Soon",
    image: "/images/cm.png",
    color: "#2ecc71",
  },
  {
    id: 3,
    name: "Cooming Soon",
    image: "/images/cm.png",
    color: "#9b59b6",
  },
];

const ArenaGraphic = ({ id, name, image, color = "#3498db" }: ArenaProps) => (
  <div className="relative w-full aspect-square mx-auto mb-4 select-none cursor-grab active:cursor-grabbing">
    {/* Island Base */}
    <div className="absolute inset-x-4 bottom-4 top-10 bg-[#1a2634] rounded-[40px] shadow-2xl transform rotate-x-12 border-b-8 border-[#0f1620]"></div>

    {/* Water/Liquid */}
    <div
      className="absolute inset-x-6 bottom-8 top-12 rounded-[30px] opacity-80 transition-colors duration-500"
      style={{ backgroundColor: color }}
    ></div>

    {/* The Arena Image (Floating Island) */}
    <div className="absolute inset-0 flex items-center justify-center z-10 p-6">
      <img
        src={image}
        alt={name}
        className="w-full h-full object-cover rounded-2xl"
      />
    </div>

    {/* Arena Name Label */}
    <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 z-20">
      <div className="bg-[#2c3e50] text-white font-clash text-xl px-6 py-1 rounded-full border-2 border-[#34495e] shadow-lg text-stroke whitespace-nowrap">
        {name}
      </div>
    </div>
  </div>
);

export default function BattleTab({
  onBattleClick,
  onArenaChange,
}: {
  onBattleClick: () => void;
  onArenaChange?: (id: number) => void;
}) {
  const { playSound } = useAudio();
  const [arenaIndex, setArenaIndex] = useState(0);
  const [selectedDesktopArena, setSelectedDesktopArena] = useState(
    arenas[0].id,
  );

  const nextArena = () => {
    setArenaIndex((prev) => {
      const newIndex = (prev + 1) % arenas.length;
      setSelectedDesktopArena(arenas[newIndex].id);
      onArenaChange?.(arenas[newIndex].id);
      return newIndex;
    });
  };

  const prevArena = () => {
    setArenaIndex((prev) => {
      const newIndex = (prev - 1 + arenas.length) % arenas.length;
      setSelectedDesktopArena(arenas[newIndex].id);
      onArenaChange?.(arenas[newIndex].id);
      return newIndex;
    });
  };

  return (
    <div className="pt-24 md:pt-32 lg:pt-40 pb-24 md:pb-48 lg:pb-56 px-2 md:px-4 lg:px-6 min-h-screen flex flex-col w-full mx-auto">
      {/* Brand Name (Logo Style) - Mobile Only */}
      <div className="md:hidden flex justify-center mb-8 md:mb-12 lg:mb-16 relative z-20">
        <div className="relative transform hover:scale-105 transition-transform duration-300 w-full max-w-sm md:max-w-md lg:max-w-2xl">
          <img
            src="/images/logo.png"
            alt="ChemImpact Logo"
            className="w-full h-auto object-cover rounded-lg"
          />
        </div>
      </div>

      {/* Arena Display Section */}
      <div className="flex-1 flex items-center justify-center relative mb-4 w-full">
        {/* Mobile: Slider View */}
        <div className="w-full md:hidden">
          {/* Background Overlay */}
          <div
            className="absolute inset-0 z-0 opacity-20 transition-colors duration-500 pointer-events-none"
            style={{
              background: `radial-gradient(circle at center, ${arenas[arenaIndex].color} 0%, transparent 70%)`,
            }}
          />

          {/* Center Arena Slider */}
          <div className="w-full px-2 relative h-64 flex items-center justify-center overflow-visible z-10">
            {/* Navigation Arrows */}
            <button
              onClick={() => {
                playSound("/audio/pilih.mp3");
                prevArena();
              }}
              className="absolute left-0 z-40 p-1 bg-black/20 rounded-full hover:bg-black/40 text-white/50 hover:text-white transition-colors"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={() => {
                playSound("/audio/pilih.mp3");
                nextArena();
              }}
              className="absolute right-0 z-40 p-1 bg-black/20 rounded-full hover:bg-black/40 text-white/50 hover:text-white transition-colors"
            >
              <ChevronRight size={24} />
            </button>

            <AnimatePresence mode="wait">
              <motion.div
                key={arenaIndex}
                initial={{ opacity: 0, x: 50, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -50, scale: 0.9 }}
                transition={{ duration: 0.3, ease: "backOut" }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={(e, { offset, velocity }) => {
                  const swipe = offset.x;
                  if (swipe < -50) {
                    nextArena();
                  } else if (swipe > 50) {
                    prevArena();
                  }
                }}
                className="w-full touch-pan-y"
              >
                <ArenaGraphic {...arenas[arenaIndex]} />
              </motion.div>
            </AnimatePresence>

            {/* Pagination Dots */}
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2">
              {arenas.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-2 h-2 rounded-full transition-colors ${idx === arenaIndex ? "bg-yellow-400" : "bg-gray-600"}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Desktop/Tablet: Grid View with Drag */}
        <div className="hidden md:flex w-full gap-6 lg:gap-8 max-w-6xl mx-auto items-center justify-center relative">
          {/* Left Arrow */}
          <button
            onClick={() => {
              playSound("/audio/pilih.mp3");
              prevArena();
            }}
            className="p-2 bg-black/20 rounded-full hover:bg-black/40 text-white/50 hover:text-white transition-colors flex-shrink-0"
          >
            <ChevronLeft size={32} />
          </button>

          {/* Draggable Grid Container */}
          <motion.div
            className="hidden md:grid w-full gap-6 lg:gap-8 md:grid-cols-2 lg:grid-cols-3"
            drag="x"
            dragConstraints={{ left: -100, right: 100 }}
            dragElastic={0.2}
            onDragEnd={(e, { offset, velocity }) => {
              const swipe = offset.x;
              if (swipe < -50) {
                nextArena();
              } else if (swipe > 50) {
                prevArena();
              }
            }}
          >
            {arenas.map((arena) => (
              <motion.div
                key={arena.id}
                className={`max-w-xs mx-auto w-full transition-all duration-300 transform cursor-grab active:cursor-grabbing ${
                  selectedDesktopArena === arena.id
                    ? "scale-110"
                    : "scale-100 opacity-75"
                }`}
                onClick={() => setSelectedDesktopArena(arena.id)}
                whileHover={{
                  scale: selectedDesktopArena === arena.id ? 1.15 : 1.05,
                }}
              >
                <ArenaGraphic {...arena} />
              </motion.div>
            ))}
          </motion.div>

          {/* Right Arrow */}
          <button
            onClick={() => {
              playSound("/audio/pilih.mp3");
              nextArena();
            }}
            className="p-2 bg-black/20 rounded-full hover:bg-black/40 text-white/50 hover:text-white transition-colors flex-shrink-0"
          >
            <ChevronRight size={32} />
          </button>
        </div>
      </div>

      {/* Battle Button */}
      <div className="flex justify-center mb-8 relative z-30 mt-16 md:mt-4">
        <CRButton
          variant="yellow"
          size="xl"
          className="w-48 shadow-[0_6px_0_#e65100,0_10px_10px_rgba(0,0,0,0.4)] active:shadow-[0_0_0_#e65100] active:translate-y-1.5 transition-all"
          onClick={() => {
            playSound("/audio/start.mp3");
            onBattleClick();
          }}
        >
          <span className="text-3xl drop-shadow-md text-stroke-lg">MULAI</span>
        </CRButton>
      </div>
    </div>
  );
}

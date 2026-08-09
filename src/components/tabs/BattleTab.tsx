import CRButton from "../ui/CRButton";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useAudio } from "../../hooks/useAudio";
import { ArenaMission } from "../../types/mission";

// BattleTab kini dinamis: daftar arena berasal dari parent (StudentDashboard)
// = misi default yang tidak disembunyikan guru + misi custom yang published.

interface ArenaGraphicProps {
  name: string;
  image: string;
  color?: string;
  isCustom?: boolean;
}

const ArenaGraphic = ({
  name,
  image,
  color = "#3498db",
  isCustom,
}: ArenaGraphicProps) => (
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
      {image ? (
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover rounded-2xl"
        />
      ) : (
        <div
          className="w-full h-full rounded-2xl flex items-center justify-center text-6xl"
          style={{
            background: `linear-gradient(135deg, ${color}, ${color}66)`,
          }}
        >
          🎮
        </div>
      )}
    </div>

    {/* Badge misi buatan guru */}
    {isCustom && (
      <div className="absolute top-6 right-6 z-20 bg-violet-600 text-white text-[10px] font-bold px-2 py-1 rounded-full border-2 border-violet-800 shadow-md">
        MISI GURU
      </div>
    )}

    {/* Arena Name Label */}
    <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 z-20 max-w-full px-2">
      <div className="bg-[#2c3e50] text-white font-clash text-xl px-6 py-1 rounded-full border-2 border-[#34495e] shadow-lg text-stroke whitespace-nowrap overflow-hidden text-ellipsis max-w-[280px]">
        {name}
      </div>
    </div>
  </div>
);

export interface BattleTabProps {
  missions: ArenaMission[]; // daftar arena dinamis dari parent
  onBattleClick: (missionId: number | string) => void;
  onArenaChange?: (id: number | string) => void;
  selectedMission?: number | string;
  onMissionChange?: (missionId: number | string) => void;
}

export default function BattleTab({
  missions,
  onBattleClick,
  onArenaChange,
  selectedMission,
  onMissionChange,
}: BattleTabProps) {
  const { playSound } = useAudio();

  const findIndex = (id?: number | string): number => {
    if (id === undefined) return 0;
    const idx = missions.findIndex((m) => m.id === id);
    return idx >= 0 ? idx : 0;
  };

  const [arenaIndex, setArenaIndex] = useState(findIndex(selectedMission));

  // Sync dengan selectedMission dari parent & jaga index tetap valid
  useEffect(() => {
    const idx = findIndex(selectedMission);
    setArenaIndex(idx < missions.length ? idx : 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMission, missions.length]);

  if (missions.length === 0) {
    return (
      <div className="pt-32 px-6 min-h-screen flex items-center justify-center">
        <div className="bg-[#2c3e50] text-white rounded-2xl border-4 border-[#34495e] shadow-2xl p-8 max-w-md text-center">
          <p className="text-4xl mb-3">🎮</p>
          <p className="font-clash text-xl mb-2">Belum Ada Misi</p>
          <p className="text-sm text-gray-300">
            Guru kelasmu belum mempublikasikan misi apapun. Silakan cek kembali
            nanti!
          </p>
        </div>
      </div>
    );
  }

  const currentArena = missions[arenaIndex] || missions[0];

  const goToIndex = (newIndex: number) => {
    const mission = missions[newIndex];
    setArenaIndex(newIndex);
    onArenaChange?.(mission.id);
    onMissionChange?.(mission.id);
    console.log(`🎯 Arena changed: index=${newIndex}, id=${mission.id}`);
  };

  const nextArena = () => goToIndex((arenaIndex + 1) % missions.length);
  const prevArena = () =>
    goToIndex((arenaIndex - 1 + missions.length) % missions.length);

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
      <div className="flex-1 flex items-center md:items-end justify-center relative mb-4 w-full pb-4">
        {/* Mobile: Slider View */}
        <div className="w-full md:hidden">
          {/* Background Overlay */}
          <div
            className="absolute inset-0 z-0 opacity-20 transition-colors duration-500 pointer-events-none"
            style={{
              background: `radial-gradient(circle at center, ${currentArena.color} 0%, transparent 70%)`,
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
                onDragEnd={(_e, { offset }) => {
                  const swipe = offset.x;
                  if (swipe < -50) {
                    nextArena();
                  } else if (swipe > 50) {
                    prevArena();
                  }
                }}
                className="w-full touch-pan-y"
              >
                <ArenaGraphic
                  name={currentArena.name}
                  image={currentArena.image}
                  color={currentArena.color}
                  isCustom={currentArena.source === "custom"}
                />
              </motion.div>
            </AnimatePresence>

            {/* Pagination Dots */}
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2">
              {missions.map((_, idx) => (
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
            className="hidden md:flex flex-1 items-center justify-center"
            drag="x"
            dragConstraints={{ left: -100, right: 100 }}
            dragElastic={0.2}
            onDragEnd={(_e, { offset }) => {
              const swipe = offset.x;
              if (swipe < -50) {
                nextArena();
              } else if (swipe > 50) {
                prevArena();
              }
            }}
          >
            {/* Tampilkan maksimal 3 arena sekaligus, berpusat pada arena aktif */}
            {missions
              .map((arena, idx) => ({ arena, idx }))
              .filter(({ idx }) => {
                if (missions.length <= 3) return true;
                const diff =
                  (idx - arenaIndex + missions.length) % missions.length;
                return diff === 0 || diff === 1 || diff === missions.length - 1;
              })
              .map(({ arena, idx }) => (
                <motion.div
                  key={String(arena.id)}
                  className={`max-w-xs mx-auto w-full transition-all duration-300 transform cursor-grab active:cursor-grabbing ${idx === arenaIndex ? "scale-110" : "scale-100 opacity-75"
                    }`}
                  onClick={() => {
                    playSound("/audio/pilih.mp3");
                    goToIndex(idx);
                  }}
                  whileHover={{
                    scale: idx === arenaIndex ? 1.15 : 1.05,
                  }}
                >
                  <ArenaGraphic
                    name={arena.name}
                    image={arena.image}
                    color={arena.color}
                    isCustom={arena.source === "custom"}
                  />
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
            onBattleClick(currentArena.id);
          }}
        >
          <span className="text-3xl drop-shadow-md text-stroke-lg">MULAI</span>
        </CRButton>
      </div>
    </div>
  );
}

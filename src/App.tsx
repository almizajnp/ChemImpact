import { useState, useEffect, useRef, createContext } from "react";
import CRHeader from "./components/layout/CRHeader";
import CRNavigation from "./components/layout/CRNavigation";
import StudentProfileModal from "./components/layout/StudentProfileModal";
import BattleTab from "./components/tabs/BattleTab";
import DeckTab from "./components/tabs/DeckTab";
import ShopTab from "./components/tabs/ShopTab";
import SocialTab from "./components/tabs/SocialTab";
import DecisionSim from "./components/DecisionSim";
import ComicStory from "./components/game/ComicStory";
import { motion, AnimatePresence } from "motion/react";
import { X, Music, Image as ImageIcon, Palette } from "lucide-react";

export const AudioContext = createContext<{
  bgmVolume: number;
  setBgmVolume: (volume: number) => void;
} | null>(null);

const themes = [
  { id: "gold", name: "Gold", primary: "#f1c40f", secondary: "#e67e22" },
  { id: "blue", name: "Blue", primary: "#3498db", secondary: "#2980b9" },
  { id: "purple", name: "Purple", primary: "#9b59b6", secondary: "#8e44ad" },
  { id: "green", name: "Green", primary: "#2ecc71", secondary: "#27ae60" },
  { id: "cyan", name: "Cyan", primary: "#1abc9c", secondary: "#16a085" },
];

export default function App() {
  const [bgmVolume, setBgmVolume] = useState(0.3);
  const [currentBg, setCurrentBg] = useState("bg.png");
  const [currentTheme, setCurrentTheme] = useState("gold");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("battle");
  const [isBattleMode, setIsBattleMode] = useState(false);
  const [selectedArenaId, setSelectedArenaId] = useState(1); // Default to Arena 1 (Sungai Berbusa)
  const bgMusicRef = useRef<HTMLAudioElement | null>(null);

  const studentProfile = {
    name: "Alya Rahma Putri",
    kelas: "X IPA 3",
    completedMissions: 2,
    totalMissions: 3,
    score: 1420,
    rank: "Silver",
    achievements: [
      "Menyelesaikan Misi Sungai Bersih",
      "Menjaga Konsumsi Air",
      "Juara Peringkat Lingkungan",
    ],
    missionDetails: [
      {
        id: 1,
        title: "Sungai Berbusa",
        status: "Selesai",
        points: 520,
      },
      {
        id: 2,
        title: "Tantangan Deterjen",
        status: "Selesai",
        points: 450,
      },
      {
        id: 3,
        title: "Misi Analisis Limbah",
        status: "Dalam Proses",
        points: 450,
      },
    ],
  };

  // Background music effect for battle tab
  useEffect(() => {
    if (!bgMusicRef.current) {
      bgMusicRef.current = new Audio("/audio/bs.mp3");
      bgMusicRef.current.loop = true;
    }

    bgMusicRef.current.volume = bgmVolume;

    if (activeTab === "battle" && !isBattleMode) {
      bgMusicRef.current.play().catch(() => {
        // Autoplay might be blocked, fail silently
      });
    } else {
      bgMusicRef.current.pause();
    }

    return () => {
      // Cleanup on unmount
    };
  }, [activeTab, isBattleMode, bgmVolume]);

  const renderTab = () => {
    switch (activeTab) {
      case "battle":
        return (
          <BattleTab
            onBattleClick={() => setIsBattleMode(true)}
            onArenaChange={(id) => setSelectedArenaId(id)}
          />
        );
      case "materi":
        return <DeckTab currentBg={currentBg} theme={theme} />;
      case "info":
        return <ShopTab currentBg={currentBg} theme={theme} />;
      case "social":
        return <SocialTab currentBg={currentBg} theme={theme} />;
      default:
        return (
          <div className="flex items-center justify-center min-h-screen text-gray-500 font-clash">
            Fitur {activeTab} segera hadir!
          </div>
        );
    }
  };

  const renderBattleContent = () => {
    if (selectedArenaId === 1) {
      return <ComicStory onClose={() => setIsBattleMode(false)} />;
    }
    return <DecisionSim />;
  };

  const getHeaderProps = () => {
    switch (activeTab) {
      case "materi":
        return { title: "Materi Pembelajaran" };
      case "info":
        return { title: "Info Pengembang" };
      case "battle":
        return { title: "ChemImpact" };
      default:
        return { title: "ChemImpact" };
    }
  };

  const headerProps = getHeaderProps();
  const theme = themes.find((t) => t.id === currentTheme) || themes[0];

  return (
    <div
      className="font-body antialiased min-h-screen text-white overflow-hidden"
      style={{
        backgroundImage: `url(/images/${currentBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <CRHeader
        title={headerProps.title}
        onProfileClick={() => setIsProfileOpen(true)}
        onSettingsClick={() => setIsSettingsOpen(true)}
        theme={theme}
      />

      <StudentProfileModal
        open={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        profile={studentProfile}
        theme={theme}
      />

      <main className="h-screen overflow-y-auto scrollbar-hide">
        {renderTab()}
      </main>

      <CRNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        theme={theme}
      />

      {/* Battle Mode Modal */}
      <AnimatePresence>
        {isBattleMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-[#1c2b36] flex flex-col"
          >
            {/* Battle Header */}
            <div className="p-4 flex justify-between items-center bg-[#2c3e50] border-b-4 border-black/20">
              <h2 className="font-clash text-2xl text-white text-stroke">
                {selectedArenaId === 1
                  ? "MISSION: SAVE THE RIVER"
                  : "BATTLE SIMULATION"}
              </h2>
              <button
                onClick={() => setIsBattleMode(false)}
                className="bg-red-500 p-2 rounded-lg border-2 border-red-700 shadow-md active:scale-95 transition-transform"
              >
                <X size={24} className="text-white" />
              </button>
            </div>

            {/* Battle Content */}
            <div className="flex-1 overflow-y-auto bg-[#f0f4f8]">
              {renderBattleContent()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AudioContext.Provider value={{ bgmVolume, setBgmVolume }}>
        <AnimatePresence>
          {isSettingsOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
              onClick={() => setIsSettingsOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-[#2c3e50] rounded-2xl p-8 max-w-md w-full border-4 border-[#34495e] shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <h2
                  className="font-clash text-3xl font-bold mb-8 text-stroke"
                  style={{ color: theme.primary }}
                >
                  Pengaturan
                </h2>

                {/* BGM Volume */}
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-3">
                    <Music size={24} style={{ color: theme.primary }} />
                    <span className="font-bold text-white">Musik Latar</span>
                    <span
                      className="ml-auto font-bold"
                      style={{ color: theme.primary }}
                    >
                      {Math.round(bgmVolume * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={bgmVolume * 100}
                    onChange={(e) =>
                      setBgmVolume(parseInt(e.target.value) / 100)
                    }
                    className="w-full h-2 bg-[#1a252f] rounded-lg appearance-none cursor-pointer"
                    style={{
                      accentColor: theme.primary,
                    }}
                  />
                </div>

                {/* Background Selector */}
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <ImageIcon size={24} style={{ color: theme.primary }} />
                    <span className="font-bold text-white">Latar Belakang</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {["bg.png", "bg2.png", "bg3.png"].map((bg, idx) => (
                      <button
                        key={bg}
                        onClick={() => setCurrentBg(bg)}
                        className={`relative h-20 rounded-lg overflow-hidden border-2 transition-all ${
                          currentBg === bg
                            ? "scale-105"
                            : "opacity-70 hover:opacity-100"
                        }`}
                        style={{
                          borderColor:
                            currentBg === bg ? theme.primary : "#34495e",
                        }}
                      >
                        <img
                          src={`/images/${bg}`}
                          alt={`Background ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Theme Selector */}
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <Palette size={24} style={{ color: theme.primary }} />
                    <span className="font-bold text-white">Warna Tema</span>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {themes.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setCurrentTheme(t.id)}
                        className={`h-10 rounded-lg border-2 transition-all ${
                          currentTheme === t.id
                            ? "scale-110"
                            : "opacity-70 hover:opacity-100"
                        }`}
                        style={{
                          backgroundColor: t.primary,
                          borderColor:
                            currentTheme === t.id ? t.secondary : "transparent",
                          borderWidth: currentTheme === t.id ? "3px" : "1px",
                        }}
                        title={t.name}
                      />
                    ))}
                  </div>
                </div>

                {/* Close Button */}
                <button
                  onClick={() => setIsSettingsOpen(false)}
                  className="w-full mt-8 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                  style={{
                    backgroundColor: theme.primary,
                  }}
                >
                  Tutup
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </AudioContext.Provider>
    </div>
  );
}

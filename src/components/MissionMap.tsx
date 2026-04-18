import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { Waves, Fish, Sprout, X, ArrowRight } from "lucide-react";
import { useAudio } from "../hooks/useAudio";
import ComicStory from "./game/ComicStory";

const missions = [
  {
    id: 1,
    title: "Ancaman Limbah Deterjen",
    description:
      "Memahami bagaimana surfaktan dan fosfat dalam deterjen dapat mencemari perairan dan memicu eutrofikasi.",
    icon: <Waves size={48} className="text-blue-500" />,
    color: "from-blue-400 to-blue-600",
    shadow: "shadow-blue-500/50",
    details:
      "Limbah deterjen mengandung surfaktan yang menurunkan tegangan permukaan air dan fosfat yang menjadi nutrisi berlebih bagi alga (eutrofikasi). Hal ini menyebabkan penurunan kadar oksigen terlarut dan kematian biota air.",
  },
  {
    id: 2,
    title: "Analisis Dampak Lingkungan",
    description:
      "Menganalisis dampak limbah deterjen terhadap ekosistem air dan kehidupan organisme.",
    icon: <Fish size={48} className="text-orange-500" />,
    color: "from-orange-400 to-red-500",
    shadow: "shadow-orange-500/50",
    details:
      "Dampak langsung terlihat pada insang ikan yang rusak, pertumbuhan eceng gondok yang tak terkendali, dan air yang menjadi keruh serta berbau. Rantai makanan terganggu, mengancam keanekaragaman hayati.",
  },
  {
    id: 3,
    title: "Solusi Green Chemistry",
    description:
      "Merancang solusi berbasis prinsip Green Chemistry untuk mengurangi pencemaran deterjen.",
    icon: <Sprout size={48} className="text-green-500" />,
    color: "from-green-400 to-emerald-600",
    shadow: "shadow-green-500/50",
    details:
      "Penerapan 12 prinsip Green Chemistry, seperti menggunakan bahan baku terbarukan (biodegradable surfactants), mendesain bahan kimia yang mudah terdegradasi, dan mencegah limbah pada sumbernya.",
  },
];

export default function MissionMap() {
  const { playSound } = useAudio();
  const [selectedMission, setSelectedMission] = useState<
    (typeof missions)[0] | null
  >(missions[1]); // Default memilih mission ke-2 (di tengah)
  const [showComic, setShowComic] = useState(false);

  // Desktop: Ambil index yang dipilih untuk carousel effect
  const selectedIndex = selectedMission ? missions.indexOf(selectedMission) : 1;

  if (showComic) {
    return <ComicStory onClose={() => setShowComic(false)} />;
  }

  return (
    <section
      id="missions"
      className="pt-20 md:pt-32 lg:pt-40 pb-20 relative"
      style={{
        backgroundImage: "url(/images/bg.png)",
        backgroundSize: "130%",
        backgroundPosition: "center",
      }}
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Pilih Misi
          </h2>
          <div className="h-2 w-32 bg-blue-500 mx-auto rounded-full"></div>
        </div>

        {/* Connecting Line (Desktop) */}
        <div className="hidden md:block absolute top-1/2 left-0 w-full h-2 bg-gray-200 -z-0 transform -translate-y-1/2"></div>

        {/* MOBILE VIEW - Single Column */}
        <div className="md:hidden">
          <div className="relative z-10">
            {selectedMission && (
              <motion.div
                key={selectedMission.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                transition={{ duration: 0.3 }}
                className="relative group cursor-pointer"
                onClick={() => setSelectedMission(selectedMission)}
              >
                {/* Level Badge */}
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20 bg-yellow-400 text-yellow-900 font-black px-4 py-1 rounded-full shadow-lg border-2 border-white text-sm uppercase tracking-wider">
                  Level {selectedMission.id}
                </div>

                {/* Card Container */}
                <div
                  className={`bg-white rounded-3xl p-1 border-4 border-gray-200 hover:border-blue-400 transition-colors duration-300 h-full shadow-xl ${selectedMission.shadow}`}
                >
                  <div className="bg-gray-50 rounded-2xl p-6 h-full flex flex-col items-center text-center relative overflow-hidden">
                    {/* Background Pattern */}
                    <div
                      className={`absolute top-0 left-0 w-full h-32 bg-gradient-to-b ${selectedMission.color} opacity-20 rounded-t-2xl`}
                    ></div>

                    {/* Icon Circle */}
                    <div className="w-24 h-24 bg-white rounded-full shadow-lg flex items-center justify-center mb-6 z-10 border-4 border-gray-100 group-hover:scale-110 transition-transform duration-300">
                      {selectedMission.icon}
                    </div>

                    <h3 className="font-display text-2xl font-bold text-gray-800 mb-3">
                      {selectedMission.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-6 flex-grow">
                      {selectedMission.description}
                    </p>

                    <button
                      className={`px-6 py-2 rounded-xl font-bold text-white bg-gradient-to-r ${selectedMission.color} shadow-md transform active:scale-95 transition-all w-full`}
                      onClick={() => {
                        if (selectedMission.id === 1) {
                          setShowComic(true);
                        }
                      }}
                    >
                      MULAI
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Mobile Navigation */}
          <div className="flex gap-2 mt-8 justify-center">
            {missions.map((mission) => (
              <button
                key={mission.id}
                onClick={() => {
                  playSound("/audio/pilih.mp3");
                  setSelectedMission(mission);
                }}
                className={`w-3 h-3 rounded-full transition-all ${
                  selectedMission?.id === mission.id
                    ? "bg-blue-500 w-8"
                    : "bg-gray-300"
                }`}
              ></button>
            ))}
          </div>
        </div>

        {/* DESKTOP VIEW - Carousel with all 3 visible */}
        <div className="hidden md:block">
          <div className="relative w-full h-96 flex items-center justify-center perspective">
            <div className="absolute inset-0 flex items-center justify-center">
              {missions.map((mission, index) => {
                const offset = index - selectedIndex;
                return (
                  <motion.div
                    key={mission.id}
                    animate={{
                      x: offset * 420,
                      opacity: Math.abs(offset) > 1 ? 0 : 1,
                      pointerEvents: Math.abs(offset) > 1 ? "none" : "auto",
                    }}
                    transition={{
                      duration: 0.5,
                      type: "spring",
                      stiffness: 100,
                      damping: 15,
                    }}
                    className={`absolute flex-shrink-0 w-80 cursor-pointer relative group`}
                    onClick={() => {
                      playSound("/audio/pilih.mp3");
                      setSelectedMission(mission);
                    }}
                  >
                    {/* Level Badge */}
                    <div
                      className={`absolute -top-4 left-1/2 transform -translate-x-1/2 z-20 font-black px-4 py-1 rounded-full shadow-lg border-2 border-white text-sm uppercase tracking-wider transition-all ${
                        selectedMission?.id === mission.id
                          ? "bg-yellow-400 text-yellow-900"
                          : "bg-gray-400 text-gray-700"
                      }`}
                    >
                      Level {mission.id}
                    </div>

                    {/* Card Container */}
                    <div
                      className={`bg-white rounded-3xl p-1 border-4 transition-all duration-300 h-full shadow-xl ${
                        selectedMission?.id === mission.id
                          ? `border-yellow-400 ${mission.shadow}`
                          : "border-gray-200"
                      }`}
                    >
                      <div className="bg-gray-50 rounded-2xl p-6 h-full flex flex-col items-center text-center relative overflow-hidden">
                        {/* Background Pattern */}
                        <div
                          className={`absolute top-0 left-0 w-full h-32 bg-gradient-to-b ${mission.color} transition-opacity duration-300 ${
                            selectedMission?.id === mission.id
                              ? "opacity-30"
                              : "opacity-10"
                          } rounded-t-2xl`}
                        ></div>

                        {/* Icon Circle */}
                        <div
                          className={`w-24 h-24 bg-white rounded-full shadow-lg flex items-center justify-center mb-6 z-10 border-4 transition-all duration-300 ${
                            selectedMission?.id === mission.id
                              ? "border-yellow-400"
                              : "border-gray-100"
                          } group-hover:scale-110`}
                        >
                          {mission.icon}
                        </div>

                        <h3
                          className={`font-display text-xl lg:text-2xl font-bold mb-3 transition-colors ${
                            selectedMission?.id === mission.id
                              ? "text-gray-800"
                              : "text-gray-600"
                          }`}
                        >
                          {mission.title}
                        </h3>
                        <p
                          className={`text-sm mb-6 flex-grow transition-colors ${
                            selectedMission?.id === mission.id
                              ? "text-gray-600"
                              : "text-gray-500"
                          }`}
                        >
                          {mission.description}
                        </p>

                        <button
                          className={`px-6 py-2 rounded-xl font-bold text-white bg-gradient-to-r ${mission.color} shadow-md transform active:scale-95 transition-all w-full opacity-100`}
                          onClick={() => {
                            if (mission.id === 1) {
                              setShowComic(true);
                            }
                          }}
                        >
                          MULAI
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Mission Modal - Mobile Only */}
      <AnimatePresence>
        {selectedMission && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm md:hidden"
            onClick={() => setSelectedMission(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border-4 border-white relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className={`h-32 bg-gradient-to-r ${selectedMission.color} flex items-center justify-center relative`}
              >
                <button
                  onClick={() => setSelectedMission(null)}
                  className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 p-2 rounded-full text-white transition-colors"
                >
                  <X size={24} />
                </button>
                <div className="bg-white p-4 rounded-full shadow-lg mt-16">
                  {selectedMission.icon}
                </div>
              </div>

              <div className="pt-16 pb-8 px-8 text-center">
                <h3 className="font-display text-3xl font-bold text-gray-800 mb-4">
                  {selectedMission.title}
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {selectedMission.details}
                </p>

                <div className="flex gap-4 justify-center">
                  <button
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 px-6 rounded-xl transition-colors"
                    onClick={() => setSelectedMission(null)}
                  >
                    Kembali
                  </button>
                  <button
                    className={`flex-1 bg-gradient-to-r ${selectedMission.color} text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2`}
                    onClick={() => {
                      setSelectedMission(null);
                      document
                        .getElementById("decision")
                        ?.scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    Mainkan <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

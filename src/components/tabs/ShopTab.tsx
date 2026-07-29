import { GraduationCap, Code } from "lucide-react";

interface ShopTabProps {
  currentBg?: string;
  theme?: { id: string; name: string; primary: string; secondary: string };
}

export default function ShopTab({ currentBg = "bg.png", theme }: ShopTabProps) {
  return (
    <div
      className="w-full min-h-screen pt-12 md:pt-20 pb-28 md:pb-32 px-4 md:px-6 flex flex-col items-center justify-start overflow-y-auto"
      style={{
        backgroundImage: `url(/images/${currentBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="w-full max-w-4xl mx-auto space-y-6">
        {/* MOBILE HEADER - Tim Pengembang */}
        <div
          className="md:hidden rounded-2xl p-4 shadow-xl border-2 text-center flex flex-col items-center justify-center"
          style={{
            backgroundColor: theme?.secondary
              ? `${theme.secondary}cc`
              : "rgba(51, 51, 51, 0.8)",
            borderColor: theme?.primary ?? "#1a252f",
          }}
        >
          <h2
            className="font-clash text-xl font-extrabold text-white tracking-wide"
            style={{ color: theme?.primary ?? "#ffffff" }}
          >
            Tim Pengembang
          </h2>
        </div>

        {/* CHARACTER SHOWCASE GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* PENGEMBANG MEDIA HERO CARD */}
          <div
            className="rounded-3xl p-6 sm:p-8 border-2 shadow-2xl backdrop-blur-md flex flex-col items-center text-center group transition-all duration-300 relative overflow-hidden"
            style={{
              backgroundColor: theme?.primary
                ? `${theme.primary}ff`
                : "rgba(46, 119, 221, 1)",
              borderColor: theme?.primary ? `${theme.primary}90` : "#ffffff20",
            }}
          >
            <div className="relative mb-5 z-10">
              <div className="relative">
                <img
                  src="/images/p1.jpeg"
                  alt="Al Miza Jolietah Nizar Putri"
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-white/80 shadow-2xl object-cover ring-4 ring-white/20 group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute -top-2 -right-2 bg-white text-slate-900 p-1.5 rounded-full shadow-lg border-2 border-white/50">
                  <Code size={16} />
                </span>
              </div>
              <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-white/20 backdrop-blur-md text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-md border border-white/30 whitespace-nowrap flex items-center gap-1">
                Pengembang
              </span>
            </div>

            <div className="mt-2 space-y-2 w-full z-10">
              <h3 className="text-lg sm:text-xl font-black text-white leading-snug tracking-wide">
                Al Miza Jolietah Nizar Putri
              </h3>
              <div className="pt-2 border-t border-white/20 mt-3">
                <p className="text-xs text-slate-100 font-medium flex items-center justify-center gap-1.5">
                  <span>🏛️</span> Universitas Negeri Malang
                </p>
              </div>
            </div>
          </div>

          {/* DOSEN PEMBIMBING HERO CARD */}
          <div
            className="rounded-3xl p-6 sm:p-8 border-2 shadow-2xl backdrop-blur-md flex flex-col items-center text-center group transition-all duration-300 relative overflow-hidden"
            style={{
              backgroundColor: theme?.primary
                ? `${theme.primary}ff`
                : "rgba(46, 119, 221, 1)",
              borderColor: theme?.primary ? `${theme.primary}90` : "#ffffff20",
            }}
          >
            <div className="relative mb-5 z-10">
              <div className="relative">
                <img
                  src="/images/p2.jpeg"
                  alt="Prof. Dra. Sri Rahayu, M.Ed., Ph.D."
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-white/80 shadow-2xl object-cover ring-4 ring-white/20 group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute -top-2 -right-2 bg-white text-slate-900 p-1.5 rounded-full shadow-lg border-2 border-white/50">
                  <GraduationCap size={16} />
                </span>
              </div>
              <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-white/20 backdrop-blur-md text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-md border border-white/30 whitespace-nowrap flex items-center gap-1">
                Dosen Pembimbing
              </span>
            </div>

            <div className="mt-2 space-y-2 w-full z-10">
              <h3 className="text-lg sm:text-xl font-black text-white leading-snug tracking-wide">
                Prof. Dra. Sri Rahayu, M.Ed., Ph.D.
              </h3>
              <div className="pt-2 border-t border-white/20 mt-3">
                <p className="text-xs text-slate-100 font-medium flex items-center justify-center gap-1.5">
                  <span>🏛️</span> Universitas Negeri Malang
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

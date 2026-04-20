import { Info } from "lucide-react";

interface ShopTabProps {
  currentBg?: string;
  theme?: { id: string; name: string; primary: string; secondary: string };
}

export default function ShopTab({ currentBg = "bg.png", theme }: ShopTabProps) {
  return (
    <div className="pt-20 pb-24 px-4 min-h-screen flex flex-col items-center overflow-y-auto" style={{
        backgroundImage: `url(/images/${currentBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }} >
      <div
        className="w-full max-w-2xl rounded-2xl p-5 border-4 shadow-xl text-center flex flex-col mt-24"
        style={{
          backgroundColor: theme?.secondary
            ? `${theme.secondary}cc`
            : "rgba(51,51,51,0.8)",
          borderColor: theme?.primary ?? "#1a252f",
          maxHeight: "calc(100vh - 140px)",
          overflowY: "auto",
        }}
      >
        <div
          className="w-20 h-20 rounded-full mx-auto mb-3 border-3 border-white flex items-center justify-center shadow-lg"
          style={{ backgroundColor: theme?.primary ?? "#3498db" }}
        >
          <Info size={40} className="text-white" />
        </div>

        <h2
          className="font-clash text-2xl text-stroke mb-2"
          style={{ color: theme?.primary ?? "#ffffff" }}
        >
          Info Pengembang
        </h2>
        <p className="text-slate-100 mb-5 font-medium text-sm">
          Halaman ini berisi informasi mengenai pengembang media dan pihak yang terkait.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          <div
            className="rounded-xl p-4 border-2 overflow-y-auto"
            style={{
              backgroundColor: theme?.primary
                ? `${theme.primary}ff`
                : "rgba(46, 119, 221, 1)",
              borderColor: theme?.primary ? `${theme.primary}90` : "#ffffff20",
              maxHeight: "calc(100vh - 420px)",
            }}
          >
            <div className="flex flex-col items-center gap-3 text-center md:text-left md:flex-row md:items-start">
              <img
                src="/images/p1.jpeg"
                alt="Al Miza Jolietah Nizar Putri"
                className="w-12 h-12 rounded-full border-2 border-white/20 shadow-md object-cover flex-shrink-0"
              />
              <div>
                <p className="text-xs text-white font-bold uppercase">
                  Pengembang
                </p>
                <p className="text-white font-bold text-sm md:text-md whitespace-nowrap">Al Miza Jolietah Nizar Putri</p>
                <p className="text-xs text-slate-200">Universitas Negeri Malang</p>
              </div>
            </div>
          </div>

          <div
            className="rounded-xl p-4 border-2 overflow-y-auto"
            style={{
              backgroundColor: theme?.primary
                ? `${theme.primary}ff`
                : "rgba(46, 119, 221, 1)",
              borderColor: theme?.primary ? `${theme.primary}90` : "#ffffff20",
              maxHeight: "calc(100vh - 420px)",
            }}
          >
            <div className="flex flex-col items-center gap-3 text-center md:text-left md:flex-row md:items-start">
              <img
                src="/images/p2.jpeg"
                alt="Prof. Dra. Sri Rahayu, M.Ed., Ph.D."
                className="w-12 h-12 rounded-full border-2 border-white/20 shadow-md object-cover flex-shrink-0"
              />
              <div>
                <p className="text-xs text-white font-bold uppercase">
                  Dosen Pembimbing
                </p>
                <p className="text-white font-bold text-sm md:text-md whitespace-nowrap">
                  Prof. Dra. Sri Rahayu, M.Ed., Ph.D.
                </p>
                <p className="text-xs text-slate-200">Universitas Negeri Malang</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

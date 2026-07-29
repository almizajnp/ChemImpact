import { useEffect, useState } from "react";
import { subscribeToLeaderboard, StudentScore } from "../../lib/firestore";
import { TrendingUp, Trophy } from "lucide-react";
import { motion } from "motion/react";

interface LeaderboardTabProps {
  theme?: { id: string; name: string; primary: string; secondary: string };
}

export default function LeaderboardTab({ theme }: LeaderboardTabProps) {
  const [students, setStudents] = useState<StudentScore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToLeaderboard((studentList) => {
      setStudents(studentList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const getInitial = (name?: string) => (name?.trim()?.[0] || "?").toUpperCase();

  const formatKelas = (kelas?: string) => {
    if (!kelas || kelas === "Unknown Class" || kelas === "Kelas") return "Siswa";
    return kelas;
  };

  const maxScore = students.length > 0 ? Math.max(...students.map((s) => s.totalScore), 1) : 1;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block">
            <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="mt-4 text-xs sm:text-sm text-gray-200 font-clash">
            Memuat papan peringkat...
          </p>
        </div>
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] px-4">
        <Trophy className="w-12 h-12 sm:w-16 sm:h-16 text-amber-400 mb-4 animate-bounce" />
        <p className="text-white font-clash text-center text-xs sm:text-sm max-w-md bg-slate-900/80 backdrop-blur-md p-4 sm:p-5 rounded-3xl border border-white/20 shadow-xl">
          Belum ada skor siswa. Selesaikan misi dan kumpulkan poin pertama kamu!
        </p>
      </div>
    );
  }

  // Top 3 Podium
  const rank1 = students[0];
  const rank2 = students[1];
  const rank3 = students[2];
  const restStudents = students.slice(3);

  return (
    <div className="w-full max-w-4xl mx-auto pt-2 sm:pt-4 px-2 sm:px-4 md:px-6 pb-28 md:pb-32">
      {/* Header */}
      <div className="mb-4 sm:mb-6 flex flex-col items-center justify-center gap-2 sm:gap-3">
        <img
          src="/images/ld.png"
          alt="Leaderboard"
          className="h-32 sm:h-44 md:h-56 object-contain filter drop-shadow-md"
        />
        <p
          className="text-white font-clash text-center text-[11px] sm:text-xs md:text-sm px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-2xl shadow-lg border border-white/20 max-w-xl"
          style={{
            backgroundColor: theme?.primary
              ? `${theme.primary}50`
              : "rgba(15, 23, 42, 0.75)",
            backdropFilter: "blur(12px)",
          }}
        >
          🏆 Peringkat siswa berdasarkan total skor yang diperoleh dari menyelesaikan misi & tantangan
        </p>
      </div>

      {/* TOP 3 PODIUM SHOWCASE */}
      {students.length > 0 && (
        <div className="mb-6 sm:mb-10 pt-2 px-0.5 sm:px-2">
          <div className="flex items-end justify-center gap-1.5 sm:gap-3 md:gap-5 max-w-2xl mx-auto">
            {/* RANK 2 (SILVER) */}
            {rank2 ? (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex-1 flex flex-col items-center group cursor-pointer min-w-0"
              >
                <div className="w-full bg-slate-800/90 rounded-2xl p-2 sm:p-3 md:p-4 border border-slate-600/80 flex flex-col items-center shadow-lg hover:border-slate-400 transition-all">
                  <div className="relative mb-1 sm:mb-2">
                    <div className="w-11 h-11 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-slate-200 to-slate-400 p-0.5 shadow-lg">
                      <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-white font-bold text-xs sm:text-lg md:text-xl">
                        {getInitial(rank2.siswaName)}
                      </div>
                    </div>
                    <span className="absolute -bottom-1.5 -right-1 text-sm sm:text-xl md:text-2xl filter drop-shadow">
                      🥈
                    </span>
                  </div>
                  <h4 className="text-[11px] sm:text-xs md:text-sm font-bold text-white text-center truncate w-full px-0.5">
                    {rank2.siswaName}
                  </h4>
                  <p className="text-[9px] sm:text-[11px] text-slate-400 font-medium mb-1.5 sm:mb-3 truncate w-full text-center">
                    {formatKelas(rank2.kelas)}
                  </p>
                  <div className="w-full bg-slate-700/80 rounded-xl p-1 sm:p-2 text-center border border-slate-600">
                    <span className="text-[9px] sm:text-[10px] font-bold text-slate-300 uppercase tracking-wider block">
                      🥈 JUARA 2
                    </span>
                    <span className="text-xs sm:text-sm md:text-base font-extrabold text-white">
                      {rank2.totalScore} <span className="text-[9px] sm:text-[10px] font-normal text-slate-300">pts</span>
                    </span>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="flex-1"></div>
            )}

            {/* RANK 1 (GOLD) */}
            {rank1 && (
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="flex-1 flex flex-col items-center group cursor-pointer -mt-4 sm:-mt-6 z-10 min-w-0"
              >
                <div className="w-full bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl p-2.5 sm:p-4 md:p-5 border-2 border-yellow-400/90 flex flex-col items-center shadow-xl ring-2 sm:ring-4 ring-yellow-400/20 hover:border-yellow-300 transition-all relative">
                  <span className="absolute -top-4 sm:-top-5 left-1/2 -translate-x-1/2 text-xl sm:text-2xl md:text-3xl animate-bounce">
                    👑
                  </span>
                  <div className="relative mb-1 sm:mb-2 mt-1">
                    <div className="w-13 h-13 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-yellow-300 via-amber-400 to-yellow-600 p-0.5 sm:p-1 shadow-xl">
                      <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center text-amber-300 font-extrabold text-sm sm:text-xl md:text-2xl">
                        {getInitial(rank1.siswaName)}
                      </div>
                    </div>
                    <span className="absolute -bottom-1.5 -right-1 text-base sm:text-2xl md:text-3xl filter drop-shadow">
                      🥇
                    </span>
                  </div>
                  <h4 className="text-xs sm:text-sm md:text-base font-black text-amber-300 text-center truncate w-full px-0.5">
                    {rank1.siswaName}
                  </h4>
                  <p className="text-[10px] sm:text-xs text-amber-200/80 font-medium mb-1.5 sm:mb-3 truncate w-full text-center">
                    {formatKelas(rank1.kelas)}
                  </p>
                  <div className="w-full bg-gradient-to-r from-amber-500/30 via-yellow-500/20 to-amber-500/30 rounded-xl p-1.5 sm:p-2.5 text-center border border-amber-400/60 shadow-inner">
                    <span className="text-[9px] sm:text-[10px] font-black text-amber-300 uppercase tracking-widest block">
                      👑 JUARA 1
                    </span>
                    <span className="text-xs sm:text-base md:text-xl font-black text-amber-300">
                      {rank1.totalScore} <span className="text-[9px] sm:text-xs font-normal text-amber-200">pts</span>
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* RANK 3 (BRONZE) */}
            {rank3 ? (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex-1 flex flex-col items-center group cursor-pointer min-w-0"
              >
                <div className="w-full bg-slate-800/90 rounded-2xl p-2 sm:p-3 md:p-4 border border-amber-800/60 flex flex-col items-center shadow-lg hover:border-amber-600 transition-all">
                  <div className="relative mb-1 sm:mb-2">
                    <div className="w-11 h-11 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 p-0.5 shadow-lg">
                      <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-white font-bold text-xs sm:text-lg md:text-xl">
                        {getInitial(rank3.siswaName)}
                      </div>
                    </div>
                    <span className="absolute -bottom-1.5 -right-1 text-sm sm:text-xl md:text-2xl filter drop-shadow">
                      🥉
                    </span>
                  </div>
                  <h4 className="text-[11px] sm:text-xs md:text-sm font-bold text-white text-center truncate w-full px-0.5">
                    {rank3.siswaName}
                  </h4>
                  <p className="text-[9px] sm:text-[11px] text-amber-200/70 font-medium mb-1.5 sm:mb-3 truncate w-full text-center">
                    {formatKelas(rank3.kelas)}
                  </p>
                  <div className="w-full bg-amber-900/40 rounded-xl p-1 sm:p-2 text-center border border-amber-700/60">
                    <span className="text-[9px] sm:text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                      🥉 JUARA 3
                    </span>
                    <span className="text-xs sm:text-sm md:text-base font-extrabold text-white">
                      {rank3.totalScore} <span className="text-[9px] sm:text-[10px] font-normal text-amber-200">pts</span>
                    </span>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="flex-1"></div>
            )}
          </div>
        </div>
      )}

      {/* REST OF LEADERBOARD LIST (RANK 4+) */}
      {restStudents.length > 0 && (
        <div className="space-y-2.5 sm:space-y-3">
          <h3 className="text-[11px] sm:text-xs uppercase tracking-widest text-slate-300 font-bold px-1 sm:px-2 mb-2">
            Peringkat Lainnya
          </h3>
          {restStudents.map((student, index) => {
            const position = index + 4;
            const percentage = (student.totalScore / maxScore) * 100;

            return (
              <motion.div
                key={student.siswaId}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.04 }}
                className="group"
              >
                <div className="bg-white/90 backdrop-blur-md rounded-2xl p-3 sm:p-4 shadow-sm hover:shadow-md transition-all duration-200 border border-slate-200/80 hover:border-emerald-400">
                  <div className="flex items-center justify-between gap-2.5 sm:gap-3">
                    {/* Left: Rank & Avatar & Name */}
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                      <span className="text-[11px] sm:text-xs font-bold text-slate-500 bg-slate-100 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full flex-shrink-0">
                        #{position}
                      </span>
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-xs sm:text-sm shadow-xs flex-shrink-0">
                        {getInitial(student.siswaName)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-xs sm:text-sm font-bold text-slate-900 truncate group-hover:text-emerald-700 transition-colors">
                          {student.siswaName}
                        </h3>
                        <p className="text-[10px] sm:text-xs text-slate-500 truncate">
                          {formatKelas(student.kelas)}
                        </p>
                      </div>
                    </div>

                    {/* Right: Score */}
                    <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
                      <TrendingUp size={14} className="text-emerald-600 sm:w-4 sm:h-4" />
                      <span className="text-sm sm:text-base font-extrabold text-slate-900">
                        {student.totalScore}
                      </span>
                      <span className="text-[10px] sm:text-xs text-slate-400">pts</span>
                    </div>
                  </div>

                  {/* Relative Score Bar */}
                  <div className="mt-2.5 sm:mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ delay: index * 0.04 + 0.2, duration: 0.5 }}
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Footer Info Banner */}
      <div className="mt-6 sm:mt-8 p-3.5 sm:p-4 bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-xs">
        <p className="text-[11px] sm:text-xs md:text-sm text-slate-700 font-medium text-center flex items-center justify-center gap-2">
          <span>💡</span> Peringkat diperbarui secara real-time! Tunjukkan kemampuanmu dan raih skor tertinggi!
        </p>
      </div>
    </div>
  );
}

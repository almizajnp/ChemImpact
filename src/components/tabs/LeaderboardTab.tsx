import { useEffect, useState } from "react";
import { subscribeToLeaderboard, StudentScore } from "../../lib/firestore";
import { Medal, TrendingUp, Trophy } from "lucide-react";
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

  const getMedalIcon = (position: number) => {
    if (position === 1) return "🥇";
    if (position === 2) return "🥈";
    if (position === 3) return "🥉";
    return null;
  };

  const getRankColor = (position: number) => {
    if (position === 1) return "from-yellow-400 to-yellow-600";
    if (position === 2) return "from-gray-300 to-gray-500";
    if (position === 3) return "from-orange-400 to-orange-600";
    return "from-slate-200 to-slate-400";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="mt-4 text-gray-600 font-clash">
            Loading leaderboard...
          </p>
        </div>
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] px-4">
        <Trophy className="w-16 h-16 text-gray-300 mb-4" />
        <p className="text-gray-600 font-clash text-center">
          No student scores yet. Start playing to appear on the leaderboard!
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto pt-4 px-4 md:px-6 pb-24"> 
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Medal size={32} style={{ color: theme?.primary }} />
          <h1
            className="text-3xl font-bold font-clash"
            style={{ color: theme?.primary }}
          >
            Leaderboard
          </h1>
        </div>
        <p className="text-gray-600 font-clash">Student rankings by score</p>
      </div>

      {/* Leaderboard List */}
      <div className="space-y-3">
        {students.map((student, index) => {
          const position = index + 1;
          const medal = getMedalIcon(position);
          const rankColor = getRankColor(position);

          return (
            <motion.div
              key={student.siswaId}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group"
            >
              <div
                className={`bg-gradient-to-r ${rankColor} p-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 cursor-pointer border-2 border-white/50`}
              >
                <div className="flex items-center justify-between">
                  {/* Left side: Position and Medal */}
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-14 h-14 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center">
                      <div className="text-center">
                        {medal && <span className="text-2xl">{medal}</span>}
                        {!medal && (
                          <span className="text-xl font-bold text-white">
                            #{position}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Student Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-white font-clash truncate">
                        {student.siswaName}
                      </h3>
                      <p className="text-sm text-white/80 font-clash">
                        {student.kelas || "No Class"}
                      </p>
                    </div>
                  </div>

                  {/* Right side: Score */}
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-1">
                      <TrendingUp size={18} className="text-white" />
                      <span className="text-2xl font-bold text-white font-clash">
                        {student.totalScore}
                      </span>
                    </div>
                    <p className="text-xs text-white/70 font-clash">points</p>
                  </div>
                </div>

                {/* Score bar */}
                <div className="mt-3 h-1.5 bg-white/20 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${Math.min((student.totalScore / 100) * 100, 100)}%`,
                    }}
                    transition={{ delay: index * 0.05 + 0.3, duration: 0.6 }}
                    className="h-full bg-white/60 rounded-full"
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Footer info */}
      <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
        <p className="text-sm text-gray-700 font-clash text-center">
          💡 Rankings update in real-time! Score points by completing missions
          and quizzes.
        </p>
      </div>
    </div>
  );
}

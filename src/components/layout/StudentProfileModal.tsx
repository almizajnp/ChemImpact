import { AnimatePresence, motion } from "motion/react";
import { CheckCircle2, Trophy, X, ShieldCheck } from "lucide-react";
import React from "react";

type MissionProgress = {
  id: number;
  title: string;
  status: string;
  points: number;
};

type StudentProfile = {
  name: string;
  kelas: string;
  completedMissions: number;
  totalMissions: number;
  score: number;
  rank: string;
  achievements: string[];
  missionDetails: MissionProgress[];
};

export default function StudentProfileModal({
  open,
  onClose,
  profile,
  theme,
}: {
  open: boolean;
  onClose: () => void;
  profile: StudentProfile;
  theme?: { id: string; name: string; primary: string; secondary: string };
}) {
  const progressPercent = Math.round(
    (profile.completedMissions / profile.totalMissions) * 100,
  );

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[95] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-2xl rounded-[32px] border-4 border-white/10 bg-[#14212c] shadow-2xl overflow-hidden max-h-[calc(100vh-3rem)] flex flex-col"
            onClick={(event) => event.stopPropagation()}
          >
            <div
              className="flex items-center justify-between gap-4 px-6 py-5 bg-[#0f1720] border-b border-white/10"
              style={{ borderColor: theme?.primary }}
            >
              <div>
                <p className="text-sm text-slate-300 uppercase tracking-[0.3em]">
                  Profil dan Progress
                </p>
                <h2
                  className="text-3xl font-clash font-bold text-white"
                  style={{ color: theme?.primary }}
                >
                  Data Siswa
                </h2>
              </div>
              <button
                className="w-11 h-11 rounded-2xl flex items-center justify-center bg-white/10 text-white hover:bg-white/20 transition"
                onClick={onClose}
              >
                <X size={24} />
              </button>
            </div>

            <div className="overflow-y-auto p-6 space-y-6">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-inner">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
                  Identitas Siswa
                </p>
                <h3 className="mt-4 text-3xl font-bold text-white">
                  {profile.name}
                </h3>
                <p className="mt-2 text-xl text-slate-300">Kelas {profile.kelas}</p>
              </div>

              <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-inner">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
                        Progress Misi
                      </p>
                      <h3 className="mt-2 text-2xl font-bold text-white">
                        {profile.completedMissions}/{profile.totalMissions} misi selesai
                      </h3>
                    </div>
                    <div className="rounded-2xl bg-[#0f1720] px-4 py-3 text-xs uppercase tracking-[0.25em] text-slate-300 border border-white/10">
                      {progressPercent}%
                    </div>
                  </div>

                  <div className="h-3 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2 text-white">
                    <div className="rounded-3xl bg-[#0f1720] p-4 border border-white/10">
                      <p className="text-sm text-slate-400">Skor Total</p>
                      <p className="mt-2 text-3xl font-bold" style={{ color: theme?.primary }}>
                        {profile.score}
                      </p>
                    </div>
                    <div className="rounded-3xl bg-[#0f1720] p-4 border border-white/10">
                      <p className="text-sm text-slate-400">Peringkat</p>
                      <p className="mt-2 text-3xl font-bold text-emerald-300">
                        {profile.rank}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 rounded-3xl border border-white/10 bg-[#0f1720] p-5">
                    <p className="text-sm uppercase tracking-[0.3em] text-slate-400 mb-3">
                      Capaian
                    </p>
                    <div className="space-y-3">
                      {profile.achievements.map((achievement) => (
                        <div
                          key={achievement}
                          className="flex items-start gap-3 rounded-2xl border border-white/10 bg-[#15212d] p-4"
                        >
                          <CheckCircle2 className="mt-1 text-cyan-400" size={20} />
                          <div>
                            <p className="text-sm text-slate-300">{achievement}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-inner">
                  <div className="flex items-center gap-3 mb-5">
                    <ShieldCheck size={22} className="text-emerald-300" />
                    <h3 className="text-lg font-bold text-white">Detail Misi</h3>
                  </div>
                  <div className="space-y-3">
                    {profile.missionDetails.map((mission) => (
                      <div
                        key={mission.id}
                        className="flex items-center justify-between rounded-2xl bg-[#0f1720] p-4 border border-white/5"
                      >
                        <div>
                          <p className="text-sm text-slate-300">Misi {mission.id}</p>
                          <p className="font-semibold text-white">{mission.title}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
                            {mission.status}
                          </p>
                          <p className="mt-1 text-base font-bold text-cyan-300">
                            +{mission.points}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

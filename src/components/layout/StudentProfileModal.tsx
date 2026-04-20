import { AnimatePresence, motion } from "motion/react";
import { CheckCircle2, Trophy, X, Plus } from "lucide-react";
import React, { useState, useEffect } from "react";
import {
  getClassByCode,
  addClassMember,
  getStudentClasses,
} from "../../lib/firestore";
import { Class } from "../../types";

type StudentProfile = {
  name: string;
  kelas: string;
  score: number;
  rank: string;
  achievements: string[];
};

type UserProfile = {
  uid: string;
  email: string;
  name: string;
  role: "guru" | "siswa";
  createdAt: string;
};

export default function StudentProfileModal({
  open,
  onClose,
  profile,
  theme,
  userProfile,
}: {
  open: boolean;
  onClose: () => void;
  profile: StudentProfile;
  theme?: { id: string; name: string; primary: string; secondary: string };
  userProfile?: UserProfile;
}) {
  const [classCode, setClassCode] = useState("");
  const [joiningClass, setJoiningClass] = useState(false);
  const [joinMessage, setJoinMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [joinedClasses, setJoinedClasses] = useState<Class[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(false);

  // Fetch joined classes on mount or when modal opens
  useEffect(() => {
    if (open && userProfile?.uid) {
      fetchJoinedClasses();
    }
  }, [open, userProfile?.uid]);

  const fetchJoinedClasses = async () => {
    try {
      setLoadingClasses(true);
      const classes = await getStudentClasses(userProfile!.uid);
      setJoinedClasses(classes);
      console.log("✅ Joined classes fetched:", classes.length);
    } catch (error) {
      console.error("❌ Error fetching joined classes:", error);
    } finally {
      setLoadingClasses(false);
    }
  };

  const handleJoinClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!classCode.trim()) {
      setJoinMessage({ type: "error", text: "Masukkan kode kelas" });
      return;
    }

    if (!userProfile?.uid) {
      setJoinMessage({ type: "error", text: "❌ Data profil tidak ditemukan" });
      return;
    }

    setJoiningClass(true);
    setJoinMessage(null);

    try {
      const classData = await getClassByCode(classCode.toUpperCase());

      if (!classData || !classData.id) {
        setJoinMessage({ type: "error", text: "Kode kelas tidak ditemukan" });
        setJoiningClass(false);
        return;
      }

      // Join class
      await addClassMember(classData.id, userProfile.uid, userProfile.name);

      setJoinMessage({
        type: "success",
        text: "✅ Berhasil bergabung dengan kelas!",
      });
      setClassCode("");

      // Refresh joined classes list
      await fetchJoinedClasses();

      setTimeout(() => {
        setJoinMessage(null);
      }, 3000);
    } catch (error) {
      console.error("Error joining class:", error);
      setJoinMessage({
        type: "error",
        text: "❌ Gagal bergabung dengan kelas",
      });
    } finally {
      setJoiningClass(false);
    }
  };

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
                  {userProfile?.name || profile.name}
                </h3>
                <p className="mt-2 text-xl text-slate-300">
                  {joinedClasses.length > 0
                    ? `${joinedClasses.length} Kelas`
                    : "Belum bergabung dengan kelas"}
                </p>
              </div>

              {/* Joined Classes List */}
              {joinedClasses.length > 0 && (
                <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-inner">
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-400 mb-4">
                    Kelas yang Diikuti
                  </p>
                  <div className="space-y-3">
                    {joinedClasses.map((cls) => (
                      <div
                        key={cls.id}
                        className="rounded-2xl bg-[#0f1720] p-4 border border-white/10"
                      >
                        <p className="font-semibold text-white">{cls.name}</p>
                        <p className="text-sm text-slate-400 mt-1">
                          {cls.guruName}
                        </p>
                        <p className="text-xs text-slate-500 mt-2">
                          Kode: {cls.classCode} • {cls.memberCount || 0} siswa
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-inner">
                  <div className="mt-5 grid gap-3 text-white">
                    <div className="rounded-3xl bg-[#0f1720] p-4 border border-white/10">
                      <p className="text-sm text-slate-400">Skor Total</p>
                      <p
                        className="mt-2 text-3xl font-bold"
                        style={{ color: theme?.primary }}
                      >
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
                          <CheckCircle2
                            className="mt-1 text-cyan-400"
                            size={20}
                          />
                          <div>
                            <p className="text-sm text-slate-300">
                              {achievement}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Join Class Section */}
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-inner">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Plus size={20} style={{ color: theme?.primary }} />
                  Bergabung dengan Kelas
                </h3>

                <form onSubmit={handleJoinClass} className="space-y-4">
                  <div>
                    <input
                      type="text"
                      value={classCode}
                      onChange={(e) => setClassCode(e.target.value)}
                      placeholder="Masukkan kode kelas..."
                      maxLength={6}
                      className="w-full px-4 py-3 rounded-2xl bg-[#0f1720] border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-white/30 transition uppercase"
                      disabled={joiningClass}
                    />
                  </div>

                  {joinMessage && (
                    <div
                      className={`p-3 rounded-2xl text-sm font-semibold ${
                        joinMessage.type === "success"
                          ? "bg-emerald-500/20 text-emerald-200 border border-emerald-500/30"
                          : "bg-red-500/20 text-red-200 border border-red-500/30"
                      }`}
                    >
                      {joinMessage.text}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={joiningClass || !classCode.trim()}
                    className="w-full py-3 px-4 rounded-2xl font-bold text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor:
                        joiningClass || !classCode.trim()
                          ? "#666"
                          : theme?.primary,
                    }}
                  >
                    {joiningClass ? "Bergabung..." : "Bergabung"}
                  </button>
                </form>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

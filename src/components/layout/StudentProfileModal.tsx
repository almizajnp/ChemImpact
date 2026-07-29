import { AnimatePresence, motion } from "motion/react";
import { CheckCircle2, Trophy, X, Plus, Medal, GraduationCap, Users, Mail, Sparkles } from "lucide-react";
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
  const [showJoinForm, setShowJoinForm] = useState(false);

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
      // Jika siswa belum masuk kelas manapun, tampilkan form input secara otomatis.
      // Jika sudah masuk kelas, sembunyikan form input secara default.
      if (classes.length === 0) {
        setShowJoinForm(true);
      } else {
        setShowJoinForm(false);
      }
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
      setJoinMessage({ type: "error", text: "Data profil tidak ditemukan" });
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
        text: "Berhasil bergabung dengan kelas!",
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
        text: "Gagal bergabung dengan kelas",
      });
    } finally {
      setJoiningClass(false);
    }
  };

  const getInitial = (name?: string) => (name?.trim()?.[0] || "S").toUpperCase();

  const studentName = userProfile?.name || profile.name || "Siswa";
  const studentEmail = userProfile?.email || "";

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[95] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 md:p-6"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            className="w-full max-w-2xl rounded-3xl border border-slate-700/60 bg-slate-900 shadow-2xl overflow-hidden max-h-[calc(100vh-2.5rem)] flex flex-col"
            onClick={(event) => event.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between gap-4 px-6 py-4 bg-slate-950 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-emerald-400" />
                <span className="text-sm font-bold tracking-wide text-white uppercase font-clash">
                  Profil & Progress Siswa
                </span>
              </div>
              <button
                className="w-9 h-9 rounded-full flex items-center justify-center bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                onClick={onClose}
                title="Tutup Modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Modal Content */}
            <div className="overflow-y-auto p-5 sm:p-6 space-y-6">
              {/* HERO IDENTITY BANNER */}
              <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-800/80 via-slate-900 to-slate-950 p-5 sm:p-6 shadow-md relative overflow-hidden">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left relative z-10">
                  {/* Avatar */}
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-emerald-400 via-teal-500 to-emerald-600 text-slate-950 font-black text-2xl sm:text-3xl flex items-center justify-center shadow-lg ring-4 ring-emerald-500/20 flex-shrink-0">
                    {getInitial(studentName)}
                  </div>

                  {/* Name & Account Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                      <h3 className="text-xl sm:text-2xl font-bold text-white truncate">
                        {studentName}
                      </h3>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold">
                        Siswa
                      </span>
                    </div>

                    {studentEmail && (
                      <p className="text-xs sm:text-sm text-slate-400 flex items-center justify-center sm:justify-start gap-1.5 mb-3">
                        <Mail size={14} className="text-slate-500" />
                        <span className="truncate">{studentEmail}</span>
                      </p>
                    )}

                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs text-slate-300">
                      <span className="px-3 py-1 rounded-xl bg-slate-800/90 border border-slate-700/80 font-medium">
                        🏫 {joinedClasses.length > 0 ? `${joinedClasses.length} Kelas Diikuti` : "Belum Masuk Kelas"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* STAT CARDS (GRID 2 KOLOM) */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {/* Score Stat Card */}
                <div className="rounded-2xl bg-slate-800/80 border border-slate-700/80 p-4 flex flex-col justify-between shadow-sm hover:border-emerald-500/40 transition-colors">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Total Poin
                    </span>
                    <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                      <Trophy size={18} />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl sm:text-3xl font-black text-amber-300">
                      {profile.score}
                    </span>
                    <span className="text-xs font-semibold text-amber-200/70">pts</span>
                  </div>
                </div>

                {/* Rank Stat Card */}
                <div className="rounded-2xl bg-slate-800/80 border border-slate-700/80 p-4 flex flex-col justify-between shadow-sm hover:border-emerald-500/40 transition-colors">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Peringkat
                    </span>
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                      <Medal size={18} />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl sm:text-3xl font-black text-emerald-300">
                      {profile.rank}
                    </span>
                  </div>
                </div>
              </div>

              {/* JOINED CLASSES SECTION */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 sm:p-5">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <GraduationCap size={16} className="text-emerald-400" />
                    Kelas yang Diikuti ({joinedClasses.length})
                  </h4>

                  {joinedClasses.length > 0 && (
                    <button
                      onClick={() => setShowJoinForm(!showJoinForm)}
                      className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg transition-all"
                    >
                      <Plus size={14} />
                      {showJoinForm ? "Sembunyikan Form" : "Tambah Kelas Lain"}
                    </button>
                  )}
                </div>

                {loadingClasses ? (
                  <p className="text-xs text-slate-400 py-3 text-center animate-pulse">
                    Memuat daftar kelas...
                  </p>
                ) : joinedClasses.length > 0 ? (
                  <div className="space-y-2.5">
                    {joinedClasses.map((cls) => (
                      <div
                        key={cls.id}
                        className="rounded-xl bg-slate-900 p-3.5 border border-slate-800 hover:border-slate-700 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <p className="font-bold text-white text-sm truncate">{cls.name}</p>
                          <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                            <span>👨‍🏫 Guru: {cls.guruName}</span>
                          </p>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-full text-xs font-mono font-bold">
                            Kode: {cls.classCode}
                          </span>
                          <span className="text-[11px] text-slate-400 flex items-center gap-1 bg-slate-800 px-2 py-1 rounded-lg">
                            <Users size={12} />
                            {cls.memberCount || 0}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center rounded-xl bg-slate-900/50 border border-slate-800/80">
                    <p className="text-xs text-slate-400">
                      Kamu belum bergabung ke dalam kelas manapun. Masukkan kode kelas dari guru di bawah ini!
                    </p>
                  </div>
                )}
              </div>

              {/* JOIN CLASS FORM SECTION (Hanya tampil jika belum masuk kelas / di-toggle) */}
              {showJoinForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 sm:p-5"
                >
                  <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-3 flex items-center gap-2">
                    <Plus size={16} className="text-emerald-400" />
                    Bergabung dengan Kelas Baru
                  </h4>

                  <form onSubmit={handleJoinClass} className="space-y-3">
                    <div>
                      <input
                        type="text"
                        value={classCode}
                        onChange={(e) => setClassCode(e.target.value)}
                        placeholder="KODE KELAS (MISAL: AB12CD)"
                        maxLength={6}
                        className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition font-mono tracking-widest text-center uppercase font-bold text-sm"
                        disabled={joiningClass}
                      />
                    </div>

                    {joinMessage && (
                      <div
                        className={`p-3 rounded-xl text-xs font-semibold ${
                          joinMessage.type === "success"
                            ? "bg-emerald-500/20 text-emerald-200 border border-emerald-500/40"
                            : "bg-red-500/20 text-red-200 border border-red-500/40"
                        }`}
                      >
                        {joinMessage.text}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={joiningClass || !classCode.trim()}
                      className="w-full py-3 px-4 rounded-xl font-bold text-white transition-all bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-md text-sm"
                    >
                      {joiningClass ? "Bergabung..." : "Bergabung Sekarang"}
                    </button>
                  </form>
                </motion.div>
              )}

              {/* ACHIEVEMENTS SECTION */}
              {profile.achievements && profile.achievements.length > 0 && (
                <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 sm:p-5">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
                    🎖️ Capaian & Lencana
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {profile.achievements.map((achievement) => (
                      <div
                        key={achievement}
                        className="flex items-center gap-2.5 rounded-xl border border-slate-800 bg-slate-900 p-3 text-xs text-slate-300"
                      >
                        <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
                        <span className="font-medium">{achievement}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

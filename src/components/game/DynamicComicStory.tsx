import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
    ChevronLeft,
    ChevronRight,
    CheckCircle,
    XCircle,
    Trophy,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { saveStudentResponse } from "../../lib/firestore";
import { CustomMission, MissionChoice } from "../../types/mission";

// ============ DYNAMIC COMIC STORY PLAYER ============
// Player universal untuk misi komik buatan guru (CustomMission).
// Merender halaman dari data Realtime Database (gambar dari Cloudinary),
// mendukung: halaman komik, pilihan ganda (+100 poin per jawaban benar),
// esai, dan refleksi. Skor & jawaban disimpan via saveStudentResponse
// (sistem penyimpanan yang sama dengan misi default).

const POINTS_PER_CORRECT = 100;

interface DynamicComicStoryProps {
    mission: CustomMission;
    onClose: () => void;
    onScoreUpdate?: (points: number) => void;
    classId?: string | null;
    siswaId?: string;
    siswaName?: string;
}

interface FeedbackState {
    show: boolean;
    choice?: MissionChoice;
}

export default function DynamicComicStory({
    mission,
    onClose,
    onScoreUpdate,
    classId,
    siswaId,
    siswaName,
}: DynamicComicStoryProps) {
    const { userProfile } = useAuth();
    const pages = mission.pages || [];
    const totalPages = pages.length;

    const [currentPage, setCurrentPage] = useState(0);
    const [showIntro, setShowIntro] = useState(true);
    const [isFinished, setIsFinished] = useState(false);
    const [feedback, setFeedback] = useState<FeedbackState>({ show: false });
    const [totalScore, setTotalScore] = useState(0);
    const [showEssayWarning, setShowEssayWarning] = useState(false);
    const [saving, setSaving] = useState(false);

    // Jawaban siswa
    const [answeredChoices, setAnsweredChoices] = useState<
        Record<string, string>
    >({}); // pageId -> choiceId yang dipilih
    const [multiChoiceAnswers, setMultiChoiceAnswers] = useState<
        Array<{
            pageId: number;
            questionIndex: number;
            selectedChoice: string;
            isCorrect: boolean;
            choiceText?: string;
        }>
    >([]);
    const [essayAnswers, setEssayAnswers] = useState<Record<string, string>>({});
    const [reflectionAnswers, setReflectionAnswers] = useState<
        Record<string, string>
    >({});

    const scrollRef = useRef<HTMLDivElement>(null);

    const page = pages[currentPage];
    const isLastPage = currentPage === totalPages - 1;

    const scrollTop = () => {
        scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    };

    // ---------- Pilihan Ganda ----------
    const handleChoiceSelect = (choice: MissionChoice) => {
        if (!page || answeredChoices[page.id]) return; // hanya pilihan pertama yang dihitung

        setAnsweredChoices((prev) => ({ ...prev, [page.id]: choice.id }));
        setMultiChoiceAnswers((prev) => [
            ...prev,
            {
                pageId: currentPage,
                questionIndex: 0,
                selectedChoice: choice.id,
                isCorrect: choice.isCorrect,
                choiceText: choice.text,
            },
        ]);

        if (choice.isCorrect) {
            setTotalScore((prev) => prev + POINTS_PER_CORRECT);
        }

        setFeedback({ show: true, choice });
    };

    // ---------- Validasi esai/refleksi wajib ----------
    const validateRequiredEssays = (): boolean => {
        if (!page || (page.type !== "essay" && page.type !== "reflection"))
            return true;
        const answers = page.type === "essay" ? essayAnswers : reflectionAnswers;
        const unanswered = (page.essays || []).filter(
            (essay) =>
                essay.required !== false && !(answers[essay.id] || "").trim(),
        );
        if (unanswered.length > 0) {
            setShowEssayWarning(true);
            return false;
        }
        return true;
    };

    const isChoiceAnswered = !page
        ? true
        : page.type !== "choice" || Boolean(answeredChoices[page.id]);

    const handleNext = () => {
        if (!validateRequiredEssays()) return;
        if (page?.type === "choice" && !isChoiceAnswered) {
            setShowEssayWarning(true);
            return;
        }
        if (isLastPage) {
            setIsFinished(true);
        } else {
            setCurrentPage((p) => p + 1);
            scrollTop();
        }
    };

    const handlePrev = () => {
        if (currentPage > 0) {
            setCurrentPage((p) => p - 1);
            scrollTop();
        }
    };

    // ---------- Simpan hasil ke database ----------
    const handleFinish = async () => {
        const finalSiswaId = siswaId || userProfile?.uid;
        const finalSiswaName = siswaName || userProfile?.name || "Siswa";

        if (finalSiswaId) {
            setSaving(true);
            try {
                // Kumpulkan pertanyaan esai & refleksi (untuk ditampilkan di monitoring guru)
                const essayQuestions: Record<string, string> = {};
                const reflectionQuestions: Record<string, string> = {};
                pages.forEach((p) => {
                    (p.essays || []).forEach((essay) => {
                        if (p.type === "essay" && essayAnswers[essay.id]) {
                            essayQuestions[essay.id] = essay.question;
                        }
                        if (p.type === "reflection" && reflectionAnswers[essay.id]) {
                            reflectionQuestions[essay.id] = essay.question;
                        }
                    });
                });

                await saveStudentResponse(finalSiswaId, finalSiswaName, {
                    classId: classId || "",
                    missionId: mission.id,
                    missionName: mission.title,
                    essayAnswers,
                    essayQuestions,
                    multiChoiceAnswers,
                    reflectionAnswers,
                    reflectionQuestions,
                    totalScore,
                    status: "completed",
                });
                console.log("✅ Custom mission response saved");

                if (totalScore > 0) {
                    onScoreUpdate?.(totalScore);
                }
            } catch (error) {
                console.error("❌ Error saving custom mission response:", error);
                alert("Gagal menyimpan jawaban. Silakan coba lagi.");
            } finally {
                setSaving(false);
            }
        }
        onClose();
    };

    // ---------- Layar Intro ----------
    if (showIntro) {
        return (
            <div className="min-h-full flex items-center justify-center p-4 md:p-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden"
                >
                    {mission.coverImage && (
                        <div className="h-48 md:h-64 bg-gray-900">
                            <img
                                src={mission.coverImage}
                                alt={mission.title}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}
                    <div className="p-6 md:p-8 text-center">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                            {mission.title}
                        </h1>
                        <p className="text-sm md:text-base text-gray-600 mb-6 whitespace-pre-wrap">
                            {mission.description}
                        </p>
                        <div className="grid grid-cols-2 gap-3 mb-6 text-left">
                            <div className="bg-blue-50 rounded-xl p-3">
                                <p className="text-xs font-bold text-blue-900">
                                    ⏭️ Navigasi Cerita
                                </p>
                                <p className="text-xs text-blue-700 mt-1">
                                    Gunakan tombol panah untuk berpindah halaman
                                </p>
                            </div>
                            <div className="bg-emerald-50 rounded-xl p-3">
                                <p className="text-xs font-bold text-emerald-900">
                                    🎯 Tantangan Pilihan
                                </p>
                                <p className="text-xs text-emerald-700 mt-1">
                                    Jawaban benar bernilai {POINTS_PER_CORRECT} poin
                                </p>
                            </div>
                            <div className="bg-amber-50 rounded-xl p-3">
                                <p className="text-xs font-bold text-amber-900">
                                    ✍️ Pengamatan Mendalam
                                </p>
                                <p className="text-xs text-amber-700 mt-1">
                                    Jawab pertanyaan esai dan refleksi dengan lengkap
                                </p>
                            </div>
                            <div className="bg-indigo-50 rounded-xl p-3">
                                <p className="text-xs font-bold text-indigo-900">
                                    🏆 Raih Skor
                                </p>
                                <p className="text-xs text-indigo-700 mt-1">
                                    Selesaikan semua halaman untuk menyimpan hasil
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowIntro(false)}
                            disabled={totalPages === 0}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 rounded-xl transition-colors text-lg"
                        >
                            {totalPages === 0 ? "Misi belum memiliki halaman" : "MULAI MISI"}
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    // ---------- Layar Selesai ----------
    if (isFinished) {
        return (
            <div className="min-h-full flex items-center justify-center p-4 md:p-8">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center"
                >
                    <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Misi Selesai! 🎉
                    </h2>
                    <p className="text-gray-600 mb-6">
                        Kamu telah menyelesaikan misi "{mission.title}"
                    </p>
                    <div className="bg-blue-50 rounded-2xl p-6 mb-6">
                        <p className="text-sm text-gray-600">Total Skor</p>
                        <p className="text-5xl font-bold text-blue-600">{totalScore}</p>
                        <p className="text-xs text-gray-500 mt-1">
                            {multiChoiceAnswers.filter((a) => a.isCorrect).length} dari{" "}
                            {multiChoiceAnswers.length} pilihan ganda benar
                        </p>
                    </div>
                    <button
                        onClick={handleFinish}
                        disabled={saving}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 rounded-xl transition-colors"
                    >
                        {saving ? "Menyimpan..." : "Simpan & Keluar"}
                    </button>
                </motion.div>
            </div>
        );
    }

    // ---------- Render Halaman ----------
    return (
        <div className="min-h-full flex flex-col">
            {/* Progress bar */}
            <div className="px-4 pt-3">
                <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                    <span className="font-semibold">
                        Halaman {currentPage + 1} / {totalPages}
                    </span>
                    <span className="font-bold text-blue-600">⭐ {totalScore} poin</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-blue-600 transition-all duration-300"
                        style={{ width: `${((currentPage + 1) / totalPages) * 100}%` }}
                    />
                </div>
            </div>

            {/* Konten halaman */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={page.id}
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -30 }}
                        transition={{ duration: 0.25 }}
                        className="max-w-3xl mx-auto"
                    >
                        {/* Gambar komik */}
                        {page.image && (
                            <div className="rounded-2xl overflow-hidden shadow-lg mb-4 bg-gray-900">
                                <img
                                    src={page.image}
                                    alt={page.title || `Halaman ${currentPage + 1}`}
                                    className="w-full max-h-[55vh] object-contain"
                                />
                            </div>
                        )}

                        {/* Judul & deskripsi */}
                        {page.title && (
                            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                                {page.title}
                            </h2>
                        )}
                        {page.description && (
                            <p className="text-sm md:text-base text-gray-700 whitespace-pre-wrap mb-4">
                                {page.description}
                            </p>
                        )}

                        {/* Pilihan Ganda */}
                        {page.type === "choice" && (
                            <div className="space-y-3 mt-2">
                                {(page.choices || []).map((choice, idx) => {
                                    const selected = answeredChoices[page.id] === choice.id;
                                    const answered = Boolean(answeredChoices[page.id]);
                                    return (
                                        <button
                                            key={choice.id}
                                            onClick={() => handleChoiceSelect(choice)}
                                            disabled={answered}
                                            className={`w-full text-left p-4 rounded-xl border-2 transition-all font-medium text-sm md:text-base ${selected
                                                    ? choice.isCorrect
                                                        ? "border-green-500 bg-green-50 text-green-900"
                                                        : "border-red-500 bg-red-50 text-red-900"
                                                    : answered
                                                        ? "border-gray-200 bg-gray-50 text-gray-400"
                                                        : "border-gray-300 bg-white text-gray-900 hover:border-blue-500 hover:bg-blue-50"
                                                }`}
                                        >
                                            <span className="font-bold mr-2">
                                                {String.fromCharCode(65 + idx)}.
                                            </span>
                                            {choice.text}
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {/* Esai / Refleksi */}
                        {(page.type === "essay" || page.type === "reflection") && (
                            <div className="space-y-4 mt-2">
                                {(page.essays || []).map((essay, idx) => {
                                    const answers =
                                        page.type === "essay" ? essayAnswers : reflectionAnswers;
                                    const setAnswers =
                                        page.type === "essay"
                                            ? setEssayAnswers
                                            : setReflectionAnswers;
                                    return (
                                        <div
                                            key={essay.id}
                                            className={`rounded-xl border-2 p-4 ${page.type === "essay"
                                                    ? "border-amber-200 bg-amber-50"
                                                    : "border-indigo-200 bg-indigo-50"
                                                }`}
                                        >
                                            <p className="font-semibold text-sm text-gray-900 mb-2">
                                                {page.type === "essay" ? "✍️" : "💭"} Pertanyaan{" "}
                                                {idx + 1}
                                                {essay.required !== false && (
                                                    <span className="text-red-500"> *</span>
                                                )}
                                            </p>
                                            <p className="text-sm text-gray-700 mb-3">
                                                {essay.question}
                                            </p>
                                            <textarea
                                                value={answers[essay.id] || ""}
                                                onChange={(e) =>
                                                    setAnswers((prev) => ({
                                                        ...prev,
                                                        [essay.id]: e.target.value,
                                                    }))
                                                }
                                                placeholder={
                                                    essay.placeholder || "Tulis jawabanmu di sini..."
                                                }
                                                rows={4}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900 bg-white resize-none"
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Navigasi bawah */}
            <div className="p-4 bg-white/80 backdrop-blur border-t border-gray-200 flex items-center justify-between gap-3">
                <button
                    onClick={handlePrev}
                    disabled={currentPage === 0}
                    className="flex items-center gap-1 px-4 py-2.5 rounded-xl bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-40 font-semibold text-sm transition-colors"
                >
                    <ChevronLeft size={18} /> Kembali
                </button>
                <button
                    onClick={handleNext}
                    className="flex items-center gap-1 px-6 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-semibold text-sm transition-colors"
                >
                    {isLastPage ? "Selesai" : "Lanjut"} <ChevronRight size={18} />
                </button>
            </div>

            {/* Modal feedback pilihan ganda */}
            <AnimatePresence>
                {feedback.show && feedback.choice && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[110] bg-black/60 flex items-center justify-center p-4"
                        onClick={() => setFeedback({ show: false })}
                    >
                        <motion.div
                            initial={{ scale: 0.85, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.85, opacity: 0 }}
                            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 text-center"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {feedback.choice.isCorrect ? (
                                <CheckCircle className="w-14 h-14 text-green-500 mx-auto mb-3" />
                            ) : (
                                <XCircle className="w-14 h-14 text-red-500 mx-auto mb-3" />
                            )}
                            <h3
                                className={`text-xl font-bold mb-2 ${feedback.choice.isCorrect ? "text-green-600" : "text-red-600"
                                    }`}
                            >
                                {feedback.choice.isCorrect
                                    ? `Benar! +${POINTS_PER_CORRECT} Poin`
                                    : "Kurang Tepat"}
                            </h3>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                {feedback.choice.feedback}
                            </p>
                            <button
                                onClick={() => setFeedback({ show: false })}
                                className="mt-5 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl transition-colors"
                            >
                                Lanjutkan
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modal peringatan jawaban belum lengkap */}
            <AnimatePresence>
                {showEssayWarning && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[110] bg-black/60 flex items-center justify-center p-4"
                        onClick={() => setShowEssayWarning(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.85, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.85, opacity: 0 }}
                            className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <p className="text-4xl mb-3">⚠️</p>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">
                                Belum Lengkap
                            </h3>
                            <p className="text-sm text-gray-600">
                                {page?.type === "choice"
                                    ? "Pilih salah satu jawaban terlebih dahulu sebelum melanjutkan."
                                    : "Jawab semua pertanyaan wajib (bertanda *) sebelum melanjutkan."}
                            </p>
                            <button
                                onClick={() => setShowEssayWarning(false)}
                                className="mt-5 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl transition-colors"
                            >
                                Mengerti
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}


import { motion, AnimatePresence } from "motion/react";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { saveStudentResponse } from "../../lib/firestore";
import {
  X,
  CheckCircle,
  AlertCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { image } from "motion/react-client";

// Comic pages data with interactive choices
const comicPages = [
  {
    id: 0,
    type: "instructions",
    title: "Cara Membaca Komik Edukasi Ini",
    instructions: [
      "📖 Tekan atau sentuh bagian KANAN layar untuk melanjutkan ke halaman berikutnya",
      "📖 Tekan atau sentuh bagian KIRI layar untuk kembali ke halaman sebelumnya",
      "🎯 Pilih jawaban dengan mengklik bagian yang ditunjukkan atau tombol pilihan",
      "✅ Baca feedback untuk memahami konsep yang diajarkan",
      "🏆 Selesaikan semua halaman untuk menguasai topik ini",
    ],
  },
  {
    id: -1,
    type: "cover",
    image: "/images/buka2.png",
    title: "Ancaman Limbah Deterjen",
    subtitle: "Bab 1: Mari Belajar Tentang Dampak Lingkungan",
  },
  {
    id: 1,
    image: "/images/komik1.png",
    type: "image",
    choices: [],
  },
  { id: 2, image: "/images/komik2.png", type: "image", choices: [] },
  {
    id: 3,
    image: "/images/komik3.png",
    type: "image-with-essays",
    mapUrl:
      "https://www.google.com/maps/embed?pb=!4v1776606725987!6m8!1m7!1sPRlQcvLqYVirwindRRErww!2m2!1d-7.272443457088635!2d112.7624425989235!3f78.48524830103521!4f-41.47947606161724!5f0.4000000000000002",
    choices: [],
    essays: [
      {
        id: "essay1",
        question: "1. Bagaimana warna air sungai?",
        placeholder: "Jelaskan warna air sungai yang Anda amati...",
        required: true,
      },
      {
        id: "essay2",
        question: "2. Bagaimana kondisi kebersihan air?",
        placeholder: "Jelaskan kondisi kebersihan air...",
        required: true,
      },
      {
        id: "essay3",
        question: "3. Apakah terdapat busa di permukaan air?",
        placeholder: "Jelaskan keberadaan busa di permukaan air...",
        required: true,
      },
      {
        id: "essay4",
        question: "4. Bagaimana kondisi lingkungan sekitar sungai?",
        placeholder: "Jelaskan kondisi lingkungan sekitar sungai...",
        required: true,
      },
      {
        id: "essay5",
        question: "5. Aktivitas manusia apa yang terlihat di sekitar sungai?",
        placeholder: "Jelaskan aktivitas manusia yang Anda amati...",
        required: true,
      },
    ],
  },
  {
    id: 4,
    image: "/images/komik4.png",
    type: "multichoice", // multiple choice beside/below image
    choices: [
      {
        id: "A",
        text: "Pilihan A",
        isCorrect: false,
        feedback:
          "Jawaban ini kurang tepat.\nAir yang mengalir tidak serta-merta menghilangkan zat pencemar.\n🔮 Jika limbah terus dibuang, pencemar akan tetap terbawa dan menyebar ke wilayah lain, sehingga memperluas kerusakan lingkungan di masa depan.",
        image: "/images/fb/fb1A.png",
        color: "red",
      },
      {
        id: "B",
        text: "Pilihan B",
        isCorrect: false,
        feedback:
          "Jawaban ini belum tepat.\nPerubahan kecil yang terjadi terus-menerus dapat terakumulasi.\n🔮 Dalam jangka panjang, dampak yang awalnya kecil bisa berkembang menjadi pencemaran serius yang sulit dipulihkan.",
        image: "/images/fb/fb1B.png",
        color: "yellow",
      },
      {
        id: "C",
        text: "Pilihan C",
        isCorrect: true,
        feedback:
          "Jawaban ini tepat! 🌿\nPerubahan kecil yang terjadi terus-menerus dapat berkembang menjadi masalah besar dalam ekosistem.\n🔮 Jika kondisi ini dibiarkan, pencemaran akan semakin parah, kadar oksigen menurun, dan kehidupan di sungai bisa terancam.\n🌱 Sebaliknya, jika pencemaran dikendalikan sejak awal, ekosistem sungai masih bisa dipertahankan di masa depan.",
        image: "/images/fb/fb1C.png",
        color: "green",
      },
      {
        id: "D",
        text: "Pilihan D",
        isCorrect: false,
        feedback:
          "Jawaban ini tidak tepat.\nSungai memiliki kemampuan pemulihan alami, tetapi terbatas.\n🔮 Jika beban pencemaran terus meningkat, kemampuan ini akan gagal, dan sungai bisa mengalami kerusakan permanen di masa depan.",
        image: "/images/fb/fb1D.png",
        color: "red",
      },
    ],
  },
  { id: 5, image: "/images/komik5.png", type: "image", choices: [] },
  {
    id: 6,
    image: "/images/komik6.png",
    type: "multichoice",
    choices: [
      {
        id: "A",
        text: "Pilihan A",
        isCorrect: false,
        feedback:
          "Jawaban ini tidak tepat.\nKondisi lingkungan tidak akan tetap stabil tanpa adanya upaya menjaga.\n 🔮Jika tidak ada perubahan perilaku, pencemaran akan terus terjadi dan kualitas sungai justru akan menurun dalam jangka panjang.",
        image: "/images/fb/fb2A.png",
        color: "red",
      },
      {
        id: "B",
        text: "Pilihan B",
        isCorrect: true,
        feedback:
          "Jawaban ini tepat!\nKondisi sungai sangat dipengaruhi oleh perilaku manusia.\n 🔮 Jika masyarakat mulai mengurangi pencemaran dan menjaga lingkungan, kualitas air dapat membaik dan ekosistem sungai bisa pulih secara bertahap di masa depan.💡 Ini menunjukkan bahwa tindakan saat ini dapat menghasilkan dampak positif jangka panjang.",
        image: "/images/fb/fb2B.png",
        color: "green",
      },
      {
        id: "C",
        text: "Pilihan C",
        isCorrect: false,
        feedback:
          "Jawaban ini kurang tepat.\nPerubahan lingkungan tidak terjadi secara acak, tetapi dipengaruhi oleh tindakan manusia.\n 🔮 Jika tidak ada pengelolaan yang jelas, kondisi sungai cenderung akan terus memburuk, bukan berubah tanpa arah. ",
        image: "/images/fb/fb2C.png",
        color: "yellow",
      },
      {
        id: "D",
        text: "Pilihan D",
        isCorrect: true,
        feedback:
          "Jawaban ini tepat.\nJika tidak ada upaya perbaikan, pencemaran akan terus terakumulasi.\n 🔮 Dalam jangka panjang, sungai bisa mengalami kerusakan parah, kehilangan keanekaragaman hayati, dan tidak lagi layak digunakan.💡 Ini menunjukkan konsekuensi negatif dari tidak adanya tindakan saat ini.",
        image: "/images/fb/fb2D.png",
        color: "green",
      },
    ],
  },
  { id: 7, image: "/images/komik7.png", type: "image", choices: [] },
  {
    id: 8,
    image: "/images/komik8.png",
    type: "multichoice",
    choices: [
      {
        id: "A",
        text: "Pilihan A",
        isCorrect: false,
        feedback: "Jawaban ini kurang tepat.",
        image: "/images/fb/fb3A.png",
        color: "red",
      },
      {
        id: "B",
        text: "Pilihan B",
        isCorrect: false,
        feedback: "Jawaban ini belum tepat.",
        image: "/images/fb/fb3B.png",
        color: "yellow",
      },
      {
        id: "C",
        text: "Pilihan C",
        isCorrect: true,
        feedback: "Jawaban ini tepat!",
        image: "/images/fb/fb3C.png",
        color: "green",
      },
      {
        id: "D",
        text: "Pilihan D",
        isCorrect: false,
        feedback: "Jawaban ini tidak tepat.",
        image: "/images/fb/fb3D.png",
        color: "red",
      },
    ],
  },
  {
    id: 9,
    image: "/images/komik9.png",
    type: "multichoice",
    choices: [
      {
        id: "A",
        text: "Pilihan A",
        isCorrect: false,
        feedback: "Jawaban ini tepat!",
        image: "/images/fb/fb4A.png",
        color: "red",
      },
      {
        id: "B",
        text: "Pilihan B",
        isCorrect: true,
        feedback: "Jawaban ini kurang tepat.",
        image: "/images/fb/fb4B.png",
        color: "green",
      },
      {
        id: "C",
        text: "Pilihan C",
        isCorrect: false,
        feedback: "Jawaban ini belum tepat.",
        image: "/images/fb/fb4C.png",
        color: "yellow",
      },
      {
        id: "D",
        text: "Pilihan D",
        isCorrect: false,
        feedback: "Jawaban ini tidak tepat.",
        image: "/images/fb/fb4D.png",
        color: "red",
      },
    ],
  },
  {
    id: 10,
    image: "/images/komik10.png",
    type: "multichoice",
    choices: [
      {
        id: "A",
        text: "Pilihan A",
        isCorrect: false,
        feedback: "Jawaban ini kurang tepat.",
        image: "/images/fb/fb5A.png",
        color: "red",
      },
      {
        id: "B",
        text: "Pilihan B",
        isCorrect: false,
        feedback: "Jawaban ini belum tepat.",
        image: "/images/fb/fb5B.png",
        color: "yellow",
      },
      {
        id: "C",
        text: "Pilihan C",
        isCorrect: true,
        feedback: "Jawaban ini tidak tepat.",
        image: "/images/fb/fb5C.png",
        color: "green",
      },
      {
        id: "D",
        text: "Pilihan D",
        isCorrect: false,
        feedback: "Jawaban ini tepat!",
        image: "/images/fb/fb5D.png",
        color: "red",
      },
    ],
  },
  { id: 11, image: "/images/komik11.png", type: "image", choices: [] },
  {
    id: 12,
    type: "reflection",
    image: "/images/komik12.png",
    title: "Refleksi Diri dan Masa Depan",
    description:
      "Lingkungan di masa depan tidak terjadi secara tiba-tiba, tetapi merupakan hasil dari tindakan yang kita lakukan hari ini. Setiap kebiasaan, sekecil apa pun, dapat memberikan dampak terhadap kondisi sungai. Sekarang, coba refleksikan kembali apa yang pernah kamu lakukan dan bagaimana hal tersebut dapat memengaruhi lingkungan di masa depan.",
    essays: [
      {
        id: "r1",
        question:
          "1. Apa aktivitas yang pernah kamu lakukan terhadap lingkungan?",
        placeholder: "Ceritakan pengalamanmu...",
        required: true,
      },
      {
        id: "r2",
        question: "2. Apa dampak dari aktivitas yang kamu lakukan tersebut?",
        placeholder: "Jelaskan dampaknya...",
        required: true,
      },
      {
        id: "r3",
        question:
          "3. Bagaimana kondisi lingkungan di masa depan jika itu terus terjadi?",
        placeholder: "Prediksi masa depan...",
        required: true,
      },
      {
        id: "r4",
        question: "4. Apa yang akan kamu ubah mulai sekarang?",
        placeholder: "Tuliskan komitmenmu...",
        required: true,
      },
    ],
  },
];

interface Choice {
  id: string;
  position?: { top: string; left: string; width: string; height: string };
  text?: string;
  isCorrect: boolean;
  feedback: string;
  image?: string;
  color: "green" | "yellow" | "red";
}

interface Essay {
  id: string;
  question: string;
  placeholder?: string;
  required?: boolean;
}

interface ComicPage {
  id: number;
  type: string;
  image?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  instructions?: string[];
  choices?: Choice[];
  essays?: Essay[];
  mapUrl?: string;
}

interface FeedbackState {
  show: boolean;
  choice?: Choice;
  selectedId?: string;
}

const HEADER_HEIGHT = 56;
const FOOTER_HEIGHT = 56;

export default function ComicStory({
  onClose,
  onScoreUpdate,
  classId,
  siswaId,
  siswaName,
}: {
  onClose: () => void;
  onScoreUpdate?: (points: number) => void;
  classId?: string;
  siswaId?: string;
  siswaName?: string;
}) {
  const { userProfile } = useAuth();
  const [currentPage, setCurrentPage] = useState(0);
  const [feedback, setFeedback] = useState<FeedbackState>({ show: false });
  const [essayAnswers, setEssayAnswers] = useState<
    Record<number, Record<string, string>>
  >({});
  const [multiChoiceAnswers, setMultiChoiceAnswers] = useState<
    Array<{
      pageId: number;
      selectedChoice: string;
      isCorrect: boolean;
      choiceText?: string;
    }>
  >([]);
  const [totalScore, setTotalScore] = useState(0);
  const [showEssayWarning, setShowEssayWarning] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const totalPages = comicPages.length;

  const currentComic = comicPages[currentPage];
  const hasChoices = currentComic.choices && currentComic.choices.length > 0;
  const hasEssays = currentComic.essays && currentComic.essays.length > 0;
  const isMultiChoice = currentComic.type === "multichoice";

  // Reset scroll position when page changes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [currentPage]);

  const handleNext = () => {
    // Check if current page has essays
    if (hasEssays) {
      const pageAnswers = essayAnswers[currentPage] || {};
      const allFilled = currentComic.essays?.every(
        (essay) => pageAnswers[essay.id] && pageAnswers[essay.id].trim() !== "",
      );

      if (!allFilled) {
        setShowEssayWarning(true);
        setTimeout(() => setShowEssayWarning(false), 3000);
        return;
      }
    }

    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
      setFeedback({ show: false });
      setShowEssayWarning(false);
    }
  };

  const handleEssayChange = (essayId: string, value: string) => {
    setEssayAnswers((prev) => ({
      ...prev,
      [currentPage]: {
        ...(prev[currentPage] || {}),
        [essayId]: value,
      },
    }));
  };

  const handlePrev = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
      setFeedback({ show: false });
    }
  };

  const handleChoiceClick = (choice: Choice) => {
    // Award points for correct answer
    if (choice.isCorrect && onScoreUpdate) {
      onScoreUpdate(5);
      setTotalScore((prev) => prev + 5);
      console.log("✅ Jawaban benar! +5 poin");
    } else if (!choice.isCorrect) {
      console.log("❌ Jawaban salah. 0 poin");
    }

    // Track multiChoice answer
    const existingAnswer = multiChoiceAnswers.find(
      (a) => a.pageId === currentComic.id,
    );
    if (!existingAnswer) {
      setMultiChoiceAnswers((prev) => [
        ...prev,
        {
          pageId: currentComic.id,
          selectedChoice: choice.id,
          isCorrect: choice.isCorrect,
          choiceText: choice.text,
        },
      ]);
    }

    setFeedback({
      show: true,
      choice,
      selectedId: choice.id,
    });
  };

  const handleContinue = () => {
    setFeedback({ show: false });
    handleNext(); // Move to next page after feedback
  };

  const handleClose = async () => {
    // Save responses if classId and siswaId are provided
    if (classId && (siswaId || userProfile?.uid)) {
      try {
        const finalSiswaId = siswaId || userProfile?.uid;
        const finalSiswaName = siswaName || userProfile?.name;

        // Flatten essay answers from Record<number, Record<string, string>> to Record<string, string>
        const flattenedEssayAnswers: Record<string, string> = {};
        Object.entries(essayAnswers).forEach(([pageNum, answers]) => {
          Object.entries(answers).forEach(([essayId, answer]) => {
            flattenedEssayAnswers[essayId] = answer;
          });
        });

        // Add questionIndex to multiChoice answers
        const multiChoiceWithIndex = multiChoiceAnswers.map(
          (answer, index) => ({
            ...answer,
            questionIndex: index,
          }),
        );

        // Extract reflection answers (typically on the last page which is reflection type)
        const reflectionPageIndex = comicPages.findIndex(
          (p) => p.type === "reflection",
        );
        const reflectionAnswers =
          reflectionPageIndex !== -1
            ? essayAnswers[reflectionPageIndex] || {}
            : {};

        await saveStudentResponse(classId, finalSiswaId!, finalSiswaName!, {
          missionId: 1,
          missionName: "Ancaman Limbah Deterjen",
          essayAnswers: flattenedEssayAnswers,
          multiChoiceAnswers: multiChoiceWithIndex,
          reflectionAnswers: reflectionAnswers,
          totalScore: totalScore,
          status: "completed",
        });
        console.log("✅ Student response saved successfully");
      } catch (error) {
        console.error("❌ Error saving student response:", error);
      }
    }

    onClose();
  };

  const isLastPage = currentPage === totalPages - 1;
  const isReflectionPage = currentComic.type === "reflection";

  const contentHeight = `calc(100vh - ${HEADER_HEIGHT + FOOTER_HEIGHT}px)`;

  const getFeedbackIcon = (color: string) => {
    switch (color) {
      case "green":
        return <CheckCircle className="w-12 h-12 text-green-500" />;
      case "yellow":
        return <AlertCircle className="w-12 h-12 text-yellow-500" />;
      case "red":
        return <XCircle className="w-12 h-12 text-red-500" />;
      default:
        return null;
    }
  };

  const getFeedbackBgColor = (color: string) => {
    switch (color) {
      case "green":
        return "bg-green-50 border-green-200";
      case "yellow":
        return "bg-yellow-50 border-yellow-200";
      case "red":
        return "bg-red-50 border-red-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const getFeedbackTextColor = (color: string) => {
    switch (color) {
      case "green":
        return "text-green-900";
      case "yellow":
        return "text-yellow-900";
      case "red":
        return "text-red-900";
      default:
        return "text-gray-900";
    }
  };

  const getChoiceButtonColor = (color: string, isSelected: boolean) => {
    if (!isSelected) return "border-gray-200 hover:border-gray-400 bg-white";
    switch (color) {
      case "green":
        return "border-green-500 bg-green-50 text-green-900";
      case "yellow":
        return "border-yellow-500 bg-yellow-50 text-yellow-900";
      case "red":
        return "border-red-500 bg-red-50 text-red-900";
      default:
        return "border-gray-200 bg-white";
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 w-screen h-screen flex flex-col overflow-hidden"
      style={{
        backgroundImage: "url('/images/bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
      tabIndex={0}
    >
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-white/40 z-0" />
      {/* HEADER - Fixed Top */}
      <header
        className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-3 py-3 bg-blue-200 backdrop-blur-sm border-b border-gray-200"
        style={{ height: `${HEADER_HEIGHT}px` }}
      >
        <div className="text-xs font-medium text-gray-600 truncate">
          {currentComic.type === "instructions"
            ? "Panduan Membaca"
            : currentComic.type === "cover"
              ? "Cover Cerita"
              : "Bab 1: Ancaman Limbah Deterjen"}
        </div>
        <button
          onClick={handleClose}
          className="flex-shrink-0 p-1 hover:bg-gray-200 rounded-lg transition-colors ml-2"
        >
          <X size={18} className="text-gray-800" />
        </button>
      </header>

      {/* MAIN CONTENT - Centered */}
      <main
        className="flex items-center justify-center overflow-hidden relative cursor-pointer z-10"
        style={{
          marginTop: `${HEADER_HEIGHT}px`,
          marginBottom: `${FOOTER_HEIGHT}px`,
          height: contentHeight,
        }}
      >
        {/* Instructions Page */}
        {currentComic.type === "instructions" && (
          <div className="w-full h-full flex flex-col items-center justify-center px-6 py-8 gap-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPage}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-2xl text-center flex flex-col items-center gap-6"
              >
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                  {currentComic.title}
                </h1>
                <div className="w-full max-w-xl space-y-4">
                  {currentComic.instructions?.map((instruction, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg text-left text-sm md:text-base text-gray-700 leading-relaxed"
                    >
                      {instruction}
                    </div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        )}

        {/* Cover Page */}
        {currentComic.type === "cover" && (
          <div className="w-full h-full flex flex-col items-center justify-center px-6 py-8 gap-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPage}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="w-full flex flex-col items-center gap-6"
              >
                {/* Cover Image */}
                <div
                  className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden flex-shrink-0"
                  style={{
                    aspectRatio: "3 / 4",
                    maxHeight: "65vh",
                    width: "auto",
                  }}
                >
                  <img
                    src={currentComic.image}
                    alt="Cover"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="text-center">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                    {currentComic.title}
                  </h2>
                  <p className="text-gray-600 mt-2">{currentComic.subtitle}</p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        )}

        {/* Comic Pages */}
        {(currentComic.type === "overlay" ||
          currentComic.type === "image" ||
          currentComic.type === "image-with-essays" ||
          currentComic.type === "multichoice" ||
          currentComic.type === "reflection") && (
          <>
            {/* Mobile View */}
            <div
              ref={scrollRef}
              className="w-full h-full flex flex-col items-center md:hidden px-2 overflow-y-auto gap-4 py-4 pb-24"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentPage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="w-full flex flex-col items-center gap-4 py-2"
                >
                  {/* Reflection Title & Description - Mobile */}
                  {currentComic.type === "reflection" && (
                    <div className="w-full max-w-md px-2 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg shadow-lg border border-blue-200 p-4 mb-4">
                      <h2 className="text-lg font-bold text-gray-900 mb-2">
                        {currentComic.title}
                      </h2>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {currentComic.description}
                      </p>
                    </div>
                  )}

                  {/* Comic Panel - Mobile */}
                  <div
                    className="relative bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden flex-shrink-0"
                    style={{
                      aspectRatio:
                        currentComic.type === "reflection" ? "16 / 9" : "3 / 4",
                      maxHeight: "60vh",
                      width: "auto",
                    }}
                  >
                    <img
                      src={comicPages[currentPage].image}
                      alt={`Comic Page ${currentPage + 1}`}
                      className="w-full h-full"
                      style={{ objectFit: "contain" }}
                    />

                    {/* Interactive Choice Overlays (only for overlay type) */}
                    {currentComic.type === "overlay" &&
                      hasChoices &&
                      !feedback.show &&
                      comicPages[currentPage].choices?.map((choice) => (
                        <button
                          key={choice.id}
                          onClick={() => handleChoiceClick(choice as Choice)}
                          disabled={feedback.selectedId !== undefined}
                          className="absolute cursor-pointer hover:bg-blue-500/20 transition-colors rounded"
                          style={{
                            top: (choice as any).position?.top,
                            left: (choice as any).position?.left,
                            width: (choice as any).position?.width,
                            height: (choice as any).position?.height,
                          }}
                          title={`Pilihan ${choice.id}`}
                        />
                      ))}
                  </div>

                  {/* Google Maps 360 View - Mobile (below image) */}
                  {currentComic.mapUrl && (
                    <div className="w-full max-w-md px-2 flex-shrink-0">
                      <iframe
                        src={currentComic.mapUrl}
                        width="100%"
                        height="350"
                        style={{
                          border: "0",
                          borderRadius: "8px",
                          maxHeight: "350px",
                        }}
                        allowFullScreen={true}
                        title="Google Maps 360 View"
                      ></iframe>
                    </div>
                  )}

                  {/* Essay Questions - Mobile */}
                  {hasEssays && (
                    <div className="w-full max-w-md px-2 flex-shrink-0 bg-white rounded-lg shadow-lg border border-gray-200 p-4 space-y-4">
                      <div className="mb-3">
                        <h3 className="text-lg font-bold text-gray-900">
                          Pertanyaan Pengamatan
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Jawab pertanyaan berikut!!
                        </p>
                      </div>

                      {showEssayWarning && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex gap-2 items-start">
                          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-red-800">
                            Harap isi semua pertanyaan sebelum melanjutkan
                          </p>
                        </div>
                      )}

                      {currentComic.essays?.map((essay) => (
                        <div key={essay.id} className="space-y-2">
                          <label className="block text-sm font-semibold text-gray-800">
                            {essay.question}
                          </label>
                          <textarea
                            value={essayAnswers[currentPage]?.[essay.id] || ""}
                            onChange={(e) =>
                              handleEssayChange(essay.id, e.target.value)
                            }
                            placeholder={essay.placeholder}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            rows={4}
                          />
                          <div className="text-xs text-gray-500">
                            {
                              (essayAnswers[currentPage]?.[essay.id] || "")
                                .length
                            }{" "}
                            / 500 karakter
                          </div>
                        </div>
                      ))}

                      {/* Submit Button - Mobile */}
                      <button
                        onClick={handleNext}
                        disabled={
                          !currentComic.essays?.every(
                            (essay) =>
                              essayAnswers[currentPage]?.[essay.id] &&
                              essayAnswers[currentPage][essay.id].trim() !== "",
                          )
                        }
                        className="w-full mt-4 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                      >
                        Lanjut ke Halaman Berikutnya
                      </button>
                    </div>
                  )}

                  {/* Multiple Choice Buttons (only for multichoice type) */}
                  {isMultiChoice && hasChoices && !feedback.show && (
                    <div className="w-full grid grid-cols-2 gap-3 flex-shrink-0">
                      {comicPages[currentPage].choices?.map((choice) => (
                        <button
                          key={choice.id}
                          onClick={() => handleChoiceClick(choice as Choice)}
                          className={`p-3 rounded-lg border-2 font-semibold transition-all text-center text-black ${getChoiceButtonColor(choice.color, feedback.selectedId === choice.id)}`}
                        >
                          {choice.id}: {(choice as any).text}
                        </button>
                      ))}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Desktop View - Single Image (Same as Mobile) */}
            <div className="hidden md:w-full md:h-full md:flex md:flex-col md:overflow-y-auto md:px-2 md:py-4 md:pb-20">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentPage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="w-full flex flex-col items-center gap-6"
                >
                  {/* Reflection Title & Description - Desktop */}
                  {currentComic.type === "reflection" && (
                    <div
                      className="mx-auto bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg shadow-lg border border-blue-200 p-6 mb-4"
                      style={{ maxWidth: "calc(85vh * 16 / 9)", width: "auto" }}
                    >
                      <h2 className="text-2xl font-bold text-gray-900 mb-3">
                        {currentComic.title}
                      </h2>
                      <p className="text-base text-gray-700 leading-relaxed">
                        {currentComic.description}
                      </p>
                    </div>
                  )}

                  {/* Top Section: Image + Map */}
                  <div className="flex items-center justify-center gap-6">
                    {/* Comic Panel - Desktop */}
                    <div
                      className="relative bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden flex-shrink-0"
                      style={{
                        aspectRatio:
                          currentComic.type === "reflection"
                            ? "16 / 9"
                            : "3 / 4",
                        maxHeight: isMultiChoice ? "80vh" : "85vh",
                        width: "auto",
                      }}
                    >
                      <img
                        src={comicPages[currentPage].image}
                        alt={`Comic Page ${currentPage + 1}`}
                        className="w-full h-full"
                        style={{ objectFit: "contain" }}
                      />

                      {/* Interactive Choice Overlays (only for overlay type) */}
                      {currentComic.type === "overlay" &&
                        hasChoices &&
                        !feedback.show &&
                        comicPages[currentPage].choices?.map((choice) => (
                          <button
                            key={choice.id}
                            onClick={() => handleChoiceClick(choice as Choice)}
                            disabled={feedback.selectedId !== undefined}
                            className="absolute cursor-pointer hover:bg-blue-500/20 transition-colors rounded"
                            style={{
                              top: (choice as any).position?.top,
                              left: (choice as any).position?.left,
                              width: (choice as any).position?.width,
                              height: (choice as any).position?.height,
                            }}
                            title={`Pilihan ${choice.id}`}
                          />
                        ))}
                    </div>

                    {/* Google Maps 360 View - Desktop (beside image) */}
                    {currentComic.mapUrl && (
                      <div className="flex-shrink-0">
                        <iframe
                          src={currentComic.mapUrl}
                          width="450"
                          height="500"
                          style={{ border: "0", borderRadius: "8px" }}
                          allowFullScreen={true}
                          title="Google Maps 360 View"
                        ></iframe>
                      </div>
                    )}

                    {/* Multiple Choice Buttons (only for multichoice type) */}
                    {isMultiChoice && hasChoices && !feedback.show && (
                      <div
                        className={`flex-shrink-0 ${
                          isMultiChoice
                            ? "flex flex-col gap-3 justify-center h-full"
                            : "w-full max-w-2xl grid grid-cols-2 gap-3"
                        }`}
                      >
                        {comicPages[currentPage].choices?.map((choice) => (
                          <button
                            key={choice.id}
                            onClick={() => handleChoiceClick(choice as Choice)}
                            className={`p-3 md:p-4 rounded-lg border-2 font-semibold transition-all ${
                              isMultiChoice
                                ? "text-left flex items-center gap-3"
                                : "text-center"
                            } ${getChoiceButtonColor(choice.color, feedback.selectedId === choice.id)}`}
                          >
                            {isMultiChoice ? (
                              <>
                                <span className="text-lg font-bold flex-shrink-0 text-black">
                                  {choice.id}
                                </span>
                                <span className="text-sm text-black">
                                  {(choice as any).text}
                                </span>
                              </>
                            ) : (
                              <>
                                <div className="text-sm md:text-base text-black">
                                  {choice.id}
                                </div>
                                <div className="text-xs md:text-sm text-black">
                                  {(choice as any).text}
                                </div>
                              </>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Bottom Section: Essays (only for essay pages) */}
                  {hasEssays && (
                    <div className="w-full max-w-2xl mx-auto bg-white rounded-lg shadow-lg border border-gray-200 p-6 space-y-4">
                      <div className="mb-3">
                        <h3 className="text-lg font-bold text-gray-900">
                          Pertanyaan Pengamatan
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Jawab pertanyaan berikut!!
                        </p>
                      </div>

                      {showEssayWarning && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex gap-2 items-start">
                          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-red-800">
                            Harap isi semua pertanyaan sebelum melanjutkan
                          </p>
                        </div>
                      )}

                      <div className="space-y-4">
                        {currentComic.essays?.map((essay) => (
                          <div key={essay.id} className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-800">
                              {essay.question}
                            </label>
                            <textarea
                              value={
                                essayAnswers[currentPage]?.[essay.id] || ""
                              }
                              onChange={(e) =>
                                handleEssayChange(essay.id, e.target.value)
                              }
                              placeholder={essay.placeholder}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                              rows={3}
                            />
                            <div className="text-xs text-gray-500">
                              {
                                (essayAnswers[currentPage]?.[essay.id] || "")
                                  .length
                              }{" "}
                              / 500 karakter
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Submit Button - Desktop */}
                      <button
                        onClick={handleNext}
                        disabled={
                          !currentComic.essays?.every(
                            (essay) =>
                              essayAnswers[currentPage]?.[essay.id] &&
                              essayAnswers[currentPage][essay.id].trim() !== "",
                          )
                        }
                        className="w-full mt-4 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                      >
                        Lanjut ke Halaman Berikutnya
                      </button>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </>
        )}
      </main>

      {/* Feedback Modal */}
      <AnimatePresence>
        {feedback.show && feedback.choice && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm"
              style={{
                marginTop: `${HEADER_HEIGHT}px`,
                marginBottom: `${FOOTER_HEIGHT}px`,
              }}
            />

            {/* Feedback Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 30 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="
    fixed top-1/2 left-1/2 z-40
    -translate-x-1/2 -translate-y-1/2
    w-[92%] max-w-xl
    rounded-2xl
    backdrop-blur-xl
    bg-white/80
    border border-white/30
    shadow-2xl
    overflow-hidden
  "
            >
              {/* Close Button */}
              <button
                onClick={handleContinue}
                className="absolute top-3 right-3 p-1 hover:bg-black/10 rounded-lg transition-colors"
              >
                <X
                  size={20}
                  className={`${
                    feedback.choice.color === "green"
                      ? "text-green-600"
                      : feedback.choice.color === "yellow"
                        ? "text-yellow-600"
                        : "text-red-600"
                  }`}
                />
              </button>

              {/* Icon */}
              <div className="flex justify-center mb-4">
                {getFeedbackIcon(feedback.choice.color)}
              </div>

              {/* Title */}
              <h3
                className={`text-center text-lg font-bold mb-3 ${getFeedbackTextColor(feedback.choice.color)}`}
              >
                {feedback.choice.isCorrect
                  ? "Jawaban Bagus! ✨"
                  : "Jawaban Berbahaya! ⚠️"}
              </h3>

              {/* Feedback Image atau Text */}
              {(feedback.choice as any).image ? (
                <div className="flex justify-center mb-6">
                  <div
                    className="bg-white rounded-lg overflow-hidden"
                    style={{
                      aspectRatio: "4 / 3",
                      maxWidth: "370px",
                      height: "auto",
                    }}
                  >
                    <img
                      src={(feedback.choice as any).image}
                      alt="Feedback"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              ) : (
                <p
                  className={`text-center text-sm mb-6 leading-relaxed whitespace-pre-wrap ${getFeedbackTextColor(feedback.choice.color)}`}
                >
                  {feedback.choice.feedback}
                </p>
              )}

              {/* Continue Button */}
              <button
                onClick={handleContinue}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Lanjut
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* FOOTER - Fixed Bottom */}
      <footer
        className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-2 bg-blue-200 backdrop-blur-sm border-t border-gray-200"
        style={{ height: `${FOOTER_HEIGHT}px` }}
      >
        {/* Tombol Kembali */}
        <button
          onClick={isReflectionPage ? handleClose : handlePrev}
          disabled={currentPage === 0 && !isReflectionPage}
          className={`px-3 py-1 text-sm font-medium rounded-lg ${
            isReflectionPage
              ? "bg-gray-200 hover:bg-gray-300 text-gray-800"
              : "bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400"
          }`}
        >
          {isReflectionPage ? "← Kembali ke Beranda" : "← Kembali"}
        </button>

        {/* Page Indicator */}
        <span className="text-xs font-medium text-gray-600">
          {currentPage + 1}/{totalPages}
        </span>

        {/* Tombol Lanjut / Selesai */}
        <button
          onClick={isReflectionPage ? handleClose : handleNext}
          disabled={
            (currentPage === totalPages - 1 && !isReflectionPage) ||
            (hasChoices && !feedback.show && !isReflectionPage) ||
            (isReflectionPage &&
              !currentComic.essays?.every(
                (essay) =>
                  essayAnswers[currentPage]?.[essay.id] &&
                  essayAnswers[currentPage][essay.id].trim() !== "",
              ))
          }
          className={`px-3 py-1 text-sm font-medium rounded-lg ${
            isReflectionPage
              ? "bg-green-500 hover:bg-green-600 text-white disabled:bg-gray-300"
              : "bg-blue-500 hover:bg-blue-600 text-white disabled:bg-gray-300"
          }`}
        >
          {isReflectionPage ? "✓ Selesai" : "Lanjut →"}
        </button>
      </footer>
    </div>
  );
}

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

// Comic pages data for Mission 3 - Air Pollution
const comicPages = [
  {
    id: 0,
    type: "instructions",
    title: "💨 Petualangan Edukasi Polusi Udara",
    subtitle: "Bernafas Sehat di Masa Depan yang Berkelanjutan",
    instructions: [
      {
        icon: "⏭️",
        title: "Navigasi Cerita",
        description:
          "Tekan tombol LANJUT (panah biru) di bagian bawah layar untuk melanjutkan ke halaman berikutnya",
      },
      {
        icon: "🗺️",
        title: "Jelajahi Lokasi",
        description:
          "Lihat Google Maps 360° untuk memahami dampak emisi kendaraan nyata",
      },
      {
        icon: "✍️",
        title: "Pengamatan Mendalam",
        description:
          "Jawab pertanyaan esai untuk menganalisis sumber polusi udara",
      },
      {
        icon: "🎯",
        title: "Tantangan Pilihan",
        description:
          "Pilih solusi terbaik dan pelajari cara menjaga kualitas udara",
      },
      {
        icon: "💡",
        title: "Baca Umpan Balik",
        description:
          "Setiap jawaban memberi wawasan tentang kesehatan pernapasan dan lingkungan",
      },
      {
        icon: "🏆",
        title: "Raih Kesempatan",
        description:
          "Selesaikan semua halaman dan ciptakan perubahan positif untuk udara bersih!",
      },
    ],
  },
  {
    id: -1,
    type: "cover",
    image: "/images/cvu.jpeg",
    title: "Ancaman Polusi Udara",
    subtitle: "Mari Belajar Dampak Lingkungan",
  },
  {
    id: 1,
    image: "/images/1u.jpeg",
    type: "image-with-essays",
    mapUrl:
      "https://www.google.com/maps/embed?pb=!4v1779018324304!6m8!1m7!1saLOruwU5GUYQGrSr8ZjFng!2m2!1d-8.091431617935106!2d112.6373380975419!3f185.6549272913661!4f42.53766431901332!5f0.4000000000000002",
    choices: [],
    essays: [
      {
        id: "essay1",
        question:
          "1. Apa yang kamu amati pada kondisi udara di jalan tersebut?",
        placeholder: "Jelaskan kondisi udara yang Anda amati...",
        required: true,
      },
      {
        id: "essay2",
        question:
          "2. Apakah terdapat tanda-tanda pencemaran udara yang terlihat? Jelaskan.",
        placeholder: "Jelaskan tanda-tanda pencemaran udara yang Anda amati...",
        required: true,
      },
      {
        id: "essay3",
        question:
          "3. Menurutmu, aktivitas manusia apa saja yang kemungkinan berkontribusi terhadap kondisi tersebut?",
        placeholder:
          "Jelaskan aktivitas manusia yang mungkin menyebabkan pencemaran udara...",
        required: true,
      },
      {
        id: "essay4",
        question:
          "4. Apa dampak yang mungkin terjadi terhadap manusia dan lingkungan di sekitar jalan tersebut?",
        placeholder:
          "Jelaskan dampak pencemaran udara terhadap manusia dan lingkungan...",
        required: true,
      },
      {
        id: "essay5",
        question:
          "5. Apa risiko yang dapat terjadi jika pencemaran udara ini diabaikan?",
        placeholder: "Jelaskan risiko yang mungkin terjadi...",
        required: true,
      },
    ],
  },
  {
    id: 2,
    image: "/images/2u.jpeg",
    type: "image",
    choices: [],
  },
  {
    id: 3,
    image: "/images/3u.jpeg",
    type: "multichoice",
    choices: [
      {
        id: "A",
        text: "Pilihan A",
        isCorrect: true,
        feedback:
          "Jawaban ini kurang tepat.\nAsap kendaraan mengandung polutan berbahaya yang tidak hilang begitu saja.\n🔮 Jika emisi terus dibuang, polutan akan terakumulasi di atmosfer dan menyebabkan masalah kesehatan jangka panjang.",
        image: "/images/fb/1UA.jpeg",
        color: "green",
      },
      {
        id: "B",
        text: "Pilihan B",
        isCorrect: false,
        feedback:
          "Jawaban ini belum tepat.\nPolusi udara yang terjadi terus-menerus dapat terakumulasi.\n🔮 Dalam jangka panjang, dampak yang awalnya kecil bisa berkembang menjadi pencemaran udara serius yang sulit dipulihkan.",
        image: "/images/fb/1UB.jpeg",
        color: "red",
      },
      {
        id: "C",
        text: "Pilihan C",
        isCorrect: false,
        feedback:
          "Jawaban ini tepat! 🌿\nEmisi kendaraan yang terjadi terus-menerus dapat berkembang menjadi masalah besar bagi kualitas udara.\n🔮 Jika kondisi ini dibiarkan, pencemaran udara akan semakin parah, kualitas udara menurun, dan kesehatan masyarakat bisa terancam.\n🌱 Sebaliknya, jika emisi dikendalikan sejak awal, kualitas udara masih bisa dipertahankan di masa depan.",
        image: "/images/fb/1UC.jpeg",
        color: "red",
      },
      {
        id: "D",
        text: "Pilihan D",
        isCorrect: true,
        feedback:
          "Jawaban ini tidak tepat.\nAtmosfer memiliki kemampuan menyebarkan polutan, namun terbatas.\n🔮 Jika beban pencemaran terus meningkat, kemampuan ini akan gagal, dan udara bisa mengalami kerusakan permanen di masa depan.",
        image: "/images/fb/1UD.jpeg",
        color: "green",
      },
    ],
  },
  {
    id: 4,
    image: "/images/4u.jpeg",
    type: "multichoice",
    choices: [
      {
        id: "A",
        text: "Pilihan A",
        isCorrect: true,
        feedback:
          "Jawaban ini kurang tepat.\nAsap kendaraan mengandung polutan berbahaya yang tidak hilang begitu saja.\n🔮 Jika emisi terus dibuang, polutan akan terakumulasi di atmosfer dan menyebabkan masalah kesehatan jangka panjang.",
        image: "/images/fb/2UA.jpeg",
        color: "green",
      },
      {
        id: "B",
        text: "Pilihan B",
        isCorrect: false,
        feedback:
          "Jawaban ini belum tepat.\nPolusi udara yang terjadi terus-menerus dapat terakumulasi.\n🔮 Dalam jangka panjang, dampak yang awalnya kecil bisa berkembang menjadi pencemaran udara serius yang sulit dipulihkan.",
        image: "/images/fb/2UB.jpeg",
        color: "red",
      },
      {
        id: "C",
        text: "Pilihan C",
        isCorrect: false,
        feedback:
          "Jawaban ini tepat! 🌿\nEmisi kendaraan yang terjadi terus-menerus dapat berkembang menjadi masalah besar bagi kualitas udara.\n🔮 Jika kondisi ini dibiarkan, pencemaran udara akan semakin parah, kualitas udara menurun, dan kesehatan masyarakat bisa terancam.\n🌱 Sebaliknya, jika emisi dikendalikan sejak awal, kualitas udara masih bisa dipertahankan di masa depan.",
        image: "/images/fb/2UC.jpeg",
        color: "red",
      },
      {
        id: "D",
        text: "Pilihan D",
        isCorrect: false,
        feedback:
          "Jawaban ini tidak tepat.\nAtmosfer memiliki kemampuan menyebarkan polutan, namun terbatas.\n🔮 Jika beban pencemaran terus meningkat, kemampuan ini akan gagal, dan udara bisa mengalami kerusakan permanen di masa depan.",
        image: "/images/fb/2UD.jpeg",
        color: "red",
      },
    ],
  },
  {
    id: 5,
    image: "/images/5u.jpeg",
    type: "multichoice",
    choices: [
      {
        id: "A",
        text: "Pilihan A",
        isCorrect: false,
        feedback:
          "Jawaban ini kurang tepat.\nAsap kendaraan mengandung polutan berbahaya yang tidak hilang begitu saja.\n🔮 Jika emisi terus dibuang, polutan akan terakumulasi di atmosfer dan menyebabkan masalah kesehatan jangka panjang.",
        image: "/images/fb/3UA.jpeg",
        color: "red",
      },
      {
        id: "B",
        text: "Pilihan B",
        isCorrect: true,
        feedback:
          "Jawaban ini belum tepat.\nPolusi udara yang terjadi terus-menerus dapat terakumulasi.\n🔮 Dalam jangka panjang, dampak yang awalnya kecil bisa berkembang menjadi pencemaran udara serius yang sulit dipulihkan.",
        image: "/images/fb/3UB.jpeg",
        color: "green",
      },
      {
        id: "C",
        text: "Pilihan C",
        isCorrect: false,
        feedback:
          "Jawaban ini tepat! 🌿\nEmisi kendaraan yang terjadi terus-menerus dapat berkembang menjadi masalah besar bagi kualitas udara.\n🔮 Jika kondisi ini dibiarkan, pencemaran udara akan semakin parah, kualitas udara menurun, dan kesehatan masyarakat bisa terancam.\n🌱 Sebaliknya, jika emisi dikendalikan sejak awal, kualitas udara masih bisa dipertahankan di masa depan.",
        image: "/images/fb/3UC.jpeg",
        color: "red",
      },
      {
        id: "D",
        text: "Pilihan D",
        isCorrect: false,
        feedback:
          "Jawaban ini tidak tepat.\nAtmosfer memiliki kemampuan menyebarkan polutan, namun terbatas.\n🔮 Jika beban pencemaran terus meningkat, kemampuan ini akan gagal, dan udara bisa mengalami kerusakan permanen di masa depan.",
        image: "/images/fb/3UD.jpeg",
        color: "red",
      },
    ],
  },
  {
    id: 6,
    image: "/images/6u.jpeg",
    type: "multichoice",
    choices: [
      {
        id: "A",
        text: "Pilihan A",
        isCorrect: true,
        feedback:
          "Jawaban ini tidak tepat.\nKondisi lingkungan tidak akan tetap stabil tanpa adanya upaya menjaga.\n 🔮Jika tidak ada perubahan perilaku, pencemaran udara akan terus terjadi dan kualitas udara justru akan menurun dalam jangka panjang.",
        image: "/images/fb/4UA.jpeg",
        color: "green",
      },
      {
        id: "B",
        text: "Pilihan B",
        isCorrect: false,
        feedback:
          "Jawaban ini tepat!\nKondisi udara sangat dipengaruhi oleh perilaku manusia.\n 🔮 Jika masyarakat mulai menggunakan transportasi ramah lingkungan dan menjaga lingkungan, kualitas udara dapat membaik dan ekosistem bisa pulih secara bertahap di masa depan.💡 Ini menunjukkan bahwa tindakan saat ini dapat menghasilkan dampak positif jangka panjang.",
        image: "/images/fb/4UB.jpeg",
        color: "red",
      },
      {
        id: "C",
        text: "Pilihan C",
        isCorrect: false,
        feedback:
          "Jawaban ini kurang tepat.\nPerubahan lingkungan tidak terjadi secara acak, tetapi dipengaruhi oleh tindakan manusia.\n 🔮 Jika tidak ada pengelolaan yang jelas, kondisi udara cenderung akan terus memburuk, bukan berubah tanpa arah. ",
        image: "/images/fb/4UC.jpeg",
        color: "red",
      },
      {
        id: "D",
        text: "Pilihan D",
        isCorrect: false,
        feedback:
          "Jawaban ini tepat.\nJika tidak ada upaya perbaikan, pencemaran udara akan terus terakumulasi.\n 🔮 Dalam jangka panjang, udara bisa mengalami kerusakan parah, masalah pernapasan meningkat, dan kualitas hidup menurun.💡 Ini menunjukkan konsekuensi negatif dari tidak adanya tindakan saat ini.",
        image: "/images/fb/4UD.jpeg",
        color: "red",
      },
    ],
  },
  {
    id: 7,
    image: "/images/7u.jpeg",
    type: "multichoice",
    choices: [
      {
        id: "A",
        text: "Pilihan A",
        isCorrect: false,
        feedback:
          "Jawaban ini kurang tepat.\nAsap kendaraan mengandung polutan berbahaya yang tidak hilang begitu saja.\n🔮 Jika emisi terus dibuang, polutan akan terakumulasi di atmosfer dan menyebabkan masalah kesehatan jangka panjang.",
        image: "/images/fb/5UA.jpeg",
        color: "red",
      },
      {
        id: "B",
        text: "Pilihan B",
        isCorrect: true,
        feedback:
          "Jawaban ini belum tepat.\nPolusi udara yang terjadi terus-menerus dapat terakumulasi.\n🔮 Dalam jangka panjang, dampak yang awalnya kecil bisa berkembang menjadi pencemaran udara serius yang sulit dipulihkan.",
        image: "/images/fb/5UB.jpeg",
        color: "green",
      },
      {
        id: "C",
        text: "Pilihan C",
        isCorrect: false,
        feedback:
          "Jawaban ini tepat! 🌿\nEmisi kendaraan yang terjadi terus-menerus dapat berkembang menjadi masalah besar bagi kualitas udara.\n🔮 Jika kondisi ini dibiarkan, pencemaran udara akan semakin parah, kualitas udara menurun, dan kesehatan masyarakat bisa terancam.\n🌱 Sebaliknya, jika emisi dikendalikan sejak awal, kualitas udara masih bisa dipertahankan di masa depan.",
        image: "/images/fb/5UC.jpeg",
        color: "red",
      },
      {
        id: "D",
        text: "Pilihan D",
        isCorrect: false,
        feedback:
          "Jawaban ini tidak tepat.\nAtmosfer memiliki kemampuan menyebarkan polutan, namun terbatas.\n🔮 Jika beban pencemaran terus meningkat, kemampuan ini akan gagal, dan udara bisa mengalami kerusakan permanen di masa depan.",
        image: "/images/fb/5UD.jpeg",
        color: "red",
      },
    ],
  },
  {
    id: 8,
    image: "/images/8u.jpeg",
    type: "image",
    choices: [],
  },
  {
    id: 12,
    type: "reflection",
    image: "/images/komik12.png",
    title: "Refleksi Diri dan Masa Depan",
    description:
      "Kualitas udara di masa depan tidak terjadi secara tiba-tiba, tetapi merupakan hasil dari tindakan yang kita lakukan hari ini. Setiap kebiasaan, sekecil apa pun, dapat memberikan dampak terhadap kondisi udara. Sekarang, coba refleksikan kembali apa yang pernah kamu lakukan dan bagaimana hal tersebut dapat memengaruhi kualitas udara di masa depan.",
    essays: [
      {
        id: "r1",
        question:
          "1. Setelah mempelajari misi tersebut, apakah kamu lebih menyadari dampak aktivitas manusia terhadap kualitas udara? Jelaskan.",
        placeholder: "Jelaskan perasaanmu setelah mempelajari misi ini...",
        required: true,
      },
      {
        id: "r2",
        question:
          "2. Setelah mengamati permasalahan tersebut, apakah kamu merasa perlu mulai menerapkan kebiasaan yang lebih ramah lingkungan? Mengapa?",
        placeholder: "Jelaskan pendapatmu...",
        required: true,
      },
      {
        id: "r3",
        question:
          "3. Solusi apa yang paling sesuai dengan prinsip green chemistry untuk membantu mengurangi polusi udara? Jelaskan alasanmu.",
        placeholder: "Jelaskan solusi yang kamu pilih dan alasanmu...",
        required: true,
      },
      {
        id: "r4",
        question:
          "4. Tindakan apa yang dapat kamu lakukan untuk membantu menjaga kualitas udara di lingkungan sekitar?",
        placeholder: "Jelaskan tindakan yang akan kamu lakukan...",
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

export default function ComicStoryMisi2({
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
    console.log("🔴 handleClose() called");
    console.log("📋 Current state:", {
      siswaId,
      userProfile: userProfile?.uid,
    });

    // Save responses if siswaId is available
    const finalSiswaId = siswaId || userProfile?.uid;
    if (finalSiswaId) {
      console.log("✅ Conditions met for saving (siswaId available)");
      try {
        const finalSiswaName = siswaName || userProfile?.name;
        console.log("👤 Final IDs:", { finalSiswaId, finalSiswaName });

        // Find reflection page index first
        const reflectionPageIndex = comicPages.findIndex(
          (p) => p.type === "reflection",
        );

        // Flatten essay answers from Record<number, Record<string, string>> to Record<string, string>
        // EXCLUDE reflection answers (only include observation/image-with-essays answers)
        const flattenedEssayAnswers: Record<string, string> = {};
        const flattenedEssayQuestions: Record<string, string> = {};
        Object.entries(essayAnswers).forEach(([pageNum, answers]) => {
          const pageNumInt = parseInt(pageNum);
          // Skip reflection page when flattening
          if (pageNumInt !== reflectionPageIndex) {
            const page = comicPages[pageNumInt];
            Object.entries(answers).forEach(([essayId, answer]) => {
              flattenedEssayAnswers[essayId] = answer;
              // Find and store the question
              const essay = page.essays?.find((e) => e.id === essayId);
              if (essay) {
                flattenedEssayQuestions[essayId] = essay.question;
              }
            });
          }
        });

        // Add questionIndex to multiChoice answers
        const multiChoiceWithIndex = multiChoiceAnswers.map(
          (answer, index) => ({
            ...answer,
            questionIndex: index,
          }),
        );

        // Extract reflection answers and questions (only from reflection page)
        const reflectionAnswers =
          reflectionPageIndex !== -1
            ? essayAnswers[reflectionPageIndex] || {}
            : {};

        const reflectionQuestions: Record<string, string> = {};
        if (reflectionPageIndex !== -1) {
          const reflectionPage = comicPages[reflectionPageIndex];
          Object.keys(reflectionAnswers).forEach((reflectionId) => {
            const reflection = reflectionPage.essays?.find(
              (e) => e.id === reflectionId,
            );
            if (reflection) {
              reflectionQuestions[reflectionId] = reflection.question;
            }
          });
        }

        console.log("📊 Data to save:", {
          essayCount: Object.keys(flattenedEssayAnswers).length,
          essayQuestionCount: Object.keys(flattenedEssayQuestions).length,
          multiChoiceCount: multiChoiceWithIndex.length,
          reflectionCount: Object.keys(reflectionAnswers).length,
          reflectionQuestionCount: Object.keys(reflectionQuestions).length,
          totalScore,
        });

        await saveStudentResponse(finalSiswaId, finalSiswaName, {
          classId: classId || "",
          missionId: 3,
          missionName: "Polusi Udara",
          essayAnswers: flattenedEssayAnswers,
          essayQuestions: flattenedEssayQuestions,
          multiChoiceAnswers: multiChoiceWithIndex,
          reflectionAnswers: reflectionAnswers,
          reflectionQuestions: reflectionQuestions,
          totalScore: totalScore,
          status: "completed",
        });
        console.log("✅ Student response saved successfully");
      } catch (error) {
        console.error("❌ Error saving student response:", error);
        alert("Gagal menyimpan jawaban. Silakan coba lagi.");
      }
    } else {
      console.error("❌ Cannot save - missing siswaId");
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
              : "Pencemaran Udara"}
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
          <div className="w-full h-full flex flex-col items-center justify-start overflow-y-auto px-2 sm:px-4 py-4 sm:py-6 md:py-8 gap-4 sm:gap-6 md:gap-8 pt-6 sm:pt-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPage}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-4xl flex flex-col items-center gap-4 sm:gap-6 md:gap-8 pb-8"
              >
                {/* Header */}
                <div className="text-center w-full">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-1 sm:mb-2 line-clamp-2">
                    {currentComic.title}
                  </h1>
                  {currentComic.subtitle && (
                    <p className="text-xs sm:text-sm md:text-base text-gray-600 font-medium px-2">
                      {currentComic.subtitle}
                    </p>
                  )}
                </div>

                {/* Instructions Grid */}
                <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 md:gap-4 px-0 sm:px-0">
                  {(currentComic as any).instructions?.map(
                    (instruction: any, idx: number) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: idx * 0.1 }}
                        className="group relative bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5 hover:shadow-lg hover:border-orange-400 transition-all duration-300 cursor-default"
                      >
                        {/* Background decoration */}
                        <div className="absolute top-0 right-0 w-20 h-20 sm:w-24 sm:h-24 bg-orange-200/20 rounded-full -mr-6 sm:-mr-8 -mt-6 sm:-mt-8 group-hover:scale-150 transition-transform duration-300" />

                        {/* Content */}
                        <div className="relative z-10 flex gap-2 sm:gap-3 md:gap-4">
                          <div className="text-2xl sm:text-3xl md:text-4xl flex-shrink-0">
                            {instruction.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-900 mb-0.5 sm:mb-1 text-xs sm:text-sm md:text-base line-clamp-1">
                              {instruction.title}
                            </h3>
                            <p className="text-gray-700 text-xs md:text-sm leading-relaxed line-clamp-3 sm:line-clamp-4">
                              {instruction.description}
                            </p>
                          </div>
                        </div>

                        {/* Step indicator */}
                        <div className="absolute bottom-1 right-2 sm:bottom-2 sm:right-3 w-6 h-6 sm:w-7 sm:h-7 bg-orange-200 rounded-full flex items-center justify-center text-xs font-bold text-orange-900">
                          {idx + 1}
                        </div>
                      </motion.div>
                    ),
                  )}
                </div>

                {/* Progress Bar */}
                <div className="w-full max-w-md px-4 sm:px-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs sm:text-sm font-semibold text-gray-700">
                      Siap untuk memulai?
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="h-full bg-gradient-to-r from-orange-500 to-amber-500"
                    />
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        )}

        {/* Cover Page */}
        {currentComic.type === "cover" && (
          <div className="w-full h-full flex flex-col items-center justify-start overflow-y-auto px-2 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 gap-4 sm:gap-6 md:gap-8 pt-6 sm:pt-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPage}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="w-full flex flex-col items-center gap-4 sm:gap-6 md:gap-8 pb-8"
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
                <div className="text-center px-2 sm:px-0">
                  <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 line-clamp-2">
                    {currentComic.title}
                  </h2>
                  <p className="text-xs sm:text-sm md:text-base text-gray-600 mt-1 sm:mt-2">
                    {currentComic.subtitle}
                  </p>
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

                  {/* Essay Questions - Mobile (Only for Observation) */}
                  {currentComic.type === "image-with-essays" && hasEssays && (
                    <div className="w-full max-w-md px-2 flex-shrink-0 bg-white rounded-lg shadow-lg border border-gray-200 p-4 space-y-4">
                      <div className="mb-3">
                        <h3 className="text-lg font-bold text-gray-900">
                          Pertanyaan Pengamatan
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Setelah kalian mengamati udara di jalan raya,
                          jawabalah pertanyaan berikut!
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

                  {/* Reflection Essays - Mobile */}
                  {currentComic.type === "reflection" && hasEssays && (
                    <div className="w-full max-w-md px-2 flex-shrink-0 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg shadow-lg border border-purple-200 p-4 space-y-4">
                      <div className="mb-3">
                        <h3 className="text-lg font-bold text-purple-900">
                          Refleksi Diri
                        </h3>
                        <p className="text-sm text-purple-700 mt-1">
                          Renungkan pengalaman dan komitmen Anda untuk masa
                          depan yang lebih baik
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
                        <div
                          key={essay.id}
                          className="space-y-2 pb-3 border-b border-purple-200 last:border-b-0"
                        >
                          <label className="block text-sm font-semibold text-purple-900">
                            {essay.question}
                          </label>
                          <textarea
                            value={essayAnswers[currentPage]?.[essay.id] || ""}
                            onChange={(e) =>
                              handleEssayChange(essay.id, e.target.value)
                            }
                            placeholder={essay.placeholder}
                            className="w-full px-3 py-2 border border-purple-300 rounded-lg text-sm text-black focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none bg-white/80"
                            rows={4}
                          />
                          <div className="text-xs text-purple-600">
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
                        onClick={handleClose}
                        disabled={
                          !currentComic.essays?.every(
                            (essay) =>
                              essayAnswers[currentPage]?.[essay.id] &&
                              essayAnswers[currentPage][essay.id].trim() !== "",
                          )
                        }
                        className="w-full mt-4 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                      >
                        Selesaikan Refleksi
                      </button>
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

                  {/* Bottom Section: Essays (only for Observation pages) */}
                  {currentComic.type === "image-with-essays" && hasEssays && (
                    <div className="w-full max-w-2xl mx-auto bg-white rounded-lg shadow-lg border border-gray-200 p-6 space-y-4">
                      <div className="mb-3">
                        <h3 className="text-lg font-bold text-gray-900">
                          Pertanyaan Pengamatan
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Setelah kalian mengamati udara di jalan raya,
                          jawabalah pertanyaan berikut!
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

                  {/* Reflection Essays - Desktop */}
                  {currentComic.type === "reflection" && hasEssays && (
                    <div className="w-full max-w-3xl mx-auto bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg shadow-lg border border-purple-200 p-8 space-y-6">
                      <div className="mb-4">
                        <h3 className="text-2xl font-bold text-purple-900 mb-3">
                          🌱 Refleksi Diri dan Komitmen
                        </h3>
                        <p className="text-base text-purple-700 leading-relaxed">
                          Renungkan kembali perjalanan pembelajaran Anda. Setiap
                          pertanyaan di bawah dirancang untuk membantu Anda
                          memahami dampak tindakan Anda dan merencanakan
                          perubahan positif untuk masa depan.
                        </p>
                      </div>

                      {showEssayWarning && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3 items-start">
                          <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                          <p className="text-base text-red-800">
                            Harap isi semua pertanyaan sebelum menyelesaikan
                            refleksi
                          </p>
                        </div>
                      )}

                      <div className="space-y-6">
                        {currentComic.essays?.map((essay, index) => (
                          <div
                            key={essay.id}
                            className="bg-white rounded-lg p-5 border border-purple-200 hover:border-purple-300 transition-colors"
                          >
                            <div className="flex items-start gap-3 mb-3">
                              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-purple-500 text-white font-semibold text-sm flex-shrink-0">
                                {index + 1}
                              </span>
                              <label className="block text-base font-semibold text-purple-900 flex-1">
                                {essay.question}
                              </label>
                            </div>
                            <textarea
                              value={
                                essayAnswers[currentPage]?.[essay.id] || ""
                              }
                              onChange={(e) =>
                                handleEssayChange(essay.id, e.target.value)
                              }
                              placeholder={essay.placeholder}
                              className="w-full px-4 py-3 border border-purple-300 rounded-lg text-base text-black focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                              rows={4}
                            />
                            <div className="text-sm text-purple-600 mt-2">
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
                        onClick={handleClose}
                        disabled={
                          !currentComic.essays?.every(
                            (essay) =>
                              essayAnswers[currentPage]?.[essay.id] &&
                              essayAnswers[currentPage][essay.id].trim() !== "",
                          )
                        }
                        className="w-full mt-6 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors text-lg"
                      >
                        ✓ Selesaikan Refleksi dan Misi
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
                  className={`{
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

import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { ChevronLeft, ChevronRight, X, CheckCircle, AlertCircle, XCircle } from "lucide-react";

// Comic pages data with interactive choices
const comicPages = [
  {
    id: 1,
    image: "/images/komik1.png",
    type: "overlay", // overlay choices on the image
    choices: [
      {
        id: "A",
        position: { top: "70%", left: "10%", width: "20%", height: "15%" },
        isCorrect: false,
        feedback:
          "Jawaban ini kurang tepat. Air yang mengalir tidak selalu menghilangkan pencemar. Zat kimia bisa tetap terakumulasi.",
        color: "red",
      },
      {
        id: "B",
        position: { top: "70%", left: "35%", width: "20%", height: "15%" },
        isCorrect: false,
        feedback:
          "Jawaban ini belum tepat. Perubahan kecil yang terus terjadi dapat berkembang menjadi masalah besar.",
        color: "yellow",
      },
      {
        id: "C",
        position: { top: "70%", left: "60%", width: "20%", height: "15%" },
        isCorrect: true,
        feedback:
          "Jawaban ini tepat! Perubahan kecil dapat berkembang dan merusak ekosistem jika tidak ditangani.",
        color: "green",
      },
      {
        id: "D",
        position: { top: "70%", left: "85%", width: "20%", height: "15%" },
        isCorrect: false,
        feedback:
          "Jawaban ini tidak tepat. Sungai tidak dapat pulih sendiri jika sumber pencemaran terus ada.",
        color: "red",
      },
    ],
  },
  { id: 2, image: "/images/komik2.png", type: "image", choices: [] },
  { id: 3, image: "/images/komik3.png", type: "image", choices: [] },
  {
    id: 4,
    image: "/images/komik4.png",
    type: "multichoice", // multiple choice beside/below image
    choices: [
      {
        id: "A",
        text: "Pilihan A",
        isCorrect: false,
        feedback: "Jawaban ini kurang tepat.",
        color: "red",
      },
      {
        id: "B",
        text: "Pilihan B",
        isCorrect: false,
        feedback: "Jawaban ini belum tepat.",
        color: "yellow",
      },
      {
        id: "C",
        text: "Pilihan C",
        isCorrect: true,
        feedback: "Jawaban ini tepat!",
        color: "green",
      },
      {
        id: "D",
        text: "Pilihan D",
        isCorrect: false,
        feedback: "Jawaban ini tidak tepat.",
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
        feedback: "Jawaban ini kurang tepat.",
        color: "red",
      },
      {
        id: "B",
        text: "Pilihan B",
        isCorrect: true,
        feedback: "Jawaban ini tepat!",
        color: "green",
      },
      {
        id: "C",
        text: "Pilihan C",
        isCorrect: false,
        feedback: "Jawaban ini belum tepat.",
        color: "yellow",
      },
      {
        id: "D",
        text: "Pilihan D",
        isCorrect: false,
        feedback: "Jawaban ini tidak tepat.",
        color: "red",
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
        color: "red",
      },
      {
        id: "B",
        text: "Pilihan B",
        isCorrect: false,
        feedback: "Jawaban ini belum tepat.",
        color: "yellow",
      },
      {
        id: "C",
        text: "Pilihan C",
        isCorrect: true,
        feedback: "Jawaban ini tepat!",
        color: "green",
      },
      {
        id: "D",
        text: "Pilihan D",
        isCorrect: false,
        feedback: "Jawaban ini tidak tepat.",
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
        isCorrect: true,
        feedback: "Jawaban ini tepat!",
        color: "green",
      },
      {
        id: "B",
        text: "Pilihan B",
        isCorrect: false,
        feedback: "Jawaban ini kurang tepat.",
        color: "red",
      },
      {
        id: "C",
        text: "Pilihan C",
        isCorrect: false,
        feedback: "Jawaban ini belum tepat.",
        color: "yellow",
      },
      {
        id: "D",
        text: "Pilihan D",
        isCorrect: false,
        feedback: "Jawaban ini tidak tepat.",
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
        color: "red",
      },
      {
        id: "B",
        text: "Pilihan B",
        isCorrect: false,
        feedback: "Jawaban ini belum tepat.",
        color: "yellow",
      },
      {
        id: "C",
        text: "Pilihan C",
        isCorrect: false,
        feedback: "Jawaban ini tidak tepat.",
        color: "red",
      },
      {
        id: "D",
        text: "Pilihan D",
        isCorrect: true,
        feedback: "Jawaban ini tepat!",
        color: "green",
      },
    ],
  },
  { id: 11, image: "/images/komik11.png", type: "image", choices: [] },
];

interface Choice {
  id: string;
  position?: { top: string; left: string; width: string; height: string };
  text?: string;
  isCorrect: boolean;
  feedback: string;
  color: "green" | "yellow" | "red";
}

interface FeedbackState {
  show: boolean;
  choice?: Choice;
  selectedId?: string;
}

const HEADER_HEIGHT = 56;
const FOOTER_HEIGHT = 56;

export default function ComicStory({ onClose }: { onClose: () => void }) {
  const [currentPage, setCurrentPage] = useState(0);
  const [feedback, setFeedback] = useState<FeedbackState>({ show: false });
  const totalPages = comicPages.length;

  const currentComic = comicPages[currentPage];
  const hasChoices = currentComic.choices && currentComic.choices.length > 0;
  const isMultiChoice = currentComic.type === "multichoice";

  const handleNext = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
      setFeedback({ show: false });
    }
  };

  const handlePrev = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
      setFeedback({ show: false });
    }
  };

  const handleChoiceClick = (choice: Choice) => {
    setFeedback({
      show: true,
      choice,
      selectedId: choice.id,
    });
  };

  const handleContinue = () => {
    setFeedback({ show: false });
  };

  const getDisplayPages = () => {
    const pages = [];
    for (let i = 0; i < 3; i++) {
      if (currentPage + i < totalPages) {
        pages.push(currentPage + i);
      }
    }
    return pages;
  };

  const displayPages = getDisplayPages();
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
      className="fixed inset-0 z-50 w-screen h-screen bg-white flex flex-col overflow-hidden"
      tabIndex={0}
    >
      {/* HEADER - Fixed Top */}
      <header
        className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-3 py-3 bg-white border-b border-gray-200"
        style={{ height: `${HEADER_HEIGHT}px` }}
      >
        <div className="text-xs font-medium text-gray-600 truncate">
          Bab 1: Ancaman Limbah Deterjen
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 p-1 hover:bg-gray-200 rounded-lg transition-colors ml-2"
        >
          <X size={18} className="text-gray-800" />
        </button>
      </header>

      {/* MAIN CONTENT - Centered */}
      <main
        className="flex items-center justify-center bg-gray-50 overflow-hidden relative"
        style={{
          marginTop: `${HEADER_HEIGHT}px`,
          marginBottom: `${FOOTER_HEIGHT}px`,
          height: contentHeight,
        }}
      >
        {/* Mobile View */}
        <div className="w-full h-full flex flex-col items-center justify-center md:hidden px-2 overflow-y-auto gap-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full flex flex-col items-center gap-4"
            >
              {/* Comic Panel - Mobile */}
              <div
                className="relative bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden flex-shrink-0"
                style={{
                  aspectRatio: "3 / 4",
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

              {/* Multiple Choice Buttons (only for multichoice type) */}
              {isMultiChoice && hasChoices && !feedback.show && (
                <div className="w-full grid grid-cols-2 gap-3 flex-shrink-0">
                  {comicPages[currentPage].choices?.map((choice) => (
                    <button
                      key={choice.id}
                      onClick={() => handleChoiceClick(choice)}
                      className={`p-3 rounded-lg border-2 font-semibold transition-all text-center ${getChoiceButtonColor(choice.color, feedback.selectedId === choice.id)}`}
                    >
                      {choice.id}: {(choice as any).text}
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Desktop View */}
        <div className="hidden md:w-full md:h-full md:flex md:items-center md:justify-center md:px-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full flex items-center justify-center gap-4"
            >
              {/* Multiple comic pages or single page with choices */}
              {isMultiChoice ? (
                // Single page + Multiple Choice
                <>
                  {/* Comic Panel */}
                  <div
                    className="relative flex-shrink-0 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden"
                    style={{
                      aspectRatio: "3 / 4",
                      maxHeight: "100%",
                      width: "auto",
                    }}
                  >
                    <img
                      src={comicPages[currentPage].image}
                      alt={`Comic Page ${currentPage + 1}`}
                      className="w-full h-full"
                      style={{ objectFit: "contain" }}
                    />
                  </div>

                  {/* Multiple Choice Buttons */}
                  {hasChoices && !feedback.show && (
                    <div className="flex-1 h-full flex flex-col gap-3 justify-center">
                      {comicPages[currentPage].choices?.map((choice) => (
                        <button
                          key={choice.id}
                          onClick={() => handleChoiceClick(choice as Choice)}
                          className={`p-4 rounded-lg border-2 font-semibold transition-all text-left flex items-center gap-3 ${getChoiceButtonColor(choice.color, feedback.selectedId === choice.id)}`}
                        >
                          <span className="text-lg font-bold">{choice.id}</span>
                          <span>{(choice as any).text}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                // 3 Pages view (original layout)
                displayPages.map((pageNum) => (
                  <div
                    key={pageNum}
                    className="relative flex-1 h-full bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden"
                    style={{
                      aspectRatio: "3 / 4",
                      maxHeight: "100%",
                    }}
                  >
                    <img
                      src={comicPages[pageNum].image}
                      alt={`Comic Page ${pageNum + 1}`}
                      className="w-full h-full"
                      style={{ objectFit: "contain" }}
                    />

                    {/* Interactive Choice Overlays */}
                    {comicPages[pageNum].type === "overlay" &&
                      comicPages[pageNum].choices &&
                      comicPages[pageNum].choices.length > 0 &&
                      !feedback.show &&
                      comicPages[pageNum].choices?.map((choice) => (
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
                ))
              )}
            </motion.div>
          </AnimatePresence>
        </div>
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
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={`fixed top-1/2 left-1/2 z-40 -translate-x-1/2 -translate-y-1/2 max-w-lg w-full mx-auto px-4 py-6 rounded-lg border-2 shadow-xl ${getFeedbackBgColor(feedback.choice.color)}`}
            >
              {/* Icon */}
              <div className="flex justify-center mb-4">
                {getFeedbackIcon(feedback.choice.color)}
              </div>

              {/* Title */}
              <h3
                className={`text-center text-lg font-bold mb-3 ${getFeedbackTextColor(feedback.choice.color)}`}
              >
                {feedback.choice.isCorrect ? "Jawaban Benar! ✨" : "Jawaban Salah"}
              </h3>

              {/* Feedback Text */}
              <p
                className={`text-center text-sm mb-6 leading-relaxed ${getFeedbackTextColor(feedback.choice.color)}`}
              >
                {feedback.choice.feedback}
              </p>

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
        className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-between px-2 py-2 bg-white border-t border-gray-200 gap-1"
        style={{ height: `${FOOTER_HEIGHT}px` }}
      >
        {/* Previous Button */}
        <motion.button
          whileHover={currentPage > 0 ? { scale: 1.1 } : {}}
          whileTap={currentPage > 0 ? { scale: 0.95 } : {}}
          onClick={handlePrev}
          disabled={currentPage === 0}
          className={`p-1.5 rounded-md transition-colors flex-shrink-0 ${
            currentPage === 0
              ? "text-gray-300 cursor-not-allowed bg-gray-100"
              : "text-gray-700 hover:bg-gray-100 active:bg-gray-200"
          }`}
        >
          <ChevronLeft size={20} />
        </motion.button>

        {/* Page Indicator */}
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <div className="h-0.5 flex-1 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              animate={{
                width: `${((currentPage + 1) / totalPages) * 100}%`,
              }}
              transition={{ duration: 0.3 }}
              className="h-full bg-blue-500 rounded-full"
            />
          </div>
          <span className="text-xs font-medium text-gray-600 flex-shrink-0 whitespace-nowrap">
            {currentPage + 1}/{totalPages}
          </span>
        </div>

        {/* Next Button */}
        <motion.button
          whileHover={currentPage < totalPages - 1 ? { scale: 1.1 } : {}}
          whileTap={currentPage < totalPages - 1 ? { scale: 0.95 } : {}}
          onClick={handleNext}
          disabled={currentPage >= totalPages - 1}
          className={`p-1.5 rounded-md transition-colors flex-shrink-0 ${
            currentPage + 3 >= totalPages
              ? "text-gray-300 cursor-not-allowed bg-gray-100"
              : "text-gray-700 hover:bg-gray-100 active:bg-gray-200"
          }`}
        >
          <ChevronRight size={20} />
        </motion.button>
      </footer>
    </div>
  );
}



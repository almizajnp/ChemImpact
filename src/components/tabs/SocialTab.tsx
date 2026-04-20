import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  PlusCircle,
  Search,
  MessageCircle,
  Trash2,
  Link as LinkIcon,
  X,
  ExternalLink,
} from "lucide-react";

interface TopicCardProps {
  id: string;
  title: string;
  description: string;
  commentsCount: number;
  isActive?: boolean;
  theme?: { id: string; name: string; primary: string; secondary: string };
}

function TopicCard({
  title,
  description,
  commentsCount,
  isActive,
}: TopicCardProps) {
  return (
    <div
      className={`p-3 rounded-xl border transition-colors cursor-pointer ${isActive ? "border-emerald-500 bg-emerald-50 shadow-sm border-2" : "border-slate-100 bg-white hover:border-slate-300"}`}
    >
      <div className="flex justify-between items-start mb-1">
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${isActive ? "text-emerald-700 bg-emerald-100" : "text-slate-400 bg-slate-100"}`}
        >
          {isActive ? "ACTIVE" : commentsCount > 0 ? "CLOSED" : "NEW"}
        </span>
        <span className="text-[10px] text-slate-400">
          {commentsCount} comments
        </span>
      </div>
      <h3
        className={`text-sm font-bold mt-2 ${isActive ? "text-slate-800" : "text-slate-700"}`}
      >
        {title}
      </h3>
      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{description}</p>
    </div>
  );
}

interface PollingProps {
  question: string;
  options: Option[];
  onVote: (optionId: string) => void;
  theme?: { id: string; name: string; primary: string; secondary: string };
  userVotedId?: string;
}

function Polling({ question, options, onVote, userVotedId }: PollingProps) {
  const totalVotes = options.reduce((sum, opt) => sum + opt.votes, 0);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full">
      <div className="p-4 border-b border-slate-100 flex justify-between items-center">
        <h3 className="text-sm font-bold text-slate-800">Polling Komunitas</h3>
        <span className="text-[10px] text-slate-400">
          {totalVotes} Total Votes
        </span>
      </div>
      <div className="p-5 space-y-4">
        <p className="text-xs font-semibold text-slate-700 mb-2 leading-relaxed">
          {question}
        </p>
        <div className="space-y-4">
          {options.map((option) => {
            const percentage =
              totalVotes === 0
                ? 0
                : Math.round((option.votes / totalVotes) * 100);
            const isVoted = userVotedId === option.id;

            return (
              <div
                key={option.id}
                className="space-y-1.5 cursor-pointer group"
                onClick={() => onVote(option.id)}
              >
                <div className="flex justify-between text-xs font-medium">
                  <span
                    className={`transition-colors ${isVoted ? "text-emerald-700 font-bold" : "text-slate-600 group-hover:text-emerald-700"}`}
                  >
                    {option.text}
                  </span>
                  <span
                    className={`font-semibold ${isVoted ? "text-emerald-700" : "text-slate-900"}`}
                  >
                    {percentage}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className={`${isVoted ? "bg-emerald-600" : "bg-emerald-500"} h-full transition-all duration-500 ease-out`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {userVotedId && (
        <div className="mt-auto p-4 bg-emerald-50 rounded-b-2xl border-t border-emerald-100">
          <p className="text-[11px] text-emerald-800 font-medium text-center">
            Anda telah memberikan suara pada opsi '
            {options.find((o) => o.id === userVotedId)?.text}'
          </p>
        </div>
      )}
    </div>
  );
}

interface SocialReply {
  id: string;
  author: string;
  text: string;
  likes: number;
  avatar?: string;
}

interface SocialComment {
  id: string;
  author: string;
  text: string;
  likes: number;
  replies: SocialReply[];
  avatar?: string;
}

interface CommentItemProps {
  comment: SocialComment;
  onLike: (commentId: string, replyId?: string) => void;
  isBest?: boolean;
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  onLike,
  isBest,
}) => {
  return (
    <div className={`flex gap-3 ${comment.replies.length > 0 ? "pb-2" : ""}`}>
      <div
        className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center font-bold text-xs ${isBest ? "bg-amber-100 border border-amber-200 text-amber-700" : "bg-emerald-100 border border-emerald-200 text-emerald-700"}`}
      >
        {comment.author.charAt(0)}
      </div>
      <div
        className={`flex-1 p-3 rounded-xl border ${isBest ? "bg-amber-50 border-amber-100 shadow-sm" : "bg-slate-50 border-slate-100"}`}
      >
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-bold text-slate-800">
            {comment.author.split(" - ")[0]}
          </span>
          <div className="flex items-center gap-2 text-[10px] text-slate-400">
            {isBest && (
              <span className="font-bold text-amber-600 uppercase tracking-wider">
                Top Reply
              </span>
            )}
            <span>2 jam yang lalu</span>
          </div>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed mb-2">
          {comment.text}
        </p>
        <div className="flex gap-3 mt-2">
          <button
            onClick={() => onLike(comment.id)}
            className="text-[10px] font-semibold text-slate-500 hover:text-emerald-600 transition-colors flex items-center gap-1"
          >
            Upvote ({comment.likes})
          </button>
        </div>

        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-3 space-y-3 pt-3 border-t border-slate-200/50">
            {comment.replies.map((reply) => (
              <div key={reply.id} className="flex gap-2">
                <div className="w-6 h-6 rounded-full shrink-0 bg-orange-100 border border-orange-200 text-orange-700 flex items-center justify-center font-bold text-[10px]">
                  {reply.author.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="text-[10px] font-bold text-slate-800">
                      {reply.author.split(" - ")[0]}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-600 leading-relaxed">
                    {reply.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

interface SocialTabProps {
  theme?: { id: string; name: string; primary: string; secondary: string };
}

interface Option {
  id: string;
  text: string;
  votes: number;
}

interface Topic {
  id: string;
  title: string;
  description: string;
  commentsCount: number;
}

interface TopicDetail {
  title: string;
  question: string;
  comments: SocialComment[];
  polling?: { question: string; options: Option[] };
  newsLink?: string;
}

const initialTopics: Topic[] = [
  {
    id: "plastik",
    title: "Regulasi Sampah Plastik Sekali Pakai 2026",
    description:
      "Mendiskusikan kesiapan infrastruktur pengelolaan limbah lokal terhadap tenggat waktu pelarangan plastik rumah tangga.",
    commentsCount: 2,
  },
  {
    id: "deterjen",
    title: "Meningkatnya Busa Deterjen di Sungai Ciliwung",
    description:
      "Analisis dampak peningkatan penggunaan deterjen sintetis terhadap ekosistem air tawar domestik dan usulan kebijakan mitigasi.",
    commentsCount: 1,
  },
  {
    id: "emisi",
    title: "Target Emisi Karbon di Sektor Industri Manufaktur",
    description:
      "Mengevaluasi insentif pajak hijau dan kesiapan perusahaan dalam mengadopsi teknologi rendah karbon (CCUS).",
    commentsCount: 1,
  },
];

const initialTopicData: Record<string, TopicDetail> = {
  plastik: {
    title: "Regulasi Sampah Plastik Sekali Pakai 2026",
    question:
      "Berdasarkan timeline regulasi 2026, apa hambatan infrastruktur terbesar yang akan dihadapi pemerintah daerah dalam transisi dari plastik sekali pakai?",
    newsLink: "https://www.menlhk.go.id/",
    comments: [
      {
        id: "1",
        author: "Dr. Alya Rahma - Peneliti Lingkungan",
        text: "Hambatan utama adalah kurangnya fasilitas daur ulang (MRF) sekunder yang dapat menangani bioplastik alternatif. Jika pengelolaan akhirnya dicampur di TPA, maka emisi metana justru akan meningkat.",
        likes: 45,
        replies: [
          {
            id: "1-1",
            author: "Budi Santoso - Praktisi Kebijakan Publik",
            text: "Saya setuju. Pendanaan APBD untuk infrastruktur pemrosesan akhir (TPA) masih di bawah 2% di sebagian besar daerah, sulit mensubsidi MRF baru.",
            likes: 18,
          },
        ],
      },
      {
        id: "2",
        author: "Citra Dewi - Supply Chain Analyst",
        text: "Dari sudut pandang rantai pasok industri FMCG, kami membutuhkan subsidi sementara agar material kemasan biodegradable dapat bersaing dengan rasio harga plastik konvensional PET/HDPE.",
        likes: 32,
        replies: [],
      },
    ],
    polling: {
      question:
        "Prioritas alokasi dana lingkungan (Green Fund) untuk isu plastik:",
      options: [
        {
          id: "1",
          text: "Pembangunan fasililitas pengolahan (MRF/TPA modern)",
          votes: 250,
        },
        {
          id: "2",
          text: "Subsidi pajak untuk produsen bioplastik lokal",
          votes: 145,
        },
        {
          id: "3",
          text: "Subsidi sistem logistik retur konsumer (Deposit-return)",
          votes: 95,
        },
        { id: "4", text: "Riset material komposit terbarukan", votes: 120 },
      ],
    },
  },
  deterjen: {
    title: "Meningkatnya Busa Deterjen di Sungai Ciliwung",
    question:
      "Bagaimana standar teknis Instalasi Pengolahan Air Limbah (IPAL) komunal perlu disesuaikan untuk mengatasi lonjakan Linear Alkylbenzene Sulfonate (LAS)?",
    comments: [
      {
        id: "1",
        author: "Dedi Kurniawan - Teknik Lingkungan",
        text: "LAS sangat sulit dirombak secara anaerobik. IPAL komunal standar kita rata-rata hanya menggunakan unit anaerobik. Harus ditambahkan unit aerasi biologis memadai atau biofilter tumpuk.",
        likes: 24,
        replies: [],
      },
    ],
  },
  emisi: {
    title: "Target Emisi Karbon di Sektor Industri Manufaktur",
    question:
      "Apakah sistem Cap-and-Trade lebih efektif dibanding Carbon Tax (Pajak Karbon) flat untuk dekarbonisasi industri berat di Asia Tenggara?",
    comments: [
      {
        id: "1",
        author: "Farhan Setiawan - Ekonom",
        text: "Pajak karbon flat lebih memberikan kepastian harga di awal, namun Cap-and-Trade lebih menjamin batas absolut (volume limit) deforestasi dan emisi. Tergantung apakah pemerintah butuh stabilitas fiskal atau kepastian volume cap.",
        likes: 41,
        replies: [],
      },
    ],
  },
};

export default function SocialTab({ theme }: SocialTabProps) {
  // Roles Support
  const [role, setRole] = useState<"guru" | "siswa">("guru");

  // App State Data
  const [topicsList, setTopicsList] = useState<Topic[]>(initialTopics);
  const [topicsDataObj, setTopicsDataObj] =
    useState<Record<string, TopicDetail>>(initialTopicData);

  // View States
  const [currentView, setCurrentView] = useState<string>("list");
  const [activeTopicId, setActiveTopicId] = useState<string>(
    initialTopics[0].id,
  );
  const [newComment, setNewComment] = useState("");
  const [userVotedId, setUserVotedId] = useState<string | undefined>();

  // Topic Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    question: "",
    newsLink: "",
  });

  const isDetailView = currentView !== "list";
  const effectiveTopicId = isDetailView ? currentView : activeTopicId;
  const currentTopic = topicsDataObj[effectiveTopicId];

  useEffect(() => {
    setUserVotedId(undefined); // Reset vote on topic change
  }, [effectiveTopicId]);

  const handleTopicClick = (topicId: string) => {
    setActiveTopicId(topicId);
    if (window.innerWidth < 768) {
      setCurrentView(topicId);
    } else {
      setCurrentView("list");
    }
  };

  const handleBack = () => setCurrentView("list");

  // Feature: Add Topic (Guru Only)
  const handleAddSubmit = () => {
    if (!formData.title || !formData.description || !formData.question) {
      alert("Mohon lengkapi Judul, Deskripsi, dan Pertanyaan Diskusi.");
      return;
    }
    const newId = "topic_" + Date.now();
    const newTopic: Topic = {
      id: newId,
      title: formData.title,
      description: formData.description,
      commentsCount: 0,
    };
    const newDetail: TopicDetail = {
      title: formData.title,
      question: formData.question,
      comments: [],
      newsLink: formData.newsLink || undefined,
    };

    setTopicsList([newTopic, ...topicsList]);
    setTopicsDataObj({ ...topicsDataObj, [newId]: newDetail });
    setIsAddModalOpen(false);
    setFormData({ title: "", description: "", question: "", newsLink: "" });
    setActiveTopicId(newId);
    if (window.innerWidth < 768) setCurrentView(newId);
  };

  // Feature: Delete Topic (Guru Only)
  const handleDeleteTopic = (id: string) => {
    if (
      window.confirm("Apakah Anda yakin ingin menghapus topik diskusi ini?")
    ) {
      setTopicsList(topicsList.filter((t) => t.id !== id));
      const newObj = { ...topicsDataObj };
      delete newObj[id];
      setTopicsDataObj(newObj);

      if (effectiveTopicId === id) {
        const nextTopic = topicsList.filter((t) => t.id !== id)[0];
        if (nextTopic) {
          setActiveTopicId(nextTopic.id);
          if (isDetailView) setCurrentView(nextTopic.id);
        } else {
          setCurrentView("list");
          setActiveTopicId("");
        }
      }
    }
  };

  // Feature: Discussion
  const handleAddComment = () => {
    if (newComment.trim() && currentTopic) {
      const comment: SocialComment = {
        id: Date.now().toString(),
        author:
          role === "guru" ? "Bpk. Budi Santoso (Guru)" : "Alya Rahma (Siswa)",
        text: newComment,
        likes: 0,
        replies: [],
      };

      setTopicsDataObj((prev) => ({
        ...prev,
        [effectiveTopicId]: {
          ...prev[effectiveTopicId],
          comments: [...prev[effectiveTopicId].comments, comment],
        },
      }));

      setTopicsList((prev) =>
        prev.map((t) =>
          t.id === effectiveTopicId
            ? { ...t, commentsCount: t.commentsCount + 1 }
            : t,
        ),
      );

      setNewComment("");
    }
  };

  const handleLike = (commentId: string, replyId?: string) => {
    setTopicsDataObj((prev) => ({
      ...prev,
      [effectiveTopicId]: {
        ...prev[effectiveTopicId],
        comments: prev[effectiveTopicId].comments.map((comment) => {
          if (comment.id === commentId) {
            if (replyId) {
              return {
                ...comment,
                replies: comment.replies.map((reply) =>
                  reply.id === replyId
                    ? { ...reply, likes: reply.likes + 1 }
                    : reply,
                ),
              };
            } else {
              return { ...comment, likes: comment.likes + 1 };
            }
          }
          return comment;
        }),
      },
    }));
  };

  const handleVote = (optionId: string) => {
    if (userVotedId || !currentTopic?.polling) return;
    setTopicsDataObj((prev) => ({
      ...prev,
      [effectiveTopicId]: {
        ...prev[effectiveTopicId],
        polling: {
          ...prev[effectiveTopicId].polling!,
          options: prev[effectiveTopicId].polling!.options.map((option) =>
            option.id === optionId
              ? { ...option, votes: option.votes + 1 }
              : option,
          ),
        },
      },
    }));
    setUserVotedId(optionId);
  };

  const comments = currentTopic?.comments || [];
  const maxLikes =
    comments.length > 0 ? Math.max(...comments.map((c) => c.likes)) : 0;
  const bestCommentId =
    maxLikes > 0 ? comments.find((c) => c.likes === maxLikes)?.id : undefined;

  return (
    <div className="flex flex-col w-full h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      <nav className="h-16 px-4 md:px-8 flex items-center justify-between bg-white border-b border-slate-200 shadow-sm shrink-0">
        <div className="flex items-center gap-2">
          {isDetailView && (
            <button
              onClick={handleBack}
              className="md:hidden mr-2 p-1 text-slate-500"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 19l-7-7 7-7"
                ></path>
              </svg>
            </button>
          )}
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2.25 2.25 0 012.25-2.25h.741"
              ></path>
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-800">
            EcoForum <span className="text-emerald-600 font-medium">Pro</span>
          </span>
        </div>

        <div className="flex items-center gap-4 md:gap-6">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 pl-2 rounded-lg pr-1">
            <span className="text-xs font-semibold text-slate-500 hidden sm:inline">
              Pilih Peran:
            </span>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as "guru" | "siswa")}
              className="text-xs text-slate-700 bg-transparent rounded-lg p-1.5 focus:outline-none focus:ring-opacity-50 font-bold"
            >
              <option value="guru">Guru Pengajar</option>
              <option value="siswa">Siswa Pelajar</option>
            </select>
          </div>

          <div className="flex items-center gap-3 ml-2 md:ml-4 pl-4 border-l border-slate-200">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-semibold text-slate-800">
                {role === "guru" ? "Bpk. Budi Santoso" : "Alya Rahma"}
              </p>
              <p className="text-[10px] text-slate-400">
                {role === "guru" ? "Guru Moderator" : "Siswa Kelas 10"}
              </p>
            </div>
            <div
              className={`w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center font-bold text-white text-xs ${role === "guru" ? "bg-indigo-600" : "bg-orange-500"}`}
            >
              {role === "guru" ? "BS" : "AR"}
            </div>
          </div>
        </div>
      </nav>

      <main className="flex flex-1 overflow-hidden relative">
        <aside
          className={`w-full md:w-80 bg-white border-r border-slate-200 flex flex-col shrink-0 overflow-y-auto absolute md:relative z-10 h-full transition-transform duration-300 ${!isDetailView ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
        >
          <div className="p-6">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
              Trending Topics
            </h2>
            <div className="space-y-3">
              {topicsList.length === 0 && (
                <p className="text-xs text-slate-500 italic">
                  Belum ada topik diskusi.
                </p>
              )}
              {topicsList.map((topic) => (
                <div key={topic.id} onClick={() => handleTopicClick(topic.id)}>
                  <TopicCard
                    id={topic.id}
                    title={topic.title}
                    description={topic.description}
                    commentsCount={topic.commentsCount}
                    isActive={effectiveTopicId === topic.id}
                  />
                </div>
              ))}
            </div>
          </div>
          {role === "guru" && (
            <div className="mt-auto p-6 border-t border-slate-100 bg-slate-50">
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="w-full py-2.5 bg-slate-800 text-white rounded-lg text-sm font-semibold hover:bg-slate-700 transition-colors"
              >
                + Mulai Topik Baru
              </button>
            </div>
          )}
        </aside>

        <section
          className={`flex-1 flex flex-col bg-slate-50 overflow-hidden w-full absolute md:relative h-full transition-transform duration-300 ${!isDetailView ? "translate-x-full md:translate-x-0" : "translate-x-0"}`}
        >
          {currentTopic ? (
            <div className="flex flex-col h-full overflow-y-auto">
              <div className="p-6 md:p-8 pb-4">
                <nav className="flex text-xs text-slate-400 mb-4 gap-2">
                  <span>Forum</span>
                  <span>&rsaquo;</span>
                  <span>Lingkungan</span>
                  <span>&rsaquo;</span>
                  <span className="text-slate-600 truncate">
                    {currentTopic.title}
                  </span>
                </nav>

                <div className="flex justify-between items-start mb-4 gap-4">
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight">
                    {currentTopic.title}
                  </h1>
                  {role === "guru" && (
                    <button
                      onClick={() => handleDeleteTopic(effectiveTopicId)}
                      title="Hapus Topik"
                      className="p-2 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors border border-transparent shadow-sm hover:border-red-100 shrink-0"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>

                <div className="bg-white rounded-2xl p-5 md:p-6 border border-slate-200 shadow-sm relative">
                  <div className="flex items-start gap-3 md:gap-4">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                      <MessageSquare className="w-4 h-4 md:w-5 md:h-5 text-emerald-600" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-[11px] md:text-sm font-bold text-emerald-700 uppercase tracking-tight mb-1">
                        Pertanyaan Utama Guru
                      </h2>
                      <p className="text-sm md:text-lg text-slate-700 font-medium leading-relaxed">
                        {currentTopic.question}
                      </p>

                      {currentTopic.newsLink && (
                        <div className="mt-5 border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm mt-6">
                          <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5 flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-700 flex items-center gap-2">
                              <LinkIcon className="w-3.5 h-3.5 text-emerald-600" />
                              Materi Referensi Tersemat
                            </span>
                            <a
                              href={currentTopic.newsLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1.5 transition-colors"
                            >
                              Buka Penuh{" "}
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                          <div className="w-full h-[400px] bg-slate-100">
                            <iframe
                              src={currentTopic.newsLink}
                              className="w-full h-full border-none"
                              title="Materi Referensi"
                              loading="lazy"
                              sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                            />
                          </div>
                        </div>
                      )}

                      {topicsList.find((t) => t.id === effectiveTopicId)
                        ?.description && (
                        <div className="mt-5 p-4 bg-slate-50 border border-slate-100 rounded-xl relative overflow-hidden">
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500"></div>
                          <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            Deskripsi Topik
                          </h3>
                          <p className="text-sm text-slate-700 leading-relaxed">
                            {
                              topicsList.find((t) => t.id === effectiveTopicId)
                                ?.description
                            }
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 px-6 md:px-8 pb-8 flex flex-col gap-6 lg:grid lg:grid-cols-2">
                <div className="flex flex-col gap-6">
                  {currentTopic.polling &&
                    currentTopic.polling.options.length > 0 && (
                      <Polling
                        question={currentTopic.polling.question}
                        options={currentTopic.polling.options}
                        onVote={handleVote}
                        userVotedId={userVotedId}
                      />
                    )}
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden max-h-[800px]">
                  <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="text-sm font-bold text-slate-800">
                      Diskusi Kelas
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400">
                        {comments.length} respons
                      </span>
                      <button className="p-1 text-slate-400 hover:text-slate-600 transition-colors">
                        <MessageCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
                    {comments.map((comment) => (
                      <CommentItem
                        key={comment.id}
                        comment={comment}
                        onLike={handleLike}
                        isBest={
                          comment.id === bestCommentId && comment.likes > 0
                        }
                      />
                    ))}

                    {comments.length === 0 && (
                      <div className="text-center py-10 bg-white rounded-xl border border-dashed border-slate-300 text-slate-500 text-sm">
                        Belum ada diskusi siswa, jadilah yang pertama merespons.
                      </div>
                    )}
                  </div>

                  <div className="p-4 border-t border-slate-100 bg-white">
                    <div className="relative">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Ikut diskusi dengan merespons pertanyaan di atas..."
                        className="w-full p-3 pr-12 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none text-slate-800 placeholder-slate-400"
                        rows={2}
                      />
                      <button
                        onClick={handleAddComment}
                        disabled={!newComment.trim()}
                        className="absolute right-3 bottom-3 text-emerald-600 hover:text-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <svg
                          className="w-6 h-6"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-500 text-sm">
              Pilih topik di sidebar untuk melihat diskusi.
            </div>
          )}
        </section>
      </main>

      {/* Add Topic Modal (Guru Only) */}
      {isAddModalOpen && role === "guru" && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-2xl">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-emerald-600" /> Buat Topik
                Diskusi Baru
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Judul Topik
                </label>
                <input
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full p-2.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                  placeholder="Contoh: Dampak Mikroplastik pada Rantai Makanan"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Deskripsi Singkat
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full p-2.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none outline-none"
                  rows={2}
                  placeholder="Siswa diharapkan dapat menganalisa kasus..."
                ></textarea>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pertanyaan Utama (Pemantik Diskusi)
                </label>
                <textarea
                  value={formData.question}
                  onChange={(e) =>
                    setFormData({ ...formData, question: e.target.value })
                  }
                  className="w-full p-2.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none outline-none"
                  rows={3}
                  placeholder="Sebutkan langkah mitigasi yang paling tepat menurut Anda?"
                ></textarea>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Link Referensi/Berita (Opsional)
                </label>
                <div className="relative">
                  <LinkIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    value={formData.newsLink}
                    onChange={(e) =>
                      setFormData({ ...formData, newsLink: e.target.value })
                    }
                    className="w-full pl-9 pr-3 p-2.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50 rounded-b-2xl">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="px-5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 bg-slate-100 rounded-lg transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleAddSubmit}
                className="px-5 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors"
              >
                Simpan & Publikasikan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import TopicCard from '../social/TopicCard';
import CommentItem from '../social/CommentItem';
import Polling from '../social/Polling';
import { ArrowLeft, MessageSquare, TrendingUp } from 'lucide-react';

interface SocialTabProps {
  currentBg?: string;
  theme?: { id: string; name: string; primary: string; secondary: string };
}

interface Reply {
  id: string;
  author: string;
  text: string;
  likes: number;
  avatar?: string;
}

interface Comment {
  id: string;
  author: string;
  text: string;
  likes: number;
  replies: Reply[];
  avatar?: string;
}

interface Option {
  id: string;
  text: string;
  votes: number;
}

const topics = [
  {
    id: "deterjen",
    title: "Sungai Berbusa",
    description: "Pencemaran air akibat deterjen - apa solusi efektif untuk membersihkan sungai kita?",
    commentsCount: 18
  },
  {
    id: "plastik",
    title: "Pencemaran Plastik",
    description: "Mari diskusikan bagaimana kita bisa mengurangi dampak plastik terhadap ekosistem laut dan daratan.",
    commentsCount: 24
  }
];

const topicData: Record<string, { title: string; question: string; comments: Comment[]; polling: { question: string; options: Option[] } }> = {
  plastik: {
    title: "Pencemaran Plastik",
    question: "Bayangkan 10 tahun ke depan - bagaimana kondisi lautan kita jika penggunaan plastik tidak dikurangi drastis?",
    comments: [
      {
        id: '1',
        author: 'Alya Rahma',
        text: 'Saya khawatir lautan akan penuh dengan plastik mikro yang merusak rantai makanan. Sudah ada penelitian yang menunjukkan plastik ada di dalam ikan yang kita makan.',
        likes: 15,
        avatar: '/avatars/alya.jpg',
        replies: [
          {
            id: '1-1',
            author: 'Budi Santoso',
            text: 'Betul sekali! Saya baru baca artikel tentang itu. Kita perlu aksi sekarang sebelum terlambat.',
            likes: 8,
            avatar: '/avatars/budi.jpg'
          }
        ]
      },
      {
        id: '2',
        author: 'Citra Dewi',
        text: 'Selain lautan, plastik juga menumpuk di tanah dan sungai. Kita perlu edukasi massal tentang bahaya plastik sekali pakai.',
        likes: 12,
        avatar: '/avatars/citra.jpg',
        replies: []
      }
    ],
    polling: {
      question: 'Solusi paling realistis untuk mengurangi plastik?',
      options: [
        { id: '1', text: 'Larangan total plastik sekali pakai di sekolah', votes: 25 },
        { id: '2', text: 'Program daur ulang massal dengan insentif', votes: 20 },
        { id: '3', text: 'Pengembangan bahan alternatif biodegradable', votes: 18 },
        { id: '4', text: 'Kampanye kesadaran melalui media sosial', votes: 15 }
      ]
    }
  },
  deterjen: {
    title: "Sungai Berbusa",
    question: "Jika deterjen berbusa terus dibuang ke sungai, bagaimana nasib ekosistem air tawar kita dalam 5 tahun?",
    comments: [
      {
        id: '1',
        author: 'Dedi Kurniawan',
        text: 'Deterjen mengandung surfaktan yang membuat busa dan mengganggu kehidupan biota air. Kita perlu deterjen ramah lingkungan.',
        likes: 10,
        avatar: '/avatars/dedi.jpg',
        replies: []
      }
    ],
    polling: {
      question: 'Langkah pencegahan pencemaran sungai yang paling efektif:',
      options: [
        { id: '1', text: 'Pengolahan limbah sebelum dibuang', votes: 15 },
        { id: '2', text: 'Larangan deterjen berbusa', votes: 12 },
        { id: '3', text: 'Edukasi masyarakat tentang dampak', votes: 10 },
        { id: '4', text: 'Pengembangan filter air alami', votes: 8 }
      ]
    }
  }
};

export default function SocialTab({ currentBg = "bg.png", theme }: SocialTabProps) {
  const [currentView, setCurrentView] = useState<'list' | string>('list');
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [pollingOptions, setPollingOptions] = useState<Option[]>([]);

  const handleTopicClick = (topicId: string) => {
    setCurrentView(topicId);
    const topic = topicData[topicId];
    if (topic) {
      setComments(topic.comments);
      setPollingOptions(topic.polling.options);
    }
  };

  const handleBack = () => {
    setCurrentView('list');
    setComments([]);
    setPollingOptions([]);
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      const comment: Comment = {
        id: Date.now().toString(),
        author: 'Anda',
        text: newComment,
        likes: 0,
        replies: [],
        avatar: '/avatars/user.jpg'
      };
      setComments([...comments, comment]);
      setNewComment('');
    }
  };

  const handleLike = (commentId: string, replyId?: string) => {
    setComments(comments.map(comment => {
      if (comment.id === commentId) {
        if (replyId) {
          return {
            ...comment,
            replies: comment.replies.map(reply =>
              reply.id === replyId ? { ...reply, likes: reply.likes + 1 } : reply
            )
          };
        } else {
          return { ...comment, likes: comment.likes + 1 };
        }
      }
      return comment;
    }));
  };

  const handleVote = (optionId: string) => {
    setPollingOptions(pollingOptions.map(option =>
      option.id === optionId ? { ...option, votes: option.votes + 1 } : option
    ));
  };

  const maxLikes = Math.max(...comments.map(c => c.likes));
  const bestCommentId = comments.find(c => c.likes === maxLikes)?.id;

  if (currentView === 'list') {
    return (
      <div className="pt-20 pb-24 px-4 min-h-screen text-white font-sans"
        style={{
          backgroundImage: `url(/images/${currentBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        <div className="container mx-auto max-w-6xl px-6 py-12">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 mb-6">
              <div 
                className="p-3 rounded-2xl shadow-lg"
                style={{ backgroundColor: theme?.secondary ?? "#3b82f6" }}
              >
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h1 
                className="text-4xl font-bold"
                style={{ color: "white", textShadow: "0 2px 4px rgba(0,0,0,0.3)" }}
              >
                Forum Diskusi
              </h1>
            </div>
            <div 
              className="max-w-2xl mx-auto rounded-2xl p-6 backdrop-blur-md shadow-xl border"
              style={{
                backgroundColor: theme?.secondary ? `${theme.secondary}e0` : "#111827",
                borderColor: theme?.primary ? `${theme.primary}60` : "#ffffff20",
              }}
            >
              <p className="text-gray-100 text-lg leading-relaxed">
                Bergabunglah dalam diskusi interaktif tentang lingkungan dan keberlanjutan.
                Bagikan ide, ajukan pertanyaan, dan belajar bersama untuk masa depan yang lebih baik.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {topics.map((topic) => (
              <div key={topic.id} onClick={() => handleTopicClick(topic.id)}>
                <TopicCard
                  id={topic.id}
                  title={topic.title}
                  description={topic.description}
                  commentsCount={topic.commentsCount}
                  theme={theme}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const currentTopic = topicData[currentView];
  if (!currentTopic) {
    return (
      <div className="pt-20 pb-24 px-4 min-h-screen text-white font-sans"
        style={{
          backgroundImage: `url(/images/${currentBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Topik tidak ditemukan</h1>
            <button 
              onClick={handleBack} 
              className="transition-colors"
              style={{ color: theme?.primary ?? "#60a5fa" }}
            >
              ← Kembali ke Forum
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 pb-24 px-4 min-h-screen text-white font-sans"
      style={{
        backgroundImage: `url(/images/${currentBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="container mx-auto max-w-4xl px-6 py-8">
        <button 
          onClick={handleBack} 
          className="inline-flex items-center gap-2 transition-colors mb-6"
          style={{ color: "rgba(255,255,255,0.7)" }}
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Kembali ke Forum</span>
        </button>

        <div className="mb-8">
          <h1 
            className="text-4xl font-bold mb-4"
            style={{ color: "white", textShadow: "0 2px 4px rgba(0,0,0,0.3)" }}
          >
            {currentTopic.title}
          </h1>
          <div 
            className="rounded-3xl p-8 border shadow-xl"
            style={{
              backgroundColor: theme?.secondary ? `${theme.secondary}e0` : "#111827",
              borderColor: theme?.primary ? `${theme.primary}60` : "#ffffff20",
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div 
                className="p-2 rounded-xl"
                style={{
                  backgroundColor: theme?.primary ? `${theme.primary}30` : "rgba(59,130,246,0.3)",
                }}
              >
                <TrendingUp 
                  className="w-6 h-6" 
                  style={{ color: theme?.primary ?? "#60a5fa" }}
                />
              </div>
              <span 
                className="font-semibold"
                style={{ color: theme?.primary ?? "#60a5fa" }}
              >
                Pertanyaan Utama
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white leading-relaxed">{currentTopic.question}</h2>
          </div>
        </div>

        <Polling question={currentTopic.polling.question} options={pollingOptions} onVote={handleVote} theme={theme} />

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div 
              className="p-2 rounded-xl"
              style={{
                backgroundColor: theme?.primary ? `${theme.primary}30` : "rgba(59,130,246,0.3)",
              }}
            >
              <MessageSquare 
                className="w-6 h-6"
                style={{ color: theme?.primary ?? "#60a5fa" }}
              />
            </div>
            <h3 className="text-2xl font-bold text-white">Diskusi</h3>
            <span className="text-gray-300 text-sm">({comments.length} pendapat)</span>
          </div>

          {comments.map(comment => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onLike={handleLike}
              isBest={comment.id === bestCommentId}
              theme={theme}
            />
          ))}
        </div>

        <div 
          className="rounded-3xl p-8 border shadow-xl"
          style={{
            backgroundColor: theme?.secondary ? `${theme.secondary}e0` : "#111827",
            borderColor: theme?.primary ? `${theme.primary}60` : "rgba(107,114,128,0.4)",
          }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div 
              className="p-2 rounded-xl"
              style={{
                backgroundColor: theme?.primary ? `${theme.primary}30` : "rgba(59,130,246,0.3)",
              }}
            >
              <MessageSquare 
                className="w-6 h-6"
                style={{ color: theme?.primary ?? "#60a5fa" }}
              />
            </div>
            <h3 className="text-xl font-bold text-white">Bagikan Pendapat Anda</h3>
          </div>

          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Apa yang Anda pikirkan tentang topik ini? Bagikan analisis kritis atau solusi kreatif Anda..."
            className="w-full rounded-2xl p-4 mb-4 border focus:border-transparent focus:outline-none transition-colors resize-none text-white placeholder-gray-400"
            style={{
              backgroundColor: "rgba(107,114,128,0.3)",
              borderColor: theme?.primary ? `${theme.primary}60` : "rgba(107,114,128,0.6)",
              color: "white",
            }}
            rows={4}
          />

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4 text-sm text-gray-300">
              <span>💡 Tip: Pendapat yang didukung data akan lebih berharga</span>
            </div>
            <button
              onClick={handleAddComment}
              disabled={!newComment.trim()}
              className="px-8 py-3 text-white rounded-2xl transition-all duration-300 font-semibold shadow-lg"
              style={{
                backgroundColor: theme?.primary ?? "#2563eb",
                opacity: newComment.trim() ? 1 : 0.5,
              }}
            >
              Kirim Pendapat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
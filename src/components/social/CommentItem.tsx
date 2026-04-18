import { useState } from 'react';
import { Heart, MessageCircle, User } from 'lucide-react';

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

interface Theme {
  id: string;
  name: string;
  primary: string;
  secondary: string;
}

interface CommentItemProps {
  comment: Comment;
  onLike: (commentId: string, replyId?: string) => void;
  isBest: boolean;
  theme?: Theme;
}

export default function CommentItem({ comment, onLike, isBest, theme }: CommentItemProps) {
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState('');

  const handleReply = () => {
    if (replyText.trim()) {
      console.log('Reply:', replyText);
      setReplyText('');
      setShowReply(false);
    }
  };

  return (
    <div 
      className={`rounded-2xl p-6 mb-6 border shadow-lg ${isBest ? 'border-2' : ''}`}
      style={{
        backgroundColor: theme?.secondary ? `${theme.secondary}cc` : "#1f2937",
        borderColor: isBest ? (theme?.primary ?? "#fbbf24") : (theme?.primary ? `${theme.primary}40` : "rgba(107,114,128,0.3)"),
      }}
    >
      {isBest && (
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full animate-pulse"
            style={{
              backgroundColor: theme?.primary ?? "#fbbf24"
            }}
          ></div>
          <span className="font-semibold text-sm" style={{ color: theme?.primary ?? "#fbbf24" }}>
            ⭐ Jawaban Terbaik
          </span>
        </div>
      )}

      <div className="flex items-start gap-4">
        <div 
          className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
          style={{
            backgroundImage: `linear-gradient(135deg, ${theme?.primary ?? "#60a5fa"}, ${theme?.secondary ?? "#f59e0b"})`,
          }}
        >
          {comment.avatar ? (
            <img src={comment.avatar} alt={comment.author} className="w-full h-full rounded-full object-cover" />
          ) : (
            <User className="w-6 h-6 text-white" />
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold text-white">{comment.author}</span>
            <span className="text-xs text-gray-400">2 jam lalu</span>
          </div>

          <p className="text-gray-200 mb-4 leading-relaxed">{comment.text}</p>

          <div className="flex items-center gap-6">
            <button
              onClick={() => onLike(comment.id)}
              className="flex items-center gap-2 text-gray-400 hover:text-red-400 transition-colors group"
            >
              <Heart className={`w-5 h-5 ${comment.likes > 0 ? 'fill-red-400 text-red-400' : 'group-hover:fill-red-400'}`} />
              <span className="text-sm">{comment.likes}</span>
            </button>

            <button
              onClick={() => setShowReply(!showReply)}
              className="flex items-center gap-2 hover:transition-colors"
              style={{ color: theme?.primary ?? "#60a5fa" }}
            >
              <MessageCircle className="w-5 h-5" />
              <span className="text-sm">Balas</span>
            </button>
          </div>

          {showReply && (
            <div 
              className="mt-4 p-4 rounded-xl border"
              style={{
                backgroundColor: theme?.primary ? `${theme.primary}20` : "rgba(59,130,246,0.1)",
                borderColor: theme?.primary ? `${theme.primary}40` : "rgba(59,130,246,0.3)",
              }}
            >
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Bagikan pendapat kritis Anda..."
                className="w-full text-white rounded-lg p-3 mb-3 border focus:border-transparent focus:outline-none transition-colors"
                style={{
                  backgroundColor: theme?.secondary ? `${theme.secondary}40` : "rgba(107,114,128,0.2)",
                  borderColor: theme?.primary ? `${theme.primary}40` : "rgba(59,130,246,0.3)",
                  color: "white",
                }}
                rows={3}
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowReply(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleReply}
                  className="px-4 py-2 text-white rounded-lg transition-colors"
                  style={{
                    backgroundColor: theme?.primary ?? "#2563eb",
                  }}
                >
                  Kirim Balasan
                </button>
              </div>
            </div>
          )}

          {comment.replies.map((reply) => (
            <div 
              key={reply.id} 
              className="mt-4 ml-6 p-4 rounded-xl border-l-4"
              style={{
                backgroundColor: theme?.primary ? `${theme.primary}15` : "rgba(59,130,246,0.1)",
                borderLeftColor: theme?.primary ?? "rgba(59,130,246,0.5)",
              }}
            >
              <div className="flex items-start gap-3">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    backgroundImage: `linear-gradient(135deg, ${theme?.primary ?? "#60a5fa"}, ${theme?.secondary ?? "#f59e0b"})`,
                  }}
                >
                  {reply.avatar ? (
                    <img src={reply.avatar} alt={reply.author} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <User className="w-4 h-4 text-white" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-white text-sm">{reply.author}</span>
                    <span className="text-xs text-gray-400">1 jam lalu</span>
                  </div>
                  <p className="text-gray-300 text-sm mb-2">{reply.text}</p>
                  <button
                    onClick={() => onLike(comment.id, reply.id)}
                    className="flex items-center gap-1 text-gray-400 hover:text-red-400 transition-colors text-xs"
                  >
                    <Heart className={`w-4 h-4 ${reply.likes > 0 ? 'fill-red-400 text-red-400' : ''}`} />
                    <span>{reply.likes}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
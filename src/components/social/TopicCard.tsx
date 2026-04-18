import { MessageCircle, Users, TrendingUp } from 'lucide-react';

interface TopicCardProps {
  id: string;
  title: string;
  description: string;
  commentsCount: number;
  onClick?: (id: string) => void;
  theme?: { id: string; name: string; primary: string; secondary: string };
}

const topicIcons = {
  plastik: <MessageCircle className="w-8 h-8" />,
  deterjen: <Users className="w-8 h-8" />,
};

export default function TopicCard({ id, title, description, commentsCount, onClick, theme }: TopicCardProps) {
  const icon = topicIcons[id as keyof typeof topicIcons] || <TrendingUp className="w-8 h-8" />;

  return (
    <div
      onClick={() => onClick?.(id)}
      className="group rounded-3xl p-8 hover:scale-105 transition-all duration-300 cursor-pointer shadow-xl border"
      style={{
        backgroundColor: theme?.secondary ? `${theme.secondary}e0` : "#111827",
        borderColor: theme?.primary ? `${theme.primary}60` : "#ffffff20",
      }}
    >
      <div className="flex items-start gap-4 mb-6">
        <div
          className="p-3 rounded-2xl border"
          style={{
            backgroundColor: theme?.primary ? `${theme.primary}e0` : "rgba(59,130,246,0.88)",
            borderColor: theme?.primary ? `${theme.primary}90` : "rgba(59,130,246,0.6)",
          }}
        >
          <div style={{ color: "white" }}>
            {icon}
          </div>
        </div>
        <div className="flex-1">
          <h2
            className="text-2xl font-bold mb-2 transition-colors"
            style={{ color: "#ffffff" }}
          >
            {title}
          </h2>
          <p className="text-gray-200 text-sm leading-relaxed">{description}</p>
        </div>
      </div>
      <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: theme?.primary ? `${theme.primary}30` : "#ffffff10" }}>
        <div className="flex items-center gap-2 text-gray-300 text-sm">
          <MessageCircle className="w-4 h-4" />
          <span>{commentsCount} diskusi</span>
        </div>
        <div
          className="text-sm font-medium transition-colors"
          style={{ color: theme?.primary ?? "#60a5fa" }}
        >
          Bergabung →
        </div>
      </div>
    </div>
  );
}

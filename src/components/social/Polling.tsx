import { useState } from 'react';
import { BarChart3, CheckCircle } from 'lucide-react';

interface Option {
  id: string;
  text: string;
  votes: number;
}

interface PollingProps {
  question: string;
  options: Option[];
  onVote: (optionId: string) => void;
  theme?: { id: string; name: string; primary: string; secondary: string };
}

export default function Polling({ question, options, onVote, theme }: PollingProps) {
  const [hasVoted, setHasVoted] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const totalVotes = options.reduce((sum, option) => sum + option.votes, 0);

  const handleVote = (optionId: string) => {
    if (!hasVoted) {
      setSelectedOption(optionId);
      onVote(optionId);
      setHasVoted(true);
    }
  };

  return (
    <div 
      className="rounded-3xl p-6 mb-8 border shadow-xl"
      style={{
        backgroundColor: theme?.secondary ? `${theme.secondary}e0` : "#111827",
        borderColor: theme?.primary ? `${theme.primary}60` : "#ffffff20",
      }}
    >
      <div className="flex items-center gap-3 mb-6">
        <div 
          className="p-2 rounded-xl"
          style={{
            backgroundColor: theme?.primary ? `${theme.primary}30` : "rgba(59,130,246,0.3)",
          }}
        >
          <BarChart3 
            className="w-6 h-6"
            style={{ color: theme?.primary ?? "#60a5fa" }}
          />
        </div>
        <h3 className="text-xl font-bold text-white">{question}</h3>
      </div>

      <div className="space-y-4">
        {options.map((option) => {
          const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
          const isSelected = selectedOption === option.id;

          return (
            <div key={option.id} className="space-y-3">
              <button
                onClick={() => handleVote(option.id)}
                disabled={hasVoted}
                className="w-full text-left p-4 rounded-2xl transition-all duration-300"
                style={{
                  backgroundColor: hasVoted
                    ? isSelected
                      ? theme?.primary ? `${theme.primary}80` : "rgba(59,130,246,0.5)"
                      : "rgba(107,114,128,0.3)"
                    : "rgba(107,114,128,0.3)",
                  borderColor: isSelected && hasVoted
                    ? theme?.primary ?? "rgb(59,130,246)"
                    : "transparent",
                  borderWidth: "2px",
                  opacity: hasVoted && !isSelected ? 0.6 : 1,
                  cursor: hasVoted ? "not-allowed" : "pointer",
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {hasVoted && isSelected && (
                      <CheckCircle 
                        className="w-5 h-5"
                        style={{ color: theme?.primary ?? "#60a5fa" }}
                      />
                    )}
                    <span className="text-white font-medium">{option.text}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-gray-300 text-sm">{option.votes} suara</span>
                    {hasVoted && (
                      <span 
                        className="text-sm ml-2"
                        style={{ color: theme?.primary ?? "#60a5fa" }}
                      >
                        ({percentage.toFixed(1)}%)
                      </span>
                    )}
                  </div>
                </div>
              </button>

              {hasVoted && (
                <div className="relative">
                  <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000 ease-out"
                      style={{
                        backgroundColor: theme?.primary ?? "rgb(59,130,246)",
                        width: `${percentage}%`,
                      }}
                    ></div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-semibold text-white drop-shadow-lg">
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {hasVoted && (
        <div 
          className="mt-6 p-4 border rounded-2xl"
          style={{
            backgroundColor: theme?.primary ? `${theme.primary}e0` : "rgba(59,130,246,0.88)",
            borderColor: theme?.primary ? `${theme.primary}90` : "rgba(59,130,246,0.6)",
          }}
        >
          <div 
            className="flex items-center gap-2 font-semibold text-white"
          >
            <CheckCircle className="w-5 h-5" />
            <span>Terima kasih atas partisipasi Anda!</span>
          </div>
          <p 
            className="text-sm mt-1 text-gray-100"
          >
            Suara Anda membantu membentuk diskusi yang lebih baik.
          </p>
        </div>
      )}
    </div>
  );
}
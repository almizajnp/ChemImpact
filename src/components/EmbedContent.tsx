import React from "react";

interface EmbedContentProps {
  url?: string;
}

export default function EmbedContent({ url }: EmbedContentProps) {
  if (!url) return null;

  // Detect if URL is YouTube
  const youtubeMatch = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  );
  if (youtubeMatch) {
    const videoId = youtubeMatch[1];
    return (
      <div className="w-full aspect-video rounded-lg overflow-hidden mb-4 bg-black">
        <iframe
          width="100%"
          height="100%"
          src={`https://www.youtube.com/embed/${videoId}`}
          title="YouTube video"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
    );
  }

  // For other URLs, show as embed if possible or link
  return (
    <div className="w-full mb-4">
      <div className="bg-gray-100 rounded-lg p-4 border border-gray-300">
        <p className="text-sm text-gray-600 mb-2">Referensi Konten:</p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 hover:underline break-all"
        >
          {url}
        </a>
      </div>
    </div>
  );
}

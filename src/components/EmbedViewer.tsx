import { ExternalLink, Globe } from "lucide-react";
import { EmbedLink } from "../types";

// ============ EMBED VIEWER UNIVERSAL ============
// Merender satu link embed LANGSUNG DI DALAM website (tanpa keluar):
// - youtube / vimeo / drive : iframe video player
// - tiktok                  : iframe player portrait
// - video (.mp4/.webm/...)  : HTML5 <video> player
// - pdf                     : iframe PDF viewer bawaan browser
// - image                   : <img>
// - article / website       : iframe halaman web + tombol fallback
//   (catatan: sebagian situs memblokir iframe via X-Frame-Options —
//    untuk itu tersedia tombol "Buka di Tab Baru" di bar atas frame)

interface EmbedViewerProps {
    embed: EmbedLink;
    title?: string;
    index?: number;
}

export default function EmbedViewer({
    embed,
    title = "Konten",
    index = 0,
}: EmbedViewerProps) {
    const { url, type } = embed;

    // ---------- Video platform (iframe player) ----------
    if (type === "youtube" || type === "vimeo" || type === "drive") {
        return (
            <div className="mb-4 bg-gray-900 rounded-lg overflow-hidden aspect-video">
                <iframe
                    width="100%"
                    height="100%"
                    src={url}
                    title={`${title} - video ${index + 1}`}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                    allowFullScreen
                ></iframe>
            </div>
        );
    }

    // ---------- TikTok (portrait player) ----------
    if (type === "tiktok") {
        return (
            <div className="mb-4 bg-gray-900 rounded-lg overflow-hidden mx-auto max-w-[340px] h-[580px]">
                <iframe
                    width="100%"
                    height="100%"
                    src={url}
                    title={`${title} - tiktok ${index + 1}`}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                    allowFullScreen
                ></iframe>
            </div>
        );
    }

    // ---------- File video langsung ----------
    if (type === "video") {
        return (
            <div className="mb-4 bg-black rounded-lg overflow-hidden">
                <video
                    src={url}
                    controls
                    preload="metadata"
                    className="w-full max-h-[420px]"
                >
                    Browser Anda tidak mendukung pemutaran video.
                </video>
            </div>
        );
    }

    // ---------- PDF ----------
    if (type === "pdf") {
        return (
            <div className="mb-4 rounded-lg overflow-hidden border border-gray-200">
                <div className="flex items-center justify-between bg-gray-100 px-3 py-2 border-b border-gray-200">
                    <span className="text-xs font-semibold text-gray-600 truncate">
                        📑 Dokumen PDF
                    </span>
                    <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 shrink-0"
                    >
                        <ExternalLink size={12} /> Buka di Tab Baru
                    </a>
                </div>
                <iframe
                    src={url}
                    title={`${title} - pdf ${index + 1}`}
                    className="w-full h-[480px] bg-white"
                ></iframe>
            </div>
        );
    }

    // ---------- Gambar ----------
    if (type === "image") {
        return (
            <div className="mb-4 bg-gray-100 rounded-lg overflow-hidden">
                <img
                    src={url}
                    alt={`${title} - gambar ${index + 1}`}
                    className="w-full max-h-[420px] object-contain"
                />
            </div>
        );
    }

    // ---------- Artikel / Website: tampil INLINE via iframe ----------
    return (
        <div className="mb-4 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
            {/* Bar atas: info URL + fallback jika situs memblokir iframe */}
            <div className="flex items-center justify-between gap-2 bg-gray-100 px-3 py-2 border-b border-gray-200">
                <span className="flex items-center gap-1.5 text-xs text-gray-600 truncate min-w-0">
                    <Globe size={13} className="text-blue-500 shrink-0" />
                    <span className="truncate">{url}</span>
                </span>
                <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 shrink-0"
                >
                    <ExternalLink size={12} /> Buka di Tab Baru
                </a>
            </div>
            <div className="relative bg-white">
                <iframe
                    src={url}
                    title={`${title} - halaman ${index + 1}`}
                    className="w-full h-[450px]"
                    sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                    loading="lazy"
                ></iframe>
            </div>
            <div className="bg-amber-50 border-t border-amber-100 px-3 py-1.5">
                <p className="text-[11px] text-amber-700">
                    ⚠️ Jika konten di atas kosong, situs tersebut memblokir tampilan di
                    dalam website lain — gunakan tombol "Buka di Tab Baru".
                </p>
            </div>
        </div>
    );
}

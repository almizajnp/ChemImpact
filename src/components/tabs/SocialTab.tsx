// FIXED: SocialTab dengan siswaId tracking dan proper hierarchy
import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  PlusCircle,
  Trash2,
  ThumbsUp,
  X,
  Image,
  Play,
  ExternalLink,
  SendHorizontal,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import {
  createDiscussionTopic,
  updateDiscussionTopic,
  deleteDiscussionTopic,
  subscribeToDiscussionTopics,
  addDiscussionComment,
  deleteDiscussionComment,
  subscribeToDiscussionComments,
  addDiscussionReply,
  deleteDiscussionReply,
  subscribeToDiscussionReplies,
  detectEmbedType,
} from "../../lib/firestore";
import {
  DiscussionTopic,
  DiscussionComment,
  DiscussionReply,
} from "../../types";

interface SocialTabProps {
  classId: string;
  theme?: { id: string; name: string; primary: string; secondary: string };
}

export default function SocialTab({ classId, theme }: SocialTabProps) {
  const { userProfile } = useAuth();
  const isTeacher = userProfile?.role === "guru";

  const [topics, setTopics] = useState<DiscussionTopic[]>([]);
  const [loadingTopics, setLoadingTopics] = useState(true);

  const [selectedTopicId, setSelectedTopicId] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<DiscussionTopic | null>(
    null,
  );

  const [comments, setComments] = useState<DiscussionComment[]>([]);
  const [commentReplies, setCommentReplies] = useState<
    Record<string, DiscussionReply[]>
  >({});
  const [loadingComments, setLoadingComments] = useState(false);

  const [newComment, setNewComment] = useState("");
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [creatingComment, setCreatingComment] = useState(false);
  const [creatingReply, setCreatingReply] = useState<Record<string, boolean>>(
    {},
  );

  const getInitial = (name?: string) => (name?.trim()?.[0] || "?").toUpperCase();

  // Discussion creation states
  const [showCreateDiscussion, setShowCreateDiscussion] = useState(false);
  const [discussionFormData, setDiscussionFormData] = useState({
    title: "",
    description: "",
    embedLink: "",
  });
  const [creatingDiscussion, setCreatingDiscussion] = useState(false);

  // ================= TOPICS =================
  useEffect(() => {
    if (!classId) return;

    const unsub = subscribeToDiscussionTopics(classId, (data) => {
      const filtered = isTeacher
        ? data
        : data.filter((t) => t.status === "published");

      setTopics(filtered);
      setLoadingTopics(false);

      if (!selectedTopicId && filtered.length > 0) {
        setSelectedTopicId(filtered[0].id);
      }
    });

    return () => unsub();
  }, [classId, isTeacher, selectedTopicId]);

  // ================= COMMENTS + REPLIES WITH PROPER HIERARCHY =================
  useEffect(() => {
    if (!selectedTopicId) {
      setSelectedTopic(null);
      setComments([]);
      setCommentReplies({});
      return;
    }

    const topic = topics.find((t) => t.id === selectedTopicId);
    setSelectedTopic(topic || null);

    setLoadingComments(true);

    let replyUnsubs: (() => void)[] = [];

    const unsubComments = subscribeToDiscussionComments(
      classId,
      selectedTopicId,
      (updatedComments) => {
        setComments(updatedComments);

        // cleanup old reply listeners
        replyUnsubs.forEach((u) => u());
        replyUnsubs = [];

        updatedComments.forEach((comment) => {
          // FIX: Pass correct parameters including topicId
          const unsubReplies = subscribeToDiscussionReplies(
            classId,
            selectedTopicId,
            comment.id,
            (replies) => {
              setCommentReplies((prev) => ({
                ...prev,
                [comment.id]: replies,
              }));
            },
          );

          replyUnsubs.push(unsubReplies);
        });

        setLoadingComments(false);
      },
    );

    return () => {
      unsubComments();
      replyUnsubs.forEach((u) => u());
    };
  }, [selectedTopicId, classId, topics]);

  // ================= DISCUSSION CREATION =================
  const handleCreateDiscussion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !discussionFormData.title.trim() ||
      !discussionFormData.description.trim()
    )
      return;

    setCreatingDiscussion(true);
    try {
      // Validasi embed link jika ada
      let embedType = undefined;
      if (discussionFormData.embedLink.trim()) {
        embedType = detectEmbedType(discussionFormData.embedLink);
        if (!embedType) {
          alert("URL tidak valid. Gunakan URL YouTube, gambar, atau website.");
          setCreatingDiscussion(false);
          return;
        }
      }

      // Create topic with draft status, then immediately publish for easy access
      const topicId = await createDiscussionTopic(
        classId,
        discussionFormData.title,
        discussionFormData.description,
        userProfile!.uid,
        userProfile!.name,
        discussionFormData.embedLink.trim() || undefined,
      );

      // Auto-publish the discussion so students can see it immediately
      await updateDiscussionTopic(classId, topicId, {
        status: "published",
      });

      setDiscussionFormData({ title: "", description: "", embedLink: "" });
      setShowCreateDiscussion(false);
      alert("✅ Diskusi berhasil dibuat dan dipublikasikan!");
    } catch (error) {
      console.error("Error creating discussion:", error);
      alert("Gagal membuat diskusi. Silakan coba lagi.");
    } finally {
      setCreatingDiscussion(false);
    }
  };

  const handlePublishDiscussion = async (topic: DiscussionTopic) => {
    try {
      await updateDiscussionTopic(classId, topic.id, {
        status: topic.status === "published" ? "draft" : "published",
      });
    } catch (error) {
      console.error("Error updating discussion:", error);
      alert("Gagal memperbarui status diskusi");
    }
  };

  const handleDeleteDiscussion = async (topicId: string) => {
    if (
      !window.confirm(
        "Apakah Anda yakin ingin menghapus topik diskusi ini?\n\nSemua komentar dan balasan akan dihapus.",
      )
    )
      return;

    try {
      await deleteDiscussionTopic(classId, topicId);
      setSelectedTopicId("");
      setSelectedTopic(null);
    } catch (error) {
      console.error("Error deleting discussion:", error);
      alert("Gagal menghapus diskusi");
    }
  };

  // ================= ACTIONS =================
  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedTopicId || !userProfile) return;

    // Gunakan siswaId/uid sebagai primary identity
    const siswaId = userProfile.uid;
    const siswaName = userProfile.name;

    setCreatingComment(true);
    try {
      await addDiscussionComment(
        classId,
        selectedTopicId,
        newComment,
        siswaId, // PRIMARY IDENTITY
        siswaName,
        isTeacher ? "teacher" : "student",
      );
      setNewComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setCreatingComment(false);
    }
  };

  const handleAddReply = async (commentId: string) => {
    const text = replyText[commentId];
    if (!text?.trim() || !selectedTopicId || !userProfile) return;

    // Gunakan siswaId/uid sebagai primary identity
    const siswaId = userProfile.uid;
    const userName = userProfile.name;

    setCreatingReply((p) => ({ ...p, [commentId]: true }));
    try {
      await addDiscussionReply(
        classId,
        selectedTopicId,
        commentId,
        text,
        siswaId, // PRIMARY IDENTITY
        userName,
        isTeacher ? "teacher" : "student",
      );

      setReplyText((p) => ({ ...p, [commentId]: "" }));
    } catch (error) {
      console.error("Error adding reply:", error);
    } finally {
      setCreatingReply((p) => ({ ...p, [commentId]: false }));
    }
  };

  const handleDeleteComment = async (id: string) => {
    if (!selectedTopicId) return;
    try {
      await deleteDiscussionComment(classId, selectedTopicId, id);
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const handleDeleteReply = async (commentId: string, replyId: string) => {
    try {
      await deleteDiscussionReply(classId, selectedTopicId, commentId, replyId);
    } catch (error) {
      console.error("Error deleting reply:", error);
    }
  };

  // ================= EMBED PREVIEW COMPONENTS =================
  const EmbedPreview = ({ topic }: { topic: DiscussionTopic }) => {
    if (!topic.optionalEmbedLink) return null;

    const { embedType, optionalEmbedLink } = topic;

    if (embedType === "youtube") {
      return (
        <div className="mb-4 bg-gray-900 rounded-lg overflow-hidden aspect-video">
          <iframe
            width="100%"
            height="100%"
            src={optionalEmbedLink}
            title={topic.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      );
    }

    if (embedType === "image") {
      return (
        <div className="mb-4 bg-gray-100 rounded-lg overflow-hidden max-h-64">
          <img
            src={optionalEmbedLink}
            alt={topic.title}
            className="w-full h-full object-cover"
          />
        </div>
      );
    }

    if (embedType === "article" || embedType === "website") {
      return (
        <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start gap-3">
            <ExternalLink className="w-5 h-5 text-blue-600 shrink-0 mt-1" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-blue-600 font-medium truncate">
                External Resource
              </p>
              <a
                href={optionalEmbedLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-500 hover:underline truncate block"
              >
                {optionalEmbedLink}
              </a>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  // Mobile state
  const [showTopicsList, setShowTopicsList] = useState(true);

  // ================= UI =================
  return (
    <div className="flex flex-col w-full pt-6 pb-28 md:pb-32 min-h-[650px] overflow-hidden">
      {/* CREATE DISCUSSION FORM - for teachers */}
      {isTeacher && showCreateDiscussion && (
        <div className="p-3 md:p-4 bg-white/90 backdrop-blur-sm border-b border-gray-200">
          <h3 className="text-base md:text-lg font-bold text-gray-900 mb-4">
            Buat Topik Diskusi Baru
          </h3>
          <form onSubmit={handleCreateDiscussion} className="space-y-4">
            <div>
              <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                Judul Diskusi
              </label>
              <input
                type="text"
                value={discussionFormData.title}
                onChange={(e) =>
                  setDiscussionFormData({
                    ...discussionFormData,
                    title: e.target.value,
                  })
                }
                placeholder="Contoh: Dampak Limbah Industri pada Ekosistem"
                className="w-full px-3 md:px-4 py-2 text-xs md:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-black"
                required
              />
            </div>

            <div>
              <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                Deskripsi / Studi Kasus
              </label>
              <textarea
                value={discussionFormData.description}
                onChange={(e) =>
                  setDiscussionFormData({
                    ...discussionFormData,
                    description: e.target.value,
                  })
                }
                placeholder="Jelaskan masalah, studi kasus, atau pertanyaan untuk didiskusikan..."
                className="w-full px-3 md:px-4 py-2 text-xs md:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none text-black"
                rows={3}
                required
              />
            </div>

            <div>
              <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                Link Embed (Opsional)
              </label>
              <p className="text-xs text-gray-600 mb-2">
                🎥 YouTube • 📷 Gambar • 📄 Artikel • 🌐 Website
              </p>
              <input
                type="url"
                value={discussionFormData.embedLink}
                onChange={(e) =>
                  setDiscussionFormData({
                    ...discussionFormData,
                    embedLink: e.target.value,
                  })
                }
                placeholder="Contoh: https://youtu.be/... atau https://contoh.com/gambar.jpg"
                className="w-full px-3 md:px-4 py-2 text-xs md:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex gap-3 flex-col md:flex-row">
              <button
                type="submit"
                disabled={creatingDiscussion}
                className="flex-1 bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 disabled:bg-gray-400 transition-colors font-medium text-xs md:text-sm"
              >
                {creatingDiscussion ? "Membuat..." : "Buat & Publikasikan"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateDiscussion(false);
                  setDiscussionFormData({
                    title: "",
                    description: "",
                    embedLink: "",
                  });
                }}
                className="flex-1 bg-gray-300 text-gray-900 py-2 rounded-lg hover:bg-gray-400 transition-colors font-medium text-xs md:text-sm"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="flex flex-1 min-h-0 flex-col lg:flex-row gap-5 overflow-hidden">
        {/* TOPICS SIDEBAR / LIST */}
        <div
          className={`${
            showTopicsList ? "block" : "hidden lg:block"
          } w-full lg:w-[340px] flex-shrink-0 h-full flex flex-col bg-white/80 backdrop-blur-md rounded-3xl border border-slate-200/80 shadow-sm p-4 overflow-hidden`}
        >
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm md:text-base flex items-center gap-2">
              📌 Topik Diskusi
            </h3>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full">
              {topics.length} Topik
            </span>
          </div>

          {loadingTopics ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              Memuat topik...
            </div>
          ) : topics.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs md:text-sm">
              {isTeacher
                ? "Belum ada topik diskusi. Klik 'Buat Topik Baru' di atas."
                : "Menunggu guru membuat topik diskusi..."}
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {topics.map((t) => {
                const isSelected = selectedTopicId === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      setSelectedTopicId(t.id);
                      setShowTopicsList(false); // Switch to detail view on mobile
                    }}
                    className={`w-full text-left p-4 rounded-2xl transition-all duration-200 group relative border ${
                      isSelected
                        ? "bg-emerald-50/70 border-emerald-500 shadow-md ring-1 ring-emerald-500/20"
                        : "bg-white border-slate-200/80 hover:border-emerald-300 hover:shadow-md"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3
                        className={`font-bold text-sm line-clamp-2 transition-colors ${
                          isSelected
                            ? "text-emerald-950"
                            : "text-slate-900 group-hover:text-emerald-700"
                        }`}
                      >
                        {t.title}
                      </h3>
                      {t.status !== "published" && !isTeacher && (
                        <span className="text-[10px] text-amber-700 font-bold bg-amber-100/80 px-2 py-0.5 rounded-full flex-shrink-0">
                          Draft
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mb-3 line-clamp-2 leading-relaxed">
                      {t.description}
                    </p>
                    <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 text-xs">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-medium text-[11px]">
                        💬 {t.commentCount} komentar
                      </span>
                      <span className="text-xs font-semibold text-emerald-600 group-hover:translate-x-0.5 transition-transform">
                        Buka →
                      </span>
                    </div>

                    {/* Teacher action buttons - shown on hover */}
                    {isTeacher && (
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm p-1 rounded-lg shadow-sm border border-slate-200">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePublishDiscussion(t);
                          }}
                          className={`text-[11px] px-2 py-0.5 rounded font-medium transition-colors ${
                            t.status === "published"
                              ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                              : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                          }`}
                        >
                          {t.status === "published" ? "Unpublish" : "Publish"}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteDiscussion(t.id);
                          }}
                          className="text-[11px] px-2 py-0.5 bg-rose-100 text-rose-700 hover:bg-rose-200 rounded font-medium transition-colors"
                        >
                          Hapus
                        </button>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* MAIN CONTENT - TOPIC & COMMENTS CHANNEL */}
        <div
          className={`flex-1 flex flex-col overflow-hidden rounded-3xl border border-slate-200/80 shadow-sm ${
            !showTopicsList && selectedTopic ? "flex" : "hidden lg:flex"
          }`}
          style={{
            backgroundColor: theme?.secondary
              ? `${theme.secondary}e6`
              : "rgba(255, 255, 255, 0.95)",
          }}
        >
          {selectedTopic ? (
            <>
              {/* TOPIC CONTENT */}
              <div className="flex-1 min-h-0 overflow-y-auto p-4 md:p-6 pb-16 space-y-5">
                {/* Back Button for Mobile */}
                <div className="lg:hidden mb-2">
                  <button
                    onClick={() => {
                      setShowTopicsList(true);
                    }}
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold hover:bg-emerald-100 transition-colors shadow-xs border border-emerald-200"
                  >
                    ← Kembali ke Daftar Topik
                  </button>
                </div>

                {/* UNIFIED HERO TOPIC CARD */}
                <div className="bg-white rounded-3xl p-5 md:p-7 border border-slate-100 shadow-sm space-y-4">
                  {/* Topic Title & Meta */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold tracking-wide">
                        📌 Diskusi Kelas
                      </span>
                      {selectedTopic.status === "draft" && (
                        <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
                          Draft (Belum Dipublikasikan)
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold text-slate-900 leading-snug">
                      {selectedTopic.title}
                    </h3>
                    <p className="text-xs md:text-sm text-slate-500 mt-2 flex items-center gap-2">
                      <span>
                        Dibuat oleh:{" "}
                        <strong className="text-slate-700">
                          {selectedTopic.createdByName}
                        </strong>
                      </span>
                      <span>•</span>
                      <span>
                        {new Date(selectedTopic.createdAt).toLocaleDateString(
                          "id-ID",
                        )}
                      </span>
                    </p>
                  </div>

                  {/* Embed Preview */}
                  <EmbedPreview topic={selectedTopic} />

                  {/* Topic Description Box */}
                  <div className="bg-slate-50/90 rounded-2xl p-4 md:p-5 border border-slate-100">
                    <p className="text-sm md:text-base text-slate-800 leading-relaxed whitespace-pre-wrap font-sans">
                      {selectedTopic.description}
                    </p>
                  </div>
                </div>

                {/* COMMENTS SECTION CONTAINER */}
                <div className="rounded-3xl bg-white border border-slate-100 shadow-sm p-4 md:p-6">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                    <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      💬 Diskusi & Komentar
                      <span className="text-xs bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-semibold">
                        {selectedTopic.commentCount}
                      </span>
                    </h4>
                  </div>

                  {loadingComments ? (
                    <div className="py-12 text-center text-sm text-slate-400">
                      Memuat komentar...
                    </div>
                  ) : comments.length === 0 ? (
                    <div className="py-12 text-center text-sm text-slate-400 flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl">
                        💭
                      </div>
                      <p className="font-medium text-slate-600">
                        Belum ada komentar
                      </p>
                      <p className="text-xs text-slate-400">
                        Jadilah yang pertama membuka diskusi!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {comments.map((comment) => (
                        <div
                          key={comment.id}
                          className="group rounded-2xl bg-slate-50/80 p-4 border border-slate-100 hover:border-slate-200 transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            {/* Avatar with Emerald Gradient */}
                            <div className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-sm font-extrabold text-white shadow-sm">
                              {getInitial(comment.siswaName)}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <p className="text-xs font-bold text-slate-800">
                                    {comment.siswaName}
                                  </p>
                                  <p className="mt-1 text-sm text-slate-900 leading-relaxed">
                                    {comment.text}
                                  </p>
                                </div>
                                {isTeacher && (
                                  <button
                                    onClick={() =>
                                      handleDeleteComment(comment.id)
                                    }
                                    className="rounded-full p-1.5 text-slate-400 opacity-0 group-hover:opacity-100 transition hover:bg-rose-50 hover:text-rose-600"
                                    title="Hapus komentar"
                                  >
                                    <Trash2 size={15} />
                                  </button>
                                )}
                              </div>

                              <div className="mt-2 flex items-center gap-3 text-[11px] font-medium text-slate-400">
                                <span>
                                  {new Date(
                                    comment.createdAt,
                                  ).toLocaleTimeString("id-ID", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              </div>

                              {/* Nested Replies */}
                              {(commentReplies[comment.id] || []).length >
                                0 && (
                                <div className="mt-3 space-y-2.5 border-l-2 border-emerald-200/60 pl-3">
                                  {(commentReplies[comment.id] || []).map(
                                    (reply) => (
                                      <div
                                        key={reply.id}
                                        className="flex items-start gap-2.5 bg-white rounded-xl p-3 border border-slate-100 shadow-2xs"
                                      >
                                        <div className="grid h-7 w-7 flex-shrink-0 place-items-center rounded-full bg-emerald-100 text-[11px] font-bold text-emerald-800">
                                          {getInitial(reply.userName)}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                          <div className="flex items-start justify-between gap-2">
                                            <div>
                                              <p className="text-[11px] font-bold text-slate-800">
                                                {reply.userName}
                                              </p>
                                              <p className="mt-0.5 text-xs text-slate-800 leading-relaxed">
                                                {reply.text}
                                              </p>
                                              <p className="mt-1 text-[10px] text-slate-400">
                                                {new Date(
                                                  reply.createdAt,
                                                ).toLocaleTimeString("id-ID", {
                                                  hour: "2-digit",
                                                  minute: "2-digit",
                                                })}
                                              </p>
                                            </div>
                                            {isTeacher && (
                                              <button
                                                onClick={() =>
                                                  handleDeleteReply(
                                                    comment.id,
                                                    reply.id,
                                                  )
                                                }
                                                className="rounded-full p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                                                title="Hapus balasan"
                                              >
                                                <X size={12} />
                                              </button>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    ),
                                  )}
                                </div>
                              )}

                              {/* Reply Input Box */}
                              <div className="mt-3 flex items-center gap-2 rounded-full bg-white border border-slate-200 px-3 py-1.5 focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 transition-all">
                                <input
                                  className="min-w-0 flex-1 bg-transparent text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none"
                                  placeholder="Balas komentar..."
                                  value={replyText[comment.id] || ""}
                                  onChange={(e) =>
                                    setReplyText((p) => ({
                                      ...p,
                                      [comment.id]: e.target.value,
                                    }))
                                  }
                                />
                                <button
                                  onClick={() => handleAddReply(comment.id)}
                                  disabled={
                                    creatingReply[comment.id] ||
                                    !(replyText[comment.id] || "").trim()
                                  }
                                  className="grid h-7 w-7 flex-shrink-0 place-items-center rounded-full bg-emerald-600 text-white transition hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400"
                                  title="Balas"
                                >
                                  {creatingReply[comment.id] ? (
                                    <span className="text-[10px]">...</span>
                                  ) : (
                                    <SendHorizontal size={13} />
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* ADD COMMENT INPUT BAR */}
              {!isTeacher && selectedTopic.status === "published" && (
                <div className="flex-shrink-0 border-t border-slate-100 bg-white/95 p-3 shadow-lg backdrop-blur-md md:p-4 rounded-b-3xl">
                  <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 transition-all">
                    <div className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-full bg-emerald-600 text-sm font-extrabold text-white shadow-sm">
                      {getInitial(userProfile?.name || userProfile?.email)}
                    </div>
                    <textarea
                      className="min-h-[40px] max-h-24 flex-1 resize-none bg-transparent px-1 py-1 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                      rows={1}
                      placeholder="Tambahkan komentar..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                    />
                    <button
                      onClick={handleAddComment}
                      disabled={creatingComment || !newComment.trim()}
                      className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-full bg-emerald-600 text-white transition hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 shadow-sm"
                      title="Kirim komentar"
                    >
                      {creatingComment ? (
                        <span className="text-xs font-bold">...</span>
                      ) : (
                        <SendHorizontal size={18} />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {!isTeacher && selectedTopic.status === "draft" && (
                <div className="p-3 md:p-4 border-t border-amber-200 bg-amber-50 flex-shrink-0 rounded-b-3xl">
                  <p className="text-xs text-amber-800 font-medium">
                    ⚠️ Topik ini masih draft dan belum dipublikasikan oleh guru.
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400 text-sm p-6">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl mx-auto mb-3">
                  💬
                </div>
                <p className="font-semibold text-slate-700 mb-1">
                  Pilih Topik Diskusi
                </p>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  Pilih salah satu topik di sebelah kiri untuk membaca dan ikut berpartisipasi dalam diskusi kelas.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

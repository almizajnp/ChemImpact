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
    <div className="flex flex-col w-full pt-6 pb-6 h-auto min-h-[600px] overflow-hidden">
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

      <div className="flex flex-1 min-h-0 flex-col overflow-hidden">
        {/* TOPICS LIST - Card Grid for All Screens */}
        <div
          className={`${showTopicsList ? "block" : "hidden"} h-full overflow-y-auto -mt-2`}
        >
          {loadingTopics ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              Memuat topik...
            </div>
          ) : topics.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-xs md:text-sm">
              {isTeacher
                ? "Belum ada topik diskusi"
                : "Menunggu guru membuat topik diskusi..."}
            </div>
          ) : (
            <>
              {/* Grid View - All Screens */}
              <div className="space-y-3 px-10 pt-4 pb-22">
                {topics.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setSelectedTopicId(t.id);
                      setShowTopicsList(false); // Switch to detail view
                    }}
                    className="w-full bg-white rounded-xl shadow-lg p-5 text-left hover:shadow-xl transition-all duration-200 border-2 border-gray-300 hover:border-emerald-500 group relative"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="font-bold text-base text-gray-900 flex-1 line-clamp-2">
                        {t.title}
                      </h3>
                      {t.status !== "published" && !isTeacher && (
                        <span className="text-xs text-yellow-600 font-bold bg-yellow-50 px-2 py-1 rounded-full flex-shrink-0">
                          Draft
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 mb-4 line-clamp-3">
                      {t.description}
                    </p>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                      <span className="text-xs text-gray-500 font-medium">
                        💬 {t.commentCount}{" "}
                        {t.commentCount === 1 ? "komentar" : "komentar"}
                      </span>
                      <span className="text-xs text-emerald-600 font-medium">
                        Buka →
                      </span>
                    </div>

                    {/* Teacher action buttons - shown on hover */}
                    {isTeacher && (
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePublishDiscussion(t);
                          }}
                          className={`text-xs px-2 py-1 rounded font-medium transition-colors ${
                            t.status === "published"
                              ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                              : "bg-green-200 text-green-700 hover:bg-green-300"
                          }`}
                        >
                          {t.status === "published" ? "Unpublish" : "Publish"}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteDiscussion(t.id);
                          }}
                          className="text-xs px-2 py-1 bg-red-200 text-red-700 hover:bg-red-300 rounded font-medium transition-colors"
                        >
                          Hapus
                        </button>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* MAIN CONTENT - TOPIC & COMMENTS */}
        <div
          className={`flex-1 flex flex-col overflow-hidden ${
            !showTopicsList && selectedTopic ? "block" : "hidden"
          }`}
          style={{
            backgroundColor: theme?.secondary
              ? `${theme.secondary}e6`
              : "rgba(255, 255, 255, 0.9)",
          }}
        >
          {selectedTopic ? (
            <>
              {/* TOPIC CONTENT */}
              <div className="flex-1 min-h-0 overflow-y-auto pt-4 pb-18 px-3 md:px-6 space-y-4">
                {/* Back Button for Mobile */}
                <div className="mb-2 -mt-0">
                  <button
                    onClick={() => {
                      setShowTopicsList(true);
                      setSelectedTopicId("");
                      setSelectedTopic(null);
                    }}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 text-emerald-700 text-sm font-medium hover:bg-emerald-100 transition-colors shadow-sm"
                  >
                    ← Kembali ke Topik
                  </button>
                </div>

                {/* Topic Header */}
                <div>
                  <h3 className="text-lg md:text-2xl font-bold text-gray-900 mb-2">
                    {selectedTopic.title}
                  </h3>
                  <p className="text-xs md:text-sm text-gray-600">
                    Dibuat oleh:{" "}
                    <span className="font-medium">
                      {selectedTopic.createdByName}
                    </span>{" "}
                    •{" "}
                    {new Date(selectedTopic.createdAt).toLocaleDateString(
                      "id-ID",
                    )}
                  </p>
                </div>

                {/* Embed Preview */}
                <EmbedPreview topic={selectedTopic} />

                {/* Topic Description */}
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                  <p className="text-sm text-gray-800 whitespace-pre-wrap">
                    {selectedTopic.description}
                  </p>
                </div>

                {/* Comments Section */}
                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-bold text-gray-900 mb-4 text-sm md:text-base">
                    💭 Komentar ({selectedTopic.commentCount})
                  </h4>

                  {loadingComments ? (
                    <div className="text-center text-gray-500 py-4 text-sm">
                      Memuat komentar...
                    </div>
                  ) : comments.length === 0 ? (
                    <p className="text-center text-gray-500 text-xs md:text-sm py-4">
                      Belum ada komentar. Jadilah yang pertama berkomentar!
                    </p>
                  ) : (
                    <div className="space-y-3 md:space-y-4">
                      {comments.map((comment) => (
                        <div
                          key={comment.id}
                          className="border border-gray-200 rounded-lg p-3 md:p-4 bg-white hover:shadow-sm transition-shadow"
                        >
                          {/* Comment Header */}
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-semibold text-sm md:text-base text-gray-900">
                                {comment.siswaName}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(comment.createdAt).toLocaleString(
                                  "id-ID",
                                )}
                              </p>
                            </div>
                            {isTeacher && (
                              <button
                                onClick={() => handleDeleteComment(comment.id)}
                                className="text-red-500 hover:text-red-700 p-1"
                                title="Hapus komentar"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>

                          {/* Comment Text */}
                          <p className="text-xs md:text-sm text-gray-700 mb-3">
                            {comment.text}
                          </p>

                          {/* Replies */}
                          {(commentReplies[comment.id] || []).length > 0 && (
                            <div className="ml-2 md:ml-4 space-y-2 md:space-y-3 mb-3 border-l-2 border-gray-200 pl-3 md:pl-4">
                              {(commentReplies[comment.id] || []).map(
                                (reply) => (
                                  <div
                                    key={reply.id}
                                    className="bg-gray-50 rounded p-2 md:p-3"
                                  >
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <p className="font-medium text-xs md:text-sm text-gray-900">
                                          {reply.userName}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                          {new Date(
                                            reply.createdAt,
                                          ).toLocaleString("id-ID")}
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
                                          className="text-red-500 hover:text-red-700 p-1"
                                          title="Hapus balasan"
                                        >
                                          <X size={12} />
                                        </button>
                                      )}
                                    </div>
                                    <p className="text-xs text-gray-700 mt-2">
                                      {reply.text}
                                    </p>
                                  </div>
                                ),
                              )}
                            </div>
                          )}

                          {/* Reply Input */}
                          <div className="flex gap-2 flex-col md:flex-row">
                            <input
                              className="flex-1 border border-gray-300 rounded px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 text-black"
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
                              disabled={creatingReply[comment.id]}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 md:px-4 py-2 rounded text-xs font-medium disabled:bg-gray-400 transition-colors"
                            >
                              {creatingReply[comment.id] ? "..." : "Balas"}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* ADD COMMENT SECTION */}
              {!isTeacher && selectedTopic.status === "published" && (
                <div className="p-3 md:p-4 border-t bg-gray-50 flex-shrink-0">
                  <label className="text-xs font-semibold text-gray-700 block mb-2">
                    Berikan Komentar Anda
                  </label>
                  <div className="flex gap-2 flex-col md:flex-row">
                    <textarea
                      className="flex-1 border border-gray-300 rounded px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none text-black"
                      rows={2}
                      placeholder="Tulis pemikiran atau pendapat Anda..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                    />
                    <button
                      onClick={handleAddComment}
                      disabled={creatingComment || !newComment.trim()}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 md:px-4 py-2 rounded font-medium disabled:bg-gray-400 transition-colors text-xs md:text-sm h-fit whitespace-nowrap"
                    >
                      {creatingComment ? "..." : "Kirim"}
                    </button>
                  </div>
                </div>
              )}

              {!isTeacher && selectedTopic.status === "draft" && (
                <div className="p-3 md:p-4 border-t bg-yellow-50 flex-shrink-0">
                  <p className="text-xs text-yellow-700">
                    ⚠️ Topik ini masih draft dan belum dipublikasikan oleh guru.
                  </p>
                </div>
              )}

              {/* Bottom Padding untuk konten yang di-scroll */}
              <div className="h-20 flex-shrink-0"></div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
              <div className="text-center">
                <p className="mb-4">Pilih topik untuk memulai diskusi</p>
                {topics.length === 0 && (
                  <button
                    onClick={() => setShowTopicsList(true)}
                    className="text-emerald-600 hover:text-emerald-700 text-xs font-medium"
                  >
                    Lihat Topik Diskusi
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

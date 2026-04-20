import React, { useState, useEffect } from "react";
import { MessageCircle, Trash2, Edit2 } from "lucide-react";
import { Discussion, Comment } from "../types";
import { getComments, addComment, deleteComment } from "../lib/firestore";
import EmbedContent from "./EmbedContent";

interface DiscussionCardProps {
  classId: string;
  discussion: Discussion;
  currentUserId: string;
  currentUserName: string;
  currentUserRole: "guru" | "siswa";
  onEdit?: (discussion: Discussion) => void;
  onDelete?: (discussionId: string) => void;
}

export default function DiscussionCard({
  classId,
  discussion,
  currentUserId,
  currentUserName,
  currentUserRole,
  onEdit,
  onDelete,
}: DiscussionCardProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [showComments, setShowComments] = useState(false);

  useEffect(() => {
    if (showComments) {
      loadComments();
    }
  }, [showComments]);

  const loadComments = async () => {
    setLoading(true);
    try {
      const data = await getComments(classId, discussion.id!);
      setComments(data);
    } catch (error) {
      console.error("Error loading comments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    setLoading(true);
    try {
      await addComment(
        classId,
        discussion.id!,
        newComment,
        currentUserId,
        currentUserName,
        currentUserRole,
      );
      setNewComment("");
      await loadComments();
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("Hapus komentar ini?")) return;

    try {
      await deleteComment(classId, discussion.id!, commentId);
      await loadComments();
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const isGuruOwner =
    currentUserRole === "guru" && currentUserId === discussion.guruId;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4 border-l-4 border-blue-500">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-1">
            {discussion.title}
          </h3>
          <p className="text-sm text-gray-600">
            Oleh <span className="font-semibold">{discussion.guruName}</span>
          </p>
        </div>
        {isGuruOwner && (
          <div className="flex gap-2">
            <button
              onClick={() => onEdit?.(discussion)}
              className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
              title="Edit"
            >
              <Edit2 size={18} className="text-blue-600" />
            </button>
            <button
              onClick={() => onDelete?.(discussion.id!)}
              className="p-2 hover:bg-red-50 rounded-lg transition-colors"
              title="Hapus"
            >
              <Trash2 size={18} className="text-red-600" />
            </button>
          </div>
        )}
      </div>

      {/* Description */}
      <p className="text-gray-700 mb-4">{discussion.description}</p>

      {/* Embed Content */}
      <EmbedContent url={discussion.url} />

      {/* Comments Button */}
      <button
        onClick={() => setShowComments(!showComments)}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium mb-4"
      >
        <MessageCircle size={18} />
        <span>{comments.length} Komentar</span>
      </button>

      {/* Comments Section */}
      {showComments && (
        <div className="border-t pt-4">
          {/* Comments List */}
          {loading && comments.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Memuat komentar...</p>
          ) : comments.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              Belum ada komentar. Jadilah yang pertama!
            </p>
          ) : (
            <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
              {comments.map((comment) => (
                <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">
                        {comment.userName}
                      </p>
                      <p className="text-xs text-gray-600">
                        {comment.userRole === "guru" ? "👨‍🏫 Guru" : "👨‍🎓 Siswa"}
                      </p>
                    </div>
                    {currentUserId === comment.userId && (
                      <button
                        onClick={() => handleDeleteComment(comment.id!)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Hapus
                      </button>
                    )}
                  </div>
                  <p className="text-gray-700 text-sm mt-2">{comment.text}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(comment.createdAt).toLocaleString("id-ID")}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Add Comment */}
          <div className="border-t pt-4">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Tulis komentar Anda..."
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={3}
            />
            <button
              onClick={handleAddComment}
              disabled={!newComment.trim() || loading}
              className="mt-2 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {loading ? "Mengirim..." : "Kirim Komentar"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

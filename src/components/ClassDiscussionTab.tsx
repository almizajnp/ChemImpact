import React, { useState } from "react";
import { X, Plus } from "lucide-react";
import { Discussion } from "../types";
import {
  createDiscussion,
  deleteDiscussion,
  updateDiscussion,
} from "../lib/firestore";

interface ClassDiscussionTabProps {
  classId: string;
  discussions: Discussion[];
  guruId: string;
  guruName: string;
  onDiscussionAdded: () => void;
  onDiscussionDeleted: () => void;
}

export default function ClassDiscussionTab({
  classId,
  discussions,
  guruId,
  guruName,
  onDiscussionAdded,
  onDiscussionDeleted,
}: ClassDiscussionTabProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    url: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingId) {
        await updateDiscussion(classId, editingId, {
          title: formData.title,
          description: formData.description,
          url: formData.url || undefined,
        });
      } else {
        await createDiscussion(
          classId,
          formData.title,
          formData.description,
          guruId,
          guruName,
          formData.url || undefined,
        );
      }

      setFormData({ title: "", description: "", url: "" });
      setShowForm(false);
      setEditingId(null);
      onDiscussionAdded();
    } catch (error) {
      console.error("Error saving discussion:", error);
      alert("Gagal menyimpan diskusi");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (discussionId: string) => {
    if (!confirm("Hapus diskusi ini?")) return;

    setLoading(true);
    try {
      await deleteDiscussion(classId, discussionId);
      onDiscussionDeleted();
    } catch (error) {
      console.error("Error deleting discussion:", error);
      alert("Gagal menghapus diskusi");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (discussion: Discussion) => {
    setFormData({
      title: discussion.title,
      description: discussion.description,
      url: discussion.url || "",
    });
    setEditingId(discussion.id!);
    setShowForm(true);
  };

  const handleCancel = () => {
    setFormData({ title: "", description: "", url: "" });
    setShowForm(false);
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header dengan tombol tambah */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Manajemen Diskusi</h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            Diskusi Baru
          </button>
        )}
      </div>

      {/* Form Tambah/Edit */}
      {showForm && (
        <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            {editingId ? "Edit Diskusi" : "Buat Diskusi Baru"}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Judul Diskusi
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Contoh: Analisis Reaksi Kimia Oksidasi"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Deskripsi
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Jelaskan topik diskusi dengan singkat dan jelas..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={4}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL Referensi (Opsional)
              </label>
              <input
                type="url"
                value={formData.url}
                onChange={(e) =>
                  setFormData({ ...formData, url: e.target.value })
                }
                placeholder="https://youtube.com/watch?v=... atau link artikel"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-600 mt-1">
                💡 Dukung YouTube, artikel, atau konten edukatif lainnya
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {loading ? "Menyimpan..." : editingId ? "Perbarui" : "Buat"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 bg-gray-300 text-gray-900 py-2 rounded-lg hover:bg-gray-400 transition-colors font-medium"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Daftar Diskusi */}
      {discussions.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 mb-4">Belum ada diskusi</p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            Buat Diskusi Pertama
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {discussions.map((discussion) => (
            <div
              key={discussion.id}
              className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {discussion.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {discussion.description}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(discussion)}
                    className="p-2 hover:bg-blue-50 rounded-lg transition-colors text-blue-600"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(discussion.id!)}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-600"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {discussion.url && (
                <p className="text-xs text-gray-600 mb-2">
                  🔗 URL:{" "}
                  <span className="text-blue-600">{discussion.url}</span>
                </p>
              )}

              <p className="text-xs text-gray-500">
                {new Date(discussion.createdAt).toLocaleString("id-ID")}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

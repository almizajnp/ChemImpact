import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { LogOut, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Class } from "../types";
import { getGuruClasses, createClass } from "../lib/firestore";

export default function GuruDashboard() {
  const { user, userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [creatingClass, setCreatingClass] = useState(false);

  useEffect(() => {
    if (user && userProfile?.uid) {
      loadClasses();
    }
  }, [user]);

  const loadClasses = async () => {
    setLoading(true);
    try {
      const data = await getGuruClasses(userProfile!.uid);
      setClasses(data);
    } catch (error) {
      console.error("Error loading classes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.description.trim()) return;

    setCreatingClass(true);
    try {
      const classId = await createClass(
        formData.name,
        formData.description,
        userProfile!.uid,
        userProfile!.name,
      );
      setFormData({ name: "", description: "" });
      setShowCreateForm(false);
      await loadClasses();
    } catch (error) {
      console.error("Error creating class:", error);
      alert("Gagal membuat kelas");
    } finally {
      setCreatingClass(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundImage: "url('/images/bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="absolute inset-0 bg-black/30" />

      <div className="relative z-10">
        {/* Header */}
        <div className="bg-white shadow-lg">
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">ChemImpact</h1>
              <p className="text-gray-600">Dashboard Guru</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-semibold text-gray-900">
                  {userProfile?.name}
                </p>
                <p className="text-sm text-gray-600">Guru Pengajar</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="w-6 h-6 text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-12">
          {/* Header Section */}
          <div className="mb-8">
            <h2 className="text-4xl font-bold text-gray-900">
              Selamat Datang, {userProfile?.name}!
            </h2>
            <p className="text-gray-600 mt-2">
              Kelola kelas dan pantau progres siswa Anda
            </p>
          </div>

          {/* Create Class Button */}
          {!showCreateForm && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="mb-8 flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Plus size={20} />
              Buat Kelas Baru
            </button>
          )}

          {/* Create Class Form */}
          {showCreateForm && (
            <div className="bg-blue-50 rounded-2xl p-8 mb-8 border-2 border-blue-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Buat Kelas Baru
              </h3>
              <form onSubmit={handleCreateClass} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Kelas
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Contoh: Kimia Organik X IPA 1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deskripsi Kelas
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Jelaskan tujuan dan konten kelas..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={4}
                    required
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={creatingClass}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    {creatingClass ? "Membuat..." : "Buat Kelas"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false);
                      setFormData({ name: "", description: "" });
                    }}
                    className="flex-1 bg-gray-300 text-gray-900 py-2 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                  >
                    Batal
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Classes Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : classes.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
              <p className="text-gray-600 text-lg mb-6">
                Anda belum memiliki kelas
              </p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Plus size={20} />
                Buat Kelas Pertama
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {classes.map((classItem) => (
                <div
                  key={classItem.id}
                  className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden group cursor-pointer"
                  onClick={() => navigate(`/class/${classItem.id}`)}
                >
                  {/* Card Header */}
                  <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white">
                    <h3 className="text-xl font-bold mb-2 group-hover:translate-x-1 transition-transform">
                      {classItem.name}
                    </h3>
                    <p className="text-blue-100 text-sm">
                      Kode: {classItem.classCode}
                    </p>
                  </div>

                  {/* Card Body */}
                  <div className="p-6">
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {classItem.description}
                    </p>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-blue-50 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-blue-600">
                          {classItem.memberCount || 0}
                        </p>
                        <p className="text-xs text-gray-600">Siswa</p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-green-600">
                          {/* Placeholder for discussions count */}-
                        </p>
                        <p className="text-xs text-gray-600">Diskusi</p>
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/class/${classItem.id}`);
                      }}
                      className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Masuk ke Kelas
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

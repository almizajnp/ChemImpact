import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Class, ClassMember } from "../types";
import {
  getStudentClasses,
  addClassMember,
  getClassByCode,
} from "../lib/firestore";

export default function StudentClasses() {
  const navigate = useNavigate();
  const { user, userProfile, logout } = useAuth();
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [classCode, setClassCode] = useState("");
  const [joiningClass, setJoiningClass] = useState(false);

  useEffect(() => {
    if (user && userProfile?.uid) {
      loadClasses();
    }
  }, [user]);

  const loadClasses = async () => {
    setLoading(true);
    try {
      const data = await getStudentClasses(userProfile!.uid);
      setClasses(data);
    } catch (error) {
      console.error("Error loading classes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!classCode.trim()) return;

    setJoiningClass(true);
    try {
      const classData = await getClassByCode(classCode.toUpperCase());

      if (!classData) {
        alert("Kode kelas tidak ditemukan");
        setJoiningClass(false);
        return;
      }

      // Check if already joined
      if (classes.some((c) => c.id === classData.id)) {
        alert("Anda sudah bergabung dengan kelas ini");
        setJoiningClass(false);
        return;
      }

      // Join class
      await addClassMember(classData.id!, userProfile!.uid, userProfile!.name);

      setClassCode("");
      setShowJoinForm(false);
      alert("Berhasil bergabung dengan kelas!");
      await loadClasses();
    } catch (error) {
      console.error("Error joining class:", error);
      alert("Gagal bergabung dengan kelas");
    } finally {
      setJoiningClass(false);
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
              <p className="text-gray-600">Kelas Saya</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-semibold text-gray-900">
                  {userProfile?.name}
                </p>
                <p className="text-sm text-gray-600">Siswa</p>
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
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Kelas Anda
            </h2>
            <p className="text-gray-600">
              Kelola dan akses kelas pembelajaran Anda
            </p>
          </div>

          {/* Join Class Button */}
          {!showJoinForm && (
            <button
              onClick={() => setShowJoinForm(true)}
              className="mb-8 flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Plus size={20} />
              Bergabung dengan Kelas
            </button>
          )}

          {/* Join Class Form */}
          {showJoinForm && (
            <div className="bg-blue-50 rounded-2xl p-8 mb-8 border-2 border-blue-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Bergabung dengan Kelas Baru
              </h3>
              <form onSubmit={handleJoinClass} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kode Kelas
                  </label>
                  <input
                    type="text"
                    value={classCode}
                    onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                    placeholder="Masukkan 6 digit kode kelas"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-lg font-mono tracking-widest"
                    maxLength={6}
                    required
                  />
                  <p className="text-xs text-gray-600 mt-2">
                    💡 Mintalah kode kelas dari guru Anda
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={joiningClass}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    {joiningClass ? "Bergabung..." : "Bergabung"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowJoinForm(false);
                      setClassCode("");
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
                Anda belum bergabung dengan kelas manapun
              </p>
              <button
                onClick={() => setShowJoinForm(true)}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Plus size={20} />
                Bergabung dengan Kelas
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
                  <div className="bg-gradient-to-r from-green-600 to-green-800 p-6 text-white">
                    <h3 className="text-xl font-bold mb-2 group-hover:translate-x-1 transition-transform">
                      {classItem.name}
                    </h3>
                    <p className="text-green-100 text-sm">
                      Guru: {classItem.guruName}
                    </p>
                  </div>

                  {/* Card Body */}
                  <div className="p-6">
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {classItem.description}
                    </p>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-green-50 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-green-600">
                          {classItem.memberCount || 0}
                        </p>
                        <p className="text-xs text-gray-600">Siswa</p>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-blue-600">
                          {/* Placeholder for progress */}
                          0%
                        </p>
                        <p className="text-xs text-gray-600">Progres</p>
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/class/${classItem.id}`);
                      }}
                      className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
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

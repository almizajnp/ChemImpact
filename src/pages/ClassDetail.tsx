import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Play } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Class, Discussion } from "../types";
import { getClassById, getDiscussions } from "../lib/firestore";
import ClassDiscussionTab from "../components/ClassDiscussionTab";
import StudentProgressTab from "../components/StudentProgressTab";
import DiscussionCard from "../components/DiscussionCard";
import ComicStory from "../components/game/ComicStory";

type TabType = "missions" | "discussions" | "progress" | "info";

export default function ClassDetail() {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();
  const [classData, setClassData] = useState<Class | null>(null);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>("missions");
  const [loading, setLoading] = useState(true);
  const [isMissionActive, setIsMissionActive] = useState(false);

  useEffect(() => {
    if (classId) {
      loadClassData();
    }
  }, [classId]);

  const loadClassData = async () => {
    setLoading(true);
    try {
      const classInfo = await getClassById(classId!);
      setClassData(classInfo);

      if (classInfo) {
        const disc = await getDiscussions(classId!);
        setDiscussions(disc);
      }
    } catch (error) {
      console.error("Error loading class:", error);
      alert("Gagal memuat kelas");
    } finally {
      setLoading(false);
    }
  };

  const isGuru =
    userProfile?.role === "guru" && userProfile?.uid === classData?.guruId;

  const handleMissionComplete = async () => {
    setIsMissionActive(false);
    // Reload data to see new responses
    await loadClassData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Kelas tidak ditemukan</p>
          <button
            onClick={() => navigate("/guru")}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate(isGuru ? "/guru" : "/student")}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {classData.name}
              </h1>
              <p className="text-gray-600 mt-1">
                Kode Kelas: {classData.classCode}
              </p>
            </div>
          </div>

          {/* Class Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Pengajar</p>
              <p className="text-lg font-semibold text-gray-900">
                {classData.guruName}
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Anggota Kelas</p>
              <p className="text-lg font-semibold text-gray-900">
                {classData.memberCount || 0} Siswa
              </p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Deskripsi</p>
              <p className="text-sm text-gray-900 line-clamp-2">
                {classData.description}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab("missions")}
              className={`py-4 font-medium border-b-2 transition-colors ${
                activeTab === "missions"
                  ? "text-blue-600 border-blue-600"
                  : "text-gray-600 border-transparent hover:text-gray-900"
              }`}
            >
              🎮 Misi
            </button>
            <button
              onClick={() => setActiveTab("discussions")}
              className={`py-4 font-medium border-b-2 transition-colors ${
                activeTab === "discussions"
                  ? "text-blue-600 border-blue-600"
                  : "text-gray-600 border-transparent hover:text-gray-900"
              }`}
            >
              💬 Diskusi
            </button>
            {isGuru && (
              <button
                onClick={() => setActiveTab("progress")}
                className={`py-4 font-medium border-b-2 transition-colors ${
                  activeTab === "progress"
                    ? "text-blue-600 border-blue-600"
                    : "text-gray-600 border-transparent hover:text-gray-900"
                }`}
              >
                📊 Progres Siswa
              </button>
            )}
            <button
              onClick={() => setActiveTab("info")}
              className={`py-4 font-medium border-b-2 transition-colors ${
                activeTab === "info"
                  ? "text-blue-600 border-blue-600"
                  : "text-gray-600 border-transparent hover:text-gray-900"
              }`}
            >
              ℹ️ Informasi
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {isMissionActive && classId ? (
          <ComicStory
            onClose={handleMissionComplete}
            classId={classId}
            siswaId={userProfile?.uid}
            siswaName={userProfile?.name}
          />
        ) : (
          <>
            {activeTab === "missions" && !isGuru && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  📚 Misi Pembelajaran
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Mission Card 1 */}
                  <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                    <div className="bg-linear-to-r from-blue-600 to-blue-800 p-6 text-white">
                      <h3 className="text-xl font-bold mb-2">
                        Ancaman Limbah Deterjen
                      </h3>
                      <p className="text-blue-100 text-sm">
                        Bab 1: Mari Belajar Tentang Dampak Lingkungan
                      </p>
                    </div>
                    <div className="p-6">
                      <p className="text-gray-700 mb-4">
                        Pelajari tentang dampak limbah deterjen terhadap
                        lingkungan melalui cerita interaktif dengan pemilihan
                        jawaban dan refleksi diri.
                      </p>
                      <div className="space-y-2 mb-6">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span>⏱️ Durasi: 15-20 menit</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span>📊 Poin: hingga 50 poin</span>
                        </div>
                      </div>
                      <button
                        onClick={() => setIsMissionActive(true)}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
                      >
                        <Play size={20} />
                        Mulai Misi
                      </button>
                    </div>
                  </div>

                  {/* Mission Card 2 (Coming Soon) */}
                  <div className="bg-white rounded-lg shadow-lg overflow-hidden opacity-50">
                    <div className="bg-gray-400 p-6 text-white">
                      <h3 className="text-xl font-bold mb-2">Misi Lainnya</h3>
                      <p className="text-gray-200 text-sm">Segera hadir</p>
                    </div>
                    <div className="p-6">
                      <p className="text-gray-600 mb-4">
                        Misi-misi pembelajaran tambahan akan segera tersedia.
                      </p>
                      <button
                        disabled
                        className="w-full bg-gray-400 text-white py-3 rounded-lg cursor-not-allowed font-medium"
                      >
                        Segera Hadir
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "missions" && isGuru && (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <p className="text-gray-600 text-lg">
                  Hanya siswa yang dapat mengakses dan bermain misi.
                </p>
              </div>
            )}

            {activeTab === "discussions" &&
              (isGuru ? (
                <ClassDiscussionTab
                  classId={classId!}
                  discussions={discussions}
                  guruId={userProfile!.uid}
                  guruName={userProfile!.name}
                  onDiscussionAdded={loadClassData}
                  onDiscussionDeleted={loadClassData}
                />
              ) : (
                // Student view: show discussions as cards
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Diskusi Kelas
                  </h2>
                  {discussions.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg">
                      <p className="text-gray-600">Belum ada diskusi</p>
                    </div>
                  ) : (
                    discussions.map((discussion) => (
                      <DiscussionCard
                        key={discussion.id}
                        classId={classId!}
                        discussion={discussion}
                        currentUserId={user!.uid}
                        currentUserName={userProfile!.name}
                        currentUserRole={userProfile!.role}
                      />
                    ))
                  )}
                </div>
              ))}

            {activeTab === "progress" && isGuru && (
              <StudentProgressTab classId={classId!} />
            )}

            {activeTab === "info" && (
              <div className="bg-white rounded-lg shadow p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Informasi Kelas
                </h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Nama Kelas
                    </h3>
                    <p className="text-gray-700">{classData?.name}</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Deskripsi
                    </h3>
                    <p className="text-gray-700">{classData?.description}</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Kode Kelas
                    </h3>
                    <p className="text-gray-700 font-mono text-lg tracking-widest">
                      {classData?.classCode}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Dibuat oleh
                    </h3>
                    <p className="text-gray-700">{classData?.guruName}</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Tanggal Dibuat
                    </h3>
                    <p className="text-gray-700">
                      {new Date(classData!.createdAt).toLocaleString("id-ID")}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

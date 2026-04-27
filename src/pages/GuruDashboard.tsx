import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  LogOut,
  Plus,
  Eye,
  X,
  CheckCircle,
  Clock,
  Award,
  Trash2,
  MessageCircle,
  Send,
  Edit2,
  Upload,
  EyeOff,
  Link as LinkIcon,
  ExternalLink,
  HelpCircle,
} from "lucide-react";
import {
  getGuruClasses,
  createClass,
  getClassMembers,
  getStudentScore,
  getStudentResponsesByStudent,
  createDiscussionTopic,
  subscribeToDiscussionTopics,
  updateDiscussionTopic,
  deleteDiscussionTopic,
  subscribeToDiscussionComments,
  subscribeToDiscussionReplies,
  detectEmbedType,
} from "../lib/firestore";
import {
  Class,
  ClassMember,
  StudentResponse,
  DiscussionTopic,
  DiscussionComment,
  DiscussionReply,
} from "../types";

// --- COMPONENT ---

interface StudentDetailData {
  member: ClassMember;
  responses: StudentResponse[];
  score: number;
}

export default function GuruDashboard() {
  const { user, userProfile, logout } = useAuth();
  const navigate = useNavigate();

  // Class Management States
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [creatingClass, setCreatingClass] = useState(false);

  // Monitoring States
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [classMembers, setClassMembers] = useState<ClassMember[]>([]);
  const [memberScores, setMemberScores] = useState<Record<string, number>>({});
  const [memberResponses, setMemberResponses] = useState<
    Record<string, StudentResponse | null>
  >({});
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [selectedStudent, setSelectedStudent] =
    useState<StudentDetailData | null>(null);
  const [filterStatus, setFilterStatus] = useState<"all" | "completed">("all");
  const [showGuidance, setShowGuidance] = useState(false);

  // Discussion Management States
  const [monitoringTab, setMonitoringTab] = useState<
    "students" | "discussions"
  >("students");
  const [discussionTopics, setDiscussionTopics] = useState<DiscussionTopic[]>(
    [],
  );
  const [showCreateDiscussion, setShowCreateDiscussion] = useState(false);
  const [discussionFormData, setDiscussionFormData] = useState({
    title: "",
    description: "",
    embedLink: "",
  });
  const [creatingDiscussion, setCreatingDiscussion] = useState(false);
  const [editingDiscussion, setEditingDiscussion] =
    useState<DiscussionTopic | null>(null);

  // Discussion Detail View States
  const [selectedDiscussionForDetail, setSelectedDiscussionForDetail] =
    useState<DiscussionTopic | null>(null);
  const [discussionComments, setDiscussionComments] = useState<
    DiscussionComment[]
  >([]);
  const [commentReplies, setCommentReplies] = useState<
    Record<string, DiscussionReply[]>
  >({});
  const [loadingDiscussionDetail, setLoadingDiscussionDetail] = useState(false);

  // Load guru classes on component mount
  useEffect(() => {
    if (user && userProfile?.uid) {
      loadClasses();
    }
  }, [user, userProfile]);

  // Subscribe to discussion topics when class is selected
  useEffect(() => {
    if (!selectedClass) return;

    const unsub = subscribeToDiscussionTopics(selectedClass.id!, (topics) => {
      setDiscussionTopics(topics);
    });

    return () => unsub();
  }, [selectedClass]);

  // Load discussion comments and replies when viewing details
  useEffect(() => {
    if (!selectedDiscussionForDetail || !selectedClass) {
      setDiscussionComments([]);
      setCommentReplies({});
      return;
    }

    setLoadingDiscussionDetail(true);

    let replyUnsubs: (() => void)[] = [];

    const unsubComments = subscribeToDiscussionComments(
      selectedClass.id!,
      selectedDiscussionForDetail.id,
      (updatedComments) => {
        setDiscussionComments(updatedComments);

        // cleanup old reply listeners
        replyUnsubs.forEach((u) => u());
        replyUnsubs = [];

        updatedComments.forEach((comment) => {
          const unsubReplies = subscribeToDiscussionReplies(
            selectedClass.id!,
            selectedDiscussionForDetail.id,
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

        setLoadingDiscussionDetail(false);
      },
    );

    return () => {
      unsubComments();
      replyUnsubs.forEach((u) => u());
    };
  }, [selectedDiscussionForDetail, selectedClass]);

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
      await createClass(
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

  // ============ DISCUSSION MANAGEMENT FUNCTIONS ============
  const handleCreateDiscussion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !discussionFormData.title.trim() ||
      !discussionFormData.description.trim() ||
      !selectedClass
    )
      return;

    setCreatingDiscussion(true);
    try {
      // Validasi embed link jika ada
      if (discussionFormData.embedLink.trim()) {
        const embedType = detectEmbedType(discussionFormData.embedLink);
        if (!embedType) {
          alert("URL tidak valid. Gunakan URL YouTube, gambar, atau website.");
          setCreatingDiscussion(false);
          return;
        }
      }

      await createDiscussionTopic(
        selectedClass.id!,
        discussionFormData.title,
        discussionFormData.description,
        userProfile!.uid,
        userProfile!.name,
        discussionFormData.embedLink.trim() || undefined,
      );

      setDiscussionFormData({ title: "", description: "", embedLink: "" });
      setShowCreateDiscussion(false);
    } catch (error) {
      console.error("Error creating discussion:", error);
      alert("Gagal membuat topik diskusi");
    } finally {
      setCreatingDiscussion(false);
    }
  };

  const handlePublishDiscussion = async (topic: DiscussionTopic) => {
    if (!selectedClass) return;

    try {
      await updateDiscussionTopic(selectedClass.id!, topic.id, {
        status: topic.status === "published" ? "draft" : "published",
      });
    } catch (error) {
      console.error("Error updating discussion:", error);
      alert("Gagal memperbarui status diskusi");
    }
  };

  const handleDeleteDiscussion = async (topicId: string) => {
    if (!selectedClass) return;

    const confirmed = window.confirm(
      "Apakah Anda yakin ingin menghapus topik diskusi ini?\n\nSemua komentar dan balasan akan dihapus.",
    );

    if (!confirmed) return;

    try {
      await deleteDiscussionTopic(selectedClass.id!, topicId);
    } catch (error) {
      console.error("Error deleting discussion:", error);
      alert("Gagal menghapus topik diskusi");
    }
  };

  const handleViewDiscussionDetail = (topic: DiscussionTopic) => {
    setSelectedDiscussionForDetail(topic);
  };

  const handleOpenMonitoring = async (classItem: Class) => {
    console.log(`📚 Opening monitoring for class: ${classItem.id}`);
    setSelectedClass(classItem);
    setLoadingMembers(true);
    try {
      // Load class members
      const members = await getClassMembers(classItem.id!);
      console.log(`👥 Found ${members.length} members in class`);
      setClassMembers(members);

      // Load scores and responses for each member
      const scoresMap: Record<string, number> = {};
      const responsesMap: Record<string, StudentResponse | null> = {};

      for (const member of members) {
        try {
          const score = await getStudentScore(member.siswaId);
          scoresMap[member.siswaId] = score;

          const response = await getStudentResponsesByStudent(member.siswaId);
          console.log(
            `✅ Loaded response for ${member.siswaName} (${member.siswaId}):`,
            response,
          );
          responsesMap[member.siswaId] = response;
        } catch (error) {
          console.error(
            `Error loading data for student ${member.siswaId}:`,
            error,
          );
        }
      }

      console.log(
        `📊 Final responses map:`,
        Object.entries(responsesMap).map(([id, resp]) => ({
          siswaId: id,
          hasResponse: !!resp,
        })),
      );
      setMemberScores(scoresMap);
      setMemberResponses(responsesMap as any);
    } catch (error) {
      console.error("Error loading monitoring data:", error);
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleSelectStudent = (member: ClassMember) => {
    const score = memberScores[member.siswaId] || 0;
    const response = memberResponses[member.siswaId];
    const responses = response ? [response] : [];
    console.log(`👤 Selected student: ${member.siswaName} (${member.siswaId})`);
    console.log(`📋 Response found:`, response);
    setSelectedStudent({ member, responses, score });
  };

  const handleRefreshStudents = async () => {
    if (!selectedClass) return;

    setLoadingMembers(true);
    try {
      // Load class members
      const members = await getClassMembers(selectedClass.id!);
      console.log(`👥 Found ${members.length} members in class`);
      setClassMembers(members);

      // Load scores and responses for each member
      const scoresMap: Record<string, number> = {};
      const responsesMap: Record<string, StudentResponse | null> = {};

      for (const member of members) {
        try {
          const score = await getStudentScore(member.siswaId);
          scoresMap[member.siswaId] = score;

          const response = await getStudentResponsesByStudent(member.siswaId);
          console.log(
            `✅ Loaded response for ${member.siswaName} (${member.siswaId}):`,
            response,
          );
          responsesMap[member.siswaId] = response;
        } catch (error) {
          console.error(
            `Error loading data for student ${member.siswaId}:`,
            error,
          );
        }
      }

      console.log(
        `📊 Final responses map:`,
        Object.entries(responsesMap).map(([id, resp]) => ({
          siswaId: id,
          hasResponse: !!resp,
        })),
      );
      setMemberScores(scoresMap);
      setMemberResponses(responsesMap as any);
    } catch (error) {
      console.error("Error refreshing student data:", error);
    } finally {
      setLoadingMembers(false);
    }
  };

  const getStudentStatus = (siswaId: string): "completed" | "pending" => {
    const response = memberResponses[siswaId];
    if (!response) return "pending";
    return response.status === "completed" ? "completed" : "pending";
  };

  const filteredMembers = classMembers
    .filter((member) => {
      const status = getStudentStatus(member.siswaId);
      if (filterStatus === "all") return true;
      return status === filterStatus;
    })
    .sort((a, b) => a.siswaName.localeCompare(b.siswaName));

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">ChemImpact</h1>
            <p className="text-gray-600 text-sm">Dashboard Guru</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <p className="font-semibold text-gray-900">{userProfile?.name}</p>
              <p className="text-sm text-gray-600">Guru Pengajar</p>
            </div>
            <button
              onClick={() => setShowGuidance(true)}
              className="p-2 hover:bg-blue-50 rounded-lg transition-colors group"
              title="Panduan Penggunaan Dashboard Guru"
            >
              <HelpCircle className="w-6 h-6 text-blue-600 group-hover:text-blue-800" />
            </button>
            {selectedClass ? (
              <button
                onClick={() => setSelectedClass(null)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
              >
                Kembali
              </button>
            ) : (
              <button
                onClick={handleLogout}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="w-6 h-6 text-gray-600" />
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="mb-12">
          <h2 className="text-4xl font-bold text-gray-900">
            Selamat Datang, {userProfile?.name}!
          </h2>
          <p className="text-gray-600 mt-2">
            Kelola kelas dan pantau progres siswa secara real-time
          </p>
        </div>

        {/* Create Class Button */}
        {!showCreateForm && !selectedClass && (
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
                  placeholder="Contoh: Kimia Organik XI IPA 1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-black"
                  rows={4}
                  required
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={creatingClass}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors font-medium"
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

        {/* Classes or Monitoring View */}
        {!selectedClass ? (
          // Classes Grid View
          <>
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
                    className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden group"
                  >
                    <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white">
                      <h3 className="text-xl font-bold mb-2">
                        {classItem.name}
                      </h3>
                      <p className="text-blue-100 text-sm">
                        Kode: {classItem.classCode}
                      </p>
                    </div>
                    <div className="p-6">
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {classItem.description}
                      </p>
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-blue-50 rounded-lg p-3 text-center">
                          <p className="text-2xl font-bold text-blue-600">
                            {classItem.memberCount || 0}
                          </p>
                          <p className="text-xs text-gray-600">Siswa</p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-3 text-center">
                          <p className="text-2xl font-bold text-green-600">-</p>
                          <p className="text-xs text-gray-600">Diskusi</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleOpenMonitoring(classItem)}
                        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      >
                        Lihat Monitoring
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          // Monitoring View
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {selectedClass.name}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Kode: {selectedClass.classCode}
                </p>
              </div>
            </div>

            {/* Monitoring Tabs */}
            <div className="flex gap-4 border-b border-gray-200">
              <button
                onClick={() => setMonitoringTab("students")}
                className={`py-3 px-4 font-medium border-b-2 transition-colors ${
                  monitoringTab === "students"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                👥 Progres Siswa
              </button>
              <button
                onClick={() => setMonitoringTab("discussions")}
                className={`py-3 px-4 font-medium border-b-2 transition-colors ${
                  monitoringTab === "discussions"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                💬 Forum Diskusi ({discussionTopics.length})
              </button>
            </div>

            {/* Students Tab */}
            {monitoringTab === "students" && (
              <>
                {/* Filter Tabs & Refresh */}
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div className="flex gap-2">
                    {(["all", "completed"] as const).map((status) => (
                      <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          filterStatus === status
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {status === "all"
                          ? `Semua (${classMembers.length})`
                          : `Selesai (${classMembers.filter((m) => getStudentStatus(m.siswaId) === "completed").length})`}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={handleRefreshStudents}
                    disabled={loadingMembers}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 disabled:bg-gray-200 disabled:text-gray-500 rounded-lg transition-colors font-medium text-sm"
                  >
                    {loadingMembers ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        Memuat...
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                          />
                        </svg>
                        Refresh
                      </>
                    )}
                  </button>
                </div>

                {/* Students Table */}
                {loadingMembers ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                  </div>
                ) : filteredMembers.length === 0 ? (
                  <div className="text-center py-8 bg-white rounded-lg border-2 border-dashed border-gray-300">
                    <p className="text-gray-500">Tidak ada data siswa</p>
                  </div>
                ) : (
                  <>
                    {/* Desktop Table View */}
                    <div className="hidden md:block bg-white rounded-xl shadow-lg overflow-hidden">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200 bg-gray-50">
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                              No.
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                              Nama Siswa
                            </th>
                            <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                              Status
                            </th>
                            <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                              Skor
                            </th>
                            <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                              Aksi
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredMembers.map((member, index) => {
                            const status = getStudentStatus(member.siswaId);
                            const score = memberScores[member.siswaId] || 0;

                            return (
                              <tr
                                key={member.id}
                                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                              >
                                <td className="px-6 py-4 text-sm text-gray-600">
                                  {index + 1}
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex flex-col">
                                    <span className="text-sm font-medium text-gray-900">
                                      {member.siswaName}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      ID: {member.siswaId.substring(0, 8)}...
                                    </span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                  <div className="flex items-center justify-center gap-2">
                                    {status === "completed" ? (
                                      <>
                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                        <span className="text-xs font-medium text-green-600">
                                          Selesai
                                        </span>
                                      </>
                                    ) : (
                                      <>
                                        <Clock className="w-5 h-5 text-yellow-600" />
                                        <span className="text-xs font-medium text-yellow-600">
                                          Proses
                                        </span>
                                      </>
                                    )}
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                  <div className="flex items-center justify-center gap-1">
                                    <Award className="w-4 h-4 text-yellow-600" />
                                    <span className="text-lg font-bold text-blue-600">
                                      {score}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                  <button
                                    onClick={() => handleSelectStudent(member)}
                                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors text-sm font-medium"
                                  >
                                    <Eye className="w-4 h-4" />
                                    Detail
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="md:hidden space-y-3">
                      {filteredMembers.map((member, index) => {
                        const status = getStudentStatus(member.siswaId);
                        const score = memberScores[member.siswaId] || 0;

                        return (
                          <div
                            key={member.id}
                            className="bg-white rounded-lg shadow border border-gray-200 p-4 hover:shadow-md transition-shadow"
                          >
                            {/* Header: No & Name */}
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                    #{index + 1}
                                  </span>
                                  <h3 className="text-sm font-bold text-gray-900">
                                    {member.siswaName}
                                  </h3>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                  ID: {member.siswaId.substring(0, 8)}...
                                </p>
                              </div>
                              {/* Status Badge */}
                              <div>
                                {status === "completed" ? (
                                  <div className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-semibold">
                                    <CheckCircle className="w-4 h-4" />
                                    Selesai
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1 bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-semibold">
                                    <Clock className="w-4 h-4" />
                                    Proses
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Score & Action Row */}
                            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                              <div className="flex items-center gap-2">
                                <Award className="w-4 h-4 text-yellow-600" />
                                <span className="text-lg font-bold text-blue-600">
                                  {score}
                                </span>
                                <span className="text-xs text-gray-600">
                                  poin
                                </span>
                              </div>
                              <button
                                onClick={() => handleSelectStudent(member)}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors text-xs font-medium"
                              >
                                <Eye className="w-4 h-4" />
                                Detail
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </>
            )}

            {/* Discussions Tab */}
            {monitoringTab === "discussions" && (
              <div className="space-y-6">
                {/* Create Discussion Button */}
                {!showCreateDiscussion && (
                  <button
                    onClick={() => setShowCreateDiscussion(true)}
                    className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                  >
                    <Plus size={20} />
                    Buat Topik Diskusi
                  </button>
                )}

                {/* Create Discussion Form */}
                {showCreateDiscussion && (
                  <div className="bg-emerald-50 rounded-lg p-6 border-2 border-emerald-200">
                    <h4 className="text-xl font-bold text-gray-900 mb-4">
                      Buat Topik Diskusi Baru
                    </h4>
                    <form
                      onSubmit={handleCreateDiscussion}
                      className="space-y-4"
                    >
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
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
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-black"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
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
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none text-black"
                          rows={5}
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
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
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-black"
                        />
                      </div>

                      <div className="flex gap-3">
                        <button
                          type="submit"
                          disabled={creatingDiscussion}
                          className="flex-1 bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 disabled:bg-gray-400 transition-colors font-medium"
                        >
                          {creatingDiscussion
                            ? "Membuat..."
                            : "Buat Topik (Draft)"}
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
                          className="flex-1 bg-gray-300 text-gray-900 py-2 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                        >
                          Batal
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Discussion Topics List */}
                {discussionTopics.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
                    <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">
                      Belum ada topik diskusi. Buat yang pertama sekarang!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {discussionTopics.map((topic) => (
                      <div
                        key={topic.id}
                        className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => handleViewDiscussionDetail(topic)}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="text-lg font-bold text-gray-900">
                              {topic.title}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {new Date(topic.createdAt).toLocaleDateString(
                                "id-ID",
                              )}{" "}
                              • {topic.commentCount} komentar
                            </p>
                          </div>

                          {/* Status Badge */}
                          <div className="ml-4">
                            {topic.status === "published" ? (
                              <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                                <Eye size={14} />
                                Published
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-semibold">
                                <EyeOff size={14} />
                                Draft
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                          {topic.description}
                        </p>

                        {/* Embed Info */}
                        {topic.optionalEmbedLink && (
                          <div className="flex items-center gap-2 text-xs text-blue-600 mb-3">
                            <LinkIcon size={14} />
                            {topic.embedType === "youtube" &&
                              "🎥 Video YouTube"}
                            {topic.embedType === "image" && "📷 Gambar"}
                            {topic.embedType === "article" && "📄 Artikel"}
                            {topic.embedType === "website" && "🌐 Website"}
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewDiscussionDetail(topic);
                            }}
                            className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors text-sm font-medium"
                          >
                            <Eye size={16} />
                            Lihat Detail
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePublishDiscussion(topic);
                            }}
                            className={`flex items-center gap-2 px-3 py-2 rounded text-sm font-medium transition-colors ${
                              topic.status === "published"
                                ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                : "bg-green-100 text-green-700 hover:bg-green-200"
                            }`}
                          >
                            {topic.status === "published" ? (
                              <>
                                <EyeOff size={16} />
                                Unpublish
                              </>
                            ) : (
                              <>
                                <Upload size={16} />
                                Publish
                              </>
                            )}
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteDiscussion(topic.id);
                            }}
                            className="flex items-center gap-2 px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors text-sm font-medium"
                          >
                            <Trash2 size={16} />
                            Hapus
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Student Detail Modal */}
        {selectedStudent && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-2 md:p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[95vh] md:max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-3 md:px-6 py-3 md:py-4 flex justify-between items-start md:items-center gap-3">
                <div>
                  <h2 className="text-lg md:text-2xl font-bold text-gray-900">
                    {selectedStudent.member.siswaName}
                  </h2>
                  <p className="text-xs md:text-sm text-gray-600 mt-1">
                    Detail Aktivitas & Jawaban
                  </p>
                </div>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors shrink-0"
                >
                  <X className="w-5 h-5 md:w-6 md:h-6 text-red-600" />
                </button>
              </div>

              <div className="p-3 md:p-6 space-y-4 md:space-y-6">
                {/* Summary Stats */}
                <div className="grid grid-cols-3 gap-2 md:gap-4">
                  <div className="bg-blue-50 rounded-lg p-3 md:p-4">
                    <p className="text-xs md:text-sm text-gray-600">
                      Total Skor
                    </p>
                    <p className="text-2xl md:text-3xl font-bold text-blue-600 mt-1 md:mt-2">
                      {selectedStudent.score}
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3 md:p-4">
                    <p className="text-xs md:text-sm text-gray-600">
                      Misi Selesai
                    </p>
                    <p className="text-2xl md:text-3xl font-bold text-green-600 mt-1 md:mt-2">
                      {
                        selectedStudent.responses.filter(
                          (r) => r.status === "completed",
                        ).length
                      }
                    </p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3 md:p-4">
                    <p className="text-xs md:text-sm text-gray-600">
                      Total Aktivitas
                    </p>
                    <p className="text-2xl md:text-3xl font-bold text-purple-600 mt-1 md:mt-2">
                      {selectedStudent.responses.length}
                    </p>
                  </div>
                </div>

                {/* Mission Details */}
                <div>
                  <h3 className="text-base md:text-lg font-bold text-black mb-3 md:mb-4">
                    Detail Misi
                  </h3>
                  <div className="space-y-3 md:space-y-4">
                    {selectedStudent.responses.length === 0 ? (
                      <p className="text-gray-600 text-center py-8 text-sm">
                        Siswa belum menyelesaikan misi apapun
                      </p>
                    ) : (
                      selectedStudent.responses.map((response) => (
                        <div
                          key={response.id}
                          className="border border-gray-200 rounded-lg p-3 md:p-4 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-semibold text-sm md:text-base text-black">
                                {response.missionName}
                              </h4>
                              <p className="text-xs text-gray-600 mt-1">
                                {new Date(response.submittedAt).toLocaleString(
                                  "id-ID",
                                )}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xl md:text-2xl font-bold text-black">
                                {response.totalScore || 0}
                              </p>
                              <p className="text-xs text-gray-600">poin</p>
                            </div>
                          </div>

                          {/* Essay Answers */}
                          {Object.keys(response.essayAnswers || {}).length >
                            0 && (
                            <div className="mt-3 pt-3 border-t border-gray-100">
                              <p className="text-xs md:text-sm font-semibold text-black mb-2">
                                Jawaban Uraian:
                              </p>
                              <div className="space-y-2">
                                {Object.entries(
                                  response.essayAnswers || {},
                                ).map(([essayId, answer]) => (
                                  <div
                                    key={essayId}
                                    className="bg-gray-50 rounded p-2 md:p-3"
                                  >
                                    <p className="text-xs text-black mb-1">
                                      <strong>Pertanyaan:</strong>
                                    </p>
                                    <p className="text-xs text-black mb-2 line-clamp-2">
                                      {response.essayQuestions?.[essayId] ||
                                        `Essay ${essayId}`}
                                    </p>
                                    <p className="text-xs text-black">
                                      <strong>Jawaban:</strong>
                                    </p>
                                    <p className="text-xs text-gray-700 mt-1 line-clamp-3">
                                      {answer}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Multi-choice Answers */}
                          {response.multiChoiceAnswers &&
                            response.multiChoiceAnswers.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-gray-100">
                                <p className="text-xs md:text-sm font-semibold text-black mb-2">
                                  Jawaban Pilihan Ganda:
                                </p>
                                <div className="space-y-2">
                                  {response.multiChoiceAnswers.map(
                                    (answer, idx) => (
                                      <div
                                        key={idx}
                                        className={`rounded p-2 md:p-3 text-xs ${
                                          answer.isCorrect
                                            ? "bg-green-50 border border-green-200"
                                            : "bg-red-50 border border-red-200"
                                        }`}
                                      >
                                        <p className="text-black">
                                          <strong>Soal {idx + 1}:</strong>{" "}
                                          {answer.choiceText}{" "}
                                          <span
                                            className={
                                              answer.isCorrect
                                                ? "text-green-600"
                                                : "text-red-600"
                                            }
                                          >
                                            ({answer.isCorrect ? "✓" : "✗"})
                                          </span>
                                        </p>
                                      </div>
                                    ),
                                  )}
                                </div>
                              </div>
                            )}

                          {/* Reflection Answers */}
                          {Object.keys(response.reflectionAnswers || {})
                            .length > 0 && (
                            <div className="mt-3 pt-3 border-t border-gray-100">
                              <p className="text-xs md:text-sm font-semibold text-black mb-2">
                                Refleksi:
                              </p>
                              <div className="space-y-2">
                                {Object.entries(
                                  response.reflectionAnswers || {},
                                ).map(([reflectionId, answer]) => (
                                  <div
                                    key={reflectionId}
                                    className="bg-blue-50 rounded p-2 md:p-3"
                                  >
                                    <p className="text-xs text-black mb-1">
                                      <strong>Pertanyaan:</strong>
                                    </p>
                                    <p className="text-xs text-black mb-2 line-clamp-2">
                                      {response.reflectionQuestions?.[
                                        reflectionId
                                      ] || `Refleksi ${reflectionId}`}
                                    </p>
                                    <p className="text-xs text-black">
                                      <strong>Jawaban:</strong>
                                    </p>
                                    <p className="text-xs text-gray-700 mt-1 line-clamp-3">
                                      {answer}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Discussion Detail Modal */}
        {selectedDiscussionForDetail && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-2 md:p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[95vh] md:max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-3 md:px-6 py-3 md:py-4 flex justify-between items-start md:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg md:text-2xl font-bold text-gray-900 line-clamp-2">
                    {selectedDiscussionForDetail.title}
                  </h2>
                  <p className="text-xs md:text-sm text-gray-600 mt-1 line-clamp-1">
                    Dibuat oleh: {selectedDiscussionForDetail.createdByName} •{" "}
                    {new Date(
                      selectedDiscussionForDetail.createdAt,
                    ).toLocaleDateString("id-ID")}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedDiscussionForDetail(null)}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors shrink-0"
                >
                  <X className="w-5 h-5 md:w-6 md:h-6 text-black" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-3 md:p-6 space-y-4">
                {/* Embed Preview */}
                {selectedDiscussionForDetail.optionalEmbedLink && (
                  <div>
                    {selectedDiscussionForDetail.embedType === "youtube" && (
                      <div className="mb-4 bg-gray-900 rounded-lg overflow-hidden aspect-video">
                        <iframe
                          width="100%"
                          height="100%"
                          src={selectedDiscussionForDetail.optionalEmbedLink}
                          title={selectedDiscussionForDetail.title}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      </div>
                    )}

                    {selectedDiscussionForDetail.embedType === "image" && (
                      <div className="mb-4 bg-gray-100 rounded-lg overflow-hidden max-h-64">
                        <img
                          src={selectedDiscussionForDetail.optionalEmbedLink}
                          alt={selectedDiscussionForDetail.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {(selectedDiscussionForDetail.embedType === "article" ||
                      selectedDiscussionForDetail.embedType === "website") && (
                      <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="flex items-start gap-3">
                          <ExternalLink className="w-5 h-5 text-blue-600 shrink-0 mt-1" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-blue-600 font-medium truncate">
                              External Resource
                            </p>
                            <a
                              href={
                                selectedDiscussionForDetail.optionalEmbedLink
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-500 hover:underline truncate block"
                            >
                              {selectedDiscussionForDetail.optionalEmbedLink}
                            </a>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Topic Description */}
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                  <p className="text-sm text-gray-800 whitespace-pre-wrap">
                    {selectedDiscussionForDetail.description}
                  </p>
                </div>

                {/* Comments Section */}
                <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t">
                  <h4 className="font-bold text-gray-900 mb-4 text-sm md:text-base">
                    💭 Komentar ({selectedDiscussionForDetail.commentCount})
                  </h4>

                  {loadingDiscussionDetail ? (
                    <div className="text-center text-gray-500 py-4 text-sm">
                      Memuat komentar...
                    </div>
                  ) : discussionComments.length === 0 ? (
                    <p className="text-center text-gray-500 text-xs md:text-sm py-4">
                      Belum ada komentar
                    </p>
                  ) : (
                    <div className="space-y-3 md:space-y-4">
                      {discussionComments.map((comment) => (
                        <div
                          key={comment.id}
                          className="border border-gray-200 rounded-lg p-3 md:p-4 bg-white"
                        >
                          {/* Comment Header */}
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm md:text-base text-gray-900 truncate">
                                {comment.siswaName}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(comment.createdAt).toLocaleString(
                                  "id-ID",
                                )}
                              </p>
                            </div>
                          </div>

                          {/* Comment Text */}
                          <p className="text-xs md:text-sm text-gray-700 mb-3">
                            {comment.text}
                          </p>

                          {/* Replies */}
                          {(commentReplies[comment.id] || []).length > 0 && (
                            <div className="ml-2 md:ml-4 space-y-2 md:space-y-3 border-l-2 border-gray-200 pl-3 md:pl-4">
                              {(commentReplies[comment.id] || []).map(
                                (reply) => (
                                  <div
                                    key={reply.id}
                                    className="bg-gray-50 rounded p-2 md:p-3"
                                  >
                                    <div className="flex justify-between items-start">
                                      <div className="flex-1 min-w-0">
                                        <p className="font-medium text-xs md:text-sm text-gray-900 truncate">
                                          {reply.userName}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                          {new Date(
                                            reply.createdAt,
                                          ).toLocaleString("id-ID")}
                                        </p>
                                      </div>
                                    </div>
                                    <p className="text-xs text-gray-700 mt-2">
                                      {reply.text}
                                    </p>
                                  </div>
                                ),
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Guidance Modal */}
        {showGuidance && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-2 md:p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[95vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-800 px-4 md:px-6 py-4 md:py-5 flex justify-between items-start gap-3">
                <div className="flex items-start gap-3">
                  <HelpCircle className="w-6 h-6 md:w-7 md:h-7 text-white flex-shrink-0 mt-1" />
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold text-white">
                      Panduan Dashboard Guru
                    </h2>
                    <p className="text-blue-100 text-xs md:text-sm mt-1">
                      Pelajari cara menggunakan sistem dashboard guru ChemImpact
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowGuidance(false)}
                  className="p-1 hover:bg-blue-700 rounded-lg transition-colors flex-shrink-0"
                >
                  <X className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-4 md:p-6 space-y-5 md:space-y-6">
                {/* Section 1: Overview */}
                <section className="border-b border-gray-200 pb-4 md:pb-5">
                  <h3 className="text-base md:text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 md:w-7 md:h-7 flex items-center justify-center text-xs md:text-sm font-bold flex-shrink-0">
                      1
                    </span>
                    Ikhtisar Dashboard
                  </h3>
                  <p className="text-xs md:text-sm text-gray-700 leading-relaxed">
                    Dashboard Guru adalah platform manajemen kelas yang
                    memungkinkan Anda untuk membuat kelas, memantau progres
                    siswa secara real-time, dan mengelola diskusi kelas. Semua
                    data disimpan dan diperbarui secara langsung di database.
                  </p>
                </section>

                {/* Section 2: Class Management */}
                <section className="border-b border-gray-200 pb-4 md:pb-5">
                  <h3 className="text-base md:text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 md:w-7 md:h-7 flex items-center justify-center text-xs md:text-sm font-bold flex-shrink-0">
                      2
                    </span>
                    Mengelola Kelas
                  </h3>
                  <div className="space-y-2 md:space-y-3">
                    <div>
                      <p className="text-xs md:text-sm font-semibold text-gray-900">
                        📌 Buat Kelas Baru
                      </p>
                      <p className="text-xs md:text-sm text-gray-700 mt-1">
                        Klik tombol "Buat Kelas Baru" untuk membuat kelas baru.
                        Isi nama kelas dan deskripsi, lalu klik "Buat Kelas".
                        Sistem akan otomatis menghasilkan kode kelas unik yang
                        dapat dibagikan kepada siswa.
                      </p>
                    </div>
                    <div>
                      <p className="text-xs md:text-sm font-semibold text-gray-900">
                        🔍 Lihat Monitoring
                      </p>
                      <p className="text-xs md:text-sm text-gray-700 mt-1">
                        Klik "Lihat Monitoring" pada kartu kelas untuk melihat
                        detail progres siswa dan forum diskusi kelas tersebut.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Section 3: Student Progress */}
                <section className="border-b border-gray-200 pb-4 md:pb-5">
                  <h3 className="text-base md:text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 md:w-7 md:h-7 flex items-center justify-center text-xs md:text-sm font-bold flex-shrink-0">
                      3
                    </span>
                    Memantau Progres Siswa
                  </h3>
                  <div className="space-y-2 md:space-y-3">
                    <div>
                      <p className="text-xs md:text-sm font-semibold text-gray-900">
                        👥 Tab Progres Siswa
                      </p>
                      <p className="text-xs md:text-sm text-gray-700 mt-1">
                        Lihat daftar semua siswa dalam kelas. Sistem menampilkan
                        nama siswa, status penyelesaian (Selesai/Proses), dan
                        skor total. Siswa diurutkan secara alfabetis berdasarkan
                        nama.
                      </p>
                    </div>
                    <div>
                      <p className="text-xs md:text-sm font-semibold text-gray-900">
                        🔎 Filter Status
                      </p>
                      <p className="text-xs md:text-sm text-gray-700 mt-1">
                        Gunakan tombol filter "Semua" dan "Selesai" untuk
                        melihat siswa berdasarkan status penyelesaian mereka.
                      </p>
                    </div>
                    <div>
                      <p className="text-xs md:text-sm font-semibold text-gray-900">
                        📋 Detail Siswa
                      </p>
                      <p className="text-xs md:text-sm text-gray-700 mt-1">
                        Klik tombol "Detail" untuk melihat jawaban lengkap
                        siswa, termasuk jawaban uraian, pilihan ganda, dan
                        refleksi. Pertanyaan dan jawaban ditampilkan
                        bersama-sama agar mudah dipahami.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Section 4: Discussions */}
                <section className="border-b border-gray-200 pb-4 md:pb-5">
                  <h3 className="text-base md:text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 md:w-7 md:h-7 flex items-center justify-center text-xs md:text-sm font-bold flex-shrink-0">
                      4
                    </span>
                    Forum Diskusi Kelas
                  </h3>
                  <div className="space-y-2 md:space-y-3">
                    <div>
                      <p className="text-xs md:text-sm font-semibold text-gray-900">
                        💬 Buat Topik Diskusi
                      </p>
                      <p className="text-xs md:text-sm text-gray-700 mt-1">
                        Klik "Buat Topik Diskusi" untuk membuat pertanyaan atau
                        studi kasus yang akan didiskusikan bersama. Anda dapat
                        menambahkan video YouTube, gambar, artikel, atau link
                        website sebagai pendukung diskusi.
                      </p>
                    </div>
                    <div>
                      <p className="text-xs md:text-sm font-semibold text-gray-900">
                        📢 Publish/Unpublish
                      </p>
                      <p className="text-xs md:text-sm text-gray-700 mt-1">
                        Topik diskusi dibuat dalam status "Draft" terlebih
                        dahulu. Klik "Publish" untuk membuat topik terlihat oleh
                        siswa. Klik "Unpublish" untuk menyembunyikannya.
                      </p>
                    </div>
                    <div>
                      <p className="text-xs md:text-sm font-semibold text-gray-900">
                        👁️ Lihat Detail Diskusi
                      </p>
                      <p className="text-xs md:text-sm text-gray-700 mt-1">
                        Klik "Lihat Detail" untuk melihat semua komentar dan
                        balasan siswa terhadap topik diskusi. Anda dapat
                        memantau kolaborasi dan diskusi antar siswa.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Section 5: Data Features */}
                <section className="border-b border-gray-200 pb-4 md:pb-5">
                  <h3 className="text-base md:text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 md:w-7 md:h-7 flex items-center justify-center text-xs md:text-sm font-bold flex-shrink-0">
                      5
                    </span>
                    Fitur Data & Penyimpanan
                  </h3>
                  <div className="space-y-2 md:space-y-3">
                    <div>
                      <p className="text-xs md:text-sm font-semibold text-gray-900">
                        ✅ Penyimpanan Otomatis
                      </p>
                      <p className="text-xs md:text-sm text-gray-700 mt-1">
                        Semua data siswa, termasuk jawaban, pertanyaan, dan
                        refleksi, disimpan otomatis di database. Data tersedia
                        untuk ditinjau kapan saja.
                      </p>
                    </div>
                    <div>
                      <p className="text-xs md:text-sm font-semibold text-gray-900">
                        🔄 Refresh Data
                      </p>
                      <p className="text-xs md:text-sm text-gray-700 mt-1">
                        Gunakan tombol "Refresh" untuk memperbarui data terbaru
                        dari siswa tanpa menunggu auto-refresh sistem.
                      </p>
                    </div>
                    <div>
                      <p className="text-xs md:text-sm font-semibold text-gray-900">
                        📱 Responsive Design
                      </p>
                      <p className="text-xs md:text-sm text-gray-700 mt-1">
                        Dashboard dapat diakses dari desktop, tablet, dan mobile
                        dengan tampilan yang menyesuaikan secara otomatis untuk
                        pengalaman pengguna terbaik.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Section 6: Tips */}
                <section>
                  <h3 className="text-base md:text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 md:w-7 md:h-7 flex items-center justify-center text-xs md:text-sm font-bold flex-shrink-0">
                      💡
                    </span>
                    Tips & Trik
                  </h3>
                  <ul className="space-y-2 text-xs md:text-sm text-gray-700 list-disc list-inside">
                    <li>
                      Bagikan kode kelas dengan siswa agar mereka dapat
                      bergabung ke kelas Anda
                    </li>
                    <li>
                      Periksa progres siswa secara berkala menggunakan tombol
                      Refresh
                    </li>
                    <li>
                      Gunakan forum diskusi untuk mendorong interaksi dan
                      kolaborasi antar siswa
                    </li>
                    <li>
                      Review jawaban siswa secara detail untuk memberikan
                      feedback yang lebih baik
                    </li>
                    <li>
                      Buat topik diskusi yang relevan dengan materi pembelajaran
                      untuk pemahaman lebih mendalam
                    </li>
                  </ul>
                </section>
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-4 md:px-6 py-3 md:py-4 flex justify-end">
                <button
                  onClick={() => setShowGuidance(false)}
                  className="px-4 md:px-6 py-2 md:py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm md:text-base"
                >
                  Mengerti
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

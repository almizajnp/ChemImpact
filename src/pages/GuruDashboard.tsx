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
  Edit2,
  Upload,
  EyeOff,
  Link as LinkIcon,
  ExternalLink,
  HelpCircle,
  LayoutDashboard,
  Users,
  Gamepad2,
  GraduationCap,
  ChevronLeft,
  Copy,
  Check,
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
  processEmbedUrls,
  getTopicEmbeds,
} from "../lib/firestore";
import {
  Class,
  ClassMember,
  StudentResponse,
  DiscussionTopic,
  DiscussionComment,
  DiscussionReply,
  EmbedLink,
} from "../types";
import { getGuruMissions } from "../lib/missions";
import MissionManager from "../components/guru/MissionManager";
import EmbedViewer from "../components/EmbedViewer";

// --- COMPONENT ---

interface StudentDetailData {
  member: ClassMember;
  responses: StudentResponse[];
  score: number;
}

type DashboardView = "overview" | "classes" | "missions";

const NAV_ITEMS: {
  id: DashboardView;
  label: string;
  icon: React.ReactNode;
}[] = [
    {
      id: "overview",
      label: "Overview",
      icon: <LayoutDashboard size={18} />,
    },
    { id: "classes", label: "Kelas Saya", icon: <Users size={18} /> },
    { id: "missions", label: "Misi Komik", icon: <Gamepad2 size={18} /> },
  ];

export default function GuruDashboard() {
  const { user, userProfile, logout } = useAuth();
  const navigate = useNavigate();

  // Navigation State
  const [activeView, setActiveView] = useState<DashboardView>("overview");

  // Class Management States
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [creatingClass, setCreatingClass] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Overview Stats
  const [missionCount, setMissionCount] = useState(0);

  // Monitoring States
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [classMembers, setClassMembers] = useState<ClassMember[]>([]);
  const [memberScores, setMemberScores] = useState<Record<string, number>>({});
  const [memberResponses, setMemberResponses] = useState<
    Record<string, StudentResponse[]>
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
    embedLinks: [""] as string[], // dukung banyak link embed
  });
  const [creatingDiscussion, setCreatingDiscussion] = useState(false);

  // Edit Discussion States
  const [editingDiscussion, setEditingDiscussion] =
    useState<DiscussionTopic | null>(null);
  const [editFormData, setEditFormData] = useState({
    title: "",
    description: "",
    embedLinks: [""] as string[],
  });
  const [savingEdit, setSavingEdit] = useState(false);

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
      loadMissionCount();
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

  const loadMissionCount = async () => {
    try {
      const missions = await getGuruMissions(userProfile!.uid);
      setMissionCount(missions.length);
    } catch (error) {
      console.error("Error loading mission count:", error);
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

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    });
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
      // Validasi semua embed link yang diisi
      const filledLinks = discussionFormData.embedLinks
        .map((l) => l.trim())
        .filter((l) => l.length > 0);
      for (const link of filledLinks) {
        if (!detectEmbedType(link)) {
          alert(
            `URL tidak valid: ${link}\nGunakan URL YouTube, gambar, atau website.`,
          );
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
        filledLinks,
      );

      setDiscussionFormData({ title: "", description: "", embedLinks: [""] });
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

  // Buka modal edit dengan data topik (termasuk semua link embed yang ada)
  const handleOpenEditDiscussion = (topic: DiscussionTopic) => {
    const existingLinks = getTopicEmbeds(topic).map((e) => e.url);
    setEditFormData({
      title: topic.title,
      description: topic.description,
      embedLinks: existingLinks.length > 0 ? existingLinks : [""],
    });
    setEditingDiscussion(topic);
  };

  const handleSaveEditDiscussion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !editingDiscussion ||
      !selectedClass ||
      !editFormData.title.trim() ||
      !editFormData.description.trim()
    )
      return;

    setSavingEdit(true);
    try {
      // Validasi semua link yang diisi
      const filledLinks = editFormData.embedLinks
        .map((l) => l.trim())
        .filter((l) => l.length > 0);
      for (const link of filledLinks) {
        if (!detectEmbedType(link)) {
          alert(
            `URL tidak valid: ${link}\nGunakan URL YouTube, gambar, atau website.`,
          );
          setSavingEdit(false);
          return;
        }
      }

      const embedLinks = processEmbedUrls(filledLinks);
      await updateDiscussionTopic(selectedClass.id!, editingDiscussion.id, {
        title: editFormData.title.trim(),
        description: editFormData.description.trim(),
        embedLinks,
        // Field legacy diselaraskan dengan link pertama (null = hapus dari DB)
        optionalEmbedLink: (embedLinks[0]?.url ?? null) as any,
        embedType: (embedLinks[0]?.type ?? null) as any,
      });

      setEditingDiscussion(null);
    } catch (error) {
      console.error("Error updating discussion:", error);
      alert("Gagal menyimpan perubahan diskusi");
    } finally {
      setSavingEdit(false);
    }
  };

  // Helper input daftar link (dipakai form buat & edit)
  const renderLinkInputs = (
    links: string[],
    setLinks: (links: string[]) => void,
    accent: string,
  ) => (
    <div className="space-y-2">
      {links.map((link, idx) => (
        <div key={idx} className="flex gap-2">
          <input
            type="url"
            value={link}
            onChange={(e) => {
              const next = [...links];
              next[idx] = e.target.value;
              setLinks(next);
            }}
            placeholder={`Link ${idx + 1}: https://youtu.be/... atau https://contoh.com/gambar.jpg`}
            className={`flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 ${accent} text-black text-sm`}
          />
          <button
            type="button"
            onClick={() => {
              const next = links.filter((_, i) => i !== idx);
              setLinks(next.length > 0 ? next : [""]);
            }}
            className="px-3 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
            title="Hapus link ini"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => setLinks([...links, ""])}
        className="flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-800 px-1 py-1"
      >
        <Plus size={14} /> Tambah Link Lain
      </button>
    </div>
  );

  // Render satu embed (dipakai berulang di modal detail)
  const renderEmbed = (embed: EmbedLink, key: number, title: string) => (
    <EmbedViewer key={key} embed={embed} title={title} index={key} />
  );

  const loadMonitoringData = async (classItem: Class) => {
    setLoadingMembers(true);
    try {
      // Load class members
      const members = await getClassMembers(classItem.id!);
      setClassMembers(members);

      // Load scores and responses for each member
      const scoresMap: Record<string, number> = {};
      const responsesMap: Record<string, StudentResponse[]> = {};

      for (const member of members) {
        try {
          const score = await getStudentScore(member.siswaId);
          scoresMap[member.siswaId] = score;

          const responses = await getStudentResponsesByStudent(member.siswaId);
          responsesMap[member.siswaId] = responses;
        } catch (error) {
          console.error(
            `Error loading data for student ${member.siswaId}:`,
            error,
          );
        }
      }

      setMemberScores(scoresMap);
      setMemberResponses(responsesMap as any);
    } catch (error) {
      console.error("Error loading monitoring data:", error);
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleOpenMonitoring = async (classItem: Class) => {
    console.log(`\ud83d\udcda Opening monitoring for class: ${classItem.id}`);
    setActiveView("classes");
    setSelectedClass(classItem);
    await loadMonitoringData(classItem);
  };

  const handleSelectStudent = (member: ClassMember) => {
    const score = memberScores[member.siswaId] || 0;
    const responses = memberResponses[member.siswaId] || [];
    setSelectedStudent({ member, responses, score });
  };

  const handleRefreshStudents = async () => {
    if (!selectedClass) return;
    await loadMonitoringData(selectedClass);
  };

  const getStudentStatus = (siswaId: string): "completed" | "pending" => {
    const responses = memberResponses[siswaId];
    if (!responses || responses.length === 0) return "pending";
    return responses.some((r) => r.status === "completed")
      ? "completed"
      : "pending";
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

  const handleNavChange = (view: DashboardView) => {
    setActiveView(view);
    if (view !== "classes") {
      setSelectedClass(null);
    }
  };

  const totalStudents = classes.reduce(
    (sum, c) => sum + (c.memberCount || 0),
    0,
  );

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* ============ SIDEBAR (Desktop) ============ */}
      <aside className="hidden lg:flex flex-col w-64 bg-slate-900 text-white fixed inset-y-0 left-0 z-40">
        {/* Brand */}
        <div className="px-6 py-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold">ChemImpact</h1>
              <p className="text-[11px] text-slate-400">Dashboard Guru</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeView === item.id
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        {/* Sidebar footer */}
        <div className="px-3 py-4 border-t border-slate-800 space-y-1">
          <button
            onClick={() => setShowGuidance(true)}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <HelpCircle size={18} />
            Panduan
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={18} />
            Keluar
          </button>
          <div className="px-4 pt-3">
            <p className="text-xs font-semibold text-white truncate">
              {userProfile?.name}
            </p>
            <p className="text-[10px] text-slate-400">Guru Pengajar</p>
          </div>
        </div>
      </aside>

      {/* ============ MAIN AREA ============ */}
      <div className="flex-1 lg:ml-64 min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden bg-slate-900 text-white sticky top-0 z-40">
          <div className="px-4 py-3 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-base font-bold leading-tight">
                  ChemImpact
                </h1>
                <p className="text-[10px] text-slate-400 leading-tight">
                  Dashboard Guru
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowGuidance(true)}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <HelpCircle className="w-5 h-5 text-slate-300" />
              </button>
              <button
                onClick={handleLogout}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5 text-red-400" />
              </button>
            </div>
          </div>
          {/* Mobile nav tabs */}
          <div className="flex border-t border-slate-800">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavChange(item.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium border-b-2 transition-colors ${activeView === item.id
                    ? "border-blue-500 text-white bg-slate-800/50"
                    : "border-transparent text-slate-400"
                  }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>
        </header>

        <main className="p-4 md:p-8 max-w-7xl mx-auto">
          {/* ============ VIEW: OVERVIEW ============ */}
          {activeView === "overview" && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Selamat Datang, {userProfile?.name}! 👋
                </h2>
                <p className="text-gray-600 mt-1 text-sm md:text-base">
                  Kelola kelas, pantau progres siswa, dan buat misi komik
                  interaktif Anda sendiri
                </p>
              </div>

              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-gray-900">
                      {classes.length}
                    </p>
                    <p className="text-xs text-gray-500">Kelas Aktif</p>
                  </div>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                    <GraduationCap className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-gray-900">
                      {totalStudents}
                    </p>
                    <p className="text-xs text-gray-500">Total Siswa</p>
                  </div>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
                    <Gamepad2 className="w-6 h-6 text-violet-600" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-gray-900">
                      {missionCount}
                    </p>
                    <p className="text-xs text-gray-500">Misi Buatan Sendiri</p>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => {
                    setActiveView("classes");
                    setShowCreateForm(true);
                  }}
                  className="group bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-left text-white hover:shadow-lg transition-shadow"
                >
                  <Plus className="w-8 h-8 mb-3 opacity-80 group-hover:scale-110 transition-transform" />
                  <h3 className="font-bold text-lg">Buat Kelas Baru</h3>
                  <p className="text-blue-200 text-sm mt-1">
                    Buat kelas dan bagikan kode kelas kepada siswa Anda
                  </p>
                </button>
                <button
                  onClick={() => setActiveView("missions")}
                  className="group bg-gradient-to-br from-violet-600 to-purple-700 rounded-2xl p-6 text-left text-white hover:shadow-lg transition-shadow"
                >
                  <Gamepad2 className="w-8 h-8 mb-3 opacity-80 group-hover:scale-110 transition-transform" />
                  <h3 className="font-bold text-lg">Kelola Misi Komik</h3>
                  <p className="text-violet-200 text-sm mt-1">
                    Buat misi komik interaktif dengan gambar, soal, dan
                    refleksi
                  </p>
                </button>
              </div>

              {/* Recent Classes */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-gray-900">
                    Kelas Terbaru
                  </h3>
                  <button
                    onClick={() => setActiveView("classes")}
                    className="text-sm font-medium text-blue-600 hover:text-blue-800"
                  >
                    Lihat Semua →
                  </button>
                </div>
                {loading ? (
                  <div className="flex items-center justify-center py-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : classes.length === 0 ? (
                  <div className="text-center py-10 bg-white rounded-2xl border-2 border-dashed border-gray-300">
                    <p className="text-gray-500 text-sm">
                      Belum ada kelas — buat kelas pertama Anda!
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {classes.slice(0, 3).map((classItem) => (
                      <button
                        key={classItem.id}
                        onClick={() => handleOpenMonitoring(classItem)}
                        className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-left hover:shadow-md transition-shadow"
                      >
                        <h4 className="font-bold text-gray-900 truncate">
                          {classItem.name}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">
                          Kode: {classItem.classCode} •{" "}
                          {classItem.memberCount || 0} siswa
                        </p>
                        <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                          {classItem.description}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ============ VIEW: MISSIONS ============ */}
          {activeView === "missions" && userProfile && (
            <MissionManager
              guruId={userProfile.uid}
              guruName={userProfile.name}
            />
          )}

          {/* ============ VIEW: CLASSES ============ */}
          {activeView === "classes" && (
            <>
              {/* Create Class Form */}
              {showCreateForm && !selectedClass && (
                <div className="bg-white rounded-2xl p-6 md:p-8 mb-8 border border-blue-200 shadow-sm">
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">
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
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
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
                        className="flex-1 bg-gray-200 text-gray-900 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium"
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
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                        Kelas Saya
                      </h2>
                      <p className="text-sm text-gray-600 mt-1">
                        {classes.length} kelas • {totalStudents} siswa
                        terdaftar
                      </p>
                    </div>
                    {!showCreateForm && (
                      <button
                        onClick={() => setShowCreateForm(true)}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 md:px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm shrink-0"
                      >
                        <Plus size={18} />
                        <span className="hidden sm:inline">
                          Buat Kelas Baru
                        </span>
                        <span className="sm:hidden">Buat</span>
                      </button>
                    )}
                  </div>

                  {loading ? (
                    <div className="flex items-center justify-center py-20">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                  ) : classes.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
                      <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
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
                          className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow overflow-hidden group"
                        >
                          <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-5 text-white">
                            <h3 className="text-lg font-bold mb-2 line-clamp-1">
                              {classItem.name}
                            </h3>
                            <button
                              onClick={() =>
                                handleCopyCode(classItem.classCode)
                              }
                              className="inline-flex items-center gap-1.5 bg-white/15 hover:bg-white/25 px-2.5 py-1 rounded-md text-xs font-mono font-semibold transition-colors"
                              title="Salin kode kelas"
                            >
                              {copiedCode === classItem.classCode ? (
                                <>
                                  <Check size={12} /> Tersalin!
                                </>
                              ) : (
                                <>
                                  <Copy size={12} /> {classItem.classCode}
                                </>
                              )}
                            </button>
                          </div>
                          <div className="p-5">
                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                              {classItem.description}
                            </p>
                            <div className="flex items-center gap-2 mb-4 text-sm text-gray-500">
                              <Users size={16} className="text-blue-500" />
                              <span className="font-semibold text-gray-800">
                                {classItem.memberCount || 0}
                              </span>{" "}
                              siswa terdaftar
                            </div>
                            <button
                              onClick={() => handleOpenMonitoring(classItem)}
                              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                            >
                              Kelola & Monitoring
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
                  <div className="flex items-center gap-3 mb-2">
                    <button
                      onClick={() => setSelectedClass(null)}
                      className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors shrink-0"
                      title="Kembali ke daftar kelas"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <div className="min-w-0">
                      <h3 className="text-xl md:text-2xl font-bold text-gray-900 truncate">
                        {selectedClass.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Kode:{" "}
                        <span className="font-mono font-semibold">
                          {selectedClass.classCode}
                        </span>{" "}
                        • {classMembers.length} siswa
                      </p>
                    </div>
                  </div>

                  {/* Monitoring Tabs */}
                  <div className="flex gap-4 border-b border-gray-200">
                    <button
                      onClick={() => setMonitoringTab("students")}
                      className={`py-3 px-4 font-medium border-b-2 transition-colors text-sm md:text-base ${monitoringTab === "students"
                          ? "border-blue-600 text-blue-600"
                          : "border-transparent text-gray-600 hover:text-gray-900"
                        }`}
                    >
                      👥 Progres Siswa
                    </button>
                    <button
                      onClick={() => setMonitoringTab("discussions")}
                      className={`py-3 px-4 font-medium border-b-2 transition-colors text-sm md:text-base ${monitoringTab === "discussions"
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
                              className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm ${filterStatus === status
                                  ? "bg-blue-600 text-white"
                                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
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
                          <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
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
                                  const status = getStudentStatus(
                                    member.siswaId,
                                  );
                                  const score =
                                    memberScores[member.siswaId] || 0;

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
                                            ID:{" "}
                                            {member.siswaId.substring(0, 8)}
                                            ...
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
                                          onClick={() =>
                                            handleSelectStudent(member)
                                          }
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
                                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
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
                                      onClick={() =>
                                        handleSelectStudent(member)
                                      }
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
                        <div className="bg-white rounded-xl p-6 border border-emerald-200 shadow-sm">
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
                                Link Embed (Opsional — bisa lebih dari satu)
                              </label>
                              <p className="text-xs text-gray-600 mb-2">
                                🎥 YouTube • 📷 Gambar • 📄 Artikel • 🌐
                                Website
                              </p>
                              {renderLinkInputs(
                                discussionFormData.embedLinks,
                                (links) =>
                                  setDiscussionFormData({
                                    ...discussionFormData,
                                    embedLinks: links,
                                  }),
                                "focus:ring-emerald-500",
                              )}
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
                                    embedLinks: [""],
                                  });
                                }}
                                className="flex-1 bg-gray-200 text-gray-900 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium"
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
                            Belum ada topik diskusi. Buat yang pertama
                            sekarang!
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
                                    {new Date(
                                      topic.createdAt,
                                    ).toLocaleDateString("id-ID")}{" "}
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
                              {getTopicEmbeds(topic).length > 0 && (
                                <div className="flex items-center gap-2 text-xs text-blue-600 mb-3 flex-wrap">
                                  <LinkIcon size={14} />
                                  {getTopicEmbeds(topic).map((embed, i) => (
                                    <span
                                      key={i}
                                      className="bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full"
                                    >
                                      {(embed.type === "youtube" ||
                                        embed.type === "vimeo" ||
                                        embed.type === "tiktok" ||
                                        embed.type === "drive" ||
                                        embed.type === "video") &&
                                        "🎥 Video"}
                                      {embed.type === "image" && "📷 Gambar"}
                                      {embed.type === "pdf" && "📑 PDF"}
                                      {embed.type === "article" && "📄 Artikel"}
                                      {embed.type === "website" && "🌐 Website"}
                                    </span>
                                  ))}
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
                                    handleOpenEditDiscussion(topic);
                                  }}
                                  className="flex items-center gap-2 px-3 py-2 bg-amber-100 text-amber-700 rounded hover:bg-amber-200 transition-colors text-sm font-medium"
                                >
                                  <Edit2 size={16} />
                                  Edit
                                </button>

                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handlePublishDiscussion(topic);
                                  }}
                                  className={`flex items-center gap-2 px-3 py-2 rounded text-sm font-medium transition-colors ${topic.status === "published"
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
            </>
          )}

          {/* ============ STUDENT DETAIL MODAL ============ */}
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
                      Detail Misi ({selectedStudent.responses.length})
                    </h3>
                    {selectedStudent.responses.length === 0 ? (
                      <p className="text-gray-600 text-center py-8 text-sm">
                        Siswa belum menyelesaikan misi apapun
                      </p>
                    ) : (
                      <div className="space-y-4 md:space-y-6">
                        {selectedStudent.responses.map((response, idx) => (
                          <div
                            key={response.id}
                            className="border-2 border-gray-300 rounded-xl overflow-hidden bg-white shadow-md"
                          >
                            {/* Mission Header */}
                            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-3 md:px-4 py-3 md:py-4">
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="inline-flex items-center justify-center w-6 h-6 md:w-8 md:h-8 bg-white text-blue-600 font-bold text-sm md:text-base rounded-full">
                                      {idx + 1}
                                    </span>
                                    <h4 className="font-bold text-sm md:text-base text-white">
                                      {response.missionName}
                                    </h4>
                                    {typeof response.missionId ===
                                      "string" && (
                                        <span className="text-[10px] bg-violet-500 text-white px-2 py-0.5 rounded-full font-semibold">
                                          Misi Guru
                                        </span>
                                      )}
                                  </div>
                                  <p className="text-xs text-blue-100 ml-8">
                                    {new Date(
                                      response.submittedAt,
                                    ).toLocaleString("id-ID")}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-2xl md:text-3xl font-bold text-white">
                                    {response.totalScore || 0}
                                  </p>
                                  <p className="text-xs text-blue-100">poin</p>
                                </div>
                              </div>
                            </div>

                            {/* Mission Content */}
                            <div className="px-3 md:px-4 py-3 md:py-4 space-y-3 md:space-y-4">
                              {/* Essay Answers */}
                              {Object.keys(response.essayAnswers || {})
                                .length > 0 && (
                                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 md:p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                      <div className="w-4 h-4 bg-amber-500 rounded-full"></div>
                                      <p className="text-xs md:text-sm font-bold text-amber-900">
                                        JAWABAN URAIAN
                                      </p>
                                    </div>
                                    <div className="space-y-3">
                                      {Object.entries(
                                        response.essayAnswers || {},
                                      ).map(([essayId, answer], qIdx) => (
                                        <div
                                          key={essayId}
                                          className="bg-white rounded-lg p-3 border border-amber-100"
                                        >
                                          <p className="text-xs font-semibold text-amber-900 mb-1">
                                            Pertanyaan {qIdx + 1}:
                                          </p>
                                          <p className="text-xs text-amber-800 mb-2 line-clamp-2">
                                            {response.essayQuestions?.[
                                              essayId
                                            ] || `Essay ${essayId}`}
                                          </p>
                                          <p className="text-xs font-semibold text-amber-900 mb-1">
                                            Jawaban:
                                          </p>
                                          <p className="text-xs text-gray-700 bg-amber-50 rounded p-2 line-clamp-4">
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
                                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 md:p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                      <div className="w-4 h-4 bg-emerald-500 rounded-full"></div>
                                      <p className="text-xs md:text-sm font-bold text-emerald-900">
                                        JAWABAN PILIHAN GANDA (
                                        {response.multiChoiceAnswers.length})
                                      </p>
                                    </div>
                                    <div className="space-y-2">
                                      {response.multiChoiceAnswers.map(
                                        (answer, idx) => (
                                          <div
                                            key={idx}
                                            className={`rounded-lg p-2 md:p-3 text-xs border-2 ${answer.isCorrect
                                                ? "bg-green-50 border-green-300"
                                                : "bg-red-50 border-red-300"
                                              }`}
                                          >
                                            <div className="flex items-start gap-2">
                                              <span
                                                className={`font-bold mt-0.5 ${answer.isCorrect
                                                    ? "text-green-600"
                                                    : "text-red-600"
                                                  }`}
                                              >
                                                {answer.isCorrect ? "✓" : "✗"}
                                              </span>
                                              <div className="flex-1">
                                                <p className="font-semibold text-gray-900">
                                                  Soal {idx + 1}
                                                </p>
                                                <p className="text-gray-700 mt-1">
                                                  {answer.choiceText}
                                                </p>
                                              </div>
                                            </div>
                                          </div>
                                        ),
                                      )}
                                    </div>
                                  </div>
                                )}

                              {/* Reflection Answers */}
                              {Object.keys(response.reflectionAnswers || {})
                                .length > 0 && (
                                  <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 md:p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                      <div className="w-4 h-4 bg-indigo-500 rounded-full"></div>
                                      <p className="text-xs md:text-sm font-bold text-indigo-900">
                                        REFLEKSI
                                      </p>
                                    </div>
                                    <div className="space-y-3">
                                      {Object.entries(
                                        response.reflectionAnswers || {},
                                      ).map(([reflectionId, answer], rIdx) => (
                                        <div
                                          key={reflectionId}
                                          className="bg-white rounded-lg p-3 border border-indigo-100"
                                        >
                                          <p className="text-xs font-semibold text-indigo-900 mb-1">
                                            Refleksi {rIdx + 1}:
                                          </p>
                                          <p className="text-xs text-indigo-800 mb-2 line-clamp-2">
                                            {response.reflectionQuestions?.[
                                              reflectionId
                                            ] || `Refleksi ${reflectionId}`}
                                          </p>
                                          <p className="text-xs font-semibold text-indigo-900 mb-1">
                                            Jawaban:
                                          </p>
                                          <p className="text-xs text-gray-700 bg-indigo-50 rounded p-2 line-clamp-4">
                                            {answer}
                                          </p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============ DISCUSSION DETAIL MODAL ============ */}
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
                      Dibuat oleh: {selectedDiscussionForDetail.createdByName}{" "}
                      •{" "}
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
                  {/* Embed Preview (mendukung banyak link) */}
                  {getTopicEmbeds(selectedDiscussionForDetail).length > 0 && (
                    <div>
                      {getTopicEmbeds(selectedDiscussionForDetail).map(
                        (embed, i) =>
                          renderEmbed(
                            embed,
                            i,
                            selectedDiscussionForDetail.title,
                          ),
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

          {/* ============ EDIT DISCUSSION MODAL ============ */}
          {editingDiscussion && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-2 md:p-4">
              <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[95vh] overflow-y-auto">
                <div className="sticky top-0 bg-gradient-to-r from-amber-500 to-orange-500 px-4 md:px-6 py-4 flex justify-between items-center">
                  <div>
                    <h2 className="text-lg md:text-xl font-bold text-white">
                      ✏️ Edit Topik Diskusi
                    </h2>
                    <p className="text-amber-100 text-xs mt-0.5">
                      Ubah judul, deskripsi, dan link yang disematkan
                    </p>
                  </div>
                  <button
                    onClick={() => setEditingDiscussion(null)}
                    className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>

                <form
                  onSubmit={handleSaveEditDiscussion}
                  className="p-4 md:p-6 space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Judul Diskusi
                    </label>
                    <input
                      type="text"
                      value={editFormData.title}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          title: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-black"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Deskripsi / Studi Kasus
                    </label>
                    <textarea
                      value={editFormData.description}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          description: e.target.value,
                        })
                      }
                      rows={5}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none text-black"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Link Embed (bisa lebih dari satu)
                    </label>
                    <p className="text-xs text-gray-600 mb-2">
                      🎥 YouTube • 📷 Gambar • 📄 Artikel • 🌐 Website —
                      kosongkan semua untuk menghapus embed
                    </p>
                    {renderLinkInputs(
                      editFormData.embedLinks,
                      (links) =>
                        setEditFormData({
                          ...editFormData,
                          embedLinks: links,
                        }),
                      "focus:ring-amber-500",
                    )}
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={savingEdit}
                      className="flex-1 bg-amber-500 text-white py-2.5 rounded-lg hover:bg-amber-600 disabled:bg-gray-400 transition-colors font-medium"
                    >
                      {savingEdit ? "Menyimpan..." : "Simpan Perubahan"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingDiscussion(null)}
                      disabled={savingEdit}
                      className="flex-1 bg-gray-200 text-gray-900 py-2.5 rounded-lg hover:bg-gray-300 transition-colors font-medium disabled:opacity-50"
                    >
                      Batal
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ============ GUIDANCE MODAL ============ */}
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
                        Pelajari cara menggunakan sistem dashboard guru
                        ChemImpact
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
                      siswa secara real-time, mengelola diskusi kelas, dan
                      membuat misi komik interaktif Anda sendiri. Gunakan menu
                      di sebelah kiri (atau tab di atas pada mobile) untuk
                      berpindah halaman.
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
                          Buka menu "Kelas Saya" lalu klik "Buat Kelas Baru".
                          Isi nama kelas dan deskripsi. Sistem akan otomatis
                          menghasilkan kode kelas unik — klik kode tersebut
                          pada kartu kelas untuk menyalinnya dan bagikan
                          kepada siswa.
                        </p>
                      </div>
                      <div>
                        <p className="text-xs md:text-sm font-semibold text-gray-900">
                          🔍 Kelola & Monitoring
                        </p>
                        <p className="text-xs md:text-sm text-gray-700 mt-1">
                          Klik "Kelola & Monitoring" pada kartu kelas untuk
                          melihat detail progres siswa dan forum diskusi kelas
                          tersebut.
                        </p>
                      </div>
                    </div>
                  </section>

                  {/* Section 3: Missions */}
                  <section className="border-b border-gray-200 pb-4 md:pb-5">
                    <h3 className="text-base md:text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <span className="bg-violet-100 text-violet-600 rounded-full w-6 h-6 md:w-7 md:h-7 flex items-center justify-center text-xs md:text-sm font-bold flex-shrink-0">
                        3
                      </span>
                      Misi Komik (CRUD)
                    </h3>
                    <div className="space-y-2 md:space-y-3">
                      <div>
                        <p className="text-xs md:text-sm font-semibold text-gray-900">
                          🎮 Buat Misi Sendiri
                        </p>
                        <p className="text-xs md:text-sm text-gray-700 mt-1">
                          Buka menu "Misi Komik" lalu klik "Buat Misi Baru".
                          Ikuti 3 langkah: isi info misi, susun halaman komik
                          (upload gambar, tambah soal pilihan ganda, esai, dan
                          refleksi), lalu preview dan publish. Misi yang
                          di-publish langsung muncul di halaman Battle siswa.
                        </p>
                      </div>
                      <div>
                        <p className="text-xs md:text-sm font-semibold text-gray-900">
                          🖼️ Upload Gambar
                        </p>
                        <p className="text-xs md:text-sm text-gray-700 mt-1">
                          Gambar komik diupload ke Cloudinary secara otomatis.
                          Format yang didukung: JPG, PNG, WebP, GIF (maksimal
                          5MB per gambar).
                        </p>
                      </div>
                      <div>
                        <p className="text-xs md:text-sm font-semibold text-gray-900">
                          👁️ Sembunyikan Misi Default
                        </p>
                        <p className="text-xs md:text-sm text-gray-700 mt-1">
                          3 misi bawaan sistem (Sungai Berbusa, Pencemaran
                          Plastik, Polusi Udara) bisa Anda sembunyikan jika
                          hanya ingin menggunakan misi buatan sendiri. Klik
                          "Sembunyikan dari Siswa" pada kartu misi default.
                        </p>
                      </div>
                    </div>
                  </section>

                  {/* Section 4: Student Progress */}
                  <section className="border-b border-gray-200 pb-4 md:pb-5">
                    <h3 className="text-base md:text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <span className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 md:w-7 md:h-7 flex items-center justify-center text-xs md:text-sm font-bold flex-shrink-0">
                        4
                      </span>
                      Memantau Progres Siswa
                    </h3>
                    <div className="space-y-2 md:space-y-3">
                      <div>
                        <p className="text-xs md:text-sm font-semibold text-gray-900">
                          👥 Tab Progres Siswa
                        </p>
                        <p className="text-xs md:text-sm text-gray-700 mt-1">
                          Lihat daftar semua siswa dalam kelas. Sistem
                          menampilkan nama siswa, status penyelesaian
                          (Selesai/Proses), dan skor total. Siswa diurutkan
                          secara alfabetis berdasarkan nama.
                        </p>
                      </div>
                      <div>
                        <p className="text-xs md:text-sm font-semibold text-gray-900">
                          📋 Detail Siswa
                        </p>
                        <p className="text-xs md:text-sm text-gray-700 mt-1">
                          Klik tombol "Detail" untuk melihat jawaban lengkap
                          siswa, termasuk jawaban uraian, pilihan ganda, dan
                          refleksi — baik dari misi default maupun misi buatan
                          Anda (bertanda "Misi Guru").
                        </p>
                      </div>
                    </div>
                  </section>

                  {/* Section 5: Discussions */}
                  <section className="border-b border-gray-200 pb-4 md:pb-5">
                    <h3 className="text-base md:text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <span className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 md:w-7 md:h-7 flex items-center justify-center text-xs md:text-sm font-bold flex-shrink-0">
                        5
                      </span>
                      Forum Diskusi Kelas
                    </h3>
                    <div className="space-y-2 md:space-y-3">
                      <div>
                        <p className="text-xs md:text-sm font-semibold text-gray-900">
                          💬 Buat Topik Diskusi
                        </p>
                        <p className="text-xs md:text-sm text-gray-700 mt-1">
                          Klik "Buat Topik Diskusi" untuk membuat pertanyaan
                          atau studi kasus yang akan didiskusikan bersama. Anda
                          dapat menambahkan video YouTube, gambar, artikel,
                          atau link website sebagai pendukung diskusi.
                        </p>
                      </div>
                      <div>
                        <p className="text-xs md:text-sm font-semibold text-gray-900">
                          📢 Publish/Unpublish
                        </p>
                        <p className="text-xs md:text-sm text-gray-700 mt-1">
                          Topik diskusi dibuat dalam status "Draft" terlebih
                          dahulu. Klik "Publish" untuk membuat topik terlihat
                          oleh siswa. Klik "Unpublish" untuk
                          menyembunyikannya.
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
                        Gunakan fitur Preview sebelum mem-publish misi komik
                        untuk memastikan tampilannya sesuai
                      </li>
                      <li>
                        Simpan misi sebagai Draft dulu jika masih ingin
                        mengeditnya nanti
                      </li>
                      <li>
                        Periksa progres siswa secara berkala menggunakan tombol
                        Refresh
                      </li>
                      <li>
                        Gunakan forum diskusi untuk mendorong interaksi dan
                        kolaborasi antar siswa
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
    </div>
  );
}
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ref, get } from "firebase/database";
import { sendPasswordResetEmail } from "firebase/auth";
import { db, auth } from "../config/firebase";
import { useAuth } from "../context/AuthContext";
import {
  Trash2,
  LogOut,
  Users,
  Search,
  ShieldCheck,
  GraduationCap,
  BookOpen,
  KeyRound,
  Eye,
  X,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Award,
  Mail,
  Calendar,
  ArrowUpDown,
} from "lucide-react";

// ============ ADMIN DASHBOARD ============
// Panel administrasi profesional:
// - Statistik pengguna & kelas
// - Pencarian, filter role, dan sorting
// - Detail pengguna (profil + skor siswa)
// - Reset password (mengirim email reset resmi dari Firebase Auth)
// - Hapus data pengguna dengan modal konfirmasi

interface AdminUser {
  uid: string;
  email: string;
  name: string;
  role: "guru" | "siswa" | "admin";
  score?: number;
  createdAt: string;
}

type RoleFilter = "all" | "guru" | "siswa";
type SortKey = "name" | "createdAt";

interface Toast {
  id: number;
  type: "success" | "error";
  message: string;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { deleteUser, logout } = useAuth();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [classCount, setClassCount] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  // Toolbar states
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortAsc, setSortAsc] = useState(false);

  // Action states
  const [detailUser, setDetailUser] = useState<AdminUser | null>(null);
  const [resetTarget, setResetTarget] = useState<AdminUser | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [processing, setProcessing] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Check if user is admin
  useEffect(() => {
    const role = localStorage.getItem("userRole");
    if (role !== "admin") {
      navigate("/");
    }
  }, [navigate]);

  const showToast = (type: "success" | "error", message: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // ---------- Data loading ----------
  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [usersSnap, classesSnap, scoresSnap] = await Promise.all([
        get(ref(db, "users")),
        get(ref(db, "classes")),
        get(ref(db, "studentScores")),
      ]);

      if (usersSnap.exists()) {
        const usersList: AdminUser[] = Object.values(
          usersSnap.val() as Record<string, AdminUser>,
        );
        setUsers(usersList);
      } else {
        setUsers([]);
      }

      setClassCount(
        classesSnap.exists() ? Object.keys(classesSnap.val()).length : 0,
      );

      if (scoresSnap.exists()) {
        const raw = scoresSnap.val() as Record<
          string,
          { totalScore?: number }
        >;
        const map: Record<string, number> = {};
        Object.entries(raw).forEach(([uid, data]) => {
          map[uid] = data?.totalScore || 0;
        });
        setScores(map);
      }
    } catch (err) {
      console.error("Error fetching admin data:", err);
      showToast("error", "Gagal memuat data. Coba refresh.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- Actions ----------
  const handleResetPassword = async () => {
    if (!resetTarget) return;
    setProcessing(true);
    try {
      await sendPasswordResetEmail(auth, resetTarget.email);
      showToast(
        "success",
        `Email reset password telah dikirim ke ${resetTarget.email}`,
      );
      setResetTarget(null);
    } catch (err: any) {
      console.error("Error sending reset email:", err);
      const msg =
        err?.code === "auth/user-not-found"
          ? "Email tidak terdaftar di sistem autentikasi."
          : err?.code === "auth/invalid-email"
            ? "Format email tidak valid."
            : err?.code === "auth/too-many-requests"
              ? "Terlalu banyak permintaan. Coba lagi beberapa saat."
              : "Gagal mengirim email reset password.";
      showToast("error", msg);
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setProcessing(true);
    try {
      await deleteUser(deleteTarget.uid);
      setUsers((prev) => prev.filter((u) => u.uid !== deleteTarget.uid));
      showToast(
        "success",
        `Data pengguna "${deleteTarget.name}" berhasil dihapus`,
      );
      setDeleteTarget(null);
    } catch (err) {
      console.error("Error deleting user:", err);
      showToast("error", "Gagal menghapus pengguna");
    } finally {
      setProcessing(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      localStorage.removeItem("userRole");
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  // ---------- Derived data ----------
  const filteredUsers = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    let list = users.filter((user) => {
      if (roleFilter !== "all" && user.role !== roleFilter) return false;
      if (!q) return true;
      return (
        user.name.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q)
      );
    });

    list = [...list].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "name") {
        cmp = a.name.localeCompare(b.name);
      } else {
        cmp =
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      return sortAsc ? cmp : -cmp;
    });

    return list;
  }, [users, searchTerm, roleFilter, sortKey, sortAsc]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc((prev) => !prev);
    } else {
      setSortKey(key);
      setSortAsc(key === "name"); // nama default A-Z, tanggal default terbaru
    }
  };

  const guruCount = users.filter((u) => u.role === "guru").length;
  const siswaCount = users.filter((u) => u.role === "siswa").length;

  const getInitials = (name: string): string =>
    name
      .split(" ")
      .slice(0, 2)
      .map((w) => w.charAt(0).toUpperCase())
      .join("");

  const avatarColor = (role: string): string =>
    role === "guru"
      ? "bg-emerald-500"
      : role === "siswa"
        ? "bg-blue-500"
        : "bg-purple-500";

  const roleBadge = (role: string) => (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${role === "guru"
          ? "bg-emerald-100 text-emerald-700"
          : role === "siswa"
            ? "bg-blue-100 text-blue-700"
            : "bg-purple-100 text-purple-700"
        }`}
    >
      {role === "guru" ? (
        <>
          <BookOpen size={12} /> Guru
        </>
      ) : role === "siswa" ? (
        <>
          <GraduationCap size={12} /> Siswa
        </>
      ) : (
        <>
          <ShieldCheck size={12} /> Admin
        </>
      )}
    </span>
  );

  return (
    <div className="min-h-screen bg-slate-100">
      {/* ============ HEADER ============ */}
      <header className="bg-slate-900 text-white sticky top-0 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-bold leading-tight">
                ChemImpact Admin
              </h1>
              <p className="text-slate-400 text-xs">
                Panel Administrasi Sistem
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchAllData}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-50 transition-colors"
              title="Muat ulang data"
            >
              <RefreshCw
                size={16}
                className={loading ? "animate-spin" : ""}
              />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {/* ============ TOASTS ============ */}
      <div className="fixed top-20 right-4 z-[100] space-y-2 max-w-sm">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-start gap-2 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium animate-[fadeIn_0.2s_ease-out] ${toast.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-red-50 border-red-200 text-red-800"
              }`}
          >
            {toast.type === "success" ? (
              <CheckCircle size={18} className="shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle size={18} className="shrink-0 mt-0.5" />
            )}
            {toast.message}
          </div>
        ))}
      </div>

      {/* ============ MAIN ============ */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {users.length}
              </p>
              <p className="text-xs text-gray-500">Total Pengguna</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{guruCount}</p>
              <p className="text-xs text-gray-500">Guru</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
              <GraduationCap className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{siswaCount}</p>
              <p className="text-xs text-gray-500">Siswa</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{classCount}</p>
              <p className="text-xs text-gray-500">Kelas Aktif</p>
            </div>
          </div>
        </div>

        {/* Toolbar: Search + Filter */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Cari nama atau email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50"
              />
            </div>

            {/* Role Filter */}
            <div className="flex gap-1.5">
              {(
                [
                  ["all", `Semua (${users.length})`],
                  ["guru", `Guru (${guruCount})`],
                  ["siswa", `Siswa (${siswaCount})`],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => setRoleFilter(value)}
                  className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors ${roleFilter === value
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ============ USERS TABLE ============ */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mb-3"></div>
            <p className="text-gray-500 text-sm">Memuat data pengguna...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">
              {searchTerm || roleFilter !== "all"
                ? "Tidak ada pengguna yang cocok dengan pencarian"
                : "Belum ada pengguna terdaftar"}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-6 py-4 text-left">
                        <button
                          onClick={() => toggleSort("name")}
                          className="flex items-center gap-1 text-xs font-semibold text-gray-600 uppercase tracking-wide hover:text-gray-900"
                        >
                          Pengguna <ArrowUpDown size={12} />
                        </button>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                        Role
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wide">
                        Skor
                      </th>
                      <th className="px-6 py-4 text-left">
                        <button
                          onClick={() => toggleSort("createdAt")}
                          className="flex items-center gap-1 text-xs font-semibold text-gray-600 uppercase tracking-wide hover:text-gray-900"
                        >
                          Terdaftar <ArrowUpDown size={12} />
                        </button>
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr
                        key={user.uid}
                        className="border-b border-gray-100 hover:bg-gray-50/70 transition-colors"
                      >
                        {/* Pengguna */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-9 h-9 rounded-full ${avatarColor(user.role)} text-white flex items-center justify-center text-xs font-bold shrink-0`}
                            >
                              {getInitials(user.name)}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-gray-900 truncate">
                                {user.name}
                              </p>
                              <p className="text-xs text-gray-500 truncate">
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        {/* Role */}
                        <td className="px-6 py-4">{roleBadge(user.role)}</td>
                        {/* Skor */}
                        <td className="px-6 py-4 text-center">
                          {user.role === "siswa" ? (
                            <span className="inline-flex items-center gap-1 text-sm font-bold text-blue-600">
                              <Award size={14} className="text-amber-500" />
                              {scores[user.uid] ?? 0}
                            </span>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                        {/* Terdaftar */}
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(user.createdAt).toLocaleDateString(
                            "id-ID",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            },
                          )}
                        </td>
                        {/* Aksi */}
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setDetailUser(user)}
                              className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                              title="Lihat detail"
                            >
                              <Eye size={15} />
                            </button>
                            <button
                              onClick={() => setResetTarget(user)}
                              className="p-2 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors"
                              title="Reset password (kirim email)"
                            >
                              <KeyRound size={15} />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(user)}
                              className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                              title="Hapus pengguna"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-500">
                Menampilkan {filteredUsers.length} dari {users.length} pengguna
              </div>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
              {filteredUsers.map((user) => (
                <div
                  key={user.uid}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-4"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-full ${avatarColor(user.role)} text-white flex items-center justify-center text-xs font-bold shrink-0`}
                      >
                        {getInitials(user.name)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">
                          {user.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    {roleBadge(user.role)}
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="text-xs text-gray-500">
                      {user.role === "siswa" && (
                        <span className="inline-flex items-center gap-1 font-bold text-blue-600 mr-3">
                          <Award size={12} className="text-amber-500" />
                          {scores[user.uid] ?? 0}
                        </span>
                      )}
                      {new Date(user.createdAt).toLocaleDateString("id-ID")}
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => setDetailUser(user)}
                        className="p-2 rounded-lg bg-gray-100 text-gray-600"
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        onClick={() => setResetTarget(user)}
                        className="p-2 rounded-lg bg-amber-50 text-amber-600"
                      >
                        <KeyRound size={15} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(user)}
                        className="p-2 rounded-lg bg-red-50 text-red-600"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      {/* ============ DETAIL MODAL ============ */}
      {detailUser && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setDetailUser(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-6 text-center relative">
              <button
                onClick={() => setDetailUser(null)}
                className="absolute top-3 right-3 p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X size={18} className="text-white" />
              </button>
              <div
                className={`w-16 h-16 rounded-full ${avatarColor(detailUser.role)} text-white flex items-center justify-center text-xl font-bold mx-auto mb-3 border-4 border-white/30`}
              >
                {getInitials(detailUser.name)}
              </div>
              <h3 className="text-lg font-bold text-white">
                {detailUser.name}
              </h3>
              <div className="mt-2 flex justify-center">
                {roleBadge(detailUser.role)}
              </div>
            </div>
            <div className="p-6 space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Mail size={16} className="text-gray-400 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-gray-900 font-medium truncate">
                    {detailUser.email}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar size={16} className="text-gray-400 shrink-0" />
                <div>
                  <p className="text-xs text-gray-500">Terdaftar</p>
                  <p className="text-gray-900 font-medium">
                    {new Date(detailUser.createdAt).toLocaleString("id-ID")}
                  </p>
                </div>
              </div>
              {detailUser.role === "siswa" && (
                <div className="flex items-center gap-3 text-sm">
                  <Award size={16} className="text-amber-500 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500">Total Skor</p>
                    <p className="text-blue-600 font-bold text-lg">
                      {scores[detailUser.uid] ?? 0} poin
                    </p>
                  </div>
                </div>
              )}
              <div className="pt-2 text-[11px] text-gray-400 font-mono break-all">
                UID: {detailUser.uid}
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => {
                    setDetailUser(null);
                    setResetTarget(detailUser);
                  }}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-amber-50 text-amber-700 hover:bg-amber-100 text-sm font-semibold transition-colors"
                >
                  <KeyRound size={15} /> Reset Password
                </button>
                <button
                  onClick={() => setDetailUser(null)}
                  className="py-2.5 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm font-semibold transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============ RESET PASSWORD MODAL ============ */}
      {resetTarget && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => !processing && setResetTarget(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
              <KeyRound className="w-6 h-6 text-amber-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center mb-2">
              Reset Password Pengguna
            </h3>
            <p className="text-sm text-gray-600 text-center mb-4">
              Sistem akan mengirim <b>email reset password resmi</b> dari
              Firebase ke:
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-center mb-4">
              <p className="text-sm font-bold text-gray-900">
                {resetTarget.name}
              </p>
              <p className="text-xs text-gray-500">{resetTarget.email}</p>
            </div>
            <p className="text-xs text-gray-500 bg-blue-50 border border-blue-100 rounded-lg p-3 mb-5">
              ℹ️ Pengguna akan menerima link di email tersebut untuk membuat
              password baru sendiri. Password lama tetap berlaku sampai
              pengguna menyelesaikan proses reset.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setResetTarget(null)}
                disabled={processing}
                className="py-2.5 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm font-semibold transition-colors disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={handleResetPassword}
                disabled={processing}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-amber-500 text-white hover:bg-amber-600 text-sm font-semibold transition-colors disabled:opacity-60"
              >
                {processing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Mengirim...
                  </>
                ) : (
                  <>
                    <Mail size={15} /> Kirim Email Reset
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============ DELETE CONFIRM MODAL ============ */}
      {deleteTarget && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => !processing && setDeleteTarget(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center mb-2">
              Hapus Pengguna?
            </h3>
            <p className="text-sm text-gray-600 text-center mb-4">
              Anda akan menghapus seluruh data milik:
            </p>
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center mb-4">
              <p className="text-sm font-bold text-gray-900">
                {deleteTarget.name}
              </p>
              <p className="text-xs text-gray-500">{deleteTarget.email}</p>
            </div>
            <ul className="text-xs text-gray-500 space-y-1 mb-5 list-disc list-inside">
              <li>Profil pengguna, skor, dan seluruh jawaban misi dihapus</li>
              <li>Tindakan ini tidak dapat dibatalkan</li>
            </ul>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={processing}
                className="py-2.5 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm font-semibold transition-colors disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                disabled={processing}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-600 text-white hover:bg-red-700 text-sm font-semibold transition-colors disabled:opacity-60"
              >
                {processing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Menghapus...
                  </>
                ) : (
                  <>
                    <Trash2 size={15} /> Ya, Hapus
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
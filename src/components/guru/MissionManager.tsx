import { useState, useEffect, useCallback } from "react";
import {
    Plus,
    Eye,
    EyeOff,
    Edit2,
    Trash2,
    Upload,
    Gamepad2,
    Lock,
    BookOpen,
} from "lucide-react";
import { CustomMission } from "../../types/mission";
import {
    getGuruMissions,
    deleteCustomMission,
    updateCustomMission,
    getHiddenDefaultMissions,
    setDefaultMissionHidden,
} from "../../lib/missions";
import { DEFAULT_MISSIONS } from "../../data/defaultMissions";
import MissionEditor from "./MissionEditor";

// ============ MISSION MANAGER (Dashboard Guru) ============
// Panel pengelolaan Misi Komik:
// - Misi Default (3 misi bawaan): bisa disembunyikan/ditampilkan per guru
// - Misi Buatan Sendiri: CRUD lengkap (buat, edit, hapus, publish/unpublish)

interface MissionManagerProps {
    guruId: string;
    guruName: string;
}

export default function MissionManager({
    guruId,
    guruName,
}: MissionManagerProps) {
    const [missions, setMissions] = useState<CustomMission[]>([]);
    const [hiddenDefaults, setHiddenDefaults] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);
    const [showEditor, setShowEditor] = useState(false);
    const [editingMission, setEditingMission] = useState<CustomMission | null>(
        null,
    );

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [customMissions, hidden] = await Promise.all([
                getGuruMissions(guruId),
                getHiddenDefaultMissions(guruId),
            ]);
            setMissions(customMissions);
            setHiddenDefaults(hidden);
        } catch (error) {
            console.error("Error loading missions:", error);
        } finally {
            setLoading(false);
        }
    }, [guruId]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // ---------- Aksi misi default ----------
    const handleToggleDefault = async (defaultId: number) => {
        const currentlyHidden = hiddenDefaults.includes(defaultId);
        try {
            await setDefaultMissionHidden(guruId, defaultId, !currentlyHidden);
            setHiddenDefaults((prev) =>
                currentlyHidden
                    ? prev.filter((id) => id !== defaultId)
                    : [...prev, defaultId],
            );
        } catch (error) {
            console.error("Error toggling default mission:", error);
            alert("Gagal mengubah visibilitas misi default");
        }
    };

    // ---------- Aksi misi custom ----------
    const handleTogglePublish = async (mission: CustomMission) => {
        const newStatus = mission.status === "published" ? "draft" : "published";
        try {
            await updateCustomMission(mission.id, { status: newStatus });
            setMissions((prev) =>
                prev.map((m) =>
                    m.id === mission.id ? { ...m, status: newStatus } : m,
                ),
            );
        } catch (error) {
            console.error("Error toggling publish:", error);
            alert("Gagal mengubah status misi");
        }
    };

    const handleDelete = async (mission: CustomMission) => {
        const confirmed = window.confirm(
            `Hapus misi "${mission.title}"?\n\nMisi akan dihapus permanen dan tidak lagi muncul untuk siswa.`,
        );
        if (!confirmed) return;
        try {
            await deleteCustomMission(mission.id);
            setMissions((prev) => prev.filter((m) => m.id !== mission.id));
        } catch (error) {
            console.error("Error deleting mission:", error);
            alert("Gagal menghapus misi");
        }
    };

    const handleEdit = (mission: CustomMission) => {
        setEditingMission(mission);
        setShowEditor(true);
    };

    const handleCreate = () => {
        setEditingMission(null);
        setShowEditor(true);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header + tombol buat */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Gamepad2 className="w-6 h-6 text-violet-600" />
                        Manajemen Misi Komik
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                        Buat misi komik interaktif sendiri atau kelola misi bawaan sistem
                    </p>
                </div>
                <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 bg-violet-600 text-white px-5 py-2.5 rounded-lg hover:bg-violet-700 transition-colors font-medium shrink-0"
                >
                    <Plus size={18} />
                    Buat Misi Baru
                </button>
            </div>

            {/* ============ MISI DEFAULT ============ */}
            <section>
                <div className="flex items-center gap-2 mb-3">
                    <Lock className="w-4 h-4 text-gray-400" />
                    <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                        Misi Default Sistem
                    </h4>
                    <span className="text-xs text-gray-400">
                        (konten tetap, bisa disembunyikan dari siswa)
                    </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {DEFAULT_MISSIONS.map((mission) => {
                        const isHidden = hiddenDefaults.includes(mission.id);
                        return (
                            <div
                                key={mission.id}
                                className={`bg-white rounded-xl border overflow-hidden shadow-sm transition-opacity ${isHidden ? "opacity-60 border-gray-200" : "border-gray-200"
                                    }`}
                            >
                                <div className="h-28 relative">
                                    <img
                                        src={mission.image}
                                        alt={mission.name}
                                        className="w-full h-full object-cover"
                                    />
                                    <div
                                        className="absolute inset-0"
                                        style={{
                                            background: `linear-gradient(to top, ${mission.color}cc, transparent)`,
                                        }}
                                    />
                                    <span className="absolute bottom-2 left-3 text-white font-bold drop-shadow">
                                        {mission.name}
                                    </span>
                                    {isHidden && (
                                        <span className="absolute top-2 right-2 bg-gray-900/80 text-white text-[10px] font-semibold px-2 py-1 rounded-full flex items-center gap-1">
                                            <EyeOff size={10} /> Disembunyikan
                                        </span>
                                    )}
                                </div>
                                <div className="p-3">
                                    <p className="text-xs text-gray-600 line-clamp-2 mb-3">
                                        {mission.description}
                                    </p>
                                    <button
                                        onClick={() => handleToggleDefault(mission.id)}
                                        className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-colors ${isHidden
                                                ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                            }`}
                                    >
                                        {isHidden ? (
                                            <>
                                                <Eye size={14} /> Tampilkan ke Siswa
                                            </>
                                        ) : (
                                            <>
                                                <EyeOff size={14} /> Sembunyikan dari Siswa
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* ============ MISI BUATAN GURU ============ */}
            <section>
                <div className="flex items-center gap-2 mb-3">
                    <BookOpen className="w-4 h-4 text-violet-500" />
                    <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                        Misi Buatan Saya ({missions.length})
                    </h4>
                </div>

                {missions.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-300">
                        <Gamepad2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-600 mb-4">
                            Anda belum membuat misi komik sendiri
                        </p>
                        <button
                            onClick={handleCreate}
                            className="inline-flex items-center gap-2 bg-violet-600 text-white px-5 py-2.5 rounded-lg hover:bg-violet-700 transition-colors font-medium text-sm"
                        >
                            <Plus size={16} />
                            Buat Misi Pertama
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {missions.map((mission) => (
                            <div
                                key={mission.id}
                                className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                            >
                                {/* Cover */}
                                <div
                                    className="h-28 relative flex items-end p-3"
                                    style={{
                                        background: mission.coverImage
                                            ? `linear-gradient(to top, rgba(0,0,0,0.65), transparent), url(${mission.coverImage}) center/cover`
                                            : `linear-gradient(135deg, ${mission.color}, ${mission.color}99)`,
                                    }}
                                >
                                    <span className="text-white font-bold drop-shadow line-clamp-1">
                                        {mission.title}
                                    </span>
                                    <span
                                        className={`absolute top-2 right-2 text-[10px] font-semibold px-2 py-1 rounded-full flex items-center gap-1 ${mission.status === "published"
                                                ? "bg-emerald-500 text-white"
                                                : "bg-yellow-400 text-yellow-900"
                                            }`}
                                    >
                                        {mission.status === "published" ? (
                                            <>
                                                <Eye size={10} /> Published
                                            </>
                                        ) : (
                                            <>
                                                <EyeOff size={10} /> Draft
                                            </>
                                        )}
                                    </span>
                                </div>

                                <div className="p-3">
                                    <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                                        {mission.description}
                                    </p>
                                    <p className="text-[10px] text-gray-400 mb-3">
                                        {(mission.pages || []).length} halaman • Diperbarui{" "}
                                        {new Date(mission.updatedAt).toLocaleDateString("id-ID")}
                                    </p>

                                    <div className="grid grid-cols-3 gap-1.5">
                                        <button
                                            onClick={() => handleEdit(mission)}
                                            className="flex items-center justify-center gap-1 py-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold transition-colors"
                                        >
                                            <Edit2 size={12} /> Edit
                                        </button>
                                        <button
                                            onClick={() => handleTogglePublish(mission)}
                                            className={`flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-semibold transition-colors ${mission.status === "published"
                                                    ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                                    : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                                }`}
                                        >
                                            {mission.status === "published" ? (
                                                <>
                                                    <EyeOff size={12} /> Unpublish
                                                </>
                                            ) : (
                                                <>
                                                    <Upload size={12} /> Publish
                                                </>
                                            )}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(mission)}
                                            className="flex items-center justify-center gap-1 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 text-xs font-semibold transition-colors"
                                        >
                                            <Trash2 size={12} /> Hapus
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Editor Modal */}
            {showEditor && (
                <MissionEditor
                    guruId={guruId}
                    guruName={guruName}
                    mission={editingMission}
                    onClose={() => {
                        setShowEditor(false);
                        setEditingMission(null);
                    }}
                    onSaved={loadData}
                />
            )}
        </div>
    );
}


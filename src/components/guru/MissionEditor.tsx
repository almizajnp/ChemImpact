import React, { useState } from "react";
import {
    X,
    Plus,
    Trash2,
    ChevronUp,
    ChevronDown,
    BookOpen,
    ListChecks,
    PenLine,
    Lightbulb,
    Eye,
    Save,
    Upload,
    ArrowLeft,
    ArrowRight,
} from "lucide-react";
import {
    CustomMission,
    MissionPage,
    MissionPageType,
    MissionChoice,
    MissionEssay,
} from "../../types/mission";
import {
    createCustomMission,
    updateCustomMission,
    generatePageId,
} from "../../lib/missions";
import ImageUploader from "../ui/ImageUploader";
import DynamicComicStory from "../game/DynamicComicStory";

// ============ MISSION EDITOR (WIZARD) ============
// Editor misi komik untuk guru — 3 langkah:
//   1. Informasi Misi (judul, deskripsi, cover, warna arena)
//   2. Halaman Komik (tambah/edit/hapus/urutkan halaman + upload gambar + soal)
//   3. Preview & Simpan (draft atau publish)

const ARENA_COLORS = [
    "#3498db",
    "#9b59b6",
    "#2ecc71",
    "#e67e22",
    "#e74c3c",
    "#1abc9c",
    "#f1c40f",
    "#34495e",
];

const PAGE_TYPE_INFO: Record<
    MissionPageType,
    { label: string; icon: React.ReactNode; desc: string }
> = {
    comic: {
        label: "Halaman Komik",
        icon: <BookOpen size={16} />,
        desc: "Gambar komik + narasi cerita",
    },
    choice: {
        label: "Pilihan Ganda",
        icon: <ListChecks size={16} />,
        desc: "Soal dengan pilihan jawaban + feedback",
    },
    essay: {
        label: "Esai / Uraian",
        icon: <PenLine size={16} />,
        desc: "Pertanyaan terbuka untuk analisis siswa",
    },
    reflection: {
        label: "Refleksi",
        icon: <Lightbulb size={16} />,
        desc: "Pertanyaan refleksi di akhir pembelajaran",
    },
};

const genChoiceId = () => `ch_${Math.random().toString(36).substring(2, 8)}`;
const genEssayId = () => `es_${Math.random().toString(36).substring(2, 8)}`;

const createEmptyPage = (type: MissionPageType): MissionPage => ({
    id: generatePageId(),
    type,
    image: "",
    title: "",
    description: "",
    choices:
        type === "choice"
            ? [
                { id: genChoiceId(), text: "", isCorrect: true, feedback: "" },
                { id: genChoiceId(), text: "", isCorrect: false, feedback: "" },
            ]
            : [],
    essays:
        type === "essay" || type === "reflection"
            ? [{ id: genEssayId(), question: "", placeholder: "", required: true }]
            : [],
});

interface MissionEditorProps {
    guruId: string;
    guruName: string;
    mission?: CustomMission | null; // null = buat baru, ada = edit
    onClose: () => void;
    onSaved: () => void;
}

export default function MissionEditor({
    guruId,
    guruName,
    mission,
    onClose,
    onSaved,
}: MissionEditorProps) {
    const isEdit = Boolean(mission);
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPreview, setShowPreview] = useState(false);

    // Step 1: Info misi
    const [title, setTitle] = useState(mission?.title || "");
    const [description, setDescription] = useState(mission?.description || "");
    const [coverImage, setCoverImage] = useState(mission?.coverImage || "");
    const [color, setColor] = useState(mission?.color || ARENA_COLORS[0]);

    // Step 2: Halaman
    const [pages, setPages] = useState<MissionPage[]>(mission?.pages || []);
    const [expandedPage, setExpandedPage] = useState<string | null>(null);

    // ---------- Manipulasi halaman ----------
    const addPage = (type: MissionPageType) => {
        const newPage = createEmptyPage(type);
        setPages((prev) => [...prev, newPage]);
        setExpandedPage(newPage.id);
    };

    const updatePage = (pageId: string, updates: Partial<MissionPage>) => {
        setPages((prev) =>
            prev.map((p) => (p.id === pageId ? { ...p, ...updates } : p)),
        );
    };

    const deletePage = (pageId: string) => {
        if (!window.confirm("Hapus halaman ini?")) return;
        setPages((prev) => prev.filter((p) => p.id !== pageId));
    };

    const movePage = (index: number, direction: -1 | 1) => {
        setPages((prev) => {
            const target = index + direction;
            if (target < 0 || target >= prev.length) return prev;
            const next = [...prev];
            [next[index], next[target]] = [next[target], next[index]];
            return next;
        });
    };

    // ---------- Manipulasi pilihan ganda ----------
    const updateChoice = (
        page: MissionPage,
        choiceId: string,
        updates: Partial<MissionChoice>,
    ) => {
        updatePage(page.id, {
            choices: (page.choices || []).map((c) =>
                c.id === choiceId ? { ...c, ...updates } : c,
            ),
        });
    };

    const setCorrectChoice = (page: MissionPage, choiceId: string) => {
        updatePage(page.id, {
            choices: (page.choices || []).map((c) => ({
                ...c,
                isCorrect: c.id === choiceId,
            })),
        });
    };

    const addChoice = (page: MissionPage) => {
        updatePage(page.id, {
            choices: [
                ...(page.choices || []),
                { id: genChoiceId(), text: "", isCorrect: false, feedback: "" },
            ],
        });
    };

    const removeChoice = (page: MissionPage, choiceId: string) => {
        updatePage(page.id, {
            choices: (page.choices || []).filter((c) => c.id !== choiceId),
        });
    };

    // ---------- Manipulasi esai ----------
    const updateEssay = (
        page: MissionPage,
        essayId: string,
        updates: Partial<MissionEssay>,
    ) => {
        updatePage(page.id, {
            essays: (page.essays || []).map((e) =>
                e.id === essayId ? { ...e, ...updates } : e,
            ),
        });
    };

    const addEssay = (page: MissionPage) => {
        updatePage(page.id, {
            essays: [
                ...(page.essays || []),
                { id: genEssayId(), question: "", placeholder: "", required: true },
            ],
        });
    };

    const removeEssay = (page: MissionPage, essayId: string) => {
        updatePage(page.id, {
            essays: (page.essays || []).filter((e) => e.id !== essayId),
        });
    };

    // ---------- Validasi ----------
    const validateStep1 = (): string | null => {
        if (!title.trim()) return "Judul misi wajib diisi.";
        if (!description.trim()) return "Deskripsi misi wajib diisi.";
        return null;
    };

    const validatePages = (): string | null => {
        if (pages.length === 0) return "Misi harus memiliki minimal 1 halaman.";
        for (let i = 0; i < pages.length; i++) {
            const p = pages[i];
            const num = `Halaman ${i + 1}`;
            if (p.type === "comic" && !p.image && !p.description?.trim())
                return `${num} (komik): tambahkan gambar atau narasi.`;
            if (p.type === "choice") {
                if (!p.title?.trim() && !p.description?.trim())
                    return `${num} (pilihan ganda): tulis pertanyaan di judul/narasi.`;
                const choices = p.choices || [];
                if (choices.length < 2)
                    return `${num} (pilihan ganda): minimal 2 pilihan jawaban.`;
                if (choices.some((c) => !c.text.trim()))
                    return `${num} (pilihan ganda): semua pilihan harus diisi teksnya.`;
                if (!choices.some((c) => c.isCorrect))
                    return `${num} (pilihan ganda): tandai satu jawaban benar.`;
            }
            if (
                (p.type === "essay" || p.type === "reflection") &&
                (!p.essays || p.essays.length === 0 ||
                    p.essays.some((e) => !e.question.trim()))
            )
                return `${num} (${p.type === "essay" ? "esai" : "refleksi"}): semua pertanyaan harus diisi.`;
        }
        return null;
    };

    const goToStep = (target: 1 | 2 | 3) => {
        setError(null);
        if (target >= 2) {
            const err = validateStep1();
            if (err) {
                setError(err);
                setStep(1);
                return;
            }
        }
        if (target === 3) {
            const err = validatePages();
            if (err) {
                setError(err);
                setStep(2);
                return;
            }
        }
        setStep(target);
    };

    // ---------- Simpan ----------
    const buildDraftMission = (): CustomMission => ({
        id: mission?.id || "preview",
        title,
        description,
        coverImage,
        color,
        guruId,
        guruName,
        status: mission?.status || "draft",
        pages,
        createdAt: mission?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    });

    const handleSave = async (status: "draft" | "published") => {
        setError(null);
        const err1 = validateStep1();
        if (err1) {
            setError(err1);
            setStep(1);
            return;
        }
        const err2 = validatePages();
        if (err2) {
            setError(err2);
            setStep(2);
            return;
        }

        setSaving(true);
        try {
            if (isEdit && mission) {
                await updateCustomMission(mission.id, {
                    title,
                    description,
                    coverImage,
                    color,
                    pages,
                    status,
                });
            } else {
                await createCustomMission(guruId, guruName, {
                    title,
                    description,
                    coverImage,
                    color,
                    pages,
                    status,
                });
            }
            onSaved();
            onClose();
        } catch (e: any) {
            console.error("Error saving mission:", e);
            setError(e?.message || "Gagal menyimpan misi. Coba lagi.");
        } finally {
            setSaving(false);
        }
    };

    // ---------- Preview mode ----------
    if (showPreview) {
        return (
            <div className="fixed inset-0 z-[100] bg-[#1c2b36] flex flex-col">
                <div className="p-4 flex justify-between items-center bg-[#2c3e50] border-b-4 border-black/20">
                    <h2 className="font-bold text-lg text-white">
                        👁️ PREVIEW: {title || "Misi Baru"}
                    </h2>
                    <button
                        onClick={() => setShowPreview(false)}
                        className="bg-red-500 p-2 rounded-lg border-2 border-red-700 shadow-md active:scale-95 transition-transform"
                    >
                        <X size={20} className="text-white" />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto bg-[#f0f4f8]">
                    <DynamicComicStory
                        mission={buildDraftMission()}
                        onClose={() => setShowPreview(false)}
                        // Preview guru: tidak menyimpan skor/jawaban
                        siswaId={undefined}
                        siswaName="Preview Guru"
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[80] bg-black/50 flex items-center justify-center p-2 md:p-6">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-violet-600 to-purple-700 px-4 md:px-6 py-4 flex justify-between items-center shrink-0">
                    <div>
                        <h2 className="text-lg md:text-xl font-bold text-white">
                            {isEdit ? "✏️ Edit Misi Komik" : "🎮 Buat Misi Komik Baru"}
                        </h2>
                        <p className="text-violet-200 text-xs mt-0.5">
                            Langkah {step} dari 3 —{" "}
                            {step === 1
                                ? "Informasi Misi"
                                : step === 2
                                    ? "Halaman Komik"
                                    : "Preview & Simpan"}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-white" />
                    </button>
                </div>

                {/* Step indicator */}
                <div className="flex border-b border-gray-200 shrink-0">
                    {[1, 2, 3].map((s) => (
                        <button
                            key={s}
                            onClick={() => goToStep(s as 1 | 2 | 3)}
                            className={`flex-1 py-3 text-xs md:text-sm font-semibold transition-colors border-b-2 ${step === s
                                    ? "border-violet-600 text-violet-700 bg-violet-50"
                                    : "border-transparent text-gray-500 hover:text-gray-800"
                                }`}
                        >
                            {s}.{" "}
                            {s === 1 ? "Info Misi" : s === 2 ? "Halaman" : "Preview & Simpan"}
                        </button>
                    ))}
                </div>

                {/* Error banner */}
                {error && (
                    <div className="mx-4 mt-3 bg-red-50 border border-red-300 text-red-700 rounded-lg px-4 py-2 text-sm shrink-0">
                        ❌ {error}
                    </div>
                )}

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6">
                    {/* ============ STEP 1: INFO MISI ============ */}
                    {step === 1 && (
                        <div className="space-y-5 max-w-2xl mx-auto">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Judul Misi <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Contoh: Bahaya Limbah Baterai"
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 text-gray-900"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Deskripsi Misi <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Jelaskan tujuan pembelajaran dan cerita misi ini..."
                                    rows={4}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none text-gray-900"
                                />
                            </div>

                            <ImageUploader
                                label="Gambar Cover / Arena (opsional, tampil di pemilihan misi siswa)"
                                value={coverImage}
                                onChange={setCoverImage}
                                heightClass="h-44"
                            />

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Warna Arena
                                </label>
                                <div className="flex gap-2 flex-wrap">
                                    {ARENA_COLORS.map((c) => (
                                        <button
                                            key={c}
                                            type="button"
                                            onClick={() => setColor(c)}
                                            className={`w-10 h-10 rounded-lg border-2 transition-transform ${color === c
                                                    ? "border-gray-900 scale-110"
                                                    : "border-transparent hover:scale-105"
                                                }`}
                                            style={{ backgroundColor: c }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ============ STEP 2: HALAMAN ============ */}
                    {step === 2 && (
                        <div className="space-y-4">
                            {/* Tombol tambah halaman */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                {(Object.keys(PAGE_TYPE_INFO) as MissionPageType[]).map(
                                    (type) => (
                                        <button
                                            key={type}
                                            onClick={() => addPage(type)}
                                            className="flex flex-col items-center gap-1 p-3 rounded-xl border-2 border-dashed border-gray-300 hover:border-violet-500 hover:bg-violet-50 transition-colors text-gray-700"
                                        >
                                            <span className="flex items-center gap-1.5 text-violet-600 font-semibold text-xs md:text-sm">
                                                <Plus size={14} /> {PAGE_TYPE_INFO[type].icon}{" "}
                                                {PAGE_TYPE_INFO[type].label}
                                            </span>
                                            <span className="text-[10px] md:text-xs text-gray-500 text-center">
                                                {PAGE_TYPE_INFO[type].desc}
                                            </span>
                                        </button>
                                    ),
                                )}
                            </div>

                            {pages.length === 0 ? (
                                <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                                    <BookOpen className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                                    <p className="text-gray-500 text-sm">
                                        Belum ada halaman. Tambahkan halaman komik pertama di atas!
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {pages.map((p, index) => {
                                        const expanded = expandedPage === p.id;
                                        return (
                                            <div
                                                key={p.id}
                                                className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm"
                                            >
                                                {/* Page header row */}
                                                <div
                                                    className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 cursor-pointer hover:bg-gray-100"
                                                    onClick={() =>
                                                        setExpandedPage(expanded ? null : p.id)
                                                    }
                                                >
                                                    <span className="w-7 h-7 rounded-full bg-violet-100 text-violet-700 text-xs font-bold flex items-center justify-center shrink-0">
                                                        {index + 1}
                                                    </span>
                                                    <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-200 px-2 py-1 rounded-md shrink-0">
                                                        {PAGE_TYPE_INFO[p.type].icon}
                                                        {PAGE_TYPE_INFO[p.type].label}
                                                    </span>
                                                    {p.image && (
                                                        <img
                                                            src={p.image}
                                                            alt=""
                                                            className="w-8 h-8 rounded object-cover shrink-0"
                                                        />
                                                    )}
                                                    <span className="text-sm text-gray-600 truncate flex-1">
                                                        {p.title || p.description || "(tanpa judul)"}
                                                    </span>
                                                    <div
                                                        className="flex items-center gap-1 shrink-0"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <button
                                                            onClick={() => movePage(index, -1)}
                                                            disabled={index === 0}
                                                            className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-30 text-gray-600"
                                                            title="Naikkan"
                                                        >
                                                            <ChevronUp size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => movePage(index, 1)}
                                                            disabled={index === pages.length - 1}
                                                            className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-30 text-gray-600"
                                                            title="Turunkan"
                                                        >
                                                            <ChevronDown size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => deletePage(p.id)}
                                                            className="p-1.5 rounded hover:bg-red-100 text-red-500"
                                                            title="Hapus halaman"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Page detail editor */}
                                                {expanded && (
                                                    <div className="p-4 space-y-4 border-t border-gray-100">
                                                        <ImageUploader
                                                            label={
                                                                p.type === "comic"
                                                                    ? "Gambar Komik"
                                                                    : "Gambar Pendukung (opsional)"
                                                            }
                                                            value={p.image}
                                                            onChange={(url) =>
                                                                updatePage(p.id, { image: url })
                                                            }
                                                            heightClass="h-40"
                                                        />

                                                        <div className="grid md:grid-cols-2 gap-3">
                                                            <div>
                                                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                                                    {p.type === "choice"
                                                                        ? "Pertanyaan / Judul"
                                                                        : "Judul Halaman"}
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    value={p.title || ""}
                                                                    onChange={(e) =>
                                                                        updatePage(p.id, { title: e.target.value })
                                                                    }
                                                                    placeholder={
                                                                        p.type === "choice"
                                                                            ? "Tulis pertanyaannya..."
                                                                            : "Judul (opsional)"
                                                                    }
                                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                                                    Narasi / Deskripsi
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    value={p.description || ""}
                                                                    onChange={(e) =>
                                                                        updatePage(p.id, {
                                                                            description: e.target.value,
                                                                        })
                                                                    }
                                                                    placeholder="Teks cerita atau konteks soal..."
                                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500"
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* Editor pilihan ganda */}
                                                        {p.type === "choice" && (
                                                            <div className="space-y-2">
                                                                <p className="text-xs font-semibold text-gray-700">
                                                                    Pilihan Jawaban (klik lingkaran untuk
                                                                    menandai jawaban benar)
                                                                </p>
                                                                {(p.choices || []).map((choice, cIdx) => (
                                                                    <div
                                                                        key={choice.id}
                                                                        className={`rounded-lg border p-3 space-y-2 ${choice.isCorrect
                                                                                ? "border-green-400 bg-green-50"
                                                                                : "border-gray-200 bg-gray-50"
                                                                            }`}
                                                                    >
                                                                        <div className="flex items-center gap-2">
                                                                            <button
                                                                                type="button"
                                                                                onClick={() =>
                                                                                    setCorrectChoice(p, choice.id)
                                                                                }
                                                                                title="Tandai sebagai jawaban benar"
                                                                                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 text-xs font-bold transition-colors ${choice.isCorrect
                                                                                        ? "border-green-500 bg-green-500 text-white"
                                                                                        : "border-gray-400 bg-white text-transparent hover:border-green-500"
                                                                                    }`}
                                                                            >
                                                                                ✓
                                                                            </button>
                                                                            <span className="text-xs font-bold text-gray-500 shrink-0">
                                                                                {String.fromCharCode(65 + cIdx)}.
                                                                            </span>
                                                                            <input
                                                                                type="text"
                                                                                value={choice.text}
                                                                                onChange={(e) =>
                                                                                    updateChoice(p, choice.id, {
                                                                                        text: e.target.value,
                                                                                    })
                                                                                }
                                                                                placeholder="Teks pilihan jawaban..."
                                                                                className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                                                                            />
                                                                            <button
                                                                                onClick={() =>
                                                                                    removeChoice(p, choice.id)
                                                                                }
                                                                                disabled={(p.choices || []).length <= 2}
                                                                                className="p-1.5 rounded hover:bg-red-100 text-red-500 disabled:opacity-30 shrink-0"
                                                                            >
                                                                                <Trash2 size={14} />
                                                                            </button>
                                                                        </div>
                                                                        <input
                                                                            type="text"
                                                                            value={choice.feedback}
                                                                            onChange={(e) =>
                                                                                updateChoice(p, choice.id, {
                                                                                    feedback: e.target.value,
                                                                                })
                                                                            }
                                                                            placeholder="Umpan balik saat siswa memilih jawaban ini..."
                                                                            className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                                                                        />
                                                                    </div>
                                                                ))}
                                                                <button
                                                                    onClick={() => addChoice(p)}
                                                                    className="flex items-center gap-1 text-xs font-semibold text-violet-600 hover:text-violet-800 px-2 py-1"
                                                                >
                                                                    <Plus size={14} /> Tambah Pilihan
                                                                </button>
                                                            </div>
                                                        )}

                                                        {/* Editor esai/refleksi */}
                                                        {(p.type === "essay" ||
                                                            p.type === "reflection") && (
                                                                <div className="space-y-2">
                                                                    <p className="text-xs font-semibold text-gray-700">
                                                                        Daftar Pertanyaan
                                                                    </p>
                                                                    {(p.essays || []).map((essay, eIdx) => (
                                                                        <div
                                                                            key={essay.id}
                                                                            className="rounded-lg border border-gray-200 bg-gray-50 p-3 space-y-2"
                                                                        >
                                                                            <div className="flex items-center gap-2">
                                                                                <span className="text-xs font-bold text-gray-500 shrink-0">
                                                                                    {eIdx + 1}.
                                                                                </span>
                                                                                <input
                                                                                    type="text"
                                                                                    value={essay.question}
                                                                                    onChange={(e) =>
                                                                                        updateEssay(p, essay.id, {
                                                                                            question: e.target.value,
                                                                                        })
                                                                                    }
                                                                                    placeholder="Tulis pertanyaan..."
                                                                                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                                                                                />
                                                                                <label className="flex items-center gap-1 text-xs text-gray-600 shrink-0 cursor-pointer">
                                                                                    <input
                                                                                        type="checkbox"
                                                                                        checked={essay.required !== false}
                                                                                        onChange={(e) =>
                                                                                            updateEssay(p, essay.id, {
                                                                                                required: e.target.checked,
                                                                                            })
                                                                                        }
                                                                                        className="accent-violet-600"
                                                                                    />
                                                                                    Wajib
                                                                                </label>
                                                                                <button
                                                                                    onClick={() =>
                                                                                        removeEssay(p, essay.id)
                                                                                    }
                                                                                    disabled={(p.essays || []).length <= 1}
                                                                                    className="p-1.5 rounded hover:bg-red-100 text-red-500 disabled:opacity-30 shrink-0"
                                                                                >
                                                                                    <Trash2 size={14} />
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                    <button
                                                                        onClick={() => addEssay(p)}
                                                                        className="flex items-center gap-1 text-xs font-semibold text-violet-600 hover:text-violet-800 px-2 py-1"
                                                                    >
                                                                        <Plus size={14} /> Tambah Pertanyaan
                                                                    </button>
                                                                </div>
                                                            )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ============ STEP 3: PREVIEW & SIMPAN ============ */}
                    {step === 3 && (
                        <div className="max-w-2xl mx-auto space-y-5">
                            {/* Ringkasan misi */}
                            <div className="rounded-2xl border border-gray-200 overflow-hidden">
                                <div
                                    className="h-32 flex items-end p-4"
                                    style={{
                                        background: coverImage
                                            ? `linear-gradient(to top, rgba(0,0,0,0.6), transparent), url(${coverImage}) center/cover`
                                            : `linear-gradient(135deg, ${color}, ${color}99)`,
                                    }}
                                >
                                    <h3 className="text-xl font-bold text-white drop-shadow">
                                        {title}
                                    </h3>
                                </div>
                                <div className="p-4">
                                    <p className="text-sm text-gray-700 mb-3">{description}</p>
                                    <div className="grid grid-cols-4 gap-2 text-center">
                                        {(
                                            [
                                                ["comic", "Komik"],
                                                ["choice", "Pilihan Ganda"],
                                                ["essay", "Esai"],
                                                ["reflection", "Refleksi"],
                                            ] as const
                                        ).map(([type, label]) => (
                                            <div key={type} className="bg-gray-50 rounded-lg p-2">
                                                <p className="text-lg font-bold text-violet-600">
                                                    {pages.filter((p) => p.type === type).length}
                                                </p>
                                                <p className="text-[10px] text-gray-500">{label}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => setShowPreview(true)}
                                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-violet-300 text-violet-700 font-semibold hover:bg-violet-50 transition-colors"
                            >
                                <Eye size={18} /> Coba Mainkan (Preview)
                            </button>

                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => handleSave("draft")}
                                    disabled={saving}
                                    className="flex items-center justify-center gap-2 py-3 rounded-xl bg-gray-700 text-white font-semibold hover:bg-gray-800 disabled:bg-gray-400 transition-colors"
                                >
                                    <Save size={18} />
                                    {saving ? "Menyimpan..." : "Simpan Draft"}
                                </button>
                                <button
                                    onClick={() => handleSave("published")}
                                    disabled={saving}
                                    className="flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 disabled:bg-gray-400 transition-colors"
                                >
                                    <Upload size={18} />
                                    {saving ? "Menyimpan..." : "Simpan & Publish"}
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 text-center">
                                Draft hanya terlihat oleh Anda. Misi yang di-publish akan
                                langsung muncul di halaman Battle siswa.
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer navigation */}
                <div className="px-4 md:px-6 py-3 border-t border-gray-200 flex justify-between items-center shrink-0 bg-gray-50">
                    <button
                        onClick={() => goToStep((step - 1) as 1 | 2 | 3)}
                        disabled={step === 1}
                        className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-200 disabled:opacity-40 transition-colors"
                    >
                        <ArrowLeft size={16} /> Sebelumnya
                    </button>
                    <span className="text-xs text-gray-400">
                        {pages.length} halaman dibuat
                    </span>
                    {step < 3 ? (
                        <button
                            onClick={() => goToStep((step + 1) as 1 | 2 | 3)}
                            className="flex items-center gap-1 px-5 py-2 rounded-lg text-sm font-semibold bg-violet-600 text-white hover:bg-violet-700 transition-colors"
                        >
                            Selanjutnya <ArrowRight size={16} />
                        </button>
                    ) : (
                        <span className="w-28" />
                    )}
                </div>
            </div>
        </div>
    );
}


// ============ CUSTOM MISSION TYPES ============
// Tipe data untuk fitur CRUD Misi Komik oleh guru.
// Gambar disimpan di Cloudinary (hanya URL), data misi di Realtime Database.

export interface MissionChoice {
    id: string;
    text: string;
    isCorrect: boolean;
    feedback: string; // umpan balik yang muncul setelah siswa memilih
}

export interface MissionEssay {
    id: string;
    question: string;
    placeholder?: string;
    required?: boolean;
}

export type MissionPageType = "comic" | "choice" | "essay" | "reflection";

export interface MissionPage {
    id: string;
    type: MissionPageType;
    image?: string; // URL gambar dari Cloudinary
    title?: string;
    description?: string;
    choices?: MissionChoice[]; // untuk type "choice"
    essays?: MissionEssay[]; // untuk type "essay" dan "reflection"
}

export interface CustomMission {
    id: string;
    title: string;
    description: string;
    coverImage?: string; // URL gambar arena/cover dari Cloudinary
    color: string; // warna arena di BattleTab
    guruId: string;
    guruName: string;
    status: "draft" | "published";
    pages: MissionPage[];
    createdAt: string;
    updatedAt: string;
}

// Pengaturan misi per guru (menyembunyikan misi default)
export interface MissionSettings {
    hiddenDefaults?: Record<number, boolean>; // { 1: true } = misi default 1 disembunyikan
}

// Entri arena yang ditampilkan di BattleTab siswa
// (gabungan misi default + misi custom yang published)
export interface ArenaMission {
    id: number | string; // number = misi default (1-3), string = id misi custom
    name: string;
    image: string;
    color: string;
    source: "default" | "custom";
    customMission?: CustomMission; // hanya terisi jika source === "custom"
}


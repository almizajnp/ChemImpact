// ============ CUSTOM MISSION CRUD (Realtime Database) ============
// Node baru di Realtime Database — TIDAK mengubah node/sistem yang sudah ada:
//   customMissions/{missionId}        -> data misi buatan guru
//   missionSettings/{guruId}/hiddenDefaults/{defaultId} -> misi default yang disembunyikan
//
// Gambar TIDAK disimpan di sini — hanya URL Cloudinary (lihat lib/cloudinary.ts).

import { ref, get, set, update, remove } from "firebase/database";
import { db } from "../config/firebase";
import { CustomMission, MissionPage } from "../types/mission";

const genMissionId = (): string =>
    `cm_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

export const generatePageId = (): string =>
    `pg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

// ---------- CRUD Misi Custom ----------

export const createCustomMission = async (
    guruId: string,
    guruName: string,
    data: {
        title: string;
        description: string;
        coverImage?: string;
        color?: string;
        pages: MissionPage[];
        status?: "draft" | "published";
    },
): Promise<CustomMission> => {
    const id = genMissionId();
    const now = new Date().toISOString();
    const mission: CustomMission = {
        id,
        title: data.title,
        description: data.description,
        coverImage: data.coverImage || "",
        color: data.color || "#3498db",
        guruId,
        guruName,
        status: data.status || "draft",
        pages: data.pages,
        createdAt: now,
        updatedAt: now,
    };
    await set(ref(db, `customMissions/${id}`), mission);
    console.log(`✅ Custom mission created: ${id}`);
    return mission;
};

export const updateCustomMission = async (
    missionId: string,
    updates: Partial<CustomMission>,
): Promise<void> => {
    await update(ref(db, `customMissions/${missionId}`), {
        ...updates,
        updatedAt: new Date().toISOString(),
    });
    console.log(`✅ Custom mission updated: ${missionId}`);
};

export const deleteCustomMission = async (
    missionId: string,
): Promise<void> => {
    await remove(ref(db, `customMissions/${missionId}`));
    console.log(`🗑️ Custom mission deleted: ${missionId}`);
};

export const getCustomMission = async (
    missionId: string,
): Promise<CustomMission | null> => {
    const snapshot = await get(ref(db, `customMissions/${missionId}`));
    if (!snapshot.exists()) return null;
    return normalizeMission(snapshot.val());
};

/** Semua misi milik seorang guru (draft + published) — untuk dashboard guru. */
export const getGuruMissions = async (
    guruId: string,
): Promise<CustomMission[]> => {
    const snapshot = await get(ref(db, "customMissions"));
    if (!snapshot.exists()) return [];
    const all = Object.values(snapshot.val() as Record<string, CustomMission>);
    return all
        .filter((m) => m.guruId === guruId)
        .map(normalizeMission)
        .sort(
            (a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
};

/** Misi published milik seorang guru — untuk ditampilkan ke siswa. */
export const getPublishedMissionsByGuru = async (
    guruId: string,
): Promise<CustomMission[]> => {
    const missions = await getGuruMissions(guruId);
    return missions.filter((m) => m.status === "published");
};

// Firebase menghilangkan array kosong — pastikan struktur selalu lengkap
const normalizeMission = (m: CustomMission): CustomMission => ({
    ...m,
    pages: (m.pages || []).map((p) => ({
        ...p,
        choices: p.choices || [],
        essays: p.essays || [],
    })),
});

// ---------- Pengaturan Misi Default (hide/show per guru) ----------

/** Daftar id misi default (1-3) yang disembunyikan oleh guru. */
export const getHiddenDefaultMissions = async (
    guruId: string,
): Promise<number[]> => {
    try {
        const snapshot = await get(
            ref(db, `missionSettings/${guruId}/hiddenDefaults`),
        );
        if (!snapshot.exists()) return [];
        const data = snapshot.val() as Record<string, boolean>;
        return Object.entries(data)
            .filter(([, hidden]) => hidden === true)
            .map(([id]) => parseInt(id, 10));
    } catch (error) {
        console.error("Error getting hidden default missions:", error);
        return [];
    }
};

/** Sembunyikan / tampilkan kembali sebuah misi default untuk guru tertentu. */
export const setDefaultMissionHidden = async (
    guruId: string,
    defaultMissionId: number,
    hidden: boolean,
): Promise<void> => {
    await set(
        ref(db, `missionSettings/${guruId}/hiddenDefaults/${defaultMissionId}`),
        hidden,
    );
    console.log(
        `✅ Default mission ${defaultMissionId} ${hidden ? "hidden" : "shown"} for guru ${guruId}`,
    );
};


// ============ REGISTRY MISI DEFAULT ============
// 3 misi komik bawaan sistem (hardcoded component) — web langsung bisa dipakai
// tanpa setup. Guru dapat menyembunyikan misi-misi ini dari dashboard
// (tersimpan di missionSettings/{guruId}/hiddenDefaults).

export interface DefaultMissionMeta {
    id: 1 | 2 | 3;
    name: string;
    battleTitle: string; // judul yang tampil di header battle mode
    image: string;
    color: string;
    description: string;
}

export const DEFAULT_MISSIONS: DefaultMissionMeta[] = [
    {
        id: 1,
        name: "Sungai Berbusa",
        battleTitle: "MISSION: SAVE THE RIVER",
        image: "/images/c1.png",
        color: "#3498db",
        description:
            "Petualangan edukasi limbah deterjen — jelajahi dampak pencemaran air terhadap ekosistem.",
    },
    {
        id: 2,
        name: "Pencemaran Plastik",
        battleTitle: "MISSION: PENCEMARAN PLASTIK",
        image: "/images/c2.png",
        color: "#9b59b6",
        description:
            "Misi komik interaktif tentang bahaya sampah plastik bagi lingkungan.",
    },
    {
        id: 3,
        name: "Polusi Udara",
        battleTitle: "MISSION: POLUSI UDARA",
        image: "/images/c3.png",
        color: "#2ecc71",
        description:
            "Misi komik interaktif tentang polusi udara dan dampaknya bagi kesehatan.",
    },
];


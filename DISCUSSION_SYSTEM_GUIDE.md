# ChemImpact Discussion System - Panduan Lengkap

## Ringkasan Perbaikan

Sistem diskusi telah diperbaiki sehingga guru dapat membuat diskusi dan siswa dapat melihat serta berkomentar secara real-time.

---

## 🔄 Alur Lengkap

### **GURU - Membuat Diskusi**

1. Guru login → Pilih Kelas (dari StudentClasses atau GuruDashboard)
2. Klik ke ClassDetail → Tab "💬 Diskusi"
3. Klik tombol "Buat Diskusi"
4. Isi:
   - Judul diskusi
   - Deskripsi / Studi kasus
   - Link Embed (opsional): YouTube, gambar, artikel, atau website
5. Klik "Buat & Publikasikan"
6. ✅ Diskusi langsung tersimpan dan dipublikasikan

### **SISWA - Melihat & Berkomentar**

1. Siswa login → Lihat Kelas Saya (StudentClasses)
2. Klik pada kartu kelas untuk membuka ClassDetail
3. Pilih tab "💬 Diskusi"
4. Pilih topik diskusi dari sidebar kiri
5. Lihat deskripsi dan embed (jika ada)
6. Scroll ke bawah → Input box "Berikan Komentar Anda"
7. Tulis komentar → Klik "Kirim"
8. ✅ Komentar tampil di discussion thread

### **GURU - Manage Diskusi**

1. Di ClassDetail tab "Diskusi", hover mouse ke nama topik
2. Tombol aksi muncul:
   - **Publish/Unpublish**: Kontrol visibility diskusi
   - **Hapus**: Menghapus diskusi beserta semua komentar

---

## 📊 Struktur Database

### Path: `discussionTopics/{classId}/{topicId}`

```
{
  id: string,
  classId: string,
  title: string,
  description: string,
  optionalEmbedLink?: string,
  embedType?: "youtube" | "image" | "article" | "website",
  status: "draft" | "published",        // PENTING!
  createdBy: string,      // userId guru
  createdByName: string,
  createdAt: string,
  commentCount: number,
  lastActivityAt: string
}
```

### Path: `discussionTopics/{classId}/{topicId}/comments/{commentId}`

```
{
  id: string,
  topicId: string,
  classId: string,
  text: string,
  siswaId: string,        // userId siswa
  siswaName: string,
  role: "teacher" | "student",
  createdAt: string
}
```

### Path: `discussionTopics/{classId}/{topicId}/comments/{commentId}/replies/{replyId}`

```
{
  id: string,
  commentId: string,
  topicId: string,
  classId: string,
  text: string,
  siswaId: string,        // userId user (guru atau siswa)
  userName: string,
  role: "teacher" | "student",
  createdAt: string
}
```

---

## 🔐 Kontrol Akses

| Fitur                 | Guru                      | Siswa                 |
| --------------------- | ------------------------- | --------------------- |
| **Lihat diskusi**     | Semua (draft + published) | Hanya published       |
| **Buat diskusi**      | ✅ Ya                     | ❌ Tidak              |
| **Publish/Unpublish** | ✅ Ya                     | ❌ Tidak              |
| **Hapus diskusi**     | ✅ Ya                     | ❌ Tidak              |
| **Komentar**          | ✅ Ya                     | ✅ Hanya di published |
| **Balas komentar**    | ✅ Ya                     | ✅ Hanya di published |
| **Hapus komentar**    | ✅ Ya (milik orang lain)  | ❌ Tidak              |

---

## 🔑 Fitur Utama

### 1. **Auto-Publish**

Ketika guru membuat diskusi, status otomatis menjadi "published" sehingga siswa bisa langsung melihat tanpa perlu guru manually publish.

### 2. **Real-time Updates**

Menggunakan Firebase `onValue()` listener, semua perubahan diskusi, komentar, dan reply tampil secara real-time tanpa perlu refresh.

### 3. **Embed Content**

Guru bisa menambahkan link:

- 🎥 **YouTube**: Akan ditampilkan sebagai embedded video
- 📷 **Gambar**: Tampil sebagai image preview
- 📄 **Artikel**: Tampil link ke artikel eksternal
- 🌐 **Website**: Tampil link ke website

### 4. **Comment Hierarchy**

```
Discussion Topic
├── Comment 1
│   ├── Reply 1
│   ├── Reply 2
│   └── Reply 3
├── Comment 2
│   ├── Reply 1
│   └── Reply 2
└── Comment 3
```

---

## 🛠️ File yang Diubah

### 1. **ClassDetail.tsx**

- Ganti `ClassDiscussionTab` + `DiscussionCard` dengan `SocialTab`
- Hapus state untuk `discussions` (tidak perlu)
- Update import untuk menggunakan sistem baru

### 2. **SocialTab.tsx**

- ✨ **Tambah**: UI untuk membuat diskusi (hanya untuk guru)
- ✨ **Tambah**: Button Publish/Unpublish (hover effect)
- ✨ **Tambah**: Button Hapus diskusi
- ✨ **Tambah**: Auto-publish setelah create
- Pertahankan: Comment & reply functionality
- Pertahankan: Embed preview untuk YouTube, image, dll

### 3. **StudentDashboard.tsx**

- ❌ Hapus: SocialTab (tidak ada classId context di sini)
- Catatan: SocialTab hanya digunakan di ClassDetail yang memiliki classId

---

## 🧪 Testing Checklist

- [ ] Guru bisa membuat diskusi dari ClassDetail
- [ ] Diskusi langsung muncul dengan status "published"
- [ ] Siswa melihat diskusi yang published di ClassDetail
- [ ] Siswa tidak melihat diskusi draft
- [ ] Siswa bisa menambah komentar
- [ ] Siswa bisa reply ke komentar
- [ ] Guru bisa melihat komentar dan reply
- [ ] Guru bisa publish/unpublish diskusi
- [ ] Guru bisa hapus diskusi
- [ ] Embed YouTube ditampilkan dengan benar
- [ ] Embed gambar ditampilkan dengan benar

---

## 📝 Catatan Penting

1. **Tidak ada lagi ClassDiscussionTab**: Semua diskusi kelas ada di ClassDetail via SocialTab
2. **GuruDashboard masih ada**: Guru bisa manage diskusi dari dua tempat:
   - GuruDashboard → Tab "Diskusi" (untuk manage semua diskusi di kelas)
   - ClassDetail → Tab "Diskusi" (untuk melihat diskusi dengan context kelas)
3. **Auto-publish**: Diskusi otomatis published saat dibuat, tidak perlu manual action
4. **Real-time**: Semua update langsung terlihat tanpa refresh

---

## 🐛 Troubleshooting

**Q: Siswa tidak bisa melihat diskusi yang guru buat**

- A: Pastikan diskusi status "published" (not "draft")

**Q: Komentar tidak muncul**

- A: Refresh halaman, atau check browser console untuk error
- A: Pastikan siswa sudah bergabung dengan kelas

**Q: Embed tidak muncul**

- A: Pastikan URL valid (YouTube, gambar, atau website)
- A: Check console untuk pesan detectEmbedType

---

Generated: April 21, 2026
System: ChemImpact Educational Platform

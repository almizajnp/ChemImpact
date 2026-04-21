# ChemImpact - Pre-Push Checklist Report

**Date**: April 21, 2026  
**Status**: ⚠️ PERLU DIPERBAIKI SEBELUM PUSH

---

## 📋 CHECKLIST HASIL AUDIT

### 1. ✅ Struktur Project

- ✅ File penting tersedia: package.json, src/, public/, tsconfig.json, vite.config.ts
- ✅ .gitignore sudah benar (node_modules, dist, build, .env\*)
- ⚠️ **dist/** folder ada di repo (seharusnya di .gitignore sudah tercakup)

**Status**: OK

---

### 2. 🔴 CRITICAL: Security Issue - Exposed Firebase Config

**MASALAH**: Firebase API key dan config hardcoded di `src/config/firebase.ts`

```typescript
const firebaseConfig = {
  apiKey: "AIzaSyCGGQuFFpy1niUq6pSS7-hUeILLEYhQFjY", // ❌ EXPOSED
  authDomain: "chemimpact-9c995.firebaseapp.com",
  projectId: "chemimpact-9c995",
  storageBucket: "chemimpact-9c995.firebasestorage.app",
  messagingSenderId: "641738771422",
  appId: "1:641738771422:web:c6756807ddce8c37abeb4f",
  measurementId: "G-5JXDLS42EY",
  databaseURL:
    "https://chemimpact-9c995-default-rtdb.asia-southeast1.firebasedatabase.app",
};
```

**SOLUSI**:

1. Move config ke `.env.local` (jangan push)
2. Update `firebase.ts` untuk membaca dari environment variables
3. Create `.env.example` dengan template

**URGENCY**: 🔴 CRITICAL - HARUS DIPERBAIKI SEBELUM PUSH

---

### 3. 🔴 Missing Route & Navigation

**MASALAH**: `StudentClasses.tsx` component ada tapi tidak di-route di `App.tsx`

- Navigation di `StudentDashboard.tsx` line 165: `navigate("/student-classes")`
- Route tidak ada di `App.tsx`
- Component `StudentClasses` tersedia tapi tidak accessible

**SOLUSI**: Tambahkan route ke `App.tsx`:

```typescript
<Route
  path="/student-classes"
  element={
    <ProtectedRoute requiredRole="siswa">
      <StudentClasses />
    </ProtectedRoute>
  }
/>
```

**URGENCY**: 🔴 HIGH - Akan error saat user klik "Gabung Kelas"

---

### 4. 🟡 TypeScript Errors (Lint)

**MASALAH**: 4 TypeScript errors di `src/components/tabs/DeckTab.tsx` (lines 216, 257, 315, 403)

```
Type '(el: HTMLElement) => HTMLElement' is not assignable to type 'Ref<HTMLElement>'
```

Error pada ref assignment pattern:

```typescript
ref={(el) => (sectionRefs.current[0] = el)}  // ❌ Returns HTMLElement
ref={(el) => (el ? (sectionRefs.current[0] = el) : null)}  // ✅ Returns void
```

**SOLUSI**: Fix refs di DeckTab.tsx untuk return void instead of element

**URGENCY**: 🟡 MEDIUM - Tidak prevent build tapi TypeScript warning

---

### 5. 📦 Dependencies

**Status**: ✅ SEMUA TERCANTUM DI package.json

Installed packages:

- ✅ React 19.0.0
- ✅ React Router 7.14.1
- ✅ Firebase 12.12.0
- ✅ Tailwind CSS 4.1.14
- ✅ Vite 6.2.0
- ✅ TypeScript 5.8.2
- ✅ Motion/Framer Motion 12.23.24
- ✅ Lucide React icons

**Status**: OK

---

### 6. 🟡 Environment Variables (.env.example)

**MASALAH**: `.env.example` hanya berisi Gemini config, tapi project butuh Firebase config

```ini
# Current .env.example (INCOMPLETE)
GEMINI_API_KEY="MY_GEMINI_API_KEY"
APP_URL="MY_APP_URL"
```

**SOLUSI**: Update `.env.example` dengan Firebase template:

```ini
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_DATABASE_URL=your_database_url

# Optional
VITE_GEMINI_API_KEY=your_gemini_key_here
VITE_APP_URL=http://localhost:3001
```

**URGENCY**: 🟡 HIGH - Orang lain tidak bisa setup project dengan benar

---

### 7. 📄 README.md

**MASALAH**: README masih template dari Google AI Studio, bukan untuk ChemImpact

Current content:

- ❌ "Run and deploy your AI Studio app"
- ❌ "View your app in AI Studio: https://ai.studio/apps/..."
- ❌ Instruksi untuk GEMINI_API_KEY, tidak mention Firebase

**SOLUSI**: Update README dengan:

1. Project description: ChemImpact - Environmental Education Game
2. Tech stack
3. Installation steps dengan Firebase setup
4. Available features
5. Running locally
6. Contributing guidelines

**URGENCY**: 🟡 MEDIUM - Pengguna butuh context tentang project

---

### 8. 🟡 Console Logs & Debugging

**STATUS**: Banyak console.logs (30+ instances), terutama di:

- `src/context/AuthContext.tsx` (12+ console logs)
- `src/App.tsx` (4+ console logs)
- `src/components/tabs/SocialTab.tsx` (error logs)
- Various info logs dengan emoji

**RECOMMENDATION**:

- ✅ Keep console.error (production error tracking)
- ✅ Keep console.warn (important warnings)
- ⚠️ Remove/comment console.log dengan info debug
- ⚠️ Wrap debug logs dengan `if (import.meta.env.DEV)`

**URGENCY**: 🟢 LOW - Won't break functionality, but cleaner for production

---

### 9. 🟡 Build Warnings

**Build Output**:

```
(!) Some chunks are larger than 500 kB after minification
```

Recommendation:

- Consider code-splitting untuk components yang jarang dipakai
- Use dynamic imports untuk lazy-load routes

**URGENCY**: 🟢 LOW - Project berjalan, tapi performance optimization

---

### 10. ✅ Leaderboard Feature

**Status**: ✅ BERFUNGSI

- ✅ Component `LeaderboardTab.tsx` ada
- ✅ Real-time subscription di `firestore.ts`
- ✅ Integrated ke StudentDashboard
- ✅ Responsive design
- ✅ Trophy icon di navigation

**Note**: Current version menampilkan global leaderboard

---

### 11. ✅ Build Test

```
✓ 2123 modules transformed
✓ built in 4.62s
```

- ✅ Build berhasil
- ✅ No fatal errors
- ⚠️ TypeScript lint errors (4 di DeckTab.tsx)

---

### 12. ✅ Routing & Navigation

Tested routes:

- ✅ `/login` - Public
- ✅ `/register` - Public
- ✅ `/` - Protected (routes ke dashboard based on role)
- ✅ `/student` - Protected untuk siswa
- ✅ `/guru` - Protected untuk guru
- ✅ `/class/:classId` - Class detail view
- 🔴 `/student-classes` - MISSING ROUTE (critical)

---

## 🎯 SUMMARY

| Area                               | Status      | Priority |
| ---------------------------------- | ----------- | -------- |
| Security - Exposed Firebase Config | 🔴 CRITICAL | URGENT   |
| Missing Route (/student-classes)   | 🔴 HIGH     | URGENT   |
| TypeScript Errors (DeckTab)        | 🟡 MEDIUM   | HIGH     |
| .env.example incomplete            | 🟡 MEDIUM   | HIGH     |
| README outdated                    | 🟡 MEDIUM   | MEDIUM   |
| Console logs                       | 🟢 LOW      | LOW      |
| Build warnings (chunk size)        | 🟢 LOW      | LOW      |

---

## ✅ YANG SUDAH OK

- ✅ Dependencies tercantum lengkap
- ✅ Gitignore benar
- ✅ Build berhasil
- ✅ Leaderboard feature working
- ✅ Main routing structure good
- ✅ Project structure clean

---

## 📋 ACTION ITEMS SEBELUM PUSH KE GITHUB

### CRITICAL (HARUS dilakukan):

1. **[ ] Pindahkan Firebase config ke .env.local**
   - Move firebase.ts config ke environment variables
   - Update `.env.example` dengan template
   - Pastikan .gitignore block .env files

2. **[ ] Tambahkan missing route `/student-classes`**
   - Add route ke App.tsx
   - Test navigation dari StudentDashboard

3. **[ ] Fix TypeScript errors di DeckTab.tsx**
   - Fix 4 ref assignment errors
   - Run `npm run lint` sampai 0 errors

### HIGH (Sangat penting):

4. **[ ] Update README.md**
   - Deskripsi project ChemImpact
   - Install instructions dengan Firebase setup
   - Feature list
   - Running locally section

### MEDIUM (Penting):

5. **[ ] Minimize console.logs**
   - Remove debug logs yang tidak perlu
   - Wrap dev-only logs dengan `import.meta.env.DEV`

6. **[ ] Add .env.local to .gitignore**
   - Verify `!.env.example` pattern exists

### LOW (Nice to have):

7. **[ ] Consider code-splitting**
   - Address build chunk size warning
   - Lazy load routes kalau perlu

---

## 🚀 FINAL CHECKLIST BEFORE PUSH

```
[ ] Firebase config moved to .env
[ ] .env.example updated dengan Firebase template
[ ] /student-classes route added
[ ] DeckTab TypeScript errors fixed
[ ] npm run lint returns 0 errors
[ ] npm run build succeeds
[ ] README.md updated
[ ] Console.logs cleaned up
[ ] .gitignore correct
[ ] All routes tested
[ ] Leaderboard feature verified
[ ] Ready for production
```

---

## 📌 RECOMMENDATIONS

1. **Pre-commit hook**: Add husky untuk run lint sebelum commit
2. **Production vs Development**: Setup separate .env files
3. **Error tracking**: Consider Sentry untuk production errors
4. **API Documentation**: Document Firebase schema
5. **Testing**: Add unit tests sebelum scale

---

**CONCLUSION**:

- ❌ **NOT READY TO PUSH** - Ada 3 critical issues yang perlu diperbaiki
- ⏱️ **Estimated fix time**: 30-45 minutes untuk fix semua issues
- 📅 **Next step**: Fix critical items dan retest sebelum push

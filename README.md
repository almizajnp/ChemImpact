# 🌍 ChemImpact - Environmental Education Game

**ChemImpact** is an interactive educational platform designed to teach environmental chemistry through gamified learning experiences. Students engage in missions, discussions, and friendly competitions to learn about environmental impact.

## ✨ Features

- 🎮 **Interactive Missions**: Comic-based story-driven battles and decision simulations
- 💬 **Discussion Forum**: Class-based discussion topics with real-time comments and replies
- 📊 **Leaderboard**: Real-time student rankings by score (class and global views)
- 👥 **Role-Based Access**: Separate interfaces for students (siswa) and teachers (guru)
- 📱 **Responsive Design**: Works seamlessly on mobile and desktop
- 🎨 **Customizable Themes**: Multiple color themes for personalization
- 🔐 **Secure Authentication**: Firebase-powered user authentication

## 🛠 Tech Stack

- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS 4
- **Routing**: React Router v7
- **State Management**: React Hooks
- **Animation**: Motion (Framer Motion)
- **Icons**: Lucide React
- **Backend/Database**: Firebase (Authentication + Realtime Database)
- **Build Tool**: Vite 6

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Firebase project (create at https://console.firebase.google.com/)

## 🚀 Installation & Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd ChemImpact
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure Firebase

1. Create a `.env.local` file in the project root (copy from `.env.example`)
2. Go to [Firebase Console](https://console.firebase.google.com/)
3. Select your project
4. Get your Firebase credentials from Project Settings
5. Fill in the `.env.local` file with your Firebase configuration:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
VITE_FIREBASE_DATABASE_URL=your_database_url
```

### 4. Run the development server

```bash
npm run dev
```

The app will be available at `http://localhost:3001`

## 🎯 Default Test Accounts

**Teacher (Guru)**

- Email: `guru@chemimpact.com`
- Password: `password123`

**Student (Siswa)**

- Email: `siswa@chemimpact.com`
- Password: `password123`

## 📦 Available Scripts

```bash
# Development
npm run dev       # Start dev server

# Production
npm run build     # Build for production
npm run preview   # Preview production build

# Code Quality
npm run lint      # Run TypeScript type checking

# Cleanup
npm run clean     # Remove dist folder
```

## 📁 Project Structure

```
src/
├── components/          # Reusable React components
│   ├── layout/         # Header, Navigation, Modals
│   ├── tabs/           # Feature tabs (Battle, Social, Leaderboard)
│   ├── game/           # Game-related components
│   └── ui/             # Basic UI components
├── pages/              # Page components (Login, Dashboard, etc)
├── context/            # React Context (Auth)
├── lib/                # Firebase & utility functions
├── hooks/              # Custom React hooks
├── config/             # Configuration (Firebase)
├── types/              # TypeScript type definitions
├── App.tsx             # Main app with routing
├── main.tsx            # Entry point
└── index.css           # Global styles
```

## 🎮 How It Works

1. **Authentication**: Users login as either teacher (guru) or student (siswa)
2. **Dashboard**: Access different features based on role
3. **Missions**: Students complete interactive story-based challenges
4. **Discussions**: Join class-based forums to discuss topics
5. **Leaderboard**: Track ranking by earned score points
6. **Class Management**: Teachers create classes, students join via class codes

## 🔐 Security Notes

- ✅ Firebase credentials stored in `.env.local` (never committed)
- ✅ Authentication handled through Firebase Auth
- ✅ Real-time Database with security rules
- ✅ All sensitive data excluded from version control

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Create a feature branch (`git checkout -b feature/AmazingFeature`)
2. Commit changes (`git commit -m 'Add some AmazingFeature'`)
3. Push to branch (`git push origin feature/AmazingFeature`)
4. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support & Contact

For issues, questions, or suggestions, please open an issue on GitHub.

---

**Made with ❤️ for environmental education**

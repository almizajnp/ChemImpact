import React, { createContext, useContext, useState, useEffect } from "react";
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth, db } from "../config/firebase";
import { ref, set, get, child } from "firebase/database";
import { getStudentScore } from "../lib/firestore";

interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: "guru" | "siswa";
  score?: number;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  role: "guru" | "siswa" | null;
  register: (
    email: string,
    password: string,
    name: string,
    role: "guru" | "siswa",
  ) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("Setting up auth state listener");
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      console.log("Auth state changed - user:", currentUser?.email || "null");
      if (currentUser) {
        setUser(currentUser);

        // Fetch user profile from Realtime Database
        try {
          console.log("Fetching user profile for uid:", currentUser.uid);
          const userRef = ref(db, `users/${currentUser.uid}`);
          const snapshot = await get(userRef);

          if (snapshot.exists()) {
            const profile = snapshot.val() as UserProfile;
            console.log("✅ Profile found in Realtime DB:", profile);

            // Validate role
            if (profile.role !== "guru" && profile.role !== "siswa") {
              console.error("❌ Invalid role in DB:", profile.role);
              profile.role = "siswa"; // Default to siswa if invalid
            }

            // Load score for siswa users
            if (profile.role === "siswa") {
              try {
                const studentScore = await getStudentScore(currentUser.uid);
                profile.score = studentScore;
                console.log(`✅ Loaded score for student: ${studentScore}`);
              } catch (error) {
                console.error("❌ Error loading student score:", error);
                profile.score = 0;
              }
            }

            setUserProfile(profile);
            // Update localStorage backup
            localStorage.setItem("userRole", profile.role);
          } else {
            console.error(
              "❌ User profile not found in Realtime DB for uid:",
              currentUser.uid,
            );
            // Try to get role from localStorage as fallback
            const savedRole = localStorage.getItem("userRole") as
              | "guru"
              | "siswa"
              | null;
            if (savedRole) {
              console.log("🔄 Using role from localStorage:", savedRole);
              const fallbackProfile: UserProfile = {
                uid: currentUser.uid,
                email: currentUser.email || "",
                name: "Unknown User", // We don't have name in localStorage
                role: savedRole,
                createdAt: new Date().toISOString(),
              };
              setUserProfile(fallbackProfile);
            } else {
              console.error("❌ No profile found in DB or localStorage");
              setUserProfile(null);
            }
          }
        } catch (error) {
          console.error("❌ Error fetching user profile:", error);
          setUserProfile(null);
        }
      } else {
        console.log("User logged out, clearing state");
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const register = async (
    email: string,
    password: string,
    name: string,
    role: "guru" | "siswa",
  ) => {
    try {
      console.log("🔄 Starting registration process...");
      console.log(
        "📝 Registration data - email:",
        email,
        "name:",
        name,
        "role:",
        role,
      );

      // Validate role
      if (role !== "guru" && role !== "siswa") {
        throw new Error("Invalid role specified");
      }

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const newUser = userCredential.user;
      console.log("✅ Firebase auth user created:", newUser.uid);

      // Store user profile in Realtime Database
      const userProfile: UserProfile = {
        uid: newUser.uid,
        email: newUser.email || "",
        name: name.trim(),
        role,
        score: 0, // Initialize score to 0 for new users
        createdAt: new Date().toISOString(),
      };

      console.log("💾 Saving user profile to Realtime DB:", userProfile);
      await set(ref(db, `users/${newUser.uid}`), userProfile);
      console.log("✅ User profile saved to Realtime DB successfully");

      // Initialize student score in database if siswa
      if (role === "siswa") {
        try {
          await set(ref(db, `studentScores/${newUser.uid}`), {
            siswaId: newUser.uid,
            totalScore: 0,
            lastUpdated: new Date().toISOString(),
          });
          console.log("✅ Student score initialized to 0");
        } catch (error) {
          console.error("❌ Error initializing student score:", error);
        }
      }

      // Store role in localStorage as backup
      localStorage.setItem("userRole", role);
      console.log("💾 Role saved to localStorage:", role);

      // Profile will be set automatically by onAuthStateChanged listener
    } catch (error) {
      console.error("❌ Registration error:", error);
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Profile will be fetched automatically by onAuthStateChanged listener
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      // Clear localStorage
      localStorage.removeItem("userRole");
      console.log("🗑️ Cleared localStorage on logout");
      setUser(null);
      setUserProfile(null);
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    role: userProfile?.role || null,
    register,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: "guru" | "siswa";
  createdAt: string;
}

export interface Class {
  id?: string;
  name: string;
  description: string;
  classCode: string;
  guruId: string;
  guruName: string;
  createdAt: Date | string;
  memberCount?: number;
}

// ============ DISCUSSION FORUM TYPES ============

export interface DiscussionTopic {
  id: string;
  classId: string;
  title: string;
  description: string;
  optionalEmbedLink?: string; // URL untuk YouTube, artikel, atau gambar
  embedType?: "youtube" | "image" | "article" | "website"; // tipe embed yang terdeteksi
  status: "draft" | "published"; // draft hanya guru, published untuk siswa
  createdBy: string; // userId (guru)
  createdByName: string;
  createdAt: string;
  updatedAt?: string;
  commentCount: number;
  lastActivityAt: string;
}

export interface DiscussionComment {
  id: string;
  topicId: string;
  classId: string;
  text: string;
  siswaId: string; // PRIMARY IDENTITY - WAJIB ADA
  siswaName: string;
  role: "teacher" | "student";
  createdAt: string;
  updatedAt?: string;
}

export interface DiscussionReply {
  id: string;
  commentId: string;
  topicId: string;
  classId: string;
  text: string;
  siswaId: string; // PRIMARY IDENTITY - WAJIB ADA (dari userId/siswaId)
  userName: string;
  role: "teacher" | "student";
  createdAt: string;
  updatedAt?: string;
}

// Legacy types (untuk backward compatibility)
export interface Discussion {
  id?: string;
  classId: string;
  title: string;
  description: string;
  url?: string;
  guruId: string;
  guruName: string;
  createdAt: Date | string;
  commentCount?: number;
}

export interface Comment {
  id?: string;
  discussionId: string;
  text: string;
  userId: string;
  userName: string;
  userRole: "guru" | "siswa";
  createdAt: Date | string;
}

export interface ClassMember {
  id?: string;
  classId: string;
  siswaId: string;
  siswaName: string;
  joinedAt: Date | string;
  progress?: number;
  completedMissions?: number;
}

export interface StudentResponse {
  id?: string;
  classId: string;
  siswaId: string;
  siswaName: string;
  missionId: number; // e.g., 1 for ComicStory
  missionName: string; // e.g., "Ancaman Limbah Deterjen"
  essayAnswers?: Record<string, string>; // {essayId: answer}
  essayQuestions?: Record<string, string>; // {essayId: question}
  multiChoiceAnswers?: Array<{
    pageId: number;
    questionIndex: number;
    selectedChoice: string;
    isCorrect: boolean;
    choiceText?: string;
  }>;
  reflectionAnswers?: Record<string, string>; // {reflectionId: answer}
  reflectionQuestions?: Record<string, string>; // {reflectionId: question}
  totalScore?: number;
  status: "in-progress" | "completed";
  submittedAt: Date | string;
  lastModified?: Date | string;
}

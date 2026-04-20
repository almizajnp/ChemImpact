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
  multiChoiceAnswers?: Array<{
    pageId: number;
    questionIndex: number;
    selectedChoice: string;
    isCorrect: boolean;
    choiceText?: string;
  }>;
  reflectionAnswers?: Record<string, string>; // {reflectionId: answer}
  totalScore?: number;
  status: "in-progress" | "completed";
  submittedAt: Date | string;
  lastModified?: Date | string;
}

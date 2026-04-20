import {
  ref,
  set,
  get,
  push,
  update,
  remove,
  query,
  orderByChild,
  equalTo,
  DataSnapshot,
} from "firebase/database";
import { db } from "../config/firebase";
import {
  Class,
  Discussion,
  Comment,
  ClassMember,
  StudentResponse,
} from "../types";

// Generate unique class code
export const generateClassCode = (): string => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

// Generate unique ID (like Firestore push)
export const generateId = (): string => {
  return push(ref(db, ".info/connected")).key || Date.now().toString();
};

// ============ CLASS OPERATIONS ============

export const createClass = async (
  name: string,
  description: string,
  guruId: string,
  guruName: string,
): Promise<string> => {
  try {
    const classCode = generateClassCode();
    const classId = push(ref(db, "classes")).key;

    if (!classId) throw new Error("Failed to generate class ID");

    const classData = {
      id: classId,
      name,
      description,
      classCode,
      guruId,
      guruName,
      createdAt: new Date().toISOString(),
      memberCount: 0,
    };

    await set(ref(db, `classes/${classId}`), classData);
    console.log("✅ Class created:", classId);
    return classId;
  } catch (error) {
    console.error("❌ Error creating class:", error);
    throw error;
  }
};

export const getGuruClasses = async (guruId: string): Promise<Class[]> => {
  try {
    const snapshot = await get(ref(db, "classes"));
    if (!snapshot.exists()) return [];

    const classes: Class[] = [];
    snapshot.forEach((childSnapshot) => {
      const classData = childSnapshot.val() as Class;
      if (classData.guruId === guruId) {
        classes.push(classData);
      }
    });

    return classes.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  } catch (error) {
    console.error("❌ Error getting guru classes:", error);
    return [];
  }
};

export const getClassById = async (classId: string): Promise<Class | null> => {
  try {
    const snapshot = await get(ref(db, `classes/${classId}`));
    if (!snapshot.exists()) return null;
    return snapshot.val() as Class;
  } catch (error) {
    console.error("❌ Error getting class by ID:", error);
    return null;
  }
};

export const getClassByCode = async (
  classCode: string,
): Promise<Class | null> => {
  try {
    const snapshot = await get(ref(db, "classes"));
    if (!snapshot.exists()) return null;

    let foundClass: Class | null = null;
    snapshot.forEach((childSnapshot) => {
      const classData = childSnapshot.val() as Class;
      if (classData.classCode === classCode.toUpperCase()) {
        foundClass = classData;
      }
    });

    return foundClass;
  } catch (error) {
    console.error("❌ Error getting class by code:", error);
    return null;
  }
};

export const updateClass = async (
  classId: string,
  data: Partial<Class>,
): Promise<void> => {
  try {
    await update(ref(db, `classes/${classId}`), data);
    console.log("✅ Class updated:", classId);
  } catch (error) {
    console.error("❌ Error updating class:", error);
    throw error;
  }
};

export const deleteClass = async (classId: string): Promise<void> => {
  try {
    await remove(ref(db, `classes/${classId}`));
    console.log("✅ Class deleted:", classId);
  } catch (error) {
    console.error("❌ Error deleting class:", error);
    throw error;
  }
};

// ============ DISCUSSION OPERATIONS ============

export const createDiscussion = async (
  classId: string,
  title: string,
  description: string,
  guruId: string,
  guruName: string,
  url?: string,
): Promise<string> => {
  try {
    const discussionId = push(ref(db, `discussions/${classId}`)).key;
    if (!discussionId) throw new Error("Failed to generate discussion ID");

    const discussionData = {
      id: discussionId,
      classId,
      title,
      description,
      url: url || null,
      guruId,
      guruName,
      createdAt: new Date().toISOString(),
      commentCount: 0,
    };

    await set(
      ref(db, `discussions/${classId}/${discussionId}`),
      discussionData,
    );
    console.log("✅ Discussion created:", discussionId);
    return discussionId;
  } catch (error) {
    console.error("❌ Error creating discussion:", error);
    throw error;
  }
};

export const getDiscussions = async (
  classId: string,
): Promise<Discussion[]> => {
  try {
    const snapshot = await get(ref(db, `discussions/${classId}`));
    if (!snapshot.exists()) return [];

    const discussions: Discussion[] = [];
    snapshot.forEach((childSnapshot) => {
      const discussionData = childSnapshot.val() as Discussion;
      discussions.push(discussionData);
    });

    return discussions.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  } catch (error) {
    console.error("❌ Error getting discussions:", error);
    return [];
  }
};

export const getDiscussionById = async (
  classId: string,
  discussionId: string,
): Promise<Discussion | null> => {
  try {
    const snapshot = await get(
      ref(db, `discussions/${classId}/${discussionId}`),
    );
    if (!snapshot.exists()) return null;
    return snapshot.val() as Discussion;
  } catch (error) {
    console.error("❌ Error getting discussion by ID:", error);
    return null;
  }
};

export const updateDiscussion = async (
  classId: string,
  discussionId: string,
  data: Partial<Discussion>,
): Promise<void> => {
  try {
    await update(ref(db, `discussions/${classId}/${discussionId}`), data);
    console.log("✅ Discussion updated:", discussionId);
  } catch (error) {
    console.error("❌ Error updating discussion:", error);
    throw error;
  }
};

export const deleteDiscussion = async (
  classId: string,
  discussionId: string,
): Promise<void> => {
  try {
    await remove(ref(db, `discussions/${classId}/${discussionId}`));
    console.log("✅ Discussion deleted:", discussionId);
  } catch (error) {
    console.error("❌ Error deleting discussion:", error);
    throw error;
  }
};

// ============ COMMENT OPERATIONS ============

export const addComment = async (
  classId: string,
  discussionId: string,
  text: string,
  userId: string,
  userName: string,
  userRole: "guru" | "siswa",
): Promise<string> => {
  try {
    const commentId = push(ref(db, `comments/${classId}/${discussionId}`)).key;
    if (!commentId) throw new Error("Failed to generate comment ID");

    const commentData = {
      id: commentId,
      discussionId,
      text,
      userId,
      userName,
      userRole,
      createdAt: new Date().toISOString(),
    };

    await set(
      ref(db, `comments/${classId}/${discussionId}/${commentId}`),
      commentData,
    );
    console.log("✅ Comment added:", commentId);
    return commentId;
  } catch (error) {
    console.error("❌ Error adding comment:", error);
    throw error;
  }
};

export const getComments = async (
  classId: string,
  discussionId: string,
): Promise<Comment[]> => {
  try {
    const snapshot = await get(ref(db, `comments/${classId}/${discussionId}`));
    if (!snapshot.exists()) return [];

    const comments: Comment[] = [];
    snapshot.forEach((childSnapshot) => {
      const commentData = childSnapshot.val() as Comment;
      comments.push(commentData);
    });

    return comments.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
  } catch (error) {
    console.error("❌ Error getting comments:", error);
    return [];
  }
};

export const deleteComment = async (
  classId: string,
  discussionId: string,
  commentId: string,
): Promise<void> => {
  try {
    await remove(ref(db, `comments/${classId}/${discussionId}/${commentId}`));
    console.log("✅ Comment deleted:", commentId);
  } catch (error) {
    console.error("❌ Error deleting comment:", error);
    throw error;
  }
};

// ============ CLASS MEMBER OPERATIONS ============

export const addClassMember = async (
  classId: string,
  siswaId: string,
  siswaName: string,
): Promise<void> => {
  try {
    const memberId = push(ref(db, `classMembers/${classId}`)).key;
    if (!memberId) throw new Error("Failed to generate member ID");

    const memberData = {
      id: memberId,
      classId,
      siswaId,
      siswaName,
      joinedAt: new Date().toISOString(),
      progress: 0,
      completedMissions: 0,
    };

    await set(ref(db, `classMembers/${classId}/${memberId}`), memberData);

    // Increment memberCount in class
    const classRef = ref(db, `classes/${classId}`);
    const classSnapshot = await get(classRef);
    if (classSnapshot.exists()) {
      const classData = classSnapshot.val() as Class;
      await update(classRef, { memberCount: (classData.memberCount || 0) + 1 });
    }

    console.log("✅ Member added:", memberId);
  } catch (error) {
    console.error("❌ Error adding class member:", error);
    throw error;
  }
};

export const getClassMembers = async (
  classId: string,
): Promise<ClassMember[]> => {
  try {
    const snapshot = await get(ref(db, `classMembers/${classId}`));
    if (!snapshot.exists()) return [];

    const members: ClassMember[] = [];
    snapshot.forEach((childSnapshot) => {
      const memberData = childSnapshot.val() as ClassMember;
      members.push(memberData);
    });

    return members.sort(
      (a, b) => new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime(),
    );
  } catch (error) {
    console.error("❌ Error getting class members:", error);
    return [];
  }
};

export const getStudentClasses = async (siswaId: string): Promise<Class[]> => {
  try {
    const snapshot = await get(ref(db, "classMembers"));
    if (!snapshot.exists()) return [];

    const classIds = new Set<string>();
    snapshot.forEach((classSnapshot) => {
      classSnapshot.forEach((memberSnapshot) => {
        const member = memberSnapshot.val() as ClassMember;
        if (member.siswaId === siswaId) {
          classIds.add(member.classId);
        }
      });
    });

    const classes: Class[] = [];
    for (const classId of classIds) {
      const classData = await getClassById(classId);
      if (classData) classes.push(classData);
    }

    return classes;
  } catch (error) {
    console.error("❌ Error getting student classes:", error);
    return [];
  }
};

// ============ STUDENT SCORE OPERATIONS ============

/**
 * Mendapatkan skor siswa dari Realtime Database
 */
export const getStudentScore = async (siswaId: string): Promise<number> => {
  try {
    const snapshot = await get(ref(db, `studentScores/${siswaId}`));
    if (!snapshot.exists()) return 0;

    const scoreData = snapshot.val();
    return scoreData.totalScore || 0;
  } catch (error) {
    console.error("❌ Error getting student score:", error);
    return 0;
  }
};

/**
 * Menyimpan atau memperbarui skor siswa di Realtime Database
 */
export const saveStudentScore = async (
  siswaId: string,
  totalScore: number,
): Promise<void> => {
  try {
    const scoreData = {
      siswaId,
      totalScore,
      lastUpdated: new Date().toISOString(),
    };

    await set(ref(db, `studentScores/${siswaId}`), scoreData);
    console.log(`✅ Score saved for student ${siswaId}: ${totalScore} poin`);
  } catch (error) {
    console.error("❌ Error saving student score:", error);
    throw error;
  }
};

/**
 * Menambah poin ke skor siswa
 */
export const addPointsToScore = async (
  siswaId: string,
  points: number,
): Promise<number> => {
  try {
    // Dapatkan skor saat ini
    const currentScore = await getStudentScore(siswaId);
    const newScore = currentScore + points;

    // Simpan skor baru
    await saveStudentScore(siswaId, newScore);

    console.log(
      `✅ Points added for student ${siswaId}: ${points} poin (Total: ${newScore})`,
    );
    return newScore;
  } catch (error) {
    console.error("❌ Error adding points to score:", error);
    throw error;
  }
};

// ============ STUDENT RESPONSE OPERATIONS ============

/**
 * Menyimpan atau memperbarui jawaban siswa untuk sebuah misi
 */
export const saveStudentResponse = async (
  classId: string,
  siswaId: string,
  siswaName: string,
  response: Partial<StudentResponse>,
): Promise<string> => {
  try {
    const responseId = push(ref(db, `studentResponses/${classId}`)).key;
    if (!responseId) throw new Error("Failed to generate response ID");

    const responseData: StudentResponse = {
      id: responseId,
      classId,
      siswaId,
      siswaName,
      missionId: response.missionId || 1,
      missionName: response.missionName || "Unknown",
      essayAnswers: response.essayAnswers || {},
      multiChoiceAnswers: response.multiChoiceAnswers || [],
      reflectionAnswers: response.reflectionAnswers || {},
      totalScore: response.totalScore || 0,
      status: response.status || "completed",
      submittedAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
    };

    await set(
      ref(db, `studentResponses/${classId}/${responseId}`),
      responseData,
    );
    console.log(`✅ Student response saved:`, responseId);
    return responseId;
  } catch (error) {
    console.error("❌ Error saving student response:", error);
    throw error;
  }
};

/**
 * Mendapatkan semua jawaban siswa untuk sebuah kelas
 */
export const getClassStudentResponses = async (
  classId: string,
): Promise<StudentResponse[]> => {
  try {
    const snapshot = await get(ref(db, `studentResponses/${classId}`));
    if (!snapshot.exists()) return [];

    const responses: StudentResponse[] = [];
    snapshot.forEach((childSnapshot) => {
      const responseData = childSnapshot.val() as StudentResponse;
      responses.push(responseData);
    });

    return responses.sort(
      (a, b) =>
        new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(),
    );
  } catch (error) {
    console.error("❌ Error getting class student responses:", error);
    return [];
  }
};

/**
 * Mendapatkan jawaban dari seorang siswa tertentu di sebuah kelas
 */
export const getStudentResponsesByStudent = async (
  classId: string,
  siswaId: string,
): Promise<StudentResponse[]> => {
  try {
    const snapshot = await get(ref(db, `studentResponses/${classId}`));
    if (!snapshot.exists()) return [];

    const responses: StudentResponse[] = [];
    snapshot.forEach((childSnapshot) => {
      const responseData = childSnapshot.val() as StudentResponse;
      if (responseData.siswaId === siswaId) {
        responses.push(responseData);
      }
    });

    return responses.sort(
      (a, b) =>
        new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(),
    );
  } catch (error) {
    console.error("❌ Error getting student responses by student:", error);
    return [];
  }
};

/**
 * Mendapatkan detail jawaban siswa berdasarkan response ID
 */
export const getStudentResponseDetail = async (
  classId: string,
  responseId: string,
): Promise<StudentResponse | null> => {
  try {
    const snapshot = await get(
      ref(db, `studentResponses/${classId}/${responseId}`),
    );
    if (!snapshot.exists()) return null;
    return snapshot.val() as StudentResponse;
  } catch (error) {
    console.error("❌ Error getting student response detail:", error);
    return null;
  }
};

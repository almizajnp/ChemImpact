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
  onValue,
} from "firebase/database";
import { db } from "../config/firebase";
import {
  Class,
  Discussion,
  Comment,
  ClassMember,
  StudentResponse,
  DiscussionTopic,
  DiscussionComment,
  DiscussionReply,
} from "../types";

// Generate unique class code
export const generateClassCode = (): string => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

// Generate unique ID (like Firestore push)
export const generateId = (): string => {
  return push(ref(db, ".info/connected")).key || Date.now().toString();
};

// ============ UTILITY FUNCTIONS ============

/**
 * Deteksi tipe embed dari URL
 */
export const detectEmbedType = (
  url: string,
): "youtube" | "image" | "article" | "website" | null => {
  if (!url) return null;

  const youtubePatterns = [
    /youtube\.com\/watch/i,
    /youtu\.be\//i,
    /youtube\.com\/embed/i,
  ];

  const imagePatterns = [/\.(jpg|jpeg|png|gif|webp)$/i];
  const articlePatterns = [/medium\.com/i, /dev\.to/i, /blog/i];

  for (const pattern of youtubePatterns) {
    if (pattern.test(url)) return "youtube";
  }

  for (const pattern of imagePatterns) {
    if (pattern.test(url)) return "image";
  }

  for (const pattern of articlePatterns) {
    if (pattern.test(url)) return "article";
  }

  // Default ke website jika bukan yang di atas
  try {
    new URL(url);
    return "website";
  } catch {
    return null;
  }
};

/**
 * Konversi YouTube URL ke embed URL
 */
export const convertYouTubeUrl = (url: string): string => {
  let videoId = "";

  // Format: https://www.youtube.com/watch?v=VIDEO_ID
  const match1 = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
  if (match1) videoId = match1[1];

  // Format: https://youtu.be/VIDEO_ID
  const match2 = url.match(/youtu\.be\/([\w-]+)/);
  if (match2) videoId = match2[1];

  return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
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

/*
========================================
DISCUSSION TOPIC OPERATIONS (REALTIME)
========================================
*/

/**
 * Membuat discussion topic baru dengan embed link handling
 */
export const createDiscussionTopic = async (
  classId: string,
  title: string,
  description: string,
  userId: string,
  userName: string,
  embedUrl?: string,
): Promise<string> => {
  const topicRef = push(ref(db, `discussionTopics/${classId}`));
  const topicId = topicRef.key!;

  // Validasi dan deteksi tipe embed
  let embedType: "youtube" | "image" | "article" | "website" | undefined;
  let processedEmbedUrl = embedUrl;

  if (embedUrl) {
    embedType = detectEmbedType(embedUrl) || undefined;

    // Konversi YouTube URL ke embed format
    if (embedType === "youtube") {
      processedEmbedUrl = convertYouTubeUrl(embedUrl);
    }
  }

  const topicData: DiscussionTopic = {
    id: topicId,
    classId,
    title,
    description,
    optionalEmbedLink: processedEmbedUrl || undefined,
    embedType,
    status: "draft", // Guru membuat sebagai draft
    createdBy: userId,
    createdByName: userName,
    createdAt: new Date().toISOString(),
    commentCount: 0,
    lastActivityAt: new Date().toISOString(),
  };

  await set(topicRef, topicData);
  console.log("✅ Discussion topic created:", topicId);

  return topicId;
};

/**
 * Update discussion topic
 */
export const updateDiscussionTopic = async (
  classId: string,
  topicId: string,
  data: Partial<DiscussionTopic>,
) => {
  const updateData = { ...data };

  // Jika embed link diubah, deteksi ulang tipenya
  if (data.optionalEmbedLink) {
    const embedType = detectEmbedType(data.optionalEmbedLink);
    updateData.embedType = embedType || undefined;

    // Konversi YouTube URL jika diperlukan
    if (embedType === "youtube") {
      updateData.optionalEmbedLink = convertYouTubeUrl(data.optionalEmbedLink);
    }
  }

  updateData.updatedAt = new Date().toISOString();

  await update(ref(db, `discussionTopics/${classId}/${topicId}`), updateData);
  console.log("✅ Discussion topic updated:", topicId);
};

/**
 * Delete discussion topic
 */
export const deleteDiscussionTopic = async (
  classId: string,
  topicId: string,
) => {
  await remove(ref(db, `discussionTopics/${classId}/${topicId}`));
  console.log("✅ Discussion topic deleted:", topicId);
};

/**
 * Subscribe ke discussion topics dengan real-time updates
 */
export const subscribeToDiscussionTopics = (
  classId: string,
  callback: (topics: DiscussionTopic[]) => void,
) => {
  const topicsRef = ref(db, `discussionTopics/${classId}`);

  return onValue(topicsRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback([]);
      return;
    }

    const topics: DiscussionTopic[] = [];

    snapshot.forEach((child) => {
      topics.push(child.val() as DiscussionTopic);
    });

    callback(
      topics.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    );
  });
};

/*
========================================
DISCUSSION COMMENT OPERATIONS
========================================
*/

/**
 * Tambah komentar pada discussion topic
 * siswaId WAJIB ada untuk tracking identitas siswa
 */
export const addDiscussionComment = async (
  classId: string,
  topicId: string,
  text: string,
  siswaId: string, // PRIMARY IDENTITY - from userId (siswaId)
  siswaName: string,
  role: "teacher" | "student",
) => {
  const commentRef = push(
    ref(db, `discussionTopics/${classId}/${topicId}/comments`),
  );
  const commentId = commentRef.key!;

  const commentData: DiscussionComment = {
    id: commentId,
    topicId,
    classId,
    text,
    siswaId, // PRIMARY IDENTITY
    siswaName,
    role,
    createdAt: new Date().toISOString(),
  };

  await set(commentRef, commentData);

  // Update comment count pada topic
  const topicRef = ref(db, `discussionTopics/${classId}/${topicId}`);
  const topicSnapshot = await get(topicRef);
  if (topicSnapshot.exists()) {
    const topic = topicSnapshot.val() as DiscussionTopic;
    await update(topicRef, {
      commentCount: (topic.commentCount || 0) + 1,
      lastActivityAt: new Date().toISOString(),
    });
  }

  console.log("✅ Comment added to topic:", topicId);
};

/**
 * Delete komentar
 */
export const deleteDiscussionComment = async (
  classId: string,
  topicId: string,
  commentId: string,
) => {
  await remove(
    ref(db, `discussionTopics/${classId}/${topicId}/comments/${commentId}`),
  );

  // Update comment count
  const topicRef = ref(db, `discussionTopics/${classId}/${topicId}`);
  const topicSnapshot = await get(topicRef);
  if (topicSnapshot.exists()) {
    const topic = topicSnapshot.val() as DiscussionTopic;
    await update(topicRef, {
      commentCount: Math.max(0, (topic.commentCount || 1) - 1),
    });
  }

  console.log("✅ Comment deleted:", commentId);
};

/**
 * Subscribe ke comments pada topic dengan real-time updates
 */
export const subscribeToDiscussionComments = (
  classId: string,
  topicId: string,
  callback: (comments: DiscussionComment[]) => void,
) => {
  const commentsRef = ref(
    db,
    `discussionTopics/${classId}/${topicId}/comments`,
  );

  return onValue(commentsRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback([]);
      return;
    }

    const comments: DiscussionComment[] = [];

    snapshot.forEach((child) => {
      comments.push(child.val() as DiscussionComment);
    });

    callback(
      comments.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      ),
    );
  });
};

/*
========================================
DISCUSSION REPLY OPERATIONS
========================================
*/

/**
 * Tambah reply pada komentar
 * siswaId WAJIB ada untuk tracking identitas user
 */
export const addDiscussionReply = async (
  classId: string,
  topicId: string,
  commentId: string,
  text: string,
  siswaId: string, // PRIMARY IDENTITY - from userId
  userName: string,
  role: "teacher" | "student",
) => {
  const replyRef = push(
    ref(
      db,
      `discussionTopics/${classId}/${topicId}/comments/${commentId}/replies`,
    ),
  );
  const replyId = replyRef.key!;

  const replyData: DiscussionReply = {
    id: replyId,
    commentId,
    topicId,
    classId,
    text,
    siswaId, // PRIMARY IDENTITY
    userName,
    role,
    createdAt: new Date().toISOString(),
  };

  await set(replyRef, replyData);
  console.log("✅ Reply added to comment:", commentId);
};

/**
 * Delete reply pada komentar
 */
export const deleteDiscussionReply = async (
  classId: string,
  topicId: string,
  commentId: string,
  replyId: string,
) => {
  await remove(
    ref(
      db,
      `discussionTopics/${classId}/${topicId}/comments/${commentId}/replies/${replyId}`,
    ),
  );
  console.log("✅ Reply deleted:", replyId);
};

/**
 * Subscribe ke replies pada komentar dengan real-time updates
 */
export const subscribeToDiscussionReplies = (
  classId: string,
  topicId: string,
  commentId: string,
  callback: (replies: DiscussionReply[]) => void,
) => {
  const repliesRef = ref(
    db,
    `discussionTopics/${classId}/${topicId}/comments/${commentId}/replies`,
  );

  return onValue(repliesRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback([]);
      return;
    }

    const replies: DiscussionReply[] = [];

    snapshot.forEach((child) => {
      replies.push(child.val() as DiscussionReply);
    });

    callback(
      replies.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      ),
    );
  });
};

/*
========================================
HELPER
========================================
*/

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
  siswaName?: string,
  kelas?: string,
): Promise<void> => {
  try {
    const scoreData: any = {
      siswaId,
      totalScore,
      lastUpdated: new Date().toISOString(),
    };

    // Tambahkan siswaName dan kelas jika disediakan
    if (siswaName) scoreData.siswaName = siswaName;
    if (kelas) scoreData.kelas = kelas;

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
  siswaId: string,
  siswaName: string,
  response: Partial<StudentResponse>,
): Promise<void> => {
  try {
    console.log("🔵 saveStudentResponse called with:", {
      siswaId,
      siswaName,
      responseKeys: Object.keys(response),
    });

    const responseData: StudentResponse = {
      id: siswaId,
      classId: response.classId || "",
      siswaId,
      siswaName,
      missionId: response.missionId || 1,
      missionName: response.missionName || "Unknown",
      essayAnswers: response.essayAnswers || {},
      essayQuestions: response.essayQuestions || {},
      multiChoiceAnswers: response.multiChoiceAnswers || [],
      reflectionAnswers: response.reflectionAnswers || {},
      reflectionQuestions: response.reflectionQuestions || {},
      totalScore: response.totalScore || 0,
      status: response.status || "completed",
      submittedAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
    };

    await set(ref(db, `studentResponses/${siswaId}`), responseData);
    console.log(
      `✅ Response saved for student ${siswaId} - Mission ${responseData.missionId}`,
    );
  } catch (error) {
    console.error("❌ Error saving student response:", error);
    throw error;
  }
};

// ============ LEADERBOARD OPERATIONS ============

/**
 * Subscribe ke semua student scores untuk leaderboard realtime
 * Returns array dari student dengan score, sorted descending
 */
export interface StudentScore {
  siswaId: string;
  totalScore: number;
  lastUpdated: string;
  siswaName?: string;
  kelas?: string;
}

export const subscribeToLeaderboard = (
  callback: (students: StudentScore[]) => void,
): (() => void) => {
  try {
    const unsubscribe = onValue(
      ref(db, "studentScores"),
      (snapshot) => {
        if (!snapshot.exists()) {
          callback([]);
          return;
        }

        const scoresData = snapshot.val();
        const studentsArray: StudentScore[] = [];

        // Convert object to array and sort by score
        for (const siswaId in scoresData) {
          const data = scoresData[siswaId];
          studentsArray.push({
            siswaId,
            totalScore: data.totalScore || 0,
            lastUpdated: data.lastUpdated || new Date().toISOString(),
            siswaName: data.siswaName || "Unknown Student",
            kelas: data.kelas || "Unknown Class",
          });
        }

        // Sort by score descending
        const sortedStudents = studentsArray.sort(
          (a, b) => b.totalScore - a.totalScore,
        );

        console.log(
          `📊 Leaderboard updated with ${sortedStudents.length} students`,
        );
        callback(sortedStudents);
      },
      (error) => {
        console.error("❌ Error subscribing to leaderboard:", error);
        callback([]);
      },
    );

    return unsubscribe;
  } catch (error) {
    console.error("❌ Error setting up leaderboard subscription:", error);
    return () => {};
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
  siswaId: string,
): Promise<StudentResponse | null> => {
  try {
    console.log(`🔍 Fetching response for siswaId: ${siswaId}`);
    const snapshot = await get(ref(db, `studentResponses/${siswaId}`));
    if (!snapshot.exists()) {
      console.log(`⚠️ No response found for student ${siswaId}`);
      return null;
    }

    const responseData = snapshot.val() as StudentResponse;
    console.log(`✅ Found response for ${siswaId}`);
    return responseData;
  } catch (error) {
    console.error("❌ Error getting student response:", error);
    return null;
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

/**
 * Cleanup test data - menghapus responses dengan siswaId pattern student-00X
 */
export const cleanupTestData = async (): Promise<number> => {
  try {
    console.log(`🧹 Starting cleanup for test data`);
    const snapshot = await get(ref(db, `studentResponses`));
    if (!snapshot.exists()) {
      console.log("⚠️ No responses found");
      return 0;
    }

    let deletedCount = 0;
    const testDataPattern = /^student-\d{3}$/; // Matches: student-001, student-002, etc.
    const deletePromises: Promise<void>[] = [];

    snapshot.forEach((childSnapshot) => {
      const siswaId = childSnapshot.key;
      if (siswaId && testDataPattern.test(siswaId)) {
        console.log(`🗑️ Marking for deletion: ${siswaId}`);
        deletePromises.push(remove(ref(db, `studentResponses/${siswaId}`)));
        deletedCount++;
      }
    });

    // Execute all deletes in parallel
    await Promise.all(deletePromises);
    console.log(
      `🎉 Cleanup complete! Deleted ${deletedCount} test data records`,
    );
    return deletedCount;
  } catch (error) {
    console.error("❌ Error during cleanup:", error);
    throw error;
  }
};

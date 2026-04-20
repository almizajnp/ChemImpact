import React, { useState, useEffect } from "react";
import { Eye, ChevronDown, ChevronUp } from "lucide-react";
import { ClassMember, StudentResponse } from "../types";
import {
  getClassMembers,
  getClassStudentResponses,
  getStudentResponseDetail,
} from "../lib/firestore";

interface StudentProgressTabProps {
  classId: string;
}

export default function StudentProgressTab({
  classId,
}: StudentProgressTabProps) {
  const [members, setMembers] = useState<ClassMember[]>([]);
  const [responses, setResponses] = useState<StudentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null);
  const [selectedResponse, setSelectedResponse] =
    useState<StudentResponse | null>(null);
  const [showResponseDetail, setShowResponseDetail] = useState(false);

  useEffect(() => {
    loadData();
  }, [classId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [membersData, responsesData] = await Promise.all([
        getClassMembers(classId),
        getClassStudentResponses(classId),
      ]);
      setMembers(membersData);
      setResponses(responsesData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStudentResponses = (siswaId: string): StudentResponse[] => {
    return responses.filter((r) => r.siswaId === siswaId);
  };

  const handleViewResponse = async (response: StudentResponse) => {
    const detail = await getStudentResponseDetail(classId, response.id || "");
    if (detail) {
      setSelectedResponse(detail);
      setShowResponseDetail(true);
    }
  };

  const calculateCorrectAnswers = (response: StudentResponse): number => {
    return response.multiChoiceAnswers?.filter((a) => a.isCorrect).length || 0;
  };

  const renderResponseDetail = () => {
    if (!selectedResponse) return null;

    return (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 flex justify-between items-center">
            <h2 className="text-2xl font-bold">Detail Jawaban Siswa</h2>
            <button
              onClick={() => {
                setShowResponseDetail(false);
                setSelectedResponse(null);
              }}
              className="text-white hover:text-gray-200"
            >
              ✕
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Header Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Nama Siswa</p>
                  <p className="font-semibold text-gray-900">
                    {selectedResponse.siswaName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Misi</p>
                  <p className="font-semibold text-gray-900">
                    {selectedResponse.missionName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Skor</p>
                  <p className="font-semibold text-green-600 text-lg">
                    {selectedResponse.totalScore || 0} poin
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tanggal Submit</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(selectedResponse.submittedAt).toLocaleDateString(
                      "id-ID",
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Essay Answers */}
            {selectedResponse.essayAnswers &&
              Object.keys(selectedResponse.essayAnswers).length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    📝 Jawaban Uraian
                  </h3>
                  <div className="space-y-4">
                    {Object.entries(selectedResponse.essayAnswers).map(
                      ([essayId, answer]) => (
                        <div
                          key={essayId}
                          className="bg-blue-50 rounded-lg p-4"
                        >
                          <p className="text-sm font-semibold text-gray-700 mb-2">
                            {essayId}
                          </p>
                          <p className="text-gray-900 whitespace-pre-wrap">
                            {answer}
                          </p>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              )}

            {/* Multiple Choice Answers */}
            {selectedResponse.multiChoiceAnswers &&
              selectedResponse.multiChoiceAnswers.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    ✓ Pilihan Ganda
                  </h3>
                  <div className="space-y-3">
                    {selectedResponse.multiChoiceAnswers.map(
                      (answer, index) => (
                        <div
                          key={index}
                          className={`rounded-lg p-4 ${
                            answer.isCorrect
                              ? "bg-green-50 border-2 border-green-200"
                              : "bg-red-50 border-2 border-red-200"
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-gray-700">
                                Soal Halaman {answer.pageId}
                              </p>
                              <p className="text-gray-900 mt-1">
                                Jawaban: {answer.selectedChoice} -{" "}
                                {answer.choiceText}
                              </p>
                            </div>
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap ${
                                answer.isCorrect
                                  ? "bg-green-200 text-green-800"
                                  : "bg-red-200 text-red-800"
                              }`}
                            >
                              {answer.isCorrect ? "✓ Benar" : "✗ Salah"}
                            </span>
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              )}

            {/* Reflection Answers */}
            {selectedResponse.reflectionAnswers &&
              Object.keys(selectedResponse.reflectionAnswers).length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    💭 Refleksi Diri
                  </h3>
                  <div className="space-y-4">
                    {Object.entries(selectedResponse.reflectionAnswers).map(
                      ([reflectionId, answer]) => (
                        <div
                          key={reflectionId}
                          className="bg-purple-50 rounded-lg p-4"
                        >
                          <p className="text-sm font-semibold text-gray-700 mb-2">
                            Refleksi - {reflectionId}
                          </p>
                          <p className="text-gray-900 whitespace-pre-wrap">
                            {answer}
                          </p>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-12 text-gray-600">
        Memuat data siswa...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">
        📊 Progress & Jawaban Siswa
      </h2>

      {/* Statistics */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-600">
          <p className="text-gray-600 text-sm">Total Siswa</p>
          <p className="text-3xl font-bold text-blue-600">{members.length}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-600">
          <p className="text-gray-600 text-sm">Total Submisi</p>
          <p className="text-3xl font-bold text-green-600">
            {responses.length}
          </p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 border-l-4 border-purple-600">
          <p className="text-gray-600 text-sm">Siswa Selesai</p>
          <p className="text-3xl font-bold text-purple-600">
            {new Set(responses.map((r) => r.siswaId)).size}
          </p>
        </div>
      </div>

      {/* Student List */}
      {members.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">
            Belum ada siswa yang bergabung dengan kelas ini
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="divide-y divide-gray-200">
            {members.map((member) => {
              const studentResponses = getStudentResponses(member.siswaId);
              const lastResponse =
                studentResponses.length > 0 ? studentResponses[0] : null;

              return (
                <div key={member.id} className="hover:bg-gray-50">
                  {/* Student Header */}
                  <button
                    onClick={() =>
                      setExpandedStudent(
                        expandedStudent === member.siswaId
                          ? null
                          : member.siswaId,
                      )
                    }
                    className="w-full p-6 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4 flex-1 text-left">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="font-semibold text-blue-600">
                          {member.siswaName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">
                          {member.siswaName}
                        </p>
                        <p className="text-sm text-gray-600">
                          Bergabung:{" "}
                          {new Date(member.joinedAt).toLocaleDateString(
                            "id-ID",
                          )}
                        </p>
                      </div>
                      {lastResponse && (
                        <div className="text-right mr-4">
                          <p className="text-sm text-gray-600">
                            Skor Tertinggi
                          </p>
                          <p className="text-2xl font-bold text-green-600">
                            {Math.max(
                              ...studentResponses.map((r) => r.totalScore || 0),
                            )}
                          </p>
                        </div>
                      )}
                    </div>
                    {expandedStudent === member.siswaId ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </button>

                  {/* Student Details - Expandable */}
                  {expandedStudent === member.siswaId && (
                    <div className="px-6 pb-6 bg-gray-50">
                      {studentResponses.length === 0 ? (
                        <p className="text-gray-600 text-center py-4">
                          Belum ada submisi
                        </p>
                      ) : (
                        <div className="space-y-3">
                          <p className="font-semibold text-gray-900 mb-3">
                            Riwayat Submisi:
                          </p>
                          {studentResponses.map((response, index) => (
                            <div
                              key={response.id}
                              className="bg-white rounded-lg p-4 flex items-center justify-between"
                            >
                              <div className="flex-1">
                                <p className="font-medium text-gray-900">
                                  Submisi #{studentResponses.length - index}
                                </p>
                                <div className="text-sm text-gray-600 mt-1 space-y-1">
                                  <p>
                                    Waktu:{" "}
                                    {new Date(
                                      response.submittedAt,
                                    ).toLocaleString("id-ID")}
                                  </p>
                                  <p>Skor: {response.totalScore} poin</p>
                                  <p>
                                    Pilihan Benar:{" "}
                                    {calculateCorrectAnswers(response)}/
                                    {response.multiChoiceAnswers?.length || 0}
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={() => handleViewResponse(response)}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
                              >
                                <Eye size={18} />
                                Lihat Detail
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Response Detail Modal */}
      {showResponseDetail && renderResponseDetail()}
    </div>
  );
}

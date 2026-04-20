import React from "react";

export default function DecisionSim({
  onComplete,
}: {
  onComplete: () => void;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 text-center bg-black/50 backdrop-blur-sm">
      <div className="max-w-xl w-full bg-white/90 text-gray-900 rounded-3xl shadow-2xl border border-gray-200 p-8">
        <h1 className="text-3xl font-bold mb-4">Decision Simulation</h1>
        <p className="text-sm text-gray-700 leading-relaxed mb-6">
          Modul simulasi keputusan belum tersedia saat ini. Silakan kembali ke
          layar utama untuk melanjutkan.
        </p>
        <button
          type="button"
          onClick={onComplete}
          className="inline-flex items-center justify-center rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 transition-colors"
        >
          Kembali
        </button>
      </div>
    </div>
  );
}

import { motion } from 'motion/react';
import { useState } from 'react';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

const scenario = {
  question: "Kota mengalami peningkatan limbah deterjen di sungai akibat aktivitas rumah tangga yang tinggi. Air sungai mulai berbusa dan ikan-ikan mati. Sebagai pengambil keputusan, apa yang akan kamu lakukan?",
  choices: [
    {
      id: 'A',
      text: "Membiarkan penggunaan deterjen biasa karena murah.",
      impact: "Negatif",
      feedback: "Sungai semakin tercemar parah. Eutrofikasi meledak, ekosistem mati, dan biaya pemulihan lingkungan menjadi sangat mahal di masa depan.",
      color: "bg-red-100 border-red-500 text-red-800"
    },
    {
      id: 'B',
      text: "Membatasi kandungan fosfat dalam deterjen yang beredar.",
      impact: "Positif Moderat",
      feedback: "Langkah yang baik! Eutrofikasi berkurang, namun surfaktan masih bisa mencemari jika tidak diolah dengan baik.",
      color: "bg-yellow-100 border-yellow-500 text-yellow-800"
    },
    {
      id: 'C',
      text: "Mewajibkan deterjen ramah lingkungan & edukasi warga.",
      impact: "Sangat Positif",
      feedback: "Keputusan terbaik! Prinsip Green Chemistry diterapkan. Lingkungan pulih secara bertahap dan kesadaran masyarakat meningkat untuk masa depan berkelanjutan.",
      color: "bg-green-100 border-green-500 text-green-800"
    }
  ]
};

export default function DecisionSim() {
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);

  return (
    <section id="decision" className="py-20 bg-[#f0f4f8]">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <div className="inline-block p-3 rounded-full bg-yellow-100 text-yellow-600 mb-4">
            <AlertTriangle size={32} />
          </div>
          <h2 className="font-display text-4xl font-bold text-gray-800 mb-4">Simulasi Keputusan</h2>
          <p className="text-gray-600 text-lg">Masa depan lingkungan ada di tanganmu.</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border-2 border-gray-100">
          <div className="p-8 md:p-12 bg-gradient-to-br from-gray-50 to-white">
            <h3 className="text-xl md:text-2xl font-medium text-gray-800 mb-8 leading-relaxed text-center">
              "{scenario.question}"
            </h3>

            <div className="space-y-4">
              {scenario.choices.map((choice) => (
                <motion.button
                  key={choice.id}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => setSelectedChoice(choice.id)}
                  className={`w-full text-left p-6 rounded-2xl border-2 transition-all duration-300 flex items-center gap-4 group ${
                    selectedChoice === choice.id 
                      ? 'border-blue-500 bg-blue-50 shadow-md' 
                      : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0 ${
                    selectedChoice === choice.id ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500 group-hover:bg-blue-200 group-hover:text-blue-700'
                  }`}>
                    {choice.id}
                  </div>
                  <span className="text-lg text-gray-700 font-medium">{choice.text}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Result Section */}
          <motion.div 
            initial={false}
            animate={{ height: selectedChoice ? 'auto' : 0, opacity: selectedChoice ? 1 : 0 }}
            className="overflow-hidden bg-gray-900 text-white"
          >
            {selectedChoice && (
              <div className="p-8 md:p-12 border-t border-gray-800">
                {(() => {
                  const choice = scenario.choices.find(c => c.id === selectedChoice);
                  return (
                    <div className="text-center">
                      <div className="mb-4 flex justify-center">
                        {choice?.id === 'A' ? (
                          <XCircle className="text-red-500 w-16 h-16" />
                        ) : choice?.id === 'C' ? (
                          <CheckCircle className="text-green-500 w-16 h-16" />
                        ) : (
                          <AlertTriangle className="text-yellow-500 w-16 h-16" />
                        )}
                      </div>
                      <h4 className="font-display text-2xl font-bold mb-2">
                        Dampak: <span className={
                          choice?.id === 'A' ? 'text-red-400' : 
                          choice?.id === 'C' ? 'text-green-400' : 'text-yellow-400'
                        }>{choice?.impact}</span>
                      </h4>
                      <p className="text-gray-300 text-lg leading-relaxed max-w-2xl mx-auto">
                        {choice?.feedback}
                      </p>
                    </div>
                  );
                })()}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

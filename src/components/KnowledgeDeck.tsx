import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { FlaskConical, Droplet, Skull, Recycle, Home, Leaf } from 'lucide-react';

const cards = [
  {
    id: 1,
    title: "Surfaktan",
    rarity: "Common",
    elixir: 2,
    icon: <FlaskConical size={40} className="text-blue-600" />,
    description: "Bahan aktif utama deterjen yang menurunkan tegangan permukaan air. Ekor hidrofobik mengikat lemak, kepala hidrofilik mengikat air.",
    stat: "Daya Bersih: Tinggi",
    color: "border-gray-400 bg-gray-100"
  },
  {
    id: 2,
    title: "Fosfat & Eutrofikasi",
    rarity: "Rare",
    elixir: 4,
    icon: <Skull size={40} className="text-orange-600" />,
    description: "Fosfat menyuburkan alga (blooming algae), menutupi permukaan air, menghalangi sinar matahari, dan mematikan biota air.",
    stat: "Bahaya: Tinggi",
    color: "border-orange-400 bg-orange-50"
  },
  {
    id: 3,
    title: "Pencemaran Air",
    rarity: "Common",
    elixir: 3,
    icon: <Droplet size={40} className="text-cyan-600" />,
    description: "Perubahan fisik, kimia, dan biologis air akibat masuknya zat pencemar sehingga kualitas air turun.",
    stat: "Dampak: Luas",
    color: "border-gray-400 bg-gray-100"
  },
  {
    id: 4,
    title: "Green Chemistry",
    rarity: "Legendary",
    elixir: 5,
    icon: <Leaf size={40} className="text-green-600" />,
    description: "12 Prinsip kimia untuk mengurangi atau menghilangkan penggunaan bahan berbahaya dalam desain produk.",
    stat: "Solusi: Terbaik",
    color: "border-yellow-400 bg-yellow-50 shadow-[0_0_15px_rgba(250,204,21,0.3)]"
  },
  {
    id: 5,
    title: "Limbah Rumah Tangga",
    rarity: "Rare",
    elixir: 3,
    icon: <Home size={40} className="text-purple-600" />,
    description: "Sumber utama pencemaran sungai di perkotaan, didominasi oleh air bekas cucian (greywater).",
    stat: "Volume: Besar",
    color: "border-orange-400 bg-orange-50"
  },
  {
    id: 6,
    title: "Deterjen Eco-Friendly",
    rarity: "Epic",
    elixir: 4,
    icon: <Recycle size={40} className="text-emerald-600" />,
    description: "Deterjen berbasis enzim atau surfaktan nabati (seperti MES) yang mudah terurai (biodegradable).",
    stat: "Ramah: Ya",
    color: "border-purple-400 bg-purple-50"
  }
];

export default function KnowledgeDeck() {
  const [flippedCard, setFlippedCard] = useState<number | null>(null);

  return (
    <section id="deck" className="py-20 bg-gradient-to-b from-blue-900 to-indigo-900 text-white overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-md">Deck Pengetahuan</h2>
          <p className="text-blue-200 text-lg">Kumpulkan kartu pengetahuan untuk menyelesaikan misi!</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6 max-w-7xl mx-auto">
          {cards.map((card) => (
            <div 
              key={card.id} 
              className="h-[320px] perspective-1000 cursor-pointer group"
              onClick={() => setFlippedCard(flippedCard === card.id ? null : card.id)}
            >
              <motion.div
                className="relative w-full h-full transition-all duration-500 transform-style-3d"
                animate={{ rotateY: flippedCard === card.id ? 180 : 0 }}
                transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
              >
                {/* Front of Card */}
                <div className={`absolute inset-0 w-full h-full backface-hidden rounded-xl border-[6px] ${card.color} bg-white text-gray-800 shadow-xl overflow-hidden flex flex-col`}>
                  <div className="bg-gray-800 text-white text-xs font-bold px-2 py-1 absolute top-0 left-0 z-10 rounded-br-lg">
                    Level {card.elixir}
                  </div>
                  
                  <div className="p-2 flex justify-center items-center h-1/2 bg-gray-100 relative">
                     {/* Rarity Glow */}
                     <div className="absolute inset-0 bg-gradient-to-t from-white/50 to-transparent"></div>
                     <div className="transform group-hover:scale-110 transition-transform duration-300">
                       {card.icon}
                     </div>
                  </div>
                  
                  <div className="p-3 text-center flex flex-col flex-grow justify-between bg-white relative z-10">
                    <div>
                      <h3 className="font-display font-bold text-lg leading-tight mb-1">{card.title}</h3>
                      <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">{card.rarity}</p>
                    </div>
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <p className="text-xs font-medium text-gray-600">{card.stat}</p>
                    </div>
                  </div>
                </div>

                {/* Back of Card */}
                <div className={`absolute inset-0 w-full h-full backface-hidden rounded-xl border-[6px] ${card.color} bg-white text-gray-800 shadow-xl overflow-hidden rotate-y-180 flex flex-col p-4 justify-center items-center text-center`}>
                  <h3 className="font-display font-bold text-lg mb-3 text-blue-600">{card.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {card.description}
                  </p>
                  <div className="mt-4 text-xs font-bold text-gray-400">
                    Klik untuk menutup
                  </div>
                </div>
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

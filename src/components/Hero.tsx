import { motion } from 'motion/react';
import { Beaker, Droplets, Leaf, ArrowRight, Info } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-blue-900 via-blue-800 to-teal-700 text-white">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-400 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-green-400 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Floating Icons */}
      <motion.div 
        animate={{ y: [0, -20, 0] }} 
        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        className="absolute top-1/4 left-10 md:left-1/4 opacity-30"
      >
        <Beaker size={64} />
      </motion.div>
      <motion.div 
        animate={{ y: [0, 20, 0] }} 
        transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-1/3 right-10 md:right-1/4 opacity-30"
      >
        <Droplets size={64} />
      </motion.div>
      
      <div className="container mx-auto px-4 z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="font-display text-6xl md:text-8xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-blue-300 drop-shadow-lg mb-4">
            ChemImpact
          </h1>
          <p className="text-xl md:text-2xl font-medium text-blue-100 mb-2 font-display">
            "Keputusan Kimia Hari Ini, Dampak Lingkungan di Masa Depan."
          </p>
          <p className="max-w-2xl mx-auto text-gray-200 mb-8 leading-relaxed">
            Platform pembelajaran interaktif yang mengajak siswa memahami konsep Green Chemistry dan dampak limbah deterjen terhadap lingkungan, melalui sistem misi pengambilan keputusan berbasis masa depan.
          </p>
          
          <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl font-bold text-xl shadow-[0_4px_0_rgb(21,128,61)] active:shadow-none active:translate-y-1 border-2 border-green-400 flex items-center gap-2"
              onClick={() => document.getElementById('missions')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <Leaf className="w-6 h-6" />
              Mulai Misi
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl font-bold text-xl shadow-[0_4px_0_rgb(30,58,138)] active:shadow-none active:translate-y-1 border-2 border-blue-400 flex items-center gap-2"
              onClick={() => document.getElementById('deck')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <Info className="w-6 h-6" />
              Pelajari Materi
            </motion.button>
          </div>
        </motion.div>
      </div>
      
      {/* Wave Divider */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
        <svg className="relative block w-[calc(100%+1.3px)] h-[100px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="fill-[#f0f4f8]"></path>
        </svg>
      </div>
    </section>
  );
}

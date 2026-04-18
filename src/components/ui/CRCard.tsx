import { motion } from 'motion/react';
import { Star, Zap, Shield, Info } from 'lucide-react';
import React from 'react';

interface CRCardProps {
  title: string;
  elixir: number;
  image?: React.ReactNode;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  level: number;
  onClick?: () => void;
  isLocked?: boolean;
}

export default function CRCard({ title, elixir, image, rarity, level, onClick, isLocked = false }: CRCardProps) {
  const rarityColors = {
    common: 'border-gray-400 bg-gray-200',
    rare: 'border-orange-400 bg-orange-100',
    epic: 'border-purple-500 bg-purple-100',
    legendary: 'border-cyan-400 bg-cyan-100' // Using cyan for legendary-like feel
  };

  const rarityTextColors = {
    common: 'text-gray-600',
    rare: 'text-orange-600',
    epic: 'text-purple-600',
    legendary: 'text-cyan-600'
  };

  return (
    <motion.div 
      whileHover={{ scale: 1.05, y: -5 }}
      whileTap={{ scale: 0.95 }}
      className="relative cursor-pointer"
      onClick={onClick}
    >
      {/* Card Frame */}
      <div className={`
        relative aspect-[3/4] rounded-xl border-[6px] shadow-lg overflow-hidden
        ${isLocked ? 'grayscale opacity-70 border-gray-600 bg-gray-700' : `rarity-${rarity}`}
      `}>
        
        {/* Elixir Cost */}
        <div className="absolute -top-2 -left-2 w-10 h-10 bg-purple-600 rounded-full border-2 border-purple-300 flex items-center justify-center z-20 shadow-md">
          <span className="font-clash text-white text-lg drop-shadow-md">{elixir}</span>
        </div>

        {/* Level Badge (Bottom) */}
        {!isLocked && (
          <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 bg-black/60 px-3 py-0.5 rounded-full z-20 border border-white/20">
            <span className="text-[10px] font-bold text-white uppercase tracking-wider">Lvl {level}</span>
          </div>
        )}

        {/* Image Container */}
        <div className="absolute top-2 left-2 right-2 bottom-10 bg-white/50 rounded-lg overflow-hidden flex items-center justify-center border border-black/10">
           {image || <Shield size={48} className="text-gray-400 opacity-50" />}
        </div>

        {/* Title Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-10 bg-black/10 flex items-center justify-center">
           <span className="font-clash text-xs text-center px-1 leading-tight text-gray-800 text-stroke-sm text-white truncate w-full">
             {title}
           </span>
        </div>
        
        {/* Shine Effect for Legendary */}
        {rarity === 'legendary' && !isLocked && (
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent animate-pulse pointer-events-none"></div>
        )}
      </div>

      {/* Upgrade Bar (Optional visual) */}
      {!isLocked && (
        <div className="mt-2 h-3 bg-gray-700 rounded-full overflow-hidden border border-black/30 relative">
          <div className="absolute top-0 left-0 h-full bg-green-500 w-2/3"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[8px] font-bold text-white drop-shadow-md">24/50</span>
          </div>
        </div>
      )}
    </motion.div>
  );
}

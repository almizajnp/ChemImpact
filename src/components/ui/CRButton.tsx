import { motion } from 'motion/react';
import React from 'react';

interface CRButtonProps {
  children: React.ReactNode;
  variant?: 'yellow' | 'blue' | 'green' | 'red';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

export default function CRButton({ 
  children, 
  variant = 'yellow', 
  size = 'md', 
  onClick, 
  className = '',
  disabled = false
}: CRButtonProps) {
  
  const variants = {
    yellow: 'btn-cr-yellow text-white text-stroke',
    blue: 'btn-cr-blue text-white text-stroke',
    green: 'bg-gradient-to-b from-green-400 to-green-600 border-green-700 shadow-[0_4px_0_#14532d] text-white text-stroke',
    red: 'bg-gradient-to-b from-red-400 to-red-600 border-red-700 shadow-[0_4px_0_#7f1d1d] text-white text-stroke'
  };

  const sizes = {
    sm: 'px-3 py-1 text-sm rounded-lg',
    md: 'px-6 py-3 text-lg rounded-xl',
    lg: 'px-8 py-4 text-xl rounded-2xl',
    xl: 'px-12 py-6 text-3xl rounded-3xl'
  };

  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.05, filter: 'brightness(1.1)' } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      onClick={onClick}
      disabled={disabled}
      className={`
        font-clash font-bold uppercase tracking-wider relative overflow-hidden
        flex items-center justify-center gap-2
        ${variants[variant]}
        ${sizes[size]}
        ${disabled ? 'opacity-50 grayscale cursor-not-allowed' : ''}
        ${className}
      `}
    >
      {/* Glossy Effect */}
      <div className="absolute top-0 left-0 w-full h-1/2 bg-white/20 rounded-t-lg pointer-events-none"></div>
      
      {children}
    </motion.button>
  );
}

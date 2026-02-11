import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Info } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  isLoading?: boolean;
}

export const NeuButton: React.FC<ButtonProps> = ({ children, variant = 'primary', isLoading, className, ...props }) => {
  const baseStyle = "relative inline-flex items-center justify-center gap-2 px-6 py-3.5 font-display font-bold text-sm tracking-wide transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none rounded-xl";
  
  const variants = {
    primary: "bg-black text-white dark:bg-white dark:text-black shadow-lg shadow-black/10 hover:bg-gray-900 dark:hover:bg-gray-100",
    secondary: "bg-white dark:bg-gray-800 text-black dark:text-white border border-gray-200 dark:border-gray-700 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700",
    danger: "bg-neone-red text-white shadow-lg shadow-neone-red/20 hover:brightness-110",
    ghost: "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
  };

  return (
    <motion.button 
      whileTap={{ scale: 0.98 }}
      className={`${baseStyle} ${variants[variant]} ${className || ''}`}
      {...props}
    >
      {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </motion.button>
  );
};

export const SoftCard: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void }> = ({ children, className, onClick }) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    onClick={onClick}
    className={`bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-gray-100 dark:border-gray-800 text-black dark:text-white ${className || ''}`}
  >
    {children}
  </motion.div>
);

export const NeuAlert: React.FC<{ type: 'danger' | 'info' | 'success'; title: string; children: React.ReactNode }> = ({ type, title, children }) => {
  const colors = {
    danger: 'bg-red-50 text-red-900 border-red-100 dark:bg-red-900/10 dark:text-red-400 dark:border-red-900/30',
    info: 'bg-blue-50 text-blue-900 border-blue-100 dark:bg-blue-900/10 dark:text-blue-400 dark:border-blue-900/30',
    success: 'bg-emerald-50 text-emerald-900 border-emerald-100 dark:bg-emerald-900/10 dark:text-emerald-400 dark:border-emerald-900/30',
  };

  return (
    <div className={`${colors[type]} border p-4 rounded-xl flex gap-3 items-start w-full`}>
      <div className="mt-0.5 flex-shrink-0 text-lg">
        {type === 'danger' && '⚠️'} 
        {type === 'success' && '🛡️'}
        {type === 'info' && 'ℹ️'}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-display font-bold text-sm mb-0.5">
          {title}
        </h4>
        <p className="font-sans text-xs opacity-90 leading-relaxed break-words">{children}</p>
      </div>
    </div>
  );
};

export const TooltipIcon: React.FC<{ text: string }> = ({ text }) => {
  const [show, setShow] = React.useState(false);
  return (
    <div className="relative inline-block ml-1">
      <button 
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={(e) => { e.stopPropagation(); setShow(!show); }}
        className="p-1 text-gray-400 hover:text-black dark:hover:text-white transition-colors"
      >
        <Info size={14} />
      </button>
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 5 }}
            className="absolute z-[100] bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-black dark:bg-gray-800 text-white text-[11px] font-medium rounded-lg shadow-xl pointer-events-none text-center"
          >
            {text}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-black dark:border-t-gray-800" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
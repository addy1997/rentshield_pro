import React from 'react';
import { motion, AnimatePresence, HTMLMotionProps } from 'framer-motion';
import { Loader2, Info, AlertTriangle, ShieldCheck } from 'lucide-react';

interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  isLoading?: boolean;
}

export const NeuButton: React.FC<ButtonProps> = ({ children, variant = 'primary', isLoading, className, ...props }) => {
  const baseStyle = "relative inline-flex items-center justify-center gap-2 px-6 py-3.5 font-display font-bold text-sm tracking-wide transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none rounded-xl";

  const variants = {
    primary: "bg-gradient-to-r from-neone-blue to-purple-500 text-white shadow-lg shadow-neone-blue/30 hover:shadow-neone-blue/50 hover:brightness-110 dark:from-neone-blue dark:to-purple-600 border border-white/20",
    secondary: "bg-white/50 dark:bg-gray-800/50 backdrop-blur-md text-black dark:text-white border border-white/40 dark:border-white/10 shadow-sm hover:bg-white/70 dark:hover:bg-gray-700/60",
    danger: "bg-gradient-to-r from-neone-red to-pink-500 text-white shadow-lg shadow-neone-red/30 hover:shadow-neone-red/50 hover:brightness-110 border border-white/20",
    ghost: "text-gray-600 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 backdrop-blur-sm"
  };

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      className={`${baseStyle} ${variants[variant]} ${className || ''}`}
      {...props}
    >
      <>
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </>
    </motion.button>
  );
};

export const SoftCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}> = ({ children, className, onClick }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    onClick={onClick}
    role={onClick ? 'button' : undefined}
    tabIndex={onClick ? 0 : undefined}
    onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } } : undefined}
    className={`bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl rounded-2xl p-5 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] border border-white/40 dark:border-white/10 text-black dark:text-white transition-all hover:bg-white/80 dark:hover:bg-gray-900/80 ${onClick ? 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-neone-blue' : ''} ${className || ''}`}
  >
    {children}
  </motion.div>
);

export const NeuAlert: React.FC<{
  type: 'danger' | 'info' | 'success';
  title: string;
  children: React.ReactNode;
}> = ({ type, title, children }) => {
  const colors = {
    danger: 'bg-red-500/10 text-red-900 border-red-500/20 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/40 backdrop-blur-md',
    info: 'bg-blue-500/10 text-blue-900 border-blue-500/20 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900/40 backdrop-blur-md',
    success: 'bg-emerald-500/10 text-emerald-900 border-emerald-500/20 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/40 backdrop-blur-md',
  };

  const icons = {
    danger: <AlertTriangle aria-hidden="true" size={18} />,
    success: <ShieldCheck aria-hidden="true" size={18} />,
    info: <Info aria-hidden="true" size={18} />,
  };

  return (
    <div className={`${colors[type]} border p-4 rounded-xl flex gap-3 items-start w-full`} role="alert">
      <div className="mt-0.5 flex-shrink-0">
        {icons[type]}
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
  const tooltipId = React.useId();
  return (
    <div className="relative inline-block ml-1">
      <button
        aria-label="More information"
        aria-describedby={show ? tooltipId : undefined}
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onFocus={() => setShow(true)}
        onBlur={() => setShow(false)}
        onClick={(e) => { e.stopPropagation(); setShow(!show); }}
        className="p-1 text-gray-400 hover:text-black dark:hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-neone-blue rounded"
      >
        <Info size={14} aria-hidden="true" />
      </button>
      <AnimatePresence>
        {show && (
          <motion.div
            id={tooltipId}
            role="tooltip"
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

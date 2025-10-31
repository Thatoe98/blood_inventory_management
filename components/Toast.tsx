'use client';

import { useEffect } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

export default function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    success: {
      bg: 'from-green-500 to-green-600',
      icon: '✅',
      border: 'border-green-400',
    },
    error: {
      bg: 'from-red-500 to-red-600',
      icon: '❌',
      border: 'border-red-400',
    },
    info: {
      bg: 'from-blue-500 to-blue-600',
      icon: 'ℹ️',
      border: 'border-blue-400',
    },
  };

  const style = styles[type];

  return (
    <div className="fixed top-6 right-6 z-50 animate-slide-in-right">
      <div
        className={`bg-gradient-to-r ${style.bg} text-white px-6 py-4 rounded-2xl shadow-2xl border-2 ${style.border} flex items-center gap-4 min-w-[350px] transform hover:scale-105 transition-all duration-300`}
      >
        {/* Icon */}
        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm flex-shrink-0">
          <span className="text-2xl">{style.icon}</span>
        </div>
        
        {/* Message */}
        <p className="flex-1 font-medium">{message}</p>
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center text-white text-xl transition-all duration-300 transform hover:rotate-90 backdrop-blur-sm flex-shrink-0"
        >
          ×
        </button>
        
        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30 rounded-b-2xl overflow-hidden">
          <div className="h-full bg-white/50 rounded-b-2xl animate-progress" style={{
            animation: 'progress 5s linear forwards'
          }}></div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes progress {
          from { width: 100%; }
          to { width: 0%; }
        }
        .animate-progress {
          animation: progress 5s linear forwards;
        }
      `}</style>
    </div>
  );
}

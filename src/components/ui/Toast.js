import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);
        return () => clearTimeout(timer);
    }, [onClose, duration]);

    const icons = {
        success: <CheckCircle className="w-4 h-4 text-emerald-500" />,
        error: <XCircle className="w-4 h-4 text-rose-500" />,
        info: <AlertCircle className="w-4 h-4 text-blue-500" />,
    };

    const bgColors = {
        success: 'bg-emerald-50 border-emerald-100',
        error: 'bg-rose-50 border-rose-100',
        info: 'bg-blue-50 border-blue-100',
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg ${bgColors[type]} min-w-[300px]`}
        >
            <div className="flex-shrink-0">
                {icons[type]}
            </div>
            <p className="flex-1 text-sm font-semibold text-gray-800">
                {message}
            </p>
            <button
                onClick={onClose}
                className="flex-shrink-0 p-1 hover:bg-black/5 rounded-lg transition-colors"
            >
                <X className="w-4 h-4 text-gray-400" />
            </button>
        </motion.div>
    );
};

export default Toast;

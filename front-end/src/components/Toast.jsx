import React, { useEffect } from "react";

const Toast = ({ message, type = "info", onClose, duration = 3000 }) => {
    useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [duration, onClose]);

    const bgColor = {
        success: "bg-green-500",
        error: "bg-red-500",
        warning: "bg-yellow-500",
        info: "bg-blue-500",
    }[type] || "bg-gray-500";

    const icon = {
        success: "✓",
        error: "✕",
        warning: "⚠",
        info: "ℹ",
    }[type] || "ℹ";

    return (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
            <div className={`${bgColor} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 min-w-[280px] max-w-sm`}>
                <span className="text-lg">{icon}</span>
                <p className="flex-1 text-sm">{message}</p>
                <button
                    onClick={onClose}
                    className="text-white hover:text-gray-200 text-lg font-bold ml-1"
                >
                    ×
                </button>
            </div>
        </div>
    );
};

export default Toast;

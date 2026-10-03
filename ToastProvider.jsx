import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const add = useCallback((type, message, options = {}) => {
    const id = `${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const ttl = options.duration ?? 3000;
    setToasts((prev) => [...prev, { id, type, message }]);
    if (ttl > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, ttl);
    }
  }, []);

  const api = useMemo(() => ({
    success: (msg, opts) => add("success", msg, opts),
    error: (msg, opts) => add("error", msg, opts),
    info: (msg, opts) => add("info", msg, opts),
    warning: (msg, opts) => add("warning", msg, opts),
  }), [add]);

  const colorFor = (type) => {
    switch (type) {
      case "success":
        return "border-green-500";
      case "error":
        return "border-red-500";
      case "warning":
        return "border-yellow-500";
      default:
        return "border-blue-500";
    }
  };

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-3">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`w-80 bg-white/95 backdrop-blur rounded-lg shadow-lg border-l-4 ${colorFor(t.type)} p-3`}
          >
            <div className="text-[10px] tracking-widest font-bold text-gray-500">EXAMSPHERE</div>
            <div className="text-sm text-gray-800 mt-1">{t.message}</div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

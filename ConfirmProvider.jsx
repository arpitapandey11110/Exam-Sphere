import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
  const [state, setState] = useState({
    open: false,
    mode: "confirm", // 'confirm' | 'prompt'
    title: "",
    message: "",
    confirmText: "Confirm",
    cancelText: "Cancel",
    placeholder: "",
    defaultValue: "",
  });
  const [resolver, setResolver] = useState(null);
  const [inputValue, setInputValue] = useState("");

  const confirm = useCallback((options = {}) => {
    return new Promise((resolve) => {
      setResolver(() => resolve);
      setState({
        open: true,
        mode: "confirm",
        title: options.title || "Confirm",
        message: options.message || "Are you sure?",
        confirmText: options.confirmText || "Confirm",
        cancelText: options.cancelText || "Cancel",
        placeholder: "",
        defaultValue: "",
      });
    });
  }, []);

  const prompt = useCallback((options = {}) => {
    return new Promise((resolve) => {
      setResolver(() => resolve);
      setInputValue(options.defaultValue || "");
      setState({
        open: true,
        mode: "prompt",
        title: options.title || "Enter a value",
        message: options.message || "",
        confirmText: options.confirmText || "OK",
        cancelText: options.cancelText || "Cancel",
        placeholder: options.placeholder || "",
        defaultValue: options.defaultValue || "",
      });
    });
  }, []);

  const close = useCallback(() => setState(prev => ({ ...prev, open: false })), []);

  const api = useMemo(() => ({ confirm, prompt }), [confirm, prompt]);

  const onConfirm = () => {
    if (resolver) {
      if (state.mode === "prompt") resolver(inputValue || ""); else resolver(true);
    }
    close();
  };
  const onCancel = () => { if (resolver) resolver(state.mode === "prompt" ? null : false); close(); };

  return (
    <ConfirmContext.Provider value={api}>
      {children}
      {state.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-5 border">
            <div className="text-[10px] tracking-widest font-bold text-gray-500">EXAMSPHERE</div>
            <h3 className="text-lg font-semibold text-gray-900 mt-1">{state.title}</h3>
            {state.message && <p className="text-sm text-gray-600 mt-2">{state.message}</p>}
            {state.mode === "prompt" && (
              <input
                autoFocus
                type="text"
                className="mt-4 w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={state.placeholder}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
            )}
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={onCancel} className="px-4 py-2 rounded-md border text-sm hover:bg-gray-50">{state.cancelText}</button>
              <button onClick={onConfirm} className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700">{state.confirmText}</button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm must be used within ConfirmProvider");
  return ctx.confirm;
}

export function usePrompt() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("usePrompt must be used within ConfirmProvider");
  return ctx.prompt;
}

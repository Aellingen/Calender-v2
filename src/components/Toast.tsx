import { create } from 'zustand';

interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastStore {
  toasts: ToastItem[];
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (message, type = 'success') => {
    const id = Date.now().toString();
    set((s) => ({ toasts: [...s.toasts, { id, message, type }] }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, 3000);
  },
  removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

export function toast(message: string, type?: 'success' | 'error' | 'info') {
  useToastStore.getState().addToast(message, type);
}

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="flex items-center gap-2 px-4 py-2.5 rounded-[var(--r-lg)] text-sm font-medium animate-slide-up cursor-pointer"
          style={{
            background: t.type === 'error' ? 'var(--danger)' : t.type === 'info' ? 'var(--accent)' : 'var(--success)',
            color: 'white',
            boxShadow: 'var(--shadow-md)',
          }}
          onClick={() => removeToast(t.id)}
        >
          {t.type === 'error' && <span>&#x2717;</span>}
          {t.type === 'success' && <span>&#x2713;</span>}
          {t.type === 'info' && <span>&#x2139;</span>}
          {t.message}
        </div>
      ))}
    </div>
  );
}

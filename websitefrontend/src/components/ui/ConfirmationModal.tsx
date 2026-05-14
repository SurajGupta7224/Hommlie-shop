


interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel'
}: ConfirmationModalProps) {
  if (!isOpen) return null;



  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-slate-900/60 animate-in fade-in duration-200" onClick={onClose}></div>
      
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-[320px] overflow-hidden z-10 animate-in zoom-in-95 duration-200">
        <div className="p-5">
          <h3 className="text-base font-bold text-slate-900 mb-2">{title}</h3>
          <p className="text-sm text-slate-600 leading-normal mb-6">
            {message}
          </p>
          
          <div className="flex justify-end gap-6 uppercase tracking-wider text-xs font-bold">
            <button 
              onClick={onClose}
              className="text-slate-500 hover:text-slate-700 transition-all active:scale-95"
            >
              {cancelText}
            </button>
            <button 
              onClick={() => { onConfirm(); onClose(); }}
              className="text-primary hover:text-primary/80 transition-all active:scale-95"
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

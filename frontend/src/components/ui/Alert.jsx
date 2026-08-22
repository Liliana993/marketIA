import { AlertTriangle, CheckCircle, Info, XCircle, X } from "lucide-react";
import { useState } from "react";

const variants = {
  success: { bg: "bg-success-50", border: "border-success-500", text: "text-success-700", Icon: CheckCircle },
  error: { bg: "bg-danger-50", border: "border-danger-500", text: "text-danger-700", Icon: XCircle },
  warning: { bg: "bg-warning-50", border: "border-warning-500", text: "text-warning-700", Icon: AlertTriangle },
  info: { bg: "bg-brand-50", border: "border-brand-500", text: "text-brand-700", Icon: Info },
};

const Alert = ({ variant = "info", message, onClose }) => {
  const { bg, border, text, Icon } = variants[variant];

  return (
    <div className={`${bg} border-l-4 ${border} ${text} p-4 rounded-r-lg flex items-start gap-3`}>
      <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
      <p className="text-sm flex-1">{message}</p>
      {onClose && (
        <button onClick={onClose} className="flex-shrink-0">
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default Alert;

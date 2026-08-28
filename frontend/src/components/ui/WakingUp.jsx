import { useState, useEffect } from "react";
import { Store } from "lucide-react";

const WakingUp = () => {
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setSlow(true), 8000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gray-50">
      <div className="flex items-center gap-2 mb-6">
        <Store className="w-10 h-10 text-brand-600" />
        <span className="text-3xl font-bold text-brand-700">MarketIA</span>
      </div>
      <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mb-4" />
      <p className="text-sm text-gray-600">
        {slow
          ? "El servidor está despertando, puede tardar hasta un minuto. Esperá un momento..."
          : "Despertando el servidor..."}
      </p>
    </div>
  );
};

export default WakingUp;
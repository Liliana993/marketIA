import { Loader2 } from "lucide-react";

const Loading = ({ text = "Cargando..." }) => {
  return (
    <div className="flex flex-col justify-center items-center py-16">
      <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
      <p className="text-sm text-gray-500 mt-3">{text}</p>
    </div>
  );
};

export default Loading;

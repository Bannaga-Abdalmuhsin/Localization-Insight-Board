import { Link } from "wouter";
import { AlertCircle, Home } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

export default function NotFound() {
  const { lang } = useTranslation();
  const isAr = lang === "ar";
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 fade-in-up text-center">
      <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center mb-2 shadow-sm">
        <AlertCircle className="w-12 h-12 text-slate-400" />
      </div>
      <div>
        <h1 className="text-7xl font-black text-slate-800 tracking-tighter">404</h1>
        <p className="text-lg font-semibold text-slate-500 mt-2">
          {isAr ? "الصفحة غير موجودة" : "Page not found"}
        </p>
      </div>
      <Link href="/">
        <button className="mt-4 flex items-center gap-2 px-6 py-3 bg-[#0a1d37] hover:bg-[#15345a] text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-900/20 transition-all transform hover:-translate-y-0.5">
          <Home className="w-4 h-4" />
          {isAr ? "العودة إلى لوحة القيادة" : "Back to Dashboard"}
        </button>
      </Link>
    </div>
  );
}

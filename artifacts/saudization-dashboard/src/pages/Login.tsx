import { useState, FormEvent } from "react";
import { Languages, Lock, User, ShieldAlert, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useTranslation } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import acesLogoImg from "@assets/MSD_Logo_1782037993058.png";

export default function Login() {
  const { login } = useAuth();
  const { t, lang, setLang, isRtl } = useTranslation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isAr = lang === "ar";

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!username.trim() || !password) return;
    setError("");
    setLoading(true);
    const result = await login(username.trim(), password);
    setLoading(false);
    if (!result.ok) {
      setError(t.login.invalidCredentials);
    }
  }

  return (
    <div className="min-h-screen flex items-stretch bg-[#f8f9fc] relative overflow-hidden">
      {/* Background Graphic Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[50%] h-[60%] rounded-full bg-blue-500/10 blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[70%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute top-[30%] left-[20%] w-[30%] h-[40%] rounded-full bg-emerald-500/5 blur-[80px]" />
      </div>

      {/* Language toggle */}
      <button
        onClick={() => setLang(lang === "ar" ? "en" : "ar")}
        className={cn(
          "fixed top-6 z-20 flex items-center gap-2 px-4 py-2 bg-white/80 border border-slate-200 rounded-full text-xs font-bold text-slate-600 hover:text-primary hover:bg-white transition-all backdrop-blur-md shadow-sm",
          isRtl ? "left-6" : "right-6"
        )}
      >
        <Languages className="w-4 h-4" />
        {lang === "ar" ? "English" : "عربي"}
      </button>

      {/* Left side — Decorative/Informational (hidden on small screens) */}
      <div className="hidden lg:flex flex-1 flex-col justify-center px-20 relative z-10">
        <div className="max-w-xl fade-in-up stagger-1">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 text-blue-800 text-xs font-bold tracking-widest uppercase mb-6 border border-blue-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {isAr ? "بوابة الامتثال" : "Compliance Portal"}
          </div>
          <h1 className="text-5xl font-black text-[#0a1d37] leading-[1.1] tracking-tight mb-6">
            {isAr ? "منصة إدارة توطين الكفاءات" : "Localization Management Platform"}
          </h1>
          <p className="text-lg text-slate-500 font-medium leading-relaxed mb-10 max-w-md">
            {isAr 
              ? "متابعة دقيقة ونظرة شاملة لنسب التوطين وامتثال القوى العاملة لاشتراطات وزارة الموارد البشرية."
              : "Precise tracking and comprehensive overview of localization targets and workforce compliance."}
          </p>
          
          <div className="grid grid-cols-2 gap-4">
            {[
              { title: isAr ? "دقة البيانات" : "Data Accuracy", desc: isAr ? "مزامنة مباشرة للسجلات" : "Live record sync" },
              { title: isAr ? "تحليل الفجوات" : "Gap Analysis", desc: isAr ? "تحديد الاحتياجات بدقة" : "Identify hiring needs" },
              { title: isAr ? "مطابقة المهن" : "Role Matching", desc: isAr ? "توافق المسميات والإقامات" : "JD & Iqama alignment" },
              { title: isAr ? "تقارير شاملة" : "Reporting", desc: isAr ? "حسب المشروع والشركة" : "By project & company" },
            ].map((feature, i) => (
              <div key={i} className="bg-white/60 backdrop-blur-sm border border-slate-200/60 p-4 rounded-2xl">
                <p className="font-bold text-slate-800 text-sm mb-1">{feature.title}</p>
                <p className="text-xs text-slate-500 font-medium">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Login card — pinned to the right side */}
      <div
        className={cn(
          "relative z-10 flex flex-col justify-center w-full lg:w-[480px] min-h-screen p-8 lg:p-12",
          "bg-white shadow-[0_0_40px_-15px_rgba(0,0,0,0.1)] border-s border-slate-200",
        )}
      >
        <div className="w-full max-w-sm mx-auto fade-in-up stagger-2">
          {/* ACES logo */}
          <div className="mb-10 text-center">
            <img
              src={acesLogoImg}
              alt="ACES Managed Services"
              className="w-48 mx-auto object-contain drop-shadow-sm"
            />
          </div>

          <div className="mb-8 text-center">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">
              {t.login.title}
            </h2>
            <p className="text-sm text-slate-500 mt-2 font-medium">
              {isAr ? "الرجاء إدخال بيانات الاعتماد للمتابعة" : "Please enter your credentials to continue"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">{t.login.username}</label>
              <div className="relative">
                <User className={cn("absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400", isRtl ? "right-4" : "left-4")} />
                <input
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={t.login.usernamePlaceholder}
                  className={cn(
                    "w-full h-12 text-sm rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-800 placeholder:text-slate-400 outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-medium",
                    isRtl ? "pr-11 pl-4" : "pl-11 pr-4"
                  )}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">{t.login.password}</label>
              <div className="relative">
                <Lock className={cn("absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400", isRtl ? "right-4" : "left-4")} />
                <input
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.login.passwordPlaceholder}
                  className={cn(
                    "w-full h-12 text-sm rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-800 placeholder:text-slate-400 outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-medium",
                    isRtl ? "pr-11 pl-4" : "pl-11 pr-4"
                  )}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2.5 text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3 font-bold animate-in fade-in zoom-in-95 duration-200">
                <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !username.trim() || !password}
              className="w-full h-12 mt-4 bg-[#0a1d37] hover:bg-[#15345a] text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-900/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  {t.login.loggingIn}
                </>
              ) : t.login.submit}
            </button>
          </form>

          {/* Disclaimer */}
          <div className="mt-8 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <p className="text-[11px] text-slate-500 font-medium flex items-start gap-2 leading-relaxed">
              <ShieldAlert className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
              {t.login.unauthorized}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

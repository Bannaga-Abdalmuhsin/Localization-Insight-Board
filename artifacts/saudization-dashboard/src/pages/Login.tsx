import { useState, FormEvent } from "react";
import { Languages, Lock, User, ShieldAlert } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useTranslation } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import AcesLogo from "@/components/AcesLogo";

export default function Login() {
  const { login } = useAuth();
  const { t, lang, setLang, isRtl } = useTranslation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "linear-gradient(135deg, #0a1d37 0%, #0e2a4f 50%, #0a1d37 100%)" }}
    >
      {/* Language toggle */}
      <button
        onClick={() => setLang(lang === "ar" ? "en" : "ar")}
        className={cn(
          "fixed top-4 flex items-center gap-1.5 px-3 py-1.5 bg-white/10 border border-white/20 rounded-lg text-xs font-medium text-white/80 hover:text-white hover:bg-white/20 transition-colors backdrop-blur-sm",
          isRtl ? "left-4" : "right-4"
        )}
      >
        <Languages className="w-3.5 h-3.5" />
        {lang === "ar" ? "English" : "عربي"}
      </button>

      <div className="w-full max-w-sm">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-white/10">

          {/* Header — dark navy with ACES logo */}
          <div className="px-8 pt-8 pb-6 text-center" style={{ background: "#0a1d37" }}>
            <div className="mx-auto mb-4 flex justify-center">
              <AcesLogo variant="full" />
            </div>
            <p className="text-white/65 text-xs mt-2 tracking-wide">
              {isRtl ? "الخدمات المُدارة — بوابة التوطين" : "Managed Services — Nitaqat Portal"}
            </p>
          </div>

          {/* Form */}
          <div className="px-8 py-7">
            <p className="text-center text-sm font-semibold text-foreground mb-6">
              {t.login.title}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">{t.login.username}</label>
                <div className="relative">
                  <User className={cn("absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground", isRtl ? "right-3" : "left-3")} />
                  <input
                    type="text"
                    autoComplete="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={t.login.usernamePlaceholder}
                    className={cn(
                      "w-full h-10 text-sm rounded-lg border border-border bg-muted/30 outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors",
                      isRtl ? "pr-9 pl-4" : "pl-9 pr-4"
                    )}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">{t.login.password}</label>
                <div className="relative">
                  <Lock className={cn("absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground", isRtl ? "right-3" : "left-3")} />
                  <input
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t.login.passwordPlaceholder}
                    className={cn(
                      "w-full h-10 text-sm rounded-lg border border-border bg-muted/30 outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors",
                      isRtl ? "pr-9 pl-4" : "pl-9 pr-4"
                    )}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/5 border border-destructive/20 rounded-lg px-3 py-2">
                  <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0" />
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || !username.trim() || !password}
                className="w-full h-10 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{ background: loading ? "#004a9a" : "#0056b3" }}
                onMouseEnter={(e) => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = "#004a9a"; }}
                onMouseLeave={(e) => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = "#0056b3"; }}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    {t.login.loggingIn}
                  </>
                ) : t.login.submit}
              </button>
            </form>
          </div>
        </div>

        {/* Disclaimer */}
        <p className="mt-4 text-center text-[11px] text-white/40 flex items-center justify-center gap-1.5">
          <ShieldAlert className="w-3 h-3" />
          {t.login.unauthorized}
        </p>
      </div>
    </div>
  );
}

import { useState, useEffect, FormEvent } from "react";
import { Trash2, UserPlus, ShieldCheck, User, Eye, EyeOff, Settings as SettingsIcon } from "lucide-react";
import { useAuth, type AppUser } from "@/lib/auth";
import { useTranslation } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export default function Settings() {
  const { user, users, refreshUsers, addUser, deleteUser } = useAuth();
  const { t, isRtl } = useTranslation();

  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newIsAdmin, setNewIsAdmin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [adding, setAdding] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null);

  useEffect(() => {
    refreshUsers();
  }, []);

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    if (!newUsername.trim() || !newPassword) return;
    setAdding(true);
    setFeedback(null);
    const result = await addUser(newUsername.trim(), newPassword, newIsAdmin);
    setAdding(false);
    if (result.ok) {
      setFeedback({ ok: true, msg: t.settings.addSuccess });
      setNewUsername("");
      setNewPassword("");
      setNewIsAdmin(false);
    } else {
      setFeedback({ ok: false, msg: `${t.settings.addError}: ${result.error}` });
    }
  }

  async function handleDelete(u: AppUser) {
    if (u.id === user?.id) return;
    if (!window.confirm(t.settings.deleteConfirm)) return;
    await deleteUser(u.id);
  }

  return (
    <div className="p-6 space-y-8 max-w-3xl pb-12">
      {/* Header */}
      <div className="fade-in-up stagger-1">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <SettingsIcon className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">{t.settings.title}</h1>
            <p className="text-sm font-medium text-slate-500 mt-0.5">{t.settings.subtitle}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 fade-in-up stagger-2">
        {/* Form Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/40 p-6 overflow-hidden relative">
            {/* Decorative background element */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[40px] pointer-events-none" />
            
            <h2 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2 relative z-10">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <UserPlus className="w-4 h-4 text-primary" />
              </div>
              {t.settings.addUser}
            </h2>

            <form onSubmit={handleAdd} className="space-y-5 relative z-10">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-widest">{t.settings.username}</label>
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder={t.settings.usernamePlaceholder}
                    className="w-full h-11 text-sm font-medium rounded-xl border border-slate-200 bg-slate-50 text-slate-800 placeholder:text-slate-400 outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all px-4"
                    required
                    disabled={adding}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-widest">{t.settings.password}</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder={t.settings.passwordPlaceholder}
                      className={cn(
                        "w-full h-11 text-sm font-medium rounded-xl border border-slate-200 bg-slate-50 text-slate-800 placeholder:text-slate-400 outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all",
                        isRtl ? "pl-11 pr-4" : "pr-11 pl-4"
                      )}
                      required
                      disabled={adding}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className={cn(
                        "absolute top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors rounded-lg",
                        isRtl ? "left-1.5" : "right-1.5"
                      )}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <div className="relative flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={newIsAdmin}
                      onChange={(e) => setNewIsAdmin(e.target.checked)}
                      className="peer appearance-none w-5 h-5 border-2 border-slate-300 rounded-md checked:bg-primary checked:border-primary transition-all cursor-pointer"
                      disabled={adding}
                    />
                    <div className="absolute text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity">
                      <svg className="w-3 h-3" viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 5L4.5 8.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-primary" />
                    {t.settings.isAdmin}
                  </span>
                </label>
              </div>

              {feedback && (
                <div className={cn(
                  "text-xs font-bold px-4 py-3 rounded-xl border flex items-start gap-2",
                  feedback.ok
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-red-50 text-red-700 border-red-200"
                )}>
                  {feedback.ok ? <ShieldCheck className="w-4 h-4 flex-shrink-0" /> : <ShieldCheck className="w-4 h-4 flex-shrink-0" />}
                  {feedback.msg}
                </div>
              )}

              <button
                type="submit"
                disabled={adding || !newUsername.trim() || !newPassword}
                className="w-full h-11 bg-[#0a1d37] hover:bg-[#15345a] text-white text-sm font-bold rounded-xl shadow-md transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
              >
                {adding ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    {t.settings.adding}
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    {t.settings.addUser}
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Users List Column */}
        <div className="lg:col-span-3">
          <div className="rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/40 overflow-hidden flex flex-col h-full min-h-[400px]">
            <div className="px-6 py-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-600">
                {users.length > 0 ? `${users.length} ${isRtl ? "مستخدم مسجل" : "Registered User(s)"}` : t.settings.noUsers}
              </h2>
            </div>

            {users.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <User className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-sm font-bold text-slate-500">{t.settings.setupRequired}</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 overflow-y-auto">
                {users.map((u) => (
                  <div key={u.id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50/50 transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm border",
                        u.is_admin ? "bg-primary/10 border-primary/20 text-primary" : "bg-slate-100 border-slate-200 text-slate-500"
                      )}>
                        {u.is_admin ? <ShieldCheck className="w-5 h-5" /> : <User className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="text-base font-bold text-slate-800 flex items-center gap-2">
                          {u.username}
                          {u.id === user?.id && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 uppercase tracking-widest">{t.settings.you}</span>
                          )}
                        </p>
                        <p className={cn(
                          "text-xs font-semibold mt-0.5",
                          u.is_admin ? "text-primary" : "text-slate-500"
                        )}>
                          {u.is_admin ? t.settings.admin : t.settings.user}
                        </p>
                      </div>
                    </div>

                    {u.id !== user?.id && (
                      <button
                        onClick={() => handleDelete(u)}
                        className="w-9 h-9 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                        title={t.settings.delete}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect, FormEvent } from "react";
import { Trash2, UserPlus, ShieldCheck, User, Eye, EyeOff } from "lucide-react";
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
    <div className="p-6 space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t.settings.title}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t.settings.subtitle}</p>
      </div>

      {/* Add User Form */}
      <div className="rounded-xl border border-border bg-white shadow-sm p-6">
        <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <UserPlus className="w-4 h-4 text-primary" />
          {t.settings.addUser}
        </h2>
        <form onSubmit={handleAdd} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">{t.settings.username}</label>
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder={t.settings.usernamePlaceholder}
                className="w-full h-9 text-sm rounded-lg border border-border bg-muted/30 px-3 outline-none focus:ring-2 focus:ring-primary/30"
                required
                disabled={adding}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">{t.settings.password}</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={t.settings.passwordPlaceholder}
                  className={cn("w-full h-9 text-sm rounded-lg border border-border bg-muted/30 px-3 outline-none focus:ring-2 focus:ring-primary/30", isRtl ? "pl-9" : "pr-9")}
                  required
                  disabled={adding}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className={cn("absolute top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground", isRtl ? "left-2.5" : "right-2.5")}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={newIsAdmin}
                onChange={(e) => setNewIsAdmin(e.target.checked)}
                className="w-4 h-4 accent-primary rounded"
                disabled={adding}
              />
              <span className="text-sm text-foreground flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                {t.settings.isAdmin}
              </span>
            </label>
          </div>

          {feedback && (
            <div className={cn(
              "text-xs px-3 py-2 rounded-lg border",
              feedback.ok
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-destructive/5 text-destructive border-destructive/20"
            )}>
              {feedback.msg}
            </div>
          )}

          <button
            type="submit"
            disabled={adding || !newUsername.trim() || !newPassword}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-lg shadow-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
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

      {/* Users List */}
      <div className="rounded-xl border border-border bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-border bg-muted/30">
          <h2 className="text-sm font-semibold text-foreground">
            {users.length > 0 ? `${users.length} ${isRtl ? "مستخدم" : "user(s)"}` : t.settings.noUsers}
          </h2>
        </div>

        {users.length === 0 ? (
          <div className="py-10 text-center text-sm text-muted-foreground">
            {t.settings.setupRequired}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {users.map((u) => (
              <div key={u.id} className="flex items-center justify-between px-5 py-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    {u.is_admin
                      ? <ShieldCheck className="w-4 h-4 text-primary" />
                      : <User className="w-4 h-4 text-muted-foreground" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {u.username}
                      {u.id === user?.id && (
                        <span className="ms-2 text-xs text-muted-foreground font-normal">{t.settings.you}</span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {u.is_admin ? t.settings.admin : t.settings.user}
                    </p>
                  </div>
                </div>

                {u.id !== user?.id && (
                  <button
                    onClick={() => handleDelete(u)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-destructive border border-destructive/20 rounded-lg hover:bg-destructive/5 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    {t.settings.delete}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

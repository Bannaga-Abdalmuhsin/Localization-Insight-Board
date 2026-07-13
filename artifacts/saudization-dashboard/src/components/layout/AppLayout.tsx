import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  ChevronRight,
  Languages,
  Settings,
  LogOut,
  GitCompareArrows,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import acesNavLogo from "@assets/image_1782039604213.png";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [location] = useLocation();
  const { t, lang, setLang, isRtl } = useTranslation();
  const { user, logout } = useAuth();

  const NAV_ITEMS = [
    { label: t.nav.dashboard, href: "/", icon: LayoutDashboard },
    { label: t.nav.teamBreakdown, href: "/teams", icon: Users },
    { label: t.nav.positionDetail, href: "/positions", icon: Briefcase },
    { label: t.nav.roleAlignment,  href: "/alignment", icon: GitCompareArrows },
    { label: t.nav.analysis, href: "/analysis", icon: BarChart3 },
    ...(user?.is_admin ? [{ label: t.nav.settings, href: "/settings", icon: Settings }] : []),
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar — Refined and elevated */}
      <aside className="w-72 flex-shrink-0 border-e border-border/50 bg-sidebar/95 backdrop-blur-xl flex flex-col h-screen overflow-hidden shadow-[2px_0_15px_-3px_rgba(0,0,0,0.1)] relative z-20">
        
        {/* Decorative subtle glow */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-primary/10 blur-[50px] pointer-events-none" />

        {/* Logo / Brand */}
        <div className="h-20 flex items-center px-6 border-b border-white/5 relative z-10">
          <img
            src={acesNavLogo}
            alt="ACES"
            className="h-10 w-auto object-contain drop-shadow-md"
          />
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto relative z-10">
          <div className="px-3 pb-2 text-xs font-semibold text-sidebar-foreground/40 uppercase tracking-widest">
            {isRtl ? "القائمة الرئيسية" : "Main Menu"}
          </div>
          {NAV_ITEMS.map((item, idx) => {
            const active = location === item.href || (item.href !== "/" && location.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "flex items-center gap-3.5 px-3 py-3 rounded-xl text-sm font-medium cursor-pointer transition-all duration-300 relative group overflow-hidden fade-in-up",
                    active
                      ? "text-white bg-white/10 shadow-[0_0_20px_-5px_rgba(255,255,255,0.1)] border border-white/10"
                      : "text-sidebar-foreground/70 border border-transparent hover:bg-white/5 hover:text-white"
                  )}
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  {/* Active indicator bar */}
                  {active && (
                    <div className="absolute start-0 top-1/2 -translate-y-1/2 w-1 h-1/2 bg-primary rounded-e-full" />
                  )}
                  <item.icon className={cn("w-4 h-4 flex-shrink-0 transition-transform duration-300", active ? "text-primary" : "text-sidebar-foreground/50 group-hover:scale-110")} />
                  <span className="flex-1">{item.label}</span>
                  {active && (
                    <ChevronRight className={cn("w-4 h-4 opacity-50 text-white", isRtl && "rotate-180")} />
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Bottom controls */}
        <div className="px-5 pb-6 pt-5 border-t border-white/5 bg-sidebar-accent/30 relative z-10 space-y-3">
          {/* Language toggle */}
          <button
            onClick={() => setLang(lang === "ar" ? "en" : "ar")}
            className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl border border-white/10 text-xs font-semibold text-sidebar-foreground/80 hover:bg-white/10 hover:text-white transition-all shadow-sm group"
          >
            <Languages className="w-4 h-4 text-sidebar-foreground/50 group-hover:text-primary transition-colors" />
            {lang === "ar" ? "Switch to English" : "التبديل للعربية"}
          </button>

          {/* User info + logout */}
          <div className="flex items-center gap-3 px-3 py-2 bg-black/20 rounded-xl border border-white/5">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center flex-shrink-0 shadow-inner">
              <span className="text-sm font-bold text-white shadow-sm">
                {user?.username?.[0]?.toUpperCase() ?? "?"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <span className="block text-sm font-bold text-white truncate leading-tight">
                {user?.username}
              </span>
              <span className="block text-[10px] font-medium text-sidebar-foreground/50 uppercase tracking-wider">
                {user?.is_admin
                  ? (isRtl ? "مسؤول النظام" : "Administrator")
                  : (isRtl ? "مستخدم" : "User")}
              </span>
            </div>
            <button
              onClick={logout}
              title={t.nav.logout}
              className="p-2 text-sidebar-foreground/40 hover:text-red-400 hover:bg-red-400/10 transition-all rounded-lg"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <main className="flex-1 overflow-y-auto px-4 md:px-8 lg:px-12 py-8 bg-[#f8f9fc] relative">
          <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-blue-50/50 to-transparent pointer-events-none" />
          <div className="relative z-10 max-w-[1600px] mx-auto fade-in-up">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

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
    ...(user?.is_admin ? [{ label: t.nav.settings, href: "/settings", icon: Settings }] : []),
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar — ACES dark navy */}
      <aside className="w-64 flex-shrink-0 border-e border-sidebar-border bg-sidebar flex flex-col h-screen overflow-hidden">

        {/* Logo / Brand */}
        <div className="h-16 flex items-center px-4 border-b border-sidebar-border">
          <img
            src={acesNavLogo}
            alt="ACES"
            className="h-9 w-auto object-contain"
          />
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const active = location === item.href || (item.href !== "/" && location.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href}>
                <div
                  data-testid={`nav-${item.href.replace("/", "") || "dashboard"}`}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-colors",
                    active
                      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  {active && (
                    <ChevronRight className={cn("w-3.5 h-3.5 opacity-70", isRtl && "rotate-180")} />
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Bottom controls */}
        <div className="px-4 pb-4 border-t border-sidebar-border pt-3 space-y-2">
          {/* Language toggle */}
          <button
            onClick={() => setLang(lang === "ar" ? "en" : "ar")}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-sidebar-border text-xs font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
            data-testid="btn-lang-toggle"
          >
            <Languages className="w-3.5 h-3.5" />
            {lang === "ar" ? "English" : "عربي"}
          </button>

          {/* User info + logout */}
          <div className="flex items-center gap-2 px-2 py-1.5">
            <div className="w-7 h-7 rounded-full bg-sidebar-primary/30 flex items-center justify-center flex-shrink-0 border border-sidebar-primary/40">
              <span className="text-xs font-semibold text-white">
                {user?.username?.[0]?.toUpperCase() ?? "?"}
              </span>
            </div>
            <span className="flex-1 text-xs font-medium text-sidebar-foreground truncate">
              {user?.username}
            </span>
            <button
              onClick={logout}
              title={t.nav.logout}
              className="p-1.5 text-sidebar-foreground/50 hover:text-red-400 transition-colors rounded"
              data-testid="btn-logout"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

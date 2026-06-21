import { Link, useLocation } from "wouter";
import { LayoutDashboard, Users, Briefcase, Upload, ChevronRight, Languages } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [location] = useLocation();
  const { t, lang, setLang, isRtl } = useTranslation();

  const NAV_ITEMS = [
    { label: t.nav.dashboard, href: "/", icon: LayoutDashboard },
    { label: t.nav.teamBreakdown, href: "/teams", icon: Users },
    { label: t.nav.positionDetail, href: "/positions", icon: Briefcase },
    { label: t.nav.uploadData, href: "/upload", icon: Upload },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 border-e border-sidebar-border bg-sidebar flex flex-col">
        {/* Logo / Brand */}
        <div className="h-16 flex items-center px-6 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">س</span>
            </div>
            <div>
              <p className="font-semibold text-sidebar-foreground text-sm leading-tight">{t.nav.brand}</p>
              <p className="text-xs text-muted-foreground leading-tight">{t.nav.brandSub}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = location === item.href || (item.href !== "/" && location.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href}>
                <div
                  data-testid={`nav-${item.href.replace("/", "") || "dashboard"}`}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-colors",
                    active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  {active && (
                    <ChevronRight
                      className={cn("w-3.5 h-3.5 opacity-70", isRtl && "rotate-180")}
                    />
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Language Toggle */}
        <div className="px-4 pb-3">
          <button
            onClick={() => setLang(lang === "ar" ? "en" : "ar")}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-sidebar-border text-xs font-medium text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
            data-testid="btn-lang-toggle"
          >
            <Languages className="w-3.5 h-3.5" />
            {lang === "ar" ? "English" : "عربي"}
          </button>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-sidebar-border">
          <p className="text-xs text-muted-foreground">{t.nav.ministry}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{t.nav.framework}</p>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { signOutAuth } from "@/lib/auth";
import { Terminal, LayoutDashboard, Briefcase, Bookmark, KanbanSquare, BarChart3, LogOut } from "lucide-react";
import type { ReactNode } from "react";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/jobs", label: "Jobs", icon: Briefcase },
  { to: "/saved", label: "Saved", icon: Bookmark },
  { to: "/applications", label: "Tracker", icon: KanbanSquare },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await signOutAuth();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="landing-shell app-shell">
      <header className="app-shell-header">
        <div className="app-shell-header-inner">
          <Link to="/dashboard" className="landing-brand">
            <div className="landing-brand-icon">
              <Terminal size={18} />
            </div>
            <span>PipelineMatch</span>
          </Link>
          <nav className="app-shell-nav">
            {NAV.map((item) => {
              const active = pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`app-shell-nav-link ${active ? "active" : ""}`}
                >
                  <item.icon className="size-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
          <Button variant="ghost" size="sm" onClick={signOut}>
            <LogOut className="size-4" />
            <span className="hidden sm:inline">Sign out</span>
          </Button>
        </div>
      </header>
      <main className="app-shell-main">{children}</main>
    </div>
  );
}

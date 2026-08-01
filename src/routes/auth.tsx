import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getCurrentAuthUser, signInWithEmailPassword, signOutAuth, signUpWithEmailPassword } from "@/lib/auth";
import { Terminal } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — PipelineMatch" },
      { name: "description", content: "Sign in or create an account to match DevOps and SRE jobs to your resume." },
      { property: "og:title", content: "Sign in — PipelineMatch" },
      { property: "og:description", content: "Access your DevOps job matches, saved roles and application tracker." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void getCurrentAuthUser().then((user) => {
      if (user) navigate({ to: "/dashboard", replace: true });
    });
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        await signUpWithEmailPassword(email, password);
        toast.success("Account ready. You can continue to the dashboard.");
      } else {
        await signInWithEmailPassword(email, password);
      }
      navigate({ to: "/dashboard", replace: true });
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="landing-shell auth-page">
      <div className="auth-panel">
        <Link to="/" className="auth-brand">
          <div className="landing-brand-icon">
            <Terminal size={18} />
          </div>
          <span>PipelineMatch</span>
        </Link>

        <div className="auth-card">
          <div className="auth-card-header">
            <p className="hero-badge">secure access</p>
            <h1>{mode === "signin" ? "Welcome back" : "Create your account"}</h1>
            <p>
              {mode === "signin"
                ? "Sign in to review matches, saved roles and your application flow."
                : "Start scoring DevOps roles against your resume in a few seconds."}
            </p>
          </div>

          <form onSubmit={submit} className="auth-form">
            <div className="auth-field">
              <Label htmlFor="email">Username or email</Label>
              <Input
                id="email"
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin or you@example.com"
                autoComplete="username"
              />
            </div>
            <div className="auth-field">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                minLength={4}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="admin"
                autoComplete="current-password"
              />
            </div>
            <p className="auth-hint">Demo login: admin / admin</p>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Working…" : mode === "signin" ? "Sign in" : "Sign up"}
            </Button>
          </form>

          <button
            type="button"
            className="auth-toggle"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          >
            {mode === "signin" ? "No account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}

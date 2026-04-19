"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Mode = "signin" | "magic";

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [magicSent, setMagicSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    else window.location.href = "/";
    setLoading(false);
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/` },
    });
    if (error) setError(error.message);
    else setMagicSent(true);
    setLoading(false);
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/` },
    });
    if (error) setError(error.message);
    else setMagicSent(true);
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1
            className="text-3xl font-extrabold tracking-tight text-primary"
            style={{ letterSpacing: "-0.025em" }}
          >
            Quatro
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Focus on what matters. Only 4 things at a time.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {magicSent ? (
            <div className="text-center py-4">
              <p className="text-primary font-semibold text-lg">Check your email</p>
              <p className="mt-2 text-sm text-muted-foreground">
                We sent a link to <strong>{email}</strong>. Click it to sign in.
              </p>
            </div>
          ) : mode === "signin" ? (
            <>
              <h2 className="text-xl font-bold text-primary mb-6">Sign in</h2>
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="bg-muted border-0 focus-visible:ring-quatro-blue"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="bg-muted border-0 focus-visible:ring-quatro-blue"
                  />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary hover:bg-quatro-blue text-white font-bold rounded-lg px-4 py-2.5 text-sm transition-colors disabled:opacity-50"
                >
                  {loading ? "Signing in…" : "Sign in"}
                </button>
              </form>

              <div className="mt-4 space-y-2 text-center text-sm">
                <button
                  onClick={() => { setMode("magic"); setError(null); }}
                  className="text-quatro-blue hover:underline"
                >
                  Sign in with magic link instead
                </button>
                <div className="text-muted-foreground">
                  No account?{" "}
                  <button
                    onClick={handleSignUp}
                    className="text-quatro-blue hover:underline"
                  >
                    Create one
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-xl font-bold text-primary mb-6">Magic link</h2>
              <form onSubmit={handleMagicLink} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="magic-email">Email</Label>
                  <Input
                    id="magic-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="bg-muted border-0 focus-visible:ring-quatro-blue"
                  />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary hover:bg-quatro-blue text-white font-bold rounded-lg px-4 py-2.5 text-sm transition-colors disabled:opacity-50"
                >
                  {loading ? "Sending…" : "Send magic link"}
                </button>
              </form>
              <div className="mt-4 text-center text-sm">
                <button
                  onClick={() => { setMode("signin"); setError(null); }}
                  className="text-quatro-blue hover:underline"
                >
                  Back to password sign in
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

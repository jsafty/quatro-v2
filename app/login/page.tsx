"use client";

import { useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Mode = "signin" | "signup" | "magic";

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
    <path d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 2.9l5.7-5.7C34.5 6.5 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 20-9 20-20 0-1.2-.1-2.5-.4-3.5z" fill="#FFC107"/>
    <path d="M6.3 14.7l6.6 4.8C14.5 16 18.9 13 24 13c3.1 0 5.8 1.1 8 2.9l5.7-5.7C34.5 6.5 29.5 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" fill="#FF3D00"/>
    <path d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.3 35.3 26.8 36 24 36c-5.3 0-9.7-3.3-11.3-8H6.3C9.7 39.7 16.3 44 24 44z" fill="#4CAF50"/>
    <path d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4-4.1 5.3l6.2 5.2C37 37.3 44 32 44 24c0-1.2-.1-2.5-.4-3.5z" fill="#1976D2"/>
  </svg>
);

const Divider = () => (
  <div className="flex items-center gap-3 my-4">
    <div className="flex-1 h-px bg-muted" />
    <span className="text-xs text-muted-foreground">or</span>
    <div className="flex-1 h-px bg-muted" />
  </div>
);

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [magicSent, setMagicSent] = useState(false);
  const [signupSent, setSignupSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  function switchMode(next: Mode) {
    setMode(next);
    setError(null);
    setPassword("");
    setConfirmPassword("");
  }

  async function handleGoogleSignIn() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

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
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/` },
    });
    if (error) setError(error.message);
    else setSignupSent(true);
    setLoading(false);
  }

  const inputClass = "bg-muted border-0 focus-visible:ring-quatro-blue";

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <Image
            src="/logo-full.png"
            alt="Quatro"
            width={220}
            height={129}
            className="mx-auto"
            priority
          />
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {signupSent ? (
            <div className="text-center py-4">
              <p className="text-primary font-semibold text-lg">Check your email</p>
              <p className="mt-2 text-sm text-muted-foreground">
                We sent a confirmation link to <strong>{email}</strong>. Click it to verify your account, then sign in.
              </p>
              <button
                onClick={() => { setSignupSent(false); switchMode("signin"); }}
                className="mt-5 text-sm text-quatro-blue hover:underline"
              >
                Back to sign in
              </button>
            </div>
          ) : magicSent ? (
            <div className="text-center py-4">
              <p className="text-primary font-semibold text-lg">Check your email</p>
              <p className="mt-2 text-sm text-muted-foreground">
                We sent a link to <strong>{email}</strong>. Click it to sign in.
              </p>
            </div>
          ) : mode === "signin" ? (
            <>
              <h2 className="text-xl font-bold text-primary mb-5">Sign in</h2>
              <button
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center gap-3 border border-muted bg-white hover:bg-muted/50 text-primary font-semibold rounded-lg px-4 py-2.5 text-sm transition-colors"
              >
                <GoogleIcon />
                Continue with Google
              </button>
              <Divider />
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required className={inputClass} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required className={inputClass} />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <button type="submit" disabled={loading} className="w-full bg-primary hover:bg-quatro-blue text-white font-bold rounded-lg px-4 py-2.5 text-sm transition-colors disabled:opacity-50">
                  {loading ? "Signing in…" : "Sign in"}
                </button>
              </form>
              <div className="mt-4 space-y-2 text-center text-sm">
                <button onClick={() => switchMode("magic")} className="text-quatro-blue hover:underline">
                  Sign in with magic link instead
                </button>
                <div className="text-muted-foreground">
                  No account?{" "}
                  <button onClick={() => switchMode("signup")} className="text-quatro-blue hover:underline">
                    Create one
                  </button>
                </div>
              </div>
            </>
          ) : mode === "signup" ? (
            <>
              <h2 className="text-xl font-bold text-primary mb-5">Create account</h2>
              <button
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center gap-3 border border-muted bg-white hover:bg-muted/50 text-primary font-semibold rounded-lg px-4 py-2.5 text-sm transition-colors"
              >
                <GoogleIcon />
                Continue with Google
              </button>
              <Divider />
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input id="signup-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required className={inputClass} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input id="signup-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required className={inputClass} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="confirm-password">Confirm password</Label>
                  <Input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" required className={inputClass} />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <button type="submit" disabled={loading} className="w-full bg-primary hover:bg-quatro-blue text-white font-bold rounded-lg px-4 py-2.5 text-sm transition-colors disabled:opacity-50">
                  {loading ? "Creating account…" : "Create account"}
                </button>
              </form>
              <div className="mt-4 text-center text-sm">
                <button onClick={() => switchMode("signin")} className="text-quatro-blue hover:underline">
                  Back to sign in
                </button>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-xl font-bold text-primary mb-5">Magic link</h2>
              <form onSubmit={handleMagicLink} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="magic-email">Email</Label>
                  <Input id="magic-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required className={inputClass} />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <button type="submit" disabled={loading} className="w-full bg-primary hover:bg-quatro-blue text-white font-bold rounded-lg px-4 py-2.5 text-sm transition-colors disabled:opacity-50">
                  {loading ? "Sending…" : "Send magic link"}
                </button>
              </form>
              <div className="mt-4 text-center text-sm">
                <button onClick={() => switchMode("signin")} className="text-quatro-blue hover:underline">
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

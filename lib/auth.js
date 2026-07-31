// lib/auth.js — Auth.js (NextAuth v5) config. Google-only sign-in; JWT
// sessions (no DB adapter — app data lives in our own store keyed by email).
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

// Only expose Google when credentials are configured, so /api/auth/providers
// reflects reality and the UI can hide the button in unconfigured dev setups.
const providers = process.env.AUTH_GOOGLE_ID ? [Google] : [];

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers,
  session: { strategy: "jwt" },
  trustHost: true,
});

"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result.error) {
      setError("Ghalat Email ya Password!");
      setLoading(false);
    } else {
      router.push("/"); 
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl border border-zinc-200 p-10 shadow-xl">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-[#12066a]">BIZGROW</h2>
          <p className="text-zinc-500 text-sm mt-2 font-medium">Admin Access Only</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs font-bold text-center border border-red-100">
              {error}
            </div>
          )}

          <div>
            <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-2 tracking-wider">Email Address</label>
            <input
              type="email"
              required
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 outline-none focus:border-[#12066a] transition-all text-zinc-900" 
              placeholder="abc@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-2 tracking-wider">Password</label>
            <input
              type="password"
              required
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 outline-none focus:border-[#12066a] transition-all text-zinc-900"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#12066a] text-white py-4 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#1a0b8a] transition-all shadow-lg shadow-blue-900/10 disabled:opacity-70"
          >
            {loading ? "Verifying..." : "Sign In to Console"}
          </button>
        </form>
      </div>
    </div>
  );
}
import { useState } from "react";
import { Shield, Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    // Temporary frontend login
    console.log("Login:", { email, password });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#020b13] px-4 text-white">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400/5 blur-[120px]" />
        <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-blue-500/5 blur-[100px]" />
      </div>

      {/* Login card */}
      <div className="relative w-full max-w-md">
        <div className="rounded-2xl border border-cyan-400/15 bg-[#071522]/80 p-8 shadow-[0_0_80px_#22d3ee10] backdrop-blur-xl">
          
          {/* Logo */}
          <div className="mb-8 flex flex-col items-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-400/10 shadow-[0_0_30px_#22d3ee25]">
              <Shield className="text-cyan-400" size={30} />
            </div>

            <h1 className="text-2xl font-semibold tracking-wide">
              Geo<span className="text-cyan-400">Reasoner</span>
            </h1>

            <p className="mt-2 text-center text-xs text-slate-400">
              Disaster Intelligence & Response Platform
            </p>
          </div>

          {/* Heading */}
          <div className="mb-6">
            <h2 className="text-lg font-medium">
              Sign in to your account
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Access the emergency response control center
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">

            {/* Email */}
            <div>
              <label className="mb-2 block text-xs text-slate-400">
                Email Address
              </label>

              <div className="relative">
                <Mail
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                />

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@georeasoner.com"
                  required
                  className="w-full rounded-lg border border-cyan-400/10 bg-[#020b13]/70 py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/40 focus:ring-1 focus:ring-cyan-400/20"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="mb-2 block text-xs text-slate-400">
                Password
              </label>

              <div className="relative">
                <Lock
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                />

                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full rounded-lg border border-cyan-400/10 bg-[#020b13]/70 py-3 pl-10 pr-11 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/40 focus:ring-1 focus:ring-cyan-400/20"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-cyan-400"
                >
                  {showPassword ? (
                    <EyeOff size={17} />
                  ) : (
                    <Eye size={17} />
                  )}
                </button>
              </div>
            </div>

            {/* Login button */}
            <button
              type="submit"
              className="group flex w-full items-center justify-center gap-2 rounded-lg border border-cyan-400/30 bg-cyan-400/10 py-3 text-sm font-medium text-cyan-300 transition hover:bg-cyan-400/20 hover:shadow-[0_0_25px_#22d3ee20]"
            >
              Sign In
              <ArrowRight
                size={16}
                className="transition group-hover:translate-x-1"
              />
            </button>
          </form>

          {/* Footer */}
          <div className="mt-7 border-t border-white/5 pt-5 text-center">
            <p className="text-[10px] text-slate-600">
              GeoReasoner Emergency Intelligence System
            </p>

            <p className="mt-1 text-[10px] text-slate-700">
              Secure access • Role-based control • AI-assisted response
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
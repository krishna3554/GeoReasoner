import { useState } from "react";
import { ArrowRight, Eye, EyeOff, Lock, Mail, ShieldCheck } from "lucide-react";
import { login } from "../api/auth";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (event) => {
    event.preventDefault();
    try {
      const data = await login(email, password);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      window.location.href = "/";
    } catch (error) {
      alert(error.message || "Unable to connect to the server");
    }
  };

  return <div className="login-page">
    <div className="login-pattern" />
    <div className="login-layout">
      <section className="login-intro"><div className="login-brand"><span className="brand-mark">G</span><strong>GeoReasoner</strong></div><p className="eyebrow">NATIONAL RESPONSE INTELLIGENCE</p><h1>Clarity when<br /><em>every minute matters.</em></h1><p className="login-copy">AI-assisted damage intelligence for emergency responders, dispatch coordinators, and the communities they protect.</p><div className="login-trust"><div><ShieldCheck size={17} /><span>Secure role-based access</span></div><div><span className="live-dot" /><span>Live incident network</span></div></div></section>
      <section className="login-card"><div className="login-card-heading"><div className="login-icon"><ShieldCheck size={22} /></div><div><p className="panel-kicker">RESPONSE CONTROL CENTER</p><h2>Welcome back</h2></div></div><p className="login-subtitle">Sign in to continue to your regional response workspace.</p><form onSubmit={handleLogin}><label>Email address<div className="login-input"><Mail size={16} /><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@response.gov.in" required /></div></label><label>Password<div className="login-input"><Lock size={16} /><input type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" required /><button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></div></label><button className="login-submit" type="submit">Sign in to GeoReasoner <ArrowRight size={16} /></button></form><div className="login-help"><span>Need access?</span><a href="mailto:admin@georeasoner.com">Contact your administrator</a></div></section>
    </div><p className="login-footer">GeoReasoner · Emergency Intelligence System · Maharashtra Response Cell</p>
  </div>;
}

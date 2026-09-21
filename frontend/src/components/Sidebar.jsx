import rolePermissions from "../config/rolePermissions";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Map,
  TriangleAlert,
  Building2,
  FileText,
  Route,
  Truck,
  Shield,
  LogOut,
  Users,
} from "lucide-react";

const items = [
  ["Dashboard", "/", LayoutDashboard],
  ["Disaster Map", "/map", Map],
  ["Incidents", "/incidents", TriangleAlert],
  ["Damage Analysis", "/damage-analysis", Building2],
  ["Reports", "/reports", FileText],
  ["Routes", "/routes", Route],
  ["Resources", "/resources", Truck],
  ["Protocols", "/protocols", Shield],
  ["User Management", "/users", Users],
];

export default function Sidebar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const allowedRoutes = rolePermissions[user?.role] || [];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <aside className="relative z-20 flex h-screen w-[218px] shrink-0 flex-col border-r border-cyan-400/15 bg-[#06111e]/90 px-3 py-5 backdrop-blur-xl">

      <div className="px-3">
        <h1 className="text-[25px] font-bold">
          Geo<span className="text-cyan-400">Reasoner</span>
        </h1>
        <p className="text-[11px] text-slate-500">
          AI for a Safer Tomorrow
        </p>
      </div>

      <nav className="mt-7 space-y-1">
        {items
        .filter(([, path]) => allowedRoutes.includes(path))
        .map(([label, path, Icon]) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${
                isActive
                  ? "bg-cyan-400/10 text-cyan-300 shadow-[inset_3px_0_#22d3ee]"
                  : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
              }`
            }
          >
            <Icon size={19} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto rounded-xl border border-cyan-400/10 bg-white/[0.035] p-3 backdrop-blur-xl">
        <p className="mb-2 text-[10px] text-cyan-400">SYSTEM STATUS</p>

        {["Satellite Feed", "AI Models", "Data Pipeline", "Response Network"].map(
          (item) => (
            <div
              key={item}
              className="flex justify-between py-1 text-[10px]"
            >
              <span className="flex items-center gap-2 text-slate-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                {item}
              </span>
              <span className="text-emerald-400">Online</span>
            </div>
          )
        )}
      </div>

      <div className="mt-3 rounded-xl border border-cyan-400/10 bg-white/[0.035] p-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan-400/10 text-cyan-300">
            R
          </div>
          <div>
            <p className="text-xs font-medium">
              {user?.name || "User"}
            </p>
            <p className="text-[10px] text-slate-500">
              {user?.role || "USER"}
            </p>
          </div>
        </div>
      </div>
      <button
        onClick={handleLogout}
        className="mt-3 flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-400 transition hover:bg-red-400/10 hover:text-red-400"
      >
        <LogOut size={19} />
        Logout
      </button>
    </aside>
  );
}
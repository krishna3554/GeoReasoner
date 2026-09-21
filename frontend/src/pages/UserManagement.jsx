import { useState } from "react";
import { Search, UserPlus, Pencil, UserCheck, UserX } from "lucide-react";
const users = [
  {
    id: 1,
    name: "GeoReasoner Administrator",
    email: "admin@georeasoner.com",
    role: "ADMIN",
    status: "Active",
  },
  {
    id: 2,
    name: "Response Officer",
    email: "officer@georeasoner.com",
    role: "RESPONSE_TEAM",
    status: "Active",
  },
  {
    id: 3,
    name: "Data Analyst",
    email: "analyst@georeasoner.com",
    role: "ANALYST",
    status: "Active",
  },
];

export default function UserManagement() {

    const [search, setSearch] = useState("");
    const [editingUser, setEditingUser] = useState(null);
    const [showAddUser, setShowAddUser] = useState(false);
    const [userList, setUserList] = useState(users);

    const filteredUsers = userList.filter(
    (user) =>
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <main className="min-h-screen bg-[#020b14] p-7 text-white">
      {/* Header */}
      <div className="mb-7 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">User Management</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage system users, roles and account status
          </p>
        </div>

        <button
        onClick={() => setShowAddUser(true)}
        className="flex items-center gap-2 rounded-xl bg-cyan-400 px-4 py-2.5 text-sm font-medium text-[#02111d] transition hover:bg-cyan-300"
        >
        <UserPlus size={17} />
        Add User
        </button>
      </div>

      {/* Search */}
      <div className="mb-5 flex items-center rounded-xl border border-cyan-400/10 bg-white/[0.035] px-4 py-3 backdrop-blur-xl">
        <Search size={18} className="text-slate-500" />

        <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search users by name or email..."
        className="ml-3 w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-600"
        />
      </div>

      {/* Users Table */}
      <div className="overflow-hidden rounded-2xl border border-cyan-400/10 bg-white/[0.035] backdrop-blur-xl">
        <table className="w-full text-left">
          <thead className="border-b border-white/[0.06]">
            <tr className="text-xs uppercase tracking-wider text-slate-500">
              <th className="px-5 py-4">User</th>
              <th className="px-5 py-4">Role</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.length === 0 && (
            <tr>
                <td
                colSpan="4"
                className="px-5 py-12 text-center text-sm text-slate-500"
                >
                No users found.
                </td>
            </tr>
            )}
            {filteredUsers.map((user) => (
              <tr
                key={user.id}
                className="border-b border-white/[0.04] transition hover:bg-white/[0.025]"
              >
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan-400/10 text-sm font-medium text-cyan-300">
                      {user.name.charAt(0)}
                    </div>

                    <div>
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                  </div>
                </td>

                <td className="px-5 py-4">
                  <span className="rounded-lg border border-cyan-400/10 bg-cyan-400/5 px-2.5 py-1 text-xs text-cyan-300">
                    {user.role}
                  </span>
                </td>

                <td className="px-5 py-4">
                  <span
                    className={`flex items-center gap-2 text-xs ${
                        user.status === "Active"
                        ? "text-emerald-400"
                        : "text-red-400"
                    }`}
                    >
                    <span
                        className={`h-2 w-2 rounded-full ${
                        user.status === "Active"
                            ? "bg-emerald-400"
                            : "bg-red-400"
                        }`}
                    />
                    {user.status}
                    </span>
                </td>

                <td className="px-5 py-4">
                  <div className="flex justify-end gap-2">
                    <button
                    title="Edit user"
                    onClick={() => setEditingUser(user)}
                    className="rounded-lg p-2 text-slate-400 transition hover:bg-white/[0.06] hover:text-cyan-300"
                    >
                    <Pencil size={16} />
                    </button>

                    <button
                    title="Deactivate user"
                    onClick={() =>
                        setUserList((currentUsers) =>
                        currentUsers.map((item) =>
                            item.id === user.id
                            ? { ...item, status: "Inactive" }
                            : item
                        )
                        )
                    }
                    className="rounded-lg p-2 text-slate-400 transition hover:bg-white/[0.06] hover:text-red-400"
                    >
                    <UserX size={16} />
                    </button>

                    <button
                    title="Activate user"
                    onClick={() =>
                        setUserList((currentUsers) =>
                        currentUsers.map((item) =>
                            item.id === user.id
                            ? { ...item, status: "Active" }
                            : item
                        )
                        )
                    }
                    className="rounded-lg p-2 text-slate-400 transition hover:bg-white/[0.06] hover:text-emerald-400"
                    >
                    <UserCheck size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border border-cyan-400/15 bg-[#071522] p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
                <div>
                <h2 className="text-lg font-semibold">Edit User</h2>
                <p className="text-xs text-slate-500">
                    Update user information
                </p>
                </div>

                <button
                onClick={() => setEditingUser(null)}
                className="text-slate-500 hover:text-white"
                >
                ✕
                </button>
            </div>

            <div className="space-y-4">
                <div>
                <label className="mb-1 block text-xs text-slate-400">
                    Name
                </label>
                <input
                    value={editingUser.name}
                    onChange={(e) =>
                    setEditingUser({
                        ...editingUser,
                        name: e.target.value,
                    })
                    }
                    className="w-full rounded-xl border border-cyan-400/10 bg-white/[0.04] px-4 py-3 text-sm outline-none focus:border-cyan-400/30"
                />
                </div>

                <div>
                <label className="mb-1 block text-xs text-slate-400">
                    Email
                </label>
                <input
                    value={editingUser.email}
                    onChange={(e) =>
                    setEditingUser({
                        ...editingUser,
                        email: e.target.value,
                    })
                    }
                    className="w-full rounded-xl border border-cyan-400/10 bg-white/[0.04] px-4 py-3 text-sm outline-none focus:border-cyan-400/30"
                />
                </div>

                <div>
                <label className="mb-1 block text-xs text-slate-400">
                    Role
                </label>

                <select
                    value={editingUser.role}
                    onChange={(e) =>
                    setEditingUser({
                        ...editingUser,
                        role: e.target.value,
                    })
                    }
                    className="w-full rounded-xl border border-cyan-400/10 bg-[#071522] px-4 py-3 text-sm outline-none"
                >
                    <option value="ADMIN">ADMIN</option>
                    <option value="INCIDENT_COMMANDER">
                    INCIDENT_COMMANDER
                    </option>
                    <option value="RESPONSE_TEAM">RESPONSE_TEAM</option>
                    <option value="ANALYST">ANALYST</option>
                    <option value="VIEWER">VIEWER</option>
                </select>
                </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
                <button
                onClick={() => setEditingUser(null)}
                className="rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-400 hover:text-white"
                >
                Cancel
                </button>

                <button
                onClick={() => {
                    console.log("Updated user:", editingUser);
                    setEditingUser(null);
                }}
                className="rounded-xl bg-cyan-400 px-4 py-2 text-sm font-medium text-[#02111d] hover:bg-cyan-300"
                >
                Save Changes
                </button>
            </div>
            </div>
        </div>
        )}

        {showAddUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border border-cyan-400/15 bg-[#071522] p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
                <div>
                <h2 className="text-lg font-semibold">Add User</h2>
                <p className="text-xs text-slate-500">
                    Create a new system user
                </p>
                </div>

                <button
                onClick={() => setShowAddUser(false)}
                className="text-slate-500 hover:text-white"
                >
                ✕
                </button>
            </div>

            <div className="space-y-4">
                <div>
                <label className="mb-1 block text-xs text-slate-400">
                    Name
                </label>
                <input
                    type="text"
                    placeholder="Enter full name"
                    className="w-full rounded-xl border border-cyan-400/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/30"
                />
                </div>

                <div>
                <label className="mb-1 block text-xs text-slate-400">
                    Email
                </label>
                <input
                    type="email"
                    placeholder="Enter email"
                    className="w-full rounded-xl border border-cyan-400/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/30"
                />
                </div>

                <div>
                <label className="mb-1 block text-xs text-slate-400">
                    Password
                </label>
                <input
                    type="password"
                    placeholder="Enter temporary password"
                    className="w-full rounded-xl border border-cyan-400/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/30"
                />
                </div>

                <div>
                <label className="mb-1 block text-xs text-slate-400">
                    Role
                </label>

                <select
                    defaultValue="VIEWER"
                    className="w-full rounded-xl border border-cyan-400/10 bg-[#071522] px-4 py-3 text-sm text-white outline-none"
                >
                    <option value="ADMIN">ADMIN</option>
                    <option value="INCIDENT_COMMANDER">
                    INCIDENT_COMMANDER
                    </option>
                    <option value="RESPONSE_TEAM">RESPONSE_TEAM</option>
                    <option value="ANALYST">ANALYST</option>
                    <option value="VIEWER">VIEWER</option>
                </select>
                </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
                <button
                onClick={() => setShowAddUser(false)}
                className="rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-400 hover:text-white"
                >
                Cancel
                </button>

                <button
                onClick={() => {
                    console.log("Create user");
                    setShowAddUser(false);
                }}
                className="rounded-xl bg-cyan-400 px-4 py-2 text-sm font-medium text-[#02111d] hover:bg-cyan-300"
                >
                Create User
                </button>
            </div>
            </div>
        </div>
        )}
    </main>
  );
}
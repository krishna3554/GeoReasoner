import { useMemo, useState } from "react";
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Clock3,
  FileText,
  Filter,
  Flame,
  MapPin,
  Plus,
  Search,
  Shield,
  Users,
  X,
  Zap,
} from "lucide-react";

function Glass({ children, className = "" }) {
  return (
    <div
      className={`border border-cyan-400/15 bg-[#071522]/80 backdrop-blur-xl ${className}`}
    >
      {children}
    </div>
  );
}

/* =========================
   MOCK PROTOCOL DATA
========================= */

const initialProtocols = [
  {
    id: "PRO-001",
    name: "Flood Emergency Response",
    category: "Flood",
    priority: "Critical",
    status: "Active",
    lastUpdated: "8 min ago",
    description:
      "Standard operating procedure for flood detection, evacuation, rescue deployment and emergency resource coordination.",
    steps: [
      "Verify flood severity and affected zone",
      "Identify blocked roads and unsafe areas",
      "Deploy available rescue units",
      "Establish evacuation corridors",
      "Coordinate emergency shelters",
      "Monitor water levels and incident changes",
    ],
    resources: [
      "Rescue Teams",
      "Emergency Vehicles",
      "Shelters",
      "Emergency Supplies",
    ],
    responsible: "Disaster Response Team",
  },
  {
    id: "PRO-002",
    name: "Structural Damage Assessment",
    category: "Structural",
    priority: "High",
    status: "Active",
    lastUpdated: "21 min ago",
    description:
      "Response procedure for buildings suspected of structural damage after a disaster event.",
    steps: [
      "Identify affected structures",
      "Restrict access to unsafe buildings",
      "Deploy structural assessment personnel",
      "Evaluate visible damage",
      "Identify secondary collapse risks",
      "Submit damage assessment report",
    ],
    resources: [
      "Assessment Teams",
      "Safety Equipment",
      "Emergency Vehicles",
    ],
    responsible: "Engineering Response Team",
  },
  {
    id: "PRO-003",
    name: "Blocked Road Response",
    category: "Infrastructure",
    priority: "High",
    status: "Active",
    lastUpdated: "34 min ago",
    description:
      "Procedure for handling blocked roads and maintaining emergency vehicle access.",
    steps: [
      "Confirm road blockage",
      "Determine blockage severity",
      "Restrict unsafe road access",
      "Identify alternate emergency route",
      "Redirect response vehicles",
      "Update route status on operational map",
    ],
    resources: [
      "Traffic Response Team",
      "Emergency Vehicles",
      "Route Intelligence",
    ],
    responsible: "Traffic Response Team",
  },
  {
    id: "PRO-004",
    name: "Emergency Shelter Activation",
    category: "Shelter",
    priority: "Medium",
    status: "Active",
    lastUpdated: "48 min ago",
    description:
      "Procedure for activating and managing emergency shelters for displaced residents.",
    steps: [
      "Verify shelter availability",
      "Check current occupancy",
      "Prepare essential supplies",
      "Activate shelter operations",
      "Register incoming evacuees",
      "Monitor shelter capacity",
    ],
    resources: [
      "Shelter Facilities",
      "Food Supplies",
      "Water Supplies",
      "Relief Teams",
    ],
    responsible: "Relief Coordination Team",
  },
  {
    id: "PRO-005",
    name: "Medical Emergency Response",
    category: "Medical",
    priority: "Critical",
    status: "Active",
    lastUpdated: "1 hr ago",
    description:
      "Emergency procedure for incidents requiring immediate medical response and evacuation.",
    steps: [
      "Assess number of affected people",
      "Identify critical casualties",
      "Deploy medical response units",
      "Establish emergency treatment area",
      "Coordinate ambulance movement",
      "Transfer critical patients to medical facilities",
    ],
    resources: [
      "Medical Teams",
      "Ambulances",
      "Medical Supplies",
    ],
    responsible: "Medical Response Team",
  },
  {
    id: "PRO-006",
    name: "General Disaster Assessment",
    category: "General",
    priority: "Medium",
    status: "Draft",
    lastUpdated: "2 hrs ago",
    description:
      "Initial assessment procedure for newly detected disaster events.",
    steps: [
      "Verify incoming incident information",
      "Determine disaster type",
      "Assess affected population",
      "Identify immediate hazards",
      "Allocate available resources",
      "Create initial situation report",
    ],
    resources: [
      "Response Teams",
      "Emergency Vehicles",
      "Assessment Equipment",
    ],
    responsible: "Incident Command Team",
  },
];

/* =========================
   HELPERS
========================= */

function priorityStyle(priority) {
  switch (priority) {
    case "Critical":
      return "border-red-400/20 bg-red-400/10 text-red-400";

    case "High":
      return "border-orange-400/20 bg-orange-400/10 text-orange-400";

    case "Medium":
      return "border-yellow-400/20 bg-yellow-400/10 text-yellow-400";

    default:
      return "border-cyan-400/20 bg-cyan-400/10 text-cyan-400";
  }
}

function statusStyle(status) {
  if (status === "Active") {
    return "border-emerald-400/20 bg-emerald-400/10 text-emerald-400";
  }

  return "border-slate-600 bg-slate-700/30 text-slate-400";
}

function categoryIcon(category) {
  switch (category) {
    case "Flood":
      return <Zap size={19} className="text-cyan-400" />;

    case "Structural":
      return <AlertTriangle size={19} className="text-orange-400" />;

    case "Infrastructure":
      return <MapPin size={19} className="text-purple-400" />;

    case "Shelter":
      return <Shield size={19} className="text-emerald-400" />;

    case "Medical":
      return <Plus size={19} className="text-red-400" />;

    default:
      return <BookOpen size={19} className="text-cyan-400" />;
  }
}

/* =========================
   PAGE
========================= */

export default function Protocols() {
  const [protocols, setProtocols] =
    useState(initialProtocols);

  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] =
    useState("All Priority");
  const [categoryFilter, setCategoryFilter] =
    useState("All Categories");

  const [selectedProtocol, setSelectedProtocol] =
    useState(null);

  const [showCreate, setShowCreate] =
    useState(false);

  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] =
    useState("General");
  const [newPriority, setNewPriority] =
    useState("Medium");
  const [newDescription, setNewDescription] =
    useState("");

  /* =========================
     FILTERING
  ========================= */

  const filteredProtocols = useMemo(() => {
    return protocols.filter((protocol) => {
      const query = search.toLowerCase();

      const matchesSearch =
        protocol.name
          .toLowerCase()
          .includes(query) ||
        protocol.category
          .toLowerCase()
          .includes(query) ||
        protocol.description
          .toLowerCase()
          .includes(query);

      const matchesPriority =
        priorityFilter === "All Priority" ||
        protocol.priority === priorityFilter;

      const matchesCategory =
        categoryFilter === "All Categories" ||
        protocol.category === categoryFilter;

      return (
        matchesSearch &&
        matchesPriority &&
        matchesCategory
      );
    });
  }, [
    protocols,
    search,
    priorityFilter,
    categoryFilter,
  ]);

  /* =========================
     SUMMARY
  ========================= */

  const activeProtocols = protocols.filter(
    (p) => p.status === "Active"
  ).length;

  const criticalProtocols = protocols.filter(
    (p) => p.priority === "Critical"
  ).length;

  const highPriorityProtocols = protocols.filter(
    (p) => p.priority === "High"
  ).length;

  const draftProtocols = protocols.filter(
    (p) => p.status === "Draft"
  ).length;

  /* =========================
     CREATE PROTOCOL
  ========================= */

  const createProtocol = () => {
    if (!newName || !newDescription) {
      return;
    }

    const newProtocol = {
      id: `PRO-${String(
        protocols.length + 1
      ).padStart(3, "0")}`,

      name: newName,

      category: newCategory,

      priority: newPriority,

      status: "Draft",

      lastUpdated: "Just now",

      description: newDescription,

      steps: [
        "Review incident information",
        "Assess current situation",
        "Assign responsible response team",
        "Allocate required resources",
        "Execute response actions",
        "Record response outcome",
      ],

      resources: [
        "Response Teams",
        "Emergency Vehicles",
      ],

      responsible: "Incident Command Team",
    };

    setProtocols((prev) => [
      newProtocol,
      ...prev,
    ]);

    setShowCreate(false);

    setNewName("");
    setNewCategory("General");
    setNewPriority("Medium");
    setNewDescription("");
  };

  return (
    <div className="h-screen overflow-hidden bg-[#020b13] text-slate-100">
      <main className="flex h-screen min-h-0 flex-col overflow-hidden p-7">
        {/* =========================
            HEADER
        ========================= */}

        <div className="mb-5 flex shrink-0 items-start justify-between">
          <div>
            <div className="mb-2 text-[11px] font-semibold tracking-[0.28em] text-cyan-400">
              GEOREASONER / RESPONSE INTELLIGENCE
            </div>

            <h1 className="text-3xl font-semibold tracking-tight">
              Protocols
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage standardized emergency response procedures and operational playbooks.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-400/5 px-4 py-2.5">
            <div className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_#34d399]" />

            <span className="text-xs text-cyan-300">
              PROTOCOL ENGINE ONLINE
            </span>
          </div>
        </div>

        {/* =========================
            SUMMARY CARDS
        ========================= */}

        <div className="mb-4 grid shrink-0 grid-cols-4 gap-4">
          <Glass className="rounded-xl p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wide text-slate-500">
                Active Protocols
              </span>

              <BookOpen
                size={18}
                className="text-cyan-400"
              />
            </div>

            <div className="text-3xl font-semibold">
              {activeProtocols}
            </div>

            <div className="mt-1 text-xs text-cyan-400">
              Operational procedures
            </div>
          </Glass>

          <Glass className="rounded-xl p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wide text-slate-500">
                Critical
              </span>

              <Flame
                size={18}
                className="text-red-400"
              />
            </div>

            <div className="text-3xl font-semibold">
              {criticalProtocols}
            </div>

            <div className="mt-1 text-xs text-red-400">
              Immediate response
            </div>
          </Glass>

          <Glass className="rounded-xl p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wide text-slate-500">
                High Priority
              </span>

              <AlertTriangle
                size={18}
                className="text-orange-400"
              />
            </div>

            <div className="text-3xl font-semibold">
              {highPriorityProtocols}
            </div>

            <div className="mt-1 text-xs text-orange-400">
              Requires attention
            </div>
          </Glass>

          <Glass className="rounded-xl p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wide text-slate-500">
                Draft Protocols
              </span>

              <FileText
                size={18}
                className="text-purple-400"
              />
            </div>

            <div className="text-3xl font-semibold">
              {draftProtocols}
            </div>

            <div className="mt-1 text-xs text-purple-400">
              Pending activation
            </div>
          </Glass>
        </div>

        {/* =========================
            CATEGORY OVERVIEW
        ========================= */}

        <div className="mb-4 grid shrink-0 grid-cols-4 gap-4">
          {[
            {
              title: "Flood Response",
              category: "Flood",
              description: "Flood and evacuation",
            },
            {
              title: "Structural",
              category: "Structural",
              description: "Building safety",
            },
            {
              title: "Infrastructure",
              category: "Infrastructure",
              description: "Roads and access",
            },
            {
              title: "Medical",
              category: "Medical",
              description: "Medical response",
            },
          ].map((item) => (
            <button
              key={item.category}
              onClick={() =>
                setCategoryFilter(
                  item.category
                )
              }
              className="text-left"
            >
              <Glass className="rounded-xl p-4 transition hover:border-cyan-400/30 hover:bg-cyan-400/[0.03]">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-cyan-400/15 bg-cyan-400/5">
                    {categoryIcon(
                      item.category
                    )}
                  </div>

                  <div>
                    <div className="text-sm font-semibold">
                      {item.title}
                    </div>

                    <div className="mt-1 text-xs text-slate-500">
                      {item.description}
                    </div>
                  </div>
                </div>
              </Glass>
            </button>
          ))}
        </div>

        {/* =========================
            TOOLBAR
        ========================= */}

        <Glass className="mb-4 shrink-0 rounded-xl p-3">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search protocols, categories or procedures..."
                className="h-11 w-full rounded-lg border border-slate-700/60 bg-[#06131f] pl-11 pr-4 text-sm text-slate-200 outline-none placeholder:text-slate-600 focus:border-cyan-400/40"
              />
            </div>

            <div className="flex h-11 items-center gap-2 rounded-lg border border-slate-700/60 bg-[#06131f] px-3">
              <Filter
                size={16}
                className="text-slate-500"
              />

              <select
                value={priorityFilter}
                onChange={(e) =>
                  setPriorityFilter(
                    e.target.value
                  )
                }
                className="bg-transparent text-sm text-slate-300 outline-none"
              >
                <option>
                  All Priority
                </option>

                <option>Critical</option>

                <option>High</option>

                <option>Medium</option>
              </select>
            </div>

            <div className="flex h-11 items-center rounded-lg border border-slate-700/60 bg-[#06131f] px-3">
              <select
                value={categoryFilter}
                onChange={(e) =>
                  setCategoryFilter(
                    e.target.value
                  )
                }
                className="bg-transparent text-sm text-slate-300 outline-none"
              >
                <option>
                  All Categories
                </option>

                <option>Flood</option>

                <option>Structural</option>

                <option>Infrastructure</option>

                <option>Shelter</option>

                <option>Medical</option>

                <option>General</option>
              </select>
            </div>

            <button
              onClick={() =>
                setShowCreate(true)
              }
              className="flex h-11 items-center gap-2 rounded-lg bg-cyan-400 px-4 text-sm font-semibold text-[#021018] transition hover:bg-cyan-300"
            >
              <Plus size={17} />
              Create Protocol
            </button>
          </div>
        </Glass>

        {/* =========================
            PROTOCOL REGISTRY
        ========================= */}

        <Glass className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl">
          <div className="shrink-0 border-b border-cyan-400/10 px-5 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold">
                  Response Protocol Registry
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  {filteredProtocols.length} protocols available
                </p>
              </div>

              <div className="text-xs text-slate-500">
                Standardized emergency procedures
              </div>
            </div>
          </div>

          <div className="min-h-0 flex-1 divide-y divide-cyan-400/10 overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-400/30 scrollbar-track-transparent">
            {filteredProtocols.map(
              (protocol) => (
                <div
                  key={protocol.id}
                  className="group flex items-center gap-5 px-5 py-4 transition hover:bg-cyan-400/[0.025]"
                >
                  {/* ICON */}

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-cyan-400/15 bg-cyan-400/5">
                    {categoryIcon(
                      protocol.category
                    )}
                  </div>

                  {/* MAIN */}

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="truncate text-sm font-semibold">
                        {protocol.name}
                      </h3>

                      <span
                        className={`rounded-md border px-2 py-0.5 text-[9px] font-semibold ${priorityStyle(
                          protocol.priority
                        )}`}
                      >
                        {protocol.priority}
                      </span>

                      <span
                        className={`rounded-md border px-2 py-0.5 text-[9px] font-semibold ${statusStyle(
                          protocol.status
                        )}`}
                      >
                        {protocol.status}
                      </span>
                    </div>

                    <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
                      <span>
                        {protocol.id}
                      </span>

                      <span>
                        {protocol.category}
                      </span>

                      <span className="flex items-center gap-1">
                        <Clock3 size={12} />
                        {protocol.lastUpdated}
                      </span>
                    </div>
                  </div>

                  {/* STEPS */}

                  <div className="hidden w-28 shrink-0 lg:block">
                    <div className="text-[9px] uppercase text-slate-600">
                      Procedures
                    </div>

                    <div className="mt-1 text-sm font-semibold">
                      {protocol.steps.length}
                    </div>

                    <div className="text-[9px] text-slate-600">
                      Response steps
                    </div>
                  </div>

                  {/* RESPONSIBLE */}

                  <div className="hidden w-40 shrink-0 xl:block">
                    <div className="text-[9px] uppercase text-slate-600">
                      Responsible Team
                    </div>

                    <div className="mt-1 truncate text-xs text-slate-400">
                      {protocol.responsible}
                    </div>
                  </div>

                  {/* ACTION */}

                  <button
                    onClick={() =>
                      setSelectedProtocol(
                        protocol
                      )
                    }
                    className="flex h-9 shrink-0 items-center gap-2 rounded-lg border border-cyan-400/20 bg-cyan-400/5 px-3 text-xs text-cyan-300 transition hover:bg-cyan-400/10"
                  >
                    View
                    <ChevronDown
                      size={14}
                    />
                  </button>
                </div>
              )
            )}

            {filteredProtocols.length ===
              0 && (
              <div className="px-5 py-16 text-center">
                <BookOpen
                  size={35}
                  className="mx-auto mb-3 text-slate-700"
                />

                <p className="text-sm text-slate-400">
                  No protocols found
                </p>

                <p className="mt-1 text-xs text-slate-600">
                  Try changing your search or filters.
                </p>
              </div>
            )}
          </div>
        </Glass>
      </main>

      {/* =========================
          PROTOCOL DETAILS MODAL
      ========================= */}

      {selectedProtocol && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm">
          <div className="flex h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-cyan-400/20 bg-[#071522] shadow-[0_0_70px_#22d3ee12]">
            {/* HEADER */}

            <div className="flex shrink-0 items-start justify-between border-b border-cyan-400/10 px-6 py-5">
              <div>
                <div className="mb-2 text-[10px] font-semibold tracking-[0.25em] text-cyan-400">
                  RESPONSE PROTOCOL
                </div>

                <h2 className="text-xl font-semibold">
                  {selectedProtocol.name}
                </h2>

                <div className="mt-1 text-xs text-slate-500">
                  {selectedProtocol.id}
                </div>
              </div>

              <button
                onClick={() =>
                  setSelectedProtocol(
                    null
                  )
                }
                className="rounded-lg p-2 text-slate-500 transition hover:bg-white/5 hover:text-slate-200"
              >
                <X size={21} />
              </button>
            </div>

            {/* CONTENT */}

            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-cyan-400/30 scrollbar-track-transparent">
              {/* STATUS */}

              <div className="flex items-center gap-4 rounded-xl border border-cyan-400/10 bg-[#06131f] p-5">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-cyan-400/15 bg-cyan-400/5">
                  {categoryIcon(
                    selectedProtocol.category
                  )}
                </div>

                <div className="min-w-0">
                  <div className="text-lg font-semibold">
                    {selectedProtocol.category} Response
                  </div>

                  <div className="mt-1 text-xs text-slate-500">
                    {selectedProtocol.responsible}
                  </div>
                </div>

                <div className="ml-auto flex gap-2">
                  <span
                    className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${priorityStyle(
                      selectedProtocol.priority
                    )}`}
                  >
                    {selectedProtocol.priority}
                  </span>

                  <span
                    className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${statusStyle(
                      selectedProtocol.status
                    )}`}
                  >
                    {selectedProtocol.status}
                  </span>
                </div>
              </div>

              {/* DESCRIPTION */}

              <div className="rounded-xl border border-cyan-400/10 bg-[#06131f] p-5">
                <div className="mb-3 text-[10px] font-semibold uppercase tracking-wide text-cyan-400">
                  Protocol Objective
                </div>

                <p className="text-sm leading-6 text-slate-300">
                  {selectedProtocol.description}
                </p>
              </div>

              {/* RESPONSE STEPS */}

              <div>
                <div className="mb-3 flex items-center gap-2">
                  <BookOpen
                    size={16}
                    className="text-cyan-400"
                  />

                  <span className="text-[10px] font-semibold uppercase tracking-wide text-cyan-400">
                    Response Procedure
                  </span>
                </div>

                <div className="space-y-2">
                  {selectedProtocol.steps.map(
                    (step, index) => (
                      <div
                        key={step}
                        className="flex items-center gap-4 rounded-xl border border-slate-700/60 bg-[#06131f] p-4"
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-cyan-400/20 bg-cyan-400/5 text-xs font-semibold text-cyan-400">
                          {index + 1}
                        </div>

                        <span className="text-sm text-slate-300">
                          {step}
                        </span>

                        <CheckCircle2
                          size={17}
                          className="ml-auto shrink-0 text-slate-700"
                        />
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* REQUIRED RESOURCES */}

              <div>
                <div className="mb-3 flex items-center gap-2">
                  <Users
                    size={16}
                    className="text-orange-400"
                  />

                  <span className="text-[10px] font-semibold uppercase tracking-wide text-orange-400">
                    Required Resources
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {selectedProtocol.resources.map(
                    (resource) => (
                      <div
                        key={resource}
                        className="rounded-lg border border-orange-400/10 bg-orange-400/[0.03] px-4 py-3 text-sm text-slate-300"
                      >
                        {resource}
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* OPERATIONAL INFO */}

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-700/50 bg-[#06131f] p-4">
                  <div className="text-[9px] uppercase text-slate-600">
                    Last Updated
                  </div>

                  <div className="mt-2 text-sm text-slate-300">
                    {selectedProtocol.lastUpdated}
                  </div>
                </div>

                <div className="rounded-xl border border-slate-700/50 bg-[#06131f] p-4">
                  <div className="text-[9px] uppercase text-slate-600">
                    Responsible Team
                  </div>

                  <div className="mt-2 text-sm text-slate-300">
                    {selectedProtocol.responsible}
                  </div>
                </div>
              </div>

              {/* WARNING */}

              <div className="rounded-xl border border-yellow-400/15 bg-yellow-400/[0.03] p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle
                    size={17}
                    className="mt-0.5 shrink-0 text-yellow-400"
                  />

                  <div>
                    <div className="text-xs font-semibold text-yellow-400">
                      Operational Guidance
                    </div>

                    <p className="mt-1 text-xs leading-5 text-slate-400">
                      Protocols provide standardized response guidance.
                      Field operators should verify current conditions
                      before executing emergency actions.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* FOOTER */}

            <div className="flex shrink-0 items-center justify-between border-t border-cyan-400/10 px-6 py-4">
              <div className="flex items-center gap-2 text-[10px] text-emerald-400">
                <CheckCircle2 size={14} />
                Protocol available
              </div>

              <button
                onClick={() =>
                  setSelectedProtocol(
                    null
                  )
                }
                className="rounded-lg bg-cyan-400 px-5 py-2.5 text-xs font-semibold text-[#021018] transition hover:bg-cyan-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================
          CREATE PROTOCOL MODAL
      ========================= */}

      {showCreate && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-cyan-400/20 bg-[#071522] p-6 shadow-[0_0_70px_#22d3ee12]">
            {/* HEADER */}

            <div className="mb-6 flex items-start justify-between">
              <div>
                <div className="mb-2 text-[10px] font-semibold tracking-[0.25em] text-cyan-400">
                  PROTOCOL MANAGEMENT
                </div>

                <h2 className="text-xl font-semibold">
                  Create Protocol
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Create a new emergency response procedure.
                </p>
              </div>

              <button
                onClick={() =>
                  setShowCreate(false)
                }
                className="text-slate-500 transition hover:text-slate-200"
              >
                <X size={20} />
              </button>
            </div>

            {/* FORM */}

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-[10px] uppercase tracking-wide text-slate-500">
                  Protocol Name
                </label>

                <input
                  value={newName}
                  onChange={(e) =>
                    setNewName(
                      e.target.value
                    )
                  }
                  placeholder="e.g. Earthquake Response"
                  className="h-11 w-full rounded-lg border border-slate-700/60 bg-[#06131f] px-4 text-sm text-slate-200 outline-none placeholder:text-slate-600 focus:border-cyan-400/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-2 block text-[10px] uppercase tracking-wide text-slate-500">
                    Category
                  </label>

                  <select
                    value={newCategory}
                    onChange={(e) =>
                      setNewCategory(
                        e.target.value
                      )
                    }
                    className="h-11 w-full rounded-lg border border-slate-700/60 bg-[#06131f] px-3 text-sm text-slate-300 outline-none"
                  >
                    <option>General</option>
                    <option>Flood</option>
                    <option>Structural</option>
                    <option>Infrastructure</option>
                    <option>Shelter</option>
                    <option>Medical</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-[10px] uppercase tracking-wide text-slate-500">
                    Priority
                  </label>

                  <select
                    value={newPriority}
                    onChange={(e) =>
                      setNewPriority(
                        e.target.value
                      )
                    }
                    className="h-11 w-full rounded-lg border border-slate-700/60 bg-[#06131f] px-3 text-sm text-slate-300 outline-none"
                  >
                    <option>Critical</option>
                    <option>High</option>
                    <option>Medium</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-[10px] uppercase tracking-wide text-slate-500">
                  Description
                </label>

                <textarea
                  value={newDescription}
                  onChange={(e) =>
                    setNewDescription(
                      e.target.value
                    )
                  }
                  rows={5}
                  placeholder="Describe the purpose and scope of this protocol..."
                  className="w-full resize-none rounded-lg border border-slate-700/60 bg-[#06131f] px-4 py-3 text-sm text-slate-200 outline-none placeholder:text-slate-600 focus:border-cyan-400/40"
                />
              </div>
            </div>

            {/* FOOTER */}

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() =>
                  setShowCreate(false)
                }
                className="rounded-lg border border-slate-700 px-4 py-2.5 text-xs text-slate-400 transition hover:bg-white/5"
              >
                Cancel
              </button>

              <button
                onClick={createProtocol}
                className="flex items-center gap-2 rounded-lg bg-cyan-400 px-5 py-2.5 text-xs font-semibold text-[#021018] transition hover:bg-cyan-300"
              >
                <Plus size={15} />
                Create Protocol
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
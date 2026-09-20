import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Clock3,
  MapPin,
  Navigation,
  Plus,
  Route as RouteIcon,
  Search,
  ShieldAlert,
  Truck,
  X,
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
   MOCK ROUTE DATA
========================= */

const initialRoutes = [
  {
    id: "RTE-001",
    name: "Riverside Emergency Route",
    source: "Rescue Unit 01",
    destination: "Riverside Incident",
    start: [19.035, 72.845],
    end: [19.078, 72.87],
    distance: "8.1 km",
    eta: "9 min",
    status: "Active",
    priority: "Critical",
    roadStatus: "Clear",
    description:
      "Primary emergency route connecting Rescue Unit 01 with the Riverside flood incident.",
    recommendation:
      "Maintain this route as the primary emergency access corridor.",
  },
  {
    id: "RTE-002",
    name: "Eastwood Response Route",
    source: "Rescue Unit 03",
    destination: "Eastwood Incident",
    start: [19.11, 72.905],
    end: [19.065, 72.885],
    distance: "9.1 km",
    eta: "12 min",
    status: "Active",
    priority: "High",
    roadStatus: "Clear",
    description:
      "Emergency response route from Rescue Unit 03 to the Eastwood structural damage incident.",
    recommendation:
      "Use this route for structural assessment deployment.",
  },
  {
    id: "RTE-003",
    name: "Bridge A Alternate Route",
    source: "Rescue Unit 01",
    destination: "Bridge A",
    start: [19.035, 72.845],
    end: [19.065, 72.885],
    distance: "7.4 km",
    eta: "11 min",
    status: "Alternate",
    priority: "High",
    roadStatus: "Partial Blockage",
    description:
      "Alternate emergency route prepared because of restricted access near Bridge A.",
    recommendation:
      "Use only when the primary Bridge A corridor is blocked.",
  },
  {
    id: "RTE-004",
    name: "Northfield Shelter Route",
    source: "Relief Team 01",
    destination: "Northfield Shelter",
    start: [19.085, 72.86],
    end: [19.11, 72.905],
    distance: "6.8 km",
    eta: "10 min",
    status: "Active",
    priority: "Medium",
    roadStatus: "Clear",
    description:
      "Supply and relief route connecting the logistics response team with Northfield Shelter.",
    recommendation:
      "Use for emergency supply and evacuation support.",
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

    default:
      return "border-yellow-400/20 bg-yellow-400/10 text-yellow-400";
  }
}

function statusStyle(status) {
  switch (status) {
    case "Active":
      return "border-emerald-400/20 bg-emerald-400/10 text-emerald-400";

    case "Alternate":
      return "border-purple-400/20 bg-purple-400/10 text-purple-400";

    default:
      return "border-slate-700 bg-slate-700/30 text-slate-400";
  }
}

function roadStatusStyle(status) {
  switch (status) {
    case "Clear":
      return "text-emerald-400";

    case "Partial Blockage":
      return "text-orange-400";

    case "Blocked":
      return "text-red-400";

    default:
      return "text-slate-400";
  }
}

/* =========================
   PAGE
========================= */

export default function Routes() {
  const [routes, setRoutes] = useState(initialRoutes);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("All Status");
  const [priorityFilter, setPriorityFilter] =
    useState("All Priority");

  const [selectedRoute, setSelectedRoute] =
    useState(null);

  const [showCreate, setShowCreate] =
    useState(false);

  const [planning, setPlanning] = useState(false);

  const [newName, setNewName] = useState("");
  const [newSource, setNewSource] = useState("");
  const [newDestination, setNewDestination] =
    useState("");
  const [newPriority, setNewPriority] =
    useState("Medium");

  /* =========================
     FILTER ROUTES
  ========================= */

  const filteredRoutes = useMemo(() => {
    return routes.filter((route) => {
      const query = search.toLowerCase();

      const matchesSearch =
        route.name.toLowerCase().includes(query) ||
        route.source.toLowerCase().includes(query) ||
        route.destination
          .toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === "All Status" ||
        route.status === statusFilter;

      const matchesPriority =
        priorityFilter === "All Priority" ||
        route.priority === priorityFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority
      );
    });
  }, [
    routes,
    search,
    statusFilter,
    priorityFilter,
  ]);

  /* =========================
     SUMMARY
  ========================= */

  const activeRoutes = routes.filter(
    (r) => r.status === "Active"
  ).length;

  const alternateRoutes = routes.filter(
    (r) => r.status === "Alternate"
  ).length;

  const blockedRoutes = routes.filter(
    (r) => r.roadStatus !== "Clear"
  ).length;

  const criticalRoutes = routes.filter(
    (r) => r.priority === "Critical"
  ).length;

  /* =========================
     PLAN ROUTE
  ========================= */

  const planRoute = async (route) => {
    setPlanning(true);

    try {
      const url =
        `https://router.project-osrm.org/route/v1/driving/` +
        `${route.start[1]},${route.start[0]};` +
        `${route.end[1]},${route.end[0]}` +
        `?overview=full&geometries=geojson`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.code === "Ok" && data.routes?.length) {
        const calculated = data.routes[0];

        const updatedRoute = {
          ...route,
          distance: `${(
            calculated.distance / 1000
          ).toFixed(1)} km`,
          eta: `${Math.max(
            1,
            Math.round(calculated.duration / 60)
          )} min`,
          coordinates:
            calculated.geometry.coordinates.map(
              ([lng, lat]) => [lat, lng]
            ),
        };

        setRoutes((prev) =>
          prev.map((item) =>
            item.id === route.id
              ? updatedRoute
              : item
          )
        );

        setSelectedRoute(updatedRoute);
      }
    } catch (error) {
      console.error(
        "Route planning error:",
        error
      );
    } finally {
      setPlanning(false);
    }
  };

  /* =========================
     CREATE ROUTE
  ========================= */

  const createRoute = () => {
    if (
      !newName ||
      !newSource ||
      !newDestination
    ) {
      return;
    }

    const newRoute = {
      id: `RTE-${String(
        routes.length + 1
      ).padStart(3, "0")}`,
      name: newName,
      source: newSource,
      destination: newDestination,
      start: [19.076, 72.877],
      end: [19.09, 72.855],
      distance: "Calculating",
      eta: "Calculating",
      status: "Alternate",
      priority: newPriority,
      roadStatus: "Clear",
      description:
        "New response route created for emergency operations.",
      recommendation:
        "Verify road conditions before dispatching response units.",
    };

    setRoutes((prev) => [
      newRoute,
      ...prev,
    ]);

    setShowCreate(false);

    setNewName("");
    setNewSource("");
    setNewDestination("");
    setNewPriority("Medium");
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
              GEOREASONER / ROUTE INTELLIGENCE
            </div>

            <h1 className="text-3xl font-semibold tracking-tight">
              Routes
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Plan, monitor and manage emergency response routes.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-400/5 px-4 py-2.5">
            <div className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_#34d399]" />

            <span className="text-xs text-cyan-300">
              ROUTE ENGINE ONLINE
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
                Active Routes
              </span>

              <RouteIcon
                size={18}
                className="text-cyan-400"
              />
            </div>

            <div className="text-3xl font-semibold">
              {activeRoutes}
            </div>

            <div className="mt-1 text-xs text-cyan-400">
              Currently operational
            </div>
          </Glass>

          <Glass className="rounded-xl p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wide text-slate-500">
                Alternate Routes
              </span>

              <Navigation
                size={18}
                className="text-purple-400"
              />
            </div>

            <div className="text-3xl font-semibold">
              {alternateRoutes}
            </div>

            <div className="mt-1 text-xs text-purple-400">
              Available alternatives
            </div>
          </Glass>

          <Glass className="rounded-xl p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wide text-slate-500">
                Road Restrictions
              </span>

              <ShieldAlert
                size={18}
                className="text-orange-400"
              />
            </div>

            <div className="text-3xl font-semibold">
              {blockedRoutes}
            </div>

            <div className="mt-1 text-xs text-orange-400">
              Routes requiring attention
            </div>
          </Glass>

          <Glass className="rounded-xl p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wide text-slate-500">
                Critical Routes
              </span>

              <AlertTriangle
                size={18}
                className="text-red-400"
              />
            </div>

            <div className="text-3xl font-semibold">
              {criticalRoutes}
            </div>

            <div className="mt-1 text-xs text-red-400">
              Priority emergency routes
            </div>
          </Glass>
        </div>

        {/* =========================
            ROUTE OVERVIEW
        ========================= */}

        <div className="mb-4 grid shrink-0 grid-cols-3 gap-4">
          <Glass className="rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-cyan-400/15 bg-cyan-400/5">
                <Truck
                  size={19}
                  className="text-cyan-400"
                />
              </div>

              <div>
                <div className="text-sm font-semibold">
                  Emergency Dispatch
                </div>

                <div className="mt-1 text-xs text-slate-500">
                  Connect response units with incidents
                </div>
              </div>
            </div>
          </Glass>

          <Glass className="rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-purple-400/15 bg-purple-400/5">
                <Navigation
                  size={19}
                  className="text-purple-400"
                />
              </div>

              <div>
                <div className="text-sm font-semibold">
                  Alternate Routing
                </div>

                <div className="mt-1 text-xs text-slate-500">
                  Prepare alternatives around blocked roads
                </div>
              </div>
            </div>
          </Glass>

          <Glass className="rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-orange-400/15 bg-orange-400/5">
                <Clock3
                  size={19}
                  className="text-orange-400"
                />
              </div>

              <div>
                <div className="text-sm font-semibold">
                  ETA Intelligence
                </div>

                <div className="mt-1 text-xs text-slate-500">
                  Calculate distance and response time
                </div>
              </div>
            </div>
          </Glass>
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
                placeholder="Search routes, units or destinations..."
                className="h-11 w-full rounded-lg border border-slate-700/60 bg-[#06131f] pl-11 pr-4 text-sm text-slate-200 outline-none placeholder:text-slate-600 focus:border-cyan-400/40"
              />
            </div>

            <div className="flex h-11 items-center rounded-lg border border-slate-700/60 bg-[#06131f] px-3">
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(
                    e.target.value
                  )
                }
                className="bg-transparent text-sm text-slate-300 outline-none"
              >
                <option>All Status</option>
                <option>Active</option>
                <option>Alternate</option>
              </select>
            </div>

            <div className="flex h-11 items-center rounded-lg border border-slate-700/60 bg-[#06131f] px-3">
              <select
                value={priorityFilter}
                onChange={(e) =>
                  setPriorityFilter(
                    e.target.value
                  )
                }
                className="bg-transparent text-sm text-slate-300 outline-none"
              >
                <option>All Priority</option>
                <option>Critical</option>
                <option>High</option>
                <option>Medium</option>
              </select>
            </div>

            <button
              onClick={() =>
                setShowCreate(true)
              }
              className="flex h-11 items-center gap-2 rounded-lg bg-cyan-400 px-4 text-sm font-semibold text-[#021018] transition hover:bg-cyan-300"
            >
              <Plus size={17} />
              Create Route
            </button>
          </div>
        </Glass>

        {/* =========================
            ROUTE REGISTRY
        ========================= */}

        <Glass className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl">
          <div className="shrink-0 border-b border-cyan-400/10 px-5 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold">
                  Emergency Route Registry
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  {filteredRoutes.length} routes available
                </p>
              </div>

              <div className="text-xs text-slate-500">
                Live route intelligence
              </div>
            </div>
          </div>

          <div className="min-h-0 flex-1 divide-y divide-cyan-400/10 overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-400/30 scrollbar-track-transparent">
            {filteredRoutes.map((route) => (
              <div
                key={route.id}
                className="group flex items-center gap-5 px-5 py-4 transition hover:bg-cyan-400/[0.025]"
              >
                {/* ICON */}

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-cyan-400/15 bg-cyan-400/5">
                  <RouteIcon
                    size={19}
                    className="text-cyan-400"
                  />
                </div>

                {/* MAIN */}

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="truncate text-sm font-semibold">
                      {route.name}
                    </h3>

                    <span
                      className={`rounded-md border px-2 py-0.5 text-[9px] font-semibold ${priorityStyle(
                        route.priority
                      )}`}
                    >
                      {route.priority}
                    </span>

                    <span
                      className={`rounded-md border px-2 py-0.5 text-[9px] font-semibold ${statusStyle(
                        route.status
                      )}`}
                    >
                      {route.status}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
                    <span>{route.id}</span>

                    <span className="flex items-center gap-1">
                      <Truck size={12} />
                      {route.source}
                    </span>

                    <span className="flex items-center gap-1">
                      <MapPin size={12} />
                      {route.destination}
                    </span>
                  </div>
                </div>

                {/* DISTANCE */}

                <div className="hidden w-24 shrink-0 md:block">
                  <div className="text-[9px] uppercase text-slate-600">
                    Distance
                  </div>

                  <div className="mt-1 text-sm font-semibold">
                    {route.distance}
                  </div>
                </div>

                {/* ETA */}

                <div className="hidden w-20 shrink-0 md:block">
                  <div className="text-[9px] uppercase text-slate-600">
                    ETA
                  </div>

                  <div className="mt-1 text-sm font-semibold text-cyan-400">
                    {route.eta}
                  </div>
                </div>

                {/* ROAD STATUS */}

                <div className="hidden w-28 shrink-0 lg:block">
                  <div className="text-[9px] uppercase text-slate-600">
                    Road Status
                  </div>

                  <div
                    className={`mt-1 text-xs font-semibold ${roadStatusStyle(
                      route.roadStatus
                    )}`}
                  >
                    {route.roadStatus}
                  </div>
                </div>

                {/* ACTION */}

                <button
                  onClick={() =>
                    setSelectedRoute(route)
                  }
                  className="flex h-9 shrink-0 items-center gap-2 rounded-lg border border-cyan-400/20 bg-cyan-400/5 px-3 text-xs text-cyan-300 transition hover:bg-cyan-400/10"
                >
                  View
                  <ChevronDown
                    size={14}
                  />
                </button>
              </div>
            ))}

            {filteredRoutes.length === 0 && (
              <div className="px-5 py-16 text-center">
                <RouteIcon
                  size={35}
                  className="mx-auto mb-3 text-slate-700"
                />

                <p className="text-sm text-slate-400">
                  No routes found
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
          ROUTE DETAILS MODAL
      ========================= */}

      {selectedRoute && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm">
          <div className="flex h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-cyan-400/20 bg-[#071522] shadow-[0_0_70px_#22d3ee12]">
            {/* HEADER */}

            <div className="flex shrink-0 items-start justify-between border-b border-cyan-400/10 px-6 py-5">
              <div>
                <div className="mb-2 text-[10px] font-semibold tracking-[0.25em] text-cyan-400">
                  ROUTE INTELLIGENCE
                </div>

                <h2 className="text-xl font-semibold">
                  {selectedRoute.name}
                </h2>

                <div className="mt-1 text-xs text-slate-500">
                  {selectedRoute.id}
                </div>
              </div>

              <button
                onClick={() =>
                  setSelectedRoute(null)
                }
                className="rounded-lg p-2 text-slate-500 transition hover:bg-white/5 hover:text-slate-200"
              >
                <X size={21} />
              </button>
            </div>

            {/* CONTENT */}

            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-cyan-400/30 scrollbar-track-transparent">
              {/* ROUTE SUMMARY */}

              <div className="rounded-xl border border-cyan-400/10 bg-[#06131f] p-5">
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-cyan-400/15 bg-cyan-400/5">
                      <RouteIcon
                        size={21}
                        className="text-cyan-400"
                      />
                    </div>

                    <div>
                      <div className="text-base font-semibold">
                        Emergency Response Route
                      </div>

                      <div className="mt-1 text-xs text-slate-500">
                        {selectedRoute.source} →{" "}
                        {selectedRoute.destination}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <span
                      className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${priorityStyle(
                        selectedRoute.priority
                      )}`}
                    >
                      {selectedRoute.priority}
                    </span>

                    <span
                      className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${statusStyle(
                        selectedRoute.status
                      )}`}
                    >
                      {selectedRoute.status}
                    </span>
                  </div>
                </div>

                {/* ROUTE LINE */}

                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full border border-cyan-400/20 bg-cyan-400/5">
                    <Truck
                      size={16}
                      className="text-cyan-400"
                    />
                  </div>

                  <div className="h-px flex-1 bg-gradient-to-r from-cyan-400/50 via-purple-400/40 to-red-400/50" />

                  <div className="flex h-9 w-9 items-center justify-center rounded-full border border-red-400/20 bg-red-400/5">
                    <MapPin
                      size={16}
                      className="text-red-400"
                    />
                  </div>
                </div>

                <div className="mt-3 flex justify-between text-xs text-slate-500">
                  <span>
                    {selectedRoute.source}
                  </span>

                  <span>
                    {selectedRoute.destination}
                  </span>
                </div>
              </div>

              {/* METRICS */}

              <div className="grid grid-cols-4 gap-3">
                <div className="rounded-xl border border-slate-700/60 bg-[#06131f] p-4">
                  <div className="text-[9px] uppercase text-slate-600">
                    Distance
                  </div>

                  <div className="mt-2 text-2xl font-semibold">
                    {selectedRoute.distance}
                  </div>
                </div>

                <div className="rounded-xl border border-slate-700/60 bg-[#06131f] p-4">
                  <div className="text-[9px] uppercase text-slate-600">
                    ETA
                  </div>

                  <div className="mt-2 text-2xl font-semibold text-cyan-400">
                    {selectedRoute.eta}
                  </div>
                </div>

                <div className="rounded-xl border border-slate-700/60 bg-[#06131f] p-4">
                  <div className="text-[9px] uppercase text-slate-600">
                    Road
                  </div>

                  <div
                    className={`mt-2 text-sm font-semibold ${roadStatusStyle(
                      selectedRoute.roadStatus
                    )}`}
                  >
                    {selectedRoute.roadStatus}
                  </div>
                </div>

                <div className="rounded-xl border border-slate-700/60 bg-[#06131f] p-4">
                  <div className="text-[9px] uppercase text-slate-600">
                    Priority
                  </div>

                  <div className="mt-2 text-sm font-semibold">
                    {selectedRoute.priority}
                  </div>
                </div>
              </div>

              {/* DESCRIPTION */}

              <div className="rounded-xl border border-cyan-400/10 bg-[#06131f] p-5">
                <div className="mb-3 text-[10px] font-semibold uppercase tracking-wide text-cyan-400">
                  Route Description
                </div>

                <p className="text-sm leading-6 text-slate-300">
                  {selectedRoute.description}
                </p>
              </div>

              {/* RECOMMENDATION */}

              <div className="rounded-xl border border-orange-400/15 bg-orange-400/[0.03] p-5">
                <div className="mb-3 flex items-center gap-2">
                  <AlertTriangle
                    size={16}
                    className="text-orange-400"
                  />

                  <span className="text-[10px] font-semibold uppercase tracking-wide text-orange-400">
                    Route Recommendation
                  </span>
                </div>

                <p className="text-sm leading-6 text-slate-300">
                  {selectedRoute.recommendation}
                </p>
              </div>

              {/* COORDINATES */}

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-700/50 bg-[#06131f] p-4">
                  <div className="text-[9px] uppercase text-slate-600">
                    Origin Coordinates
                  </div>

                  <div className="mt-2 text-sm text-slate-300">
                    {selectedRoute.start[0].toFixed(
                      4
                    )}
                    ,{" "}
                    {selectedRoute.start[1].toFixed(
                      4
                    )}
                  </div>
                </div>

                <div className="rounded-xl border border-slate-700/50 bg-[#06131f] p-4">
                  <div className="text-[9px] uppercase text-slate-600">
                    Destination Coordinates
                  </div>

                  <div className="mt-2 text-sm text-slate-300">
                    {selectedRoute.end[0].toFixed(
                      4
                    )}
                    ,{" "}
                    {selectedRoute.end[1].toFixed(
                      4
                    )}
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
                      Route recommendations should be verified against
                      current road conditions and active disaster zones
                      before deployment.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* FOOTER */}

            <div className="flex shrink-0 items-center justify-between border-t border-cyan-400/10 px-6 py-4">
              <div className="flex items-center gap-2 text-[10px] text-emerald-400">
                <CheckCircle2 size={14} />
                Route data available
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() =>
                    planRoute(selectedRoute)
                  }
                  disabled={planning}
                  className="flex items-center gap-2 rounded-lg border border-cyan-400/20 bg-cyan-400/5 px-4 py-2.5 text-xs text-cyan-300 transition hover:bg-cyan-400/10 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Navigation size={15} />

                  {planning
                    ? "Planning..."
                    : "Recalculate Route"}
                </button>

                <button
                  onClick={() =>
                    setSelectedRoute(null)
                  }
                  className="rounded-lg bg-cyan-400 px-5 py-2.5 text-xs font-semibold text-[#021018] transition hover:bg-cyan-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================
          CREATE ROUTE MODAL
      ========================= */}

      {showCreate && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-cyan-400/20 bg-[#071522] p-6 shadow-[0_0_70px_#22d3ee12]">
            {/* HEADER */}

            <div className="mb-6 flex items-start justify-between">
              <div>
                <div className="mb-2 text-[10px] font-semibold tracking-[0.25em] text-cyan-400">
                  ROUTE MANAGEMENT
                </div>

                <h2 className="text-xl font-semibold">
                  Create Route
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Create a new emergency response route.
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
                  Route Name
                </label>

                <input
                  value={newName}
                  onChange={(e) =>
                    setNewName(
                      e.target.value
                    )
                  }
                  placeholder="e.g. Airport Emergency Route"
                  className="h-11 w-full rounded-lg border border-slate-700/60 bg-[#06131f] px-4 text-sm text-slate-200 outline-none placeholder:text-slate-600 focus:border-cyan-400/40"
                />
              </div>

              <div>
                <label className="mb-2 block text-[10px] uppercase tracking-wide text-slate-500">
                  Source / Response Unit
                </label>

                <input
                  value={newSource}
                  onChange={(e) =>
                    setNewSource(
                      e.target.value
                    )
                  }
                  placeholder="e.g. Rescue Unit 04"
                  className="h-11 w-full rounded-lg border border-slate-700/60 bg-[#06131f] px-4 text-sm text-slate-200 outline-none placeholder:text-slate-600 focus:border-cyan-400/40"
                />
              </div>

              <div>
                <label className="mb-2 block text-[10px] uppercase tracking-wide text-slate-500">
                  Destination / Incident
                </label>

                <input
                  value={newDestination}
                  onChange={(e) =>
                    setNewDestination(
                      e.target.value
                    )
                  }
                  placeholder="e.g. Riverside Incident"
                  className="h-11 w-full rounded-lg border border-slate-700/60 bg-[#06131f] px-4 text-sm text-slate-200 outline-none placeholder:text-slate-600 focus:border-cyan-400/40"
                />
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
                onClick={createRoute}
                className="flex items-center gap-2 rounded-lg bg-cyan-400 px-5 py-2.5 text-xs font-semibold text-[#021018] transition hover:bg-cyan-300"
              >
                <Plus size={15} />
                Create Route
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
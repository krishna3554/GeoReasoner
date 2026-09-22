import { useMemo,  useEffect, useState } from "react";
import {
  Ambulance,
  Box,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Droplets,
  Filter,
  MapPin,
  Package,
  Plus,
  Search,
  Shield,
  Truck,
  Users,
  X,
} from "lucide-react";

import {
  getResources,
  createResource as createResourceAPI,
  getResourceAssignments,
  createResourceAssignment,
} from "../api/resources";

import { getIncidents } from "../api/incidents";

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
   HELPERS
========================= */

function statusStyle(status) {
  switch (status) {
    case "Available":
      return "border-emerald-400/20 bg-emerald-400/10 text-emerald-400";

    case "Deployed":
      return "border-red-400/20 bg-red-400/10 text-red-400";

    case "En Route":
      return "border-cyan-400/20 bg-cyan-400/10 text-cyan-400";

    case "Limited":
      return "border-orange-400/20 bg-orange-400/10 text-orange-400";

    case "Active":
      return "border-cyan-400/20 bg-cyan-400/10 text-cyan-400";

    default:
      return "border-slate-700 bg-slate-800 text-slate-400";
  }
}

function categoryIcon(category) {
  if (category === "Rescue Teams") {
    return <Users size={20} className="text-cyan-400" />;
  }

  if (category === "Vehicles") {
    return <Truck size={20} className="text-orange-400" />;
  }

  if (category === "Supplies") {
    return <Package size={20} className="text-purple-400" />;
  }

  return <Shield size={20} className="text-emerald-400" />;
}

function resourceIcon(category) {
  if (category === "Rescue Teams") {
    return <Users size={18} className="text-cyan-400" />;
  }

  if (category === "Vehicles") {
    return <Truck size={18} className="text-orange-400" />;
  }

  if (category === "Supplies") {
    return <Box size={18} className="text-purple-400" />;
  }

  return <Shield size={18} className="text-emerald-400" />;
}

/* =========================
   PAGE
========================= */

export default function Resources() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] =
    useState("All Categories");
  const [statusFilter, setStatusFilter] =
    useState("All Status");

  const [selectedResource, setSelectedResource] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [incidents, setIncidents] = useState([]);
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [assignmentIncident, setAssignmentIncident] = useState("");
  const [assignmentQuantity, setAssignmentQuantity] = useState("");

  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] =
    useState("Rescue Teams");
  const [newType, setNewType] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newQuantity, setNewQuantity] = useState("");

  const openResourceDetails = async (resource) => {
    try {
      setSelectedResource({
        ...resource,
        assignments: [],
      });

      const assignments = await getResourceAssignments(
        resource.resourceUuid
      );

      setSelectedResource({
        ...resource,
        assignments,
      });
    } catch (err) {
      console.error("Failed to load assignments:", err);

      setSelectedResource({
        ...resource,
        assignments: [],
      });
    }
  };

  const handleCreateAssignment = async () => {
    if (!selectedResource || !assignmentIncident || !assignmentQuantity) {
      return;
    }

    try {
      await createResourceAssignment({
        resource_id: selectedResource.resourceUuid,
        incident_id: assignmentIncident,
        quantity: Number(assignmentQuantity),
      });

      // Refresh assignments
      const assignments = await getResourceAssignments(
        selectedResource.resourceUuid
      );

      setSelectedResource({
        ...selectedResource,
        assignments,
      });

      // Reset form
      setAssignmentIncident("");
      setAssignmentQuantity("");
      setShowAssignmentForm(false);

      // Refresh resource list so quantity/status update
      const data = await getResources();

      const formattedResources = data.map((resource) => ({
        ...resource,
        id: resource.resource_code,
        resourceUuid: resource.id,
        capacity: `${resource.quantity} units`,
      }));

      setResources(formattedResources);
    } catch (err) {
      console.error("Failed to create assignment:", err);
      alert(err.message || "Failed to assign resource");
    }
  };

  useEffect(() => {
    const loadResources = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getResources();

        const formattedResources = data.map((resource) => ({
          ...resource,

          // Display ID
          id: resource.resource_code,

          // Database UUID used by assignment API
          resourceUuid: resource.id,

          capacity: `${resource.quantity} units`,
        }));

        setResources(formattedResources);
      } catch (err) {
        console.error("Failed to load resources:", err);
        setError(err.message || "Failed to load resources");
      } finally {
        setLoading(false);
      }
    };

    loadResources();
  }, []);

  useEffect(() => {
    const loadIncidents = async () => {
      try {
        const data = await getIncidents();

        const formattedIncidents = (data.incidents || data).map((incident) => ({
          ...incident,
          dbId: incident.id,
        }));

        setIncidents(formattedIncidents);
      } catch (err) {
        console.error("Failed to load incidents:", err);
      }
    };

    loadIncidents();
  }, []);

  /* =========================
     FILTER
  ========================= */

  const filteredResources = useMemo(() => {
    return resources.filter((resource) => {
      const matchesSearch =
        resource.name
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        resource.type
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        resource.location
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesCategory =
        categoryFilter === "All Categories" ||
        resource.category === categoryFilter;

      const matchesStatus =
        statusFilter === "All Status" ||
        resource.status === statusFilter;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesStatus
      );
    });
  }, [
    resources,
    search,
    categoryFilter,
    statusFilter,
  ]);

  /* =========================
     SUMMARY
  ========================= */

  const availableTeams = resources.filter(
    (r) =>
      r.category === "Rescue Teams" &&
      r.status === "Available"
  ).length;

  const availableVehicles = resources.filter(
    (r) =>
      r.category === "Vehicles" &&
      r.status === "Available"
  ).length;

  const activeShelters = resources.filter(
    (r) =>
      r.category === "Shelters" &&
      r.status === "Active"
  ).length;

  const limitedResources = resources.filter(
    (r) => r.status === "Limited"
  ).length;

  /* =========================
     CREATE RESOURCE
  ========================= */

  const createResource = async () => {
  if (
    !newName ||
    !newType ||
    !newLocation ||
    !newQuantity
  ) {
    setError("Please fill in all required fields.");
    return;
  }

  try {
    setError("");

    const createdResource = await createResourceAPI({
      name: newName,
      category: newCategory,
      type: newType,
      location: newLocation,
      status: "Available",
      quantity: Number(newQuantity),
      description:
        "New emergency resource added to the GeoReasoner resource registry.",
    });

    const formattedResource = {
      ...createdResource,
      id: createdResource.resource_code,
      resourceUuid: createdResource.id,
      assigned: 0,
      capacity: `${createdResource.quantity} units`,
    };

    setResources((prev) => [
      formattedResource,
      ...prev,
    ]);

    setShowCreate(false);

    setNewName("");
    setNewCategory("Rescue Teams");
    setNewType("");
    setNewLocation("");
    setNewQuantity("");
  } catch (err) {
    console.error("Failed to create resource:", err);
    setError(err.message || "Failed to create resource");
  }

  
};



  return (
    <div className="h-screen overflow-hidden bg-[#020b13] text-slate-100">
      <main className="flex h-screen min-h-0 flex-col overflow-hidden p-7">
        {/* =========================
            HEADER
        ========================= */}

        <div className="mb-7 flex items-start justify-between">
          <div>
            <div className="mb-2 text-[11px] font-semibold tracking-[0.28em] text-cyan-400">
              GEOREASONER / RESOURCE INTELLIGENCE
            </div>

            <h1 className="text-3xl font-semibold tracking-tight">
              Resources
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Monitor emergency teams, vehicles, supplies and shelters.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-400/5 px-4 py-2.5">
            <div className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_#34d399]" />

            <span className="text-xs text-cyan-300">
              RESOURCE NETWORK ONLINE
            </span>
          </div>
        </div>

        {/* =========================
            SUMMARY CARDS
        ========================= */}

        <div className="mb-6 grid grid-cols-4 gap-4">
          <Glass className="rounded-xl p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wide text-slate-500">
                Available Teams
              </span>

              <Users
                size={18}
                className="text-cyan-400"
              />
            </div>

            <div className="text-3xl font-semibold">
              {availableTeams}
            </div>

            <div className="mt-1 text-xs text-cyan-400">
              Ready for deployment
            </div>
          </Glass>

          <Glass className="rounded-xl p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wide text-slate-500">
                Available Vehicles
              </span>

              <Truck
                size={18}
                className="text-orange-400"
              />
            </div>

            <div className="text-3xl font-semibold">
              {availableVehicles}
            </div>

            <div className="mt-1 text-xs text-orange-400">
              Ready for dispatch
            </div>
          </Glass>

          <Glass className="rounded-xl p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wide text-slate-500">
                Active Shelters
              </span>

              <Shield
                size={18}
                className="text-emerald-400"
              />
            </div>

            <div className="text-3xl font-semibold">
              {activeShelters}
            </div>

            <div className="mt-1 text-xs text-emerald-400">
              Currently operational
            </div>
          </Glass>

          <Glass className="rounded-xl p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wide text-slate-500">
                Limited Resources
              </span>

              <Package
                size={18}
                className="text-red-400"
              />
            </div>

            <div className="text-3xl font-semibold">
              {limitedResources}
            </div>

            <div className="mt-1 text-xs text-red-400">
              Requires replenishment
            </div>
          </Glass>
        </div>

        {/* =========================
            CATEGORY OVERVIEW
        ========================= */}

        <div className="mb-6 grid grid-cols-4 gap-4">
          {[
            {
              title: "Rescue Teams",
              count: resources.filter(
                (r) => r.category === "Rescue Teams"
              ).length,
              subtitle: "Response personnel",
            },
            {
              title: "Vehicles",
              count: resources.filter(
                (r) => r.category === "Vehicles"
              ).length,
              subtitle: "Emergency vehicles",
            },
            {
              title: "Supplies",
              count: resources.filter(
                (r) => r.category === "Supplies"
              ).length,
              subtitle: "Relief inventory",
            },
            {
              title: "Shelters",
              count: resources.filter(
                (r) => r.category === "Shelters"
              ).length,
              subtitle: "Emergency facilities",
            },
          ].map((item) => (
            <Glass
              key={item.title}
              className="rounded-xl p-4"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-cyan-400/15 bg-cyan-400/5">
                  {categoryIcon(
                    item.title
                  )}
                </div>

                <div>
                  <div className="text-sm font-semibold">
                    {item.title}
                  </div>

                  <div className="mt-1 text-xs text-slate-500">
                    {item.count} resources ·{" "}
                    {item.subtitle}
                  </div>
                </div>
              </div>
            </Glass>
          ))}
        </div>

        {/* =========================
            TOOLBAR
        ========================= */}

        <Glass className="mb-5 rounded-xl p-3">
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
                placeholder="Search resources, types or locations..."
                className="h-11 w-full rounded-lg border border-slate-700/60 bg-[#06131f] pl-11 pr-4 text-sm text-slate-200 outline-none placeholder:text-slate-600 focus:border-cyan-400/40"
              />
            </div>

            <div className="flex h-11 items-center gap-2 rounded-lg border border-slate-700/60 bg-[#06131f] px-3">
              <Filter
                size={16}
                className="text-slate-500"
              />

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
                <option>
                  Rescue Teams
                </option>
                <option>
                  Vehicles
                </option>
                <option>
                  Supplies
                </option>
                <option>
                  Shelters
                </option>
              </select>
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
                <option>Available</option>
                <option>Deployed</option>
                <option>En Route</option>
                <option>Limited</option>
                <option>Active</option>
              </select>
            </div>

            <button
              onClick={() =>
                setShowCreate(true)
              }
              className="flex h-11 items-center gap-2 rounded-lg bg-cyan-400 px-4 text-sm font-semibold text-[#021018] transition hover:bg-cyan-300"
            >
              <Plus size={17} />
              Add Resource
            </button>
          </div>
        </Glass>

        {/* =========================
            RESOURCE REGISTRY
        ========================= */}

        <Glass className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl">
          <div className="border-b border-cyan-400/10 px-5 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold">
                  Resource Registry
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  {filteredResources.length} resources available
                </p>
              </div>

              <div className="text-xs text-slate-500">
                Live resource allocation
              </div>
            </div>
          </div>

          <div className="min-h-0 flex-1 divide-y divide-cyan-400/10 overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-400/30 scrollbar-track-transparent">
            {filteredResources.map(
              (resource) => {
                const utilization =
                  resource.quantity > 0
                    ? Math.min(
                        100,
                        Math.round(
                          (resource.assigned /
                            resource.quantity) *
                            100
                        )
                      )
                    : 0;

                return (
                  <div
                    key={resource.id}
                    className="group flex items-center gap-5 px-5 py-4 transition hover:bg-cyan-400/[0.025]"
                  >
                    {/* ICON */}

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-cyan-400/15 bg-cyan-400/5">
                      {resourceIcon(
                        resource.category
                      )}
                    </div>

                    {/* MAIN */}

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="truncate text-sm font-semibold">
                          {resource.name}
                        </h3>

                        <span
                          className={`rounded-md border px-2 py-0.5 text-[9px] font-semibold ${statusStyle(
                            resource.status
                          )}`}
                        >
                          {resource.status}
                        </span>
                      </div>

                      <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
                        <span>
                          {resource.id}
                        </span>

                        <span className="flex items-center gap-1">
                          <MapPin size={13} />
                          {resource.location}
                        </span>

                        <span>
                          {resource.type}
                        </span>
                      </div>
                    </div>

                    {/* QUANTITY */}

                    <div className="w-28 shrink-0">
                      <div className="mb-1 text-[9px] uppercase text-slate-600">
                        Quantity
                      </div>

                      <div className="text-sm font-semibold">
                        {resource.quantity.toLocaleString()}
                      </div>

                      <div className="mt-1 text-[9px] text-slate-600">
                        {resource.capacity}
                      </div>
                    </div>

                    {/* UTILIZATION */}

                    <div className="w-32 shrink-0">
                      <div className="mb-1 flex justify-between text-[9px] uppercase text-slate-600">
                        <span>Allocated</span>
                        <span>
                          {utilization}%
                        </span>
                      </div>

                      <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
                        <div
                          className="h-full rounded-full bg-cyan-400"
                          style={{
                            width: `${utilization}%`,
                          }}
                        />
                      </div>

                      <div className="mt-1 text-[9px] text-slate-600">
                        {resource.assigned.toLocaleString()}{" "}
                        assigned
                      </div>
                    </div>

                    

                    {/* ACTION */}

                    <button
                      onClick={() => openResourceDetails(resource)}
                      className="flex h-9 shrink-0 items-center gap-2 rounded-lg border border-cyan-400/20 bg-cyan-400/5 px-3 text-xs text-cyan-300 transition hover:bg-cyan-400/10"
                    >
                      View
                      <ChevronDown
                        size={14}
                      />
                    </button>
                  </div>
                );
              }
            )}

            {filteredResources.length ===
              0 && (
              <div className="px-5 py-16 text-center">
                <Package
                  size={35}
                  className="mx-auto mb-3 text-slate-700"
                />

                <p className="text-sm text-slate-400">
                  No resources found
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
          RESOURCE DETAILS MODAL
      ========================= */}

      {selectedResource && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm">
          <div className="flex h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-cyan-400/20 bg-[#071522] shadow-[0_0_70px_#22d3ee12]">
            {/* HEADER */}

            <div className="flex shrink-0 items-start justify-between border-b border-cyan-400/10 px-6 py-5">
              <div>
                <div className="mb-2 text-[10px] font-semibold tracking-[0.25em] text-cyan-400">
                  RESOURCE DETAILS
                </div>

                <h2 className="text-xl font-semibold">
                  {selectedResource.name}
                </h2>

                <div className="mt-1 text-xs text-slate-500">
                  {selectedResource.id}
                </div>
              </div>

              <button
                onClick={() => setSelectedResource(null)}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-white/5 hover:text-slate-200"
              >
                <X size={21} />
              </button>
            </div>

            {/* CONTENT */}

            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-cyan-400/30 scrollbar-track-transparent">
              {/* RESOURCE IDENTITY */}

              <div className="flex items-center gap-4 rounded-xl border border-cyan-400/10 bg-[#06131f] p-5">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-cyan-400/15 bg-cyan-400/5">
                  {categoryIcon(
                    selectedResource.category
                  )}
                </div>

                <div>
                  <div className="text-lg font-semibold">
                    {selectedResource.name}
                  </div>

                  <div className="mt-1 text-xs text-slate-500">
                    {selectedResource.type} ·{" "}
                    {selectedResource.category}
                  </div>
                </div>

                <span
                  className={`ml-auto rounded-lg border px-3 py-1.5 text-xs font-semibold ${statusStyle(
                    selectedResource.status
                  )}`}
                >
                  {selectedResource.status}
                </span>
              </div>

              {/* METRICS */}

              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-slate-700/60 bg-[#06131f] p-4">
                  <div className="text-[9px] uppercase text-slate-600">
                    Quantity
                  </div>

                  <div className="mt-2 text-2xl font-semibold">
                    {selectedResource.quantity.toLocaleString()}
                  </div>
                </div>

                <div className="rounded-xl border border-slate-700/60 bg-[#06131f] p-4">
                  <div className="text-[9px] uppercase text-slate-600">
                    Assigned
                  </div>

                  <div className="mt-2 text-2xl font-semibold text-cyan-400">
                    {selectedResource.assigned.toLocaleString()}
                  </div>
                </div>

                <div className="rounded-xl border border-slate-700/60 bg-[#06131f] p-4">
                  <div className="text-[9px] uppercase text-slate-600">
                    Available
                  </div>

                  <div className="mt-2 text-2xl font-semibold text-emerald-400">
                    {Math.max(
                      0,
                      selectedResource.quantity -
                        selectedResource.assigned
                    ).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* LOCATION */}

              <div className="rounded-xl border border-cyan-400/10 bg-[#06131f] p-5">
                <div className="mb-3 flex items-center gap-2">
                  <MapPin
                    size={17}
                    className="text-cyan-400"
                  />

                  <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    Current Location
                  </span>
                </div>

                <div className="text-sm font-semibold">
                  {selectedResource.location}
                </div>
              </div>

              {/* UTILIZATION */}

              <div className="rounded-xl border border-cyan-400/10 bg-[#06131f] p-5">
                <div className="mb-3 flex justify-between">
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-cyan-400">
                    Resource Allocation
                  </div>

                  <div className="text-xs text-cyan-400">
                    {selectedResource.quantity > 0
                      ? Math.round(
                          (selectedResource.assigned /
                            selectedResource.quantity) *
                            100
                        )
                      : 0}
                    %
                  </div>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-cyan-400"
                    style={{
                      width: `${
                        selectedResource.quantity > 0
                          ? Math.min(
                              100,
                              Math.round(
                                (selectedResource.assigned /
                                  selectedResource.quantity) *
                                  100
                              )
                            )
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>

              {/* Resource Assignment */}
              <div className="mt-6 border-t border-white/10 pt-5">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white">
                    Resource Assignment
                  </h3>

                  <button
                    onClick={() => setShowAssignmentForm(!showAssignmentForm)}
                    className="rounded-lg bg-cyan-500/20 px-3 py-2 text-xs font-medium text-cyan-300 hover:bg-cyan-500/30"
                  >
                    + Assign Resource
                  </button>
                </div>

                {showAssignmentForm && (
                  <div className="space-y-3 rounded-xl border border-white/10 bg-white/5 p-4">

                    <div>
                      <label className="mb-1 block text-xs text-slate-400">
                        Incident
                      </label>

                      <select
                        value={assignmentIncident}
                        onChange={(e) => setAssignmentIncident(e.target.value)}
                        className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white"
                      >
                        <option value="">Select incident</option>

                        {incidents.map((incident) => (
                          <option
                            key={incident.dbId}
                            value={incident.dbId}
                          >
                            {incident.incident_code} — {incident.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs text-slate-400">
                        Quantity
                      </label>

                      <input
                        type="number"
                        min="1"
                        value={assignmentQuantity}
                        onChange={(e) => setAssignmentQuantity(e.target.value)}
                        placeholder="Enter quantity"
                        className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white"
                      />
                    </div>

                    <button
                      onClick={handleCreateAssignment}
                      disabled={!assignmentIncident || !assignmentQuantity}
                      className="w-full rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Assign Resource
                    </button>
                  </div>
                )}
              </div>

              {/* CURRENT ASSIGNMENTS */}

              {selectedResource.assignments?.length > 0 && (
                <div className="rounded-xl border border-cyan-400/10 bg-[#06131f] p-5">
                  <div className="mb-4 text-[10px] font-semibold uppercase tracking-wide text-cyan-400">
                    Current Assignments
                  </div>

                  <div className="space-y-3">
                    {selectedResource.assignments.map((assignment) => (
                      <div
                        key={assignment.id}
                        className="rounded-lg border border-slate-700/50 bg-[#071522] p-4"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="text-sm font-semibold text-slate-200">
                              {assignment.incident_code}
                            </div>

                            <div className="mt-1 text-xs text-slate-500">
                              {assignment.incident_title}
                            </div>
                          </div>

                          <span className="rounded-md border border-cyan-400/20 bg-cyan-400/10 px-2 py-1 text-[10px] font-semibold text-cyan-400">
                            {assignment.status}
                          </span>
                        </div>

                        <div className="mt-3 flex items-center justify-between text-xs">
                          <span className="text-slate-500">
                            Quantity
                          </span>

                          <span className="font-semibold text-slate-300">
                            {assignment.quantity}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* DESCRIPTION */}

              <div className="rounded-xl border border-slate-700/50 bg-[#06131f] p-5">
                <div className="mb-3 text-[10px] font-semibold uppercase tracking-wide text-cyan-400">
                  Description
                </div>

                <p className="text-sm leading-6 text-slate-300">
                  {selectedResource.description}
                </p>
              </div>

              {/* STATUS INFO */}

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-slate-700/50 bg-[#06131f] p-4">
                  <div className="flex items-center gap-2 text-[9px] uppercase text-slate-600">
                    <Clock3 size={13} />
                    Current Status
                  </div>

                  <div className="mt-2 text-sm text-slate-300">
                    {selectedResource.status}
                  </div>
                </div>

                <div className="rounded-lg border border-slate-700/50 bg-[#06131f] p-4">
                  <div className="text-[9px] uppercase text-slate-600">
                    Capacity
                  </div>

                  <div className="mt-2 text-sm text-slate-300">
                    {selectedResource.capacity}
                  </div>
                </div>
              </div>
            </div>

            {/* FOOTER */}

            <div className="flex shrink-0 items-center justify-between border-t border-cyan-400/10 px-6 py-4">
              <div className="flex items-center gap-2 text-[10px] text-emerald-400">
                <CheckCircle2 size={14} />
                Resource data operational
              </div>

              <button
                onClick={() => setSelectedResource(null)}
                className="rounded-lg bg-cyan-400 px-5 py-2.5 text-xs font-semibold text-[#021018] transition hover:bg-cyan-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================
          ADD RESOURCE MODAL
      ========================= */}

      {showCreate && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-cyan-400/20 bg-[#071522] p-6 shadow-[0_0_70px_#22d3ee12]">
            {/* HEADER */}

            <div className="mb-6 flex items-start justify-between">
              <div>
                <div className="mb-2 text-[10px] font-semibold tracking-[0.25em] text-cyan-400">
                  RESOURCE MANAGEMENT
                </div>

                <h2 className="text-xl font-semibold">
                  Add Resource
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Add a new emergency resource to the registry.
                </p>
              </div>

              <button
                onClick={() =>
                  setShowCreate(false)
                }
                className="text-slate-500 hover:text-slate-200"
              >
                <X size={20} />
              </button>
            </div>

            {/* FORM */}

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-[10px] uppercase tracking-wide text-slate-500">
                  Resource Name
                </label>

                <input
                  value={newName}
                  onChange={(e) =>
                    setNewName(
                      e.target.value
                    )
                  }
                  placeholder="e.g. Rescue Unit 04"
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
                    <option>
                      Rescue Teams
                    </option>

                    <option>
                      Vehicles
                    </option>

                    <option>
                      Supplies
                    </option>

                    <option>
                      Shelters
                    </option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-[10px] uppercase tracking-wide text-slate-500">
                    Type
                  </label>

                  <input
                    value={newType}
                    onChange={(e) =>
                      setNewType(
                        e.target.value
                      )
                    }
                    placeholder="e.g. Medical Team"
                    className="h-11 w-full rounded-lg border border-slate-700/60 bg-[#06131f] px-4 text-sm text-slate-200 outline-none placeholder:text-slate-600 focus:border-cyan-400/40"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-2 block text-[10px] uppercase tracking-wide text-slate-500">
                    Location
                  </label>

                  <input
                    value={newLocation}
                    onChange={(e) =>
                      setNewLocation(
                        e.target.value
                      )
                    }
                    placeholder="e.g. Riverside District"
                    className="h-11 w-full rounded-lg border border-slate-700/60 bg-[#06131f] px-4 text-sm text-slate-200 outline-none placeholder:text-slate-600 focus:border-cyan-400/40"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-[10px] uppercase tracking-wide text-slate-500">
                    Quantity
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={newQuantity}
                    onChange={(e) =>
                      setNewQuantity(
                        e.target.value
                      )
                    }
                    placeholder="e.g. 10"
                    className="h-11 w-full rounded-lg border border-slate-700/60 bg-[#06131f] px-4 text-sm text-slate-200 outline-none placeholder:text-slate-600 focus:border-cyan-400/40"
                  />
                </div>
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
                onClick={createResource}
                className="flex items-center gap-2 rounded-lg bg-cyan-400 px-5 py-2.5 text-xs font-semibold text-[#021018] transition hover:bg-cyan-300"
              >
                <Plus size={15} />
                Add Resource
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
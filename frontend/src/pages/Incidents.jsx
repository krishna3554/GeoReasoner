import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Search,
  Filter,
  MapPin,
  Clock,
  Users,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Eye,
  X,
  BrainCircuit,
  Upload,
  Image as ImageIcon,
  Plus,
  Trash2,
} from "lucide-react";

import {
  getIncidents,
  getIncidentById,
  createIncident as createIncidentApi,
  uploadIncidentImage,
  updateIncident,
  deleteIncident
} from "../api/incidents";

const incidentsData = [
  {
    id: "INC-001",
    title: "Flood Risk — Riverside",
    type: "Flood",
    severity: "HIGH",
    status: "Active",
    location: "Riverside District",
    confidence: 91,
    affected: 4300,
    time: "8 min ago",
    unit: "Rescue Unit 03",
    description:
      "Severe flooding detected in low-lying areas with multiple road blockages affecting evacuation.",
    image: "/images/flood-incident.jpg",
    insights: [
      "Severe flooding detected in low-lying areas",
      "Multiple road blockages affecting evacuation",
      "Increased risk of building collapse",
    ],
    recommendation: "Deploy Rescue Unit 03 via Route B.",
  },
  {
    id: "INC-002",
    title: "Building Damage — Eastwood",
    type: "Structural",
    severity: "MEDIUM",
    status: "Investigating",
    location: "Eastwood Area",
    confidence: 87,
    affected: 680,
    time: "21 min ago",
    unit: "Rescue Unit 01",
    description:
      "Possible structural damage detected across multiple buildings following the disaster event.",
    image: "/images/building-damage.jpg",
    insights: [
      "Visible structural damage detected",
      "Several buildings require inspection",
      "Potential secondary collapse risk",
    ],
    recommendation:
      "Deploy structural assessment team to Eastwood.",
  },
  {
    id: "INC-003",
    title: "Road Blocked — Bridge A",
    type: "Infrastructure",
    severity: "MEDIUM",
    status: "Active",
    location: "Bridge A",
    confidence: 94,
    affected: 1200,
    time: "34 min ago",
    unit: "Traffic Response 02",
    description:
      "Road access is blocked and may affect emergency vehicle movement.",
    image: "/images/road-blocked.jpg",
    insights: [
      "Emergency access currently restricted",
      "Alternate route required",
      "Traffic congestion increasing",
    ],
    recommendation:
      "Activate alternate emergency route and redirect traffic.",
  },
  {
    id: "INC-004",
    title: "Shelter Capacity Alert",
    type: "Shelter",
    severity: "LOW",
    status: "Monitoring",
    location: "Northfield School",
    confidence: 82,
    affected: 320,
    time: "48 min ago",
    unit: "Relief Team 01",
    description:
      "Shelter occupancy is approaching the recommended capacity threshold.",
    image: "/images/shelter.jpg",
    insights: [
      "Shelter occupancy increasing",
      "Additional supplies may be required",
      "Nearby shelter capacity available",
    ],
    recommendation:
      "Prepare secondary shelter for additional evacuees.",
  },
];

const severityStyles = {
  HIGH: "border-red-400/20 bg-red-500/10 text-red-400",
  MEDIUM: "border-orange-400/20 bg-orange-500/10 text-orange-400",
  LOW: "border-cyan-400/20 bg-cyan-500/10 text-cyan-400",
};

const statusStyles = {
  Active: "text-red-400",
  Investigating: "text-amber-400",
  Monitoring: "text-cyan-400",
  Resolved: "text-emerald-400",
};

function Glass({ children, className = "" }) {
  return (
    <div
      className={`border border-cyan-400/15 bg-[#071522]/75 backdrop-blur-xl ${className}`}
    >
      {children}
    </div>
  );
}

export default function Incidents() {
const [incidents, setIncidents] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");
  const [selectedIncident, setSelectedIncident] =
    useState(null);

  const [showCreate, setShowCreate] = useState(false);

  const [search, setSearch] = useState("");

  const [severityFilter, setSeverityFilter] =
    useState("ALL");

  const [statusFilter, setStatusFilter] =
    useState("ALL");

  // CREATE INCIDENT STATES
  const [incidentType, setIncidentType] =
    useState("Flood");

  const [incidentLocation, setIncidentLocation] =
    useState("");

  const [incidentDescription, setIncidentDescription] =
    useState("");

  const [imagePreview, setImagePreview] =
    useState(null);

  const [imageFile, setImageFile] =
    useState(null);

  const [analyzing, setAnalyzing] =
    useState(false);

  const [aiResult, setAiResult] =
    useState(null);


  useEffect(() => {
  const fetchIncidents = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getIncidents();

      const mappedIncidents = data.incidents.map((incident) => ({
        id: incident.incident_code,
        dbId: incident.id,
        title: incident.title,
        type: incident.type,
        severity: incident.severity,
        status: incident.status,
        location: incident.location,
        latitude: incident.latitude,
        longitude: incident.longitude,
        confidence: Number(incident.confidence || 0),
        affected: incident.affected_people || 0,
        time: new Date(incident.created_at).toLocaleString(),
        unit: incident.assigned_unit || "Unassigned",
        description: incident.description || "",
        image: incident.image_url || null,
        insights: [],
        recommendation: incident.ai_recommendation || "No recommendation available.",
      }));

      setIncidents(mappedIncidents);
     } catch (error) {
      console.error("Failed to fetch incidents:", error);
      setError(error.message || "Failed to load incidents");
    } finally {
      setLoading(false);
    }
  };

  fetchIncidents();
}, []);
  
    // FILTER
  const filteredIncidents = useMemo(() => {
    return incidents.filter((incident) => {
      const matchesSearch =
        incident.title
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        incident.location
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        incident.id
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesSeverity =
        severityFilter === "ALL" ||
        incident.severity === severityFilter;

      const matchesStatus =
        statusFilter === "ALL" ||
        incident.status === statusFilter;

      return (
        matchesSearch &&
        matchesSeverity &&
        matchesStatus
      );
    });
  }, [
    incidents,
    search,
    severityFilter,
    statusFilter,
  ]);

  // IMAGE UPLOAD
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("Only JPG, PNG and WEBP images are allowed.");
      e.target.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Image size must be less than 10 MB.");
      e.target.value = "";
      return;
    }

    setError("");
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setAiResult(null);
  };

  // MOCK AI ANALYSIS
  const analyzeImage = () => {
    if (!imageFile) return;

    setAnalyzing(true);

    setTimeout(() => {
      let result;

      if (incidentType === "Flood") {
        result = {
          type: "Flood",
          severity: "HIGH",
          confidence: 92,
          damage: "Severe",
          affected: 4300,
          recommendation:
            "Deploy rescue personnel and establish an evacuation corridor.",
        };
      } else if (incidentType === "Structural") {
        result = {
          type: "Structural Damage",
          severity: "MEDIUM",
          confidence: 88,
          damage: "Moderate",
          affected: 680,
          recommendation:
            "Deploy structural assessment team and restrict access to damaged buildings.",
        };
      } else if (incidentType === "Infrastructure") {
        result = {
          type: "Infrastructure",
          severity: "MEDIUM",
          confidence: 94,
          damage: "Significant",
          affected: 1200,
          recommendation:
            "Block affected road and activate an alternate emergency route.",
        };
      } else {
        result = {
          type: incidentType,
          severity: "LOW",
          confidence: 84,
          damage: "Moderate",
          affected: 320,
          recommendation:
            "Monitor the situation and prepare additional emergency resources.",
        };
      }

      setAiResult(result);
      setAnalyzing(false);
    }, 1500);
  };

  // CREATE INCIDENT
 const createIncident = async () => {
    if (
      !incidentLocation ||
      !incidentDescription ||
      !imageFile ||
      !aiResult
    ) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const uploadResult = await uploadIncidentImage(imageFile);

      const imageUrl = `http://localhost:5000${uploadResult.image_url}`;

      const data = await createIncidentApi({
        title: `${aiResult.type} — ${incidentLocation}`,
        type: aiResult.type,
        severity: aiResult.severity,
        status: "Active",
        location: incidentLocation,
        description: incidentDescription,
        confidence: aiResult.confidence,
        affected_people: aiResult.affected,
        assigned_unit: "Unassigned",
        image_url: imageUrl,
        ai_damage_level: aiResult.damage,
        ai_recommendation: aiResult.recommendation,
        insights: [
          `${aiResult.type} detected from uploaded evidence`,
          `Estimated damage level: ${aiResult.damage}`,
          `AI confidence: ${aiResult.confidence}%`,
        ],
      });

      const newIncident = {
        id: data.incident.incident_code,
        dbId: data.incident.id,
        title: data.incident.title,
        type: data.incident.type,
        severity: data.incident.severity,
        status: data.incident.status,
        location: data.incident.location,
        latitude: data.incident.latitude,
        longitude: data.incident.longitude,
        confidence: Number(data.incident.confidence || 0),
        affected: data.incident.affected_people || 0,
        time: new Date(data.incident.created_at).toLocaleString(),
        unit: data.incident.assigned_unit || "Unassigned",
        description: data.incident.description || "",
        image: data.incident.image_url || null,
        insights: [
          `${aiResult.type} detected from uploaded evidence`,
          `Estimated damage level: ${aiResult.damage}`,
          `AI confidence: ${aiResult.confidence}%`,
        ],
        recommendation:
          data.incident.ai_recommendation || "No recommendation available.",
      };

      setIncidents((prev) => [newIncident, ...prev]);

      setShowCreate(false);
      setIncidentLocation("");
      setIncidentDescription("");
      setIncidentType("Flood");
      setImagePreview(null);
      setImageFile(null);
      setAiResult(null);
    } catch (error) {
      console.error("Failed to create incident:", error);
      setError(error.message || "Failed to create incident");
    } finally {
      setLoading(false);
    }
  };

  // ACKNOWLEDGE
  const acknowledgeIncident = async (incident) => {
    try {
      const data = await updateIncident(incident.dbId, {
        status: "Investigating",
      });

      setIncidents((prev) =>
        prev.map((item) =>
          item.dbId === incident.dbId
            ? {
                ...item,
                status: data.incident.status,
              }
            : item
        )
      );

      setSelectedIncident((prev) =>
        prev?.dbId === incident.dbId
          ? { ...prev, status: data.incident.status }
          : prev
      );
    } catch (error) {
      console.error("Failed to acknowledge incident:", error);
      setError(error.message || "Failed to acknowledge incident");
    }
  };

  // CLOSE
  const closeIncident = async (incident) => {
    try {
      const data = await updateIncident(incident.dbId, {
        status: "Resolved",
      });

      setIncidents((prev) =>
        prev.map((item) =>
          item.dbId === incident.dbId
            ? {
                ...item,
                status: data.incident.status,
              }
            : item
        )
      );

      setSelectedIncident((prev) =>
        prev?.dbId === incident.dbId
          ? { ...prev, status: data.incident.status }
          : prev
      );
    } catch (error) {
      console.error("Failed to close incident:", error);
      setError(error.message || "Failed to close incident");
    }
  };

  const handleDeleteIncident = async (incident) => {
  try {
    await deleteIncident(incident.dbId);

    setIncidents((prev) =>
      prev.filter((item) => item.dbId !== incident.dbId)
    );

    setSelectedIncident(null);
  } catch (error) {
    console.error("Failed to delete incident:", error);
    setError(error.message || "Failed to delete incident");
  }
};

  const activeCount = incidents.filter(
    (x) => x.status === "Active"
  ).length;

  const highCount = incidents.filter(
    (x) => x.severity === "HIGH"
  ).length;

  const affectedCount = incidents.reduce(
    (sum, x) => sum + x.affected,
    0
  );

  return (
    <div className="min-h-screen bg-[#020b13] text-white">

      {/* BACKGROUND */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/3 top-0 h-96 w-96 rounded-full bg-cyan-500/5 blur-3xl" />

        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-blue-500/5 blur-3xl" />
      </div>


      <main className="relative p-6 lg:p-8">

        {/* HEADER */}
        <div className="mb-7 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">

          <div>
            <p className="text-[10px] tracking-[0.25em] text-cyan-400">
              GEOREASONER / INCIDENT MANAGEMENT
            </p>

            <h1 className="mt-2 text-2xl font-semibold">
              Incident Management
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Monitor, investigate and coordinate active disaster incidents.
            </p>
          </div>


          <div className="flex items-center gap-3">

            <div className="flex items-center gap-2 rounded-lg border border-cyan-400/20 bg-cyan-400/5 px-3 py-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />

              <span className="text-[10px] text-cyan-400">
                LIVE RESPONSE SYSTEM
              </span>
            </div>


            {/* CREATE BUTTON */}
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 rounded-lg bg-cyan-400 px-4 py-2.5 text-xs font-semibold text-black transition hover:bg-cyan-300"
            >
              <Plus size={15} />
              Create Incident
            </button>

          </div>

        </div>


        {/* SUMMARY */}
        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">

          <Glass className="rounded-xl p-4">
            <div className="flex items-center justify-between">
              <p className="text-[9px] text-slate-500">
                ACTIVE INCIDENTS
              </p>

              <AlertTriangle
                size={16}
                className="text-red-400"
              />
            </div>

            <p className="mt-2 text-2xl font-semibold">
              {activeCount}
            </p>

            <p className="mt-1 text-[9px] text-red-400">
              Requires attention
            </p>
          </Glass>


          <Glass className="rounded-xl p-4">
            <div className="flex items-center justify-between">
              <p className="text-[9px] text-slate-500">
                HIGH SEVERITY
              </p>

              <ShieldAlert
                size={16}
                className="text-orange-400"
              />
            </div>

            <p className="mt-2 text-2xl font-semibold">
              {highCount}
            </p>

            <p className="mt-1 text-[9px] text-orange-400">
              Critical monitoring
            </p>
          </Glass>


          <Glass className="rounded-xl p-4">
            <div className="flex items-center justify-between">
              <p className="text-[9px] text-slate-500">
                PEOPLE AFFECTED
              </p>

              <Users
                size={16}
                className="text-cyan-400"
              />
            </div>

            <p className="mt-2 text-2xl font-semibold">
              {affectedCount.toLocaleString()}
            </p>

            <p className="mt-1 text-[9px] text-cyan-400">
              Across monitored incidents
            </p>
          </Glass>


          <Glass className="rounded-xl p-4">
            <div className="flex items-center justify-between">
              <p className="text-[9px] text-slate-500">
                AI ANALYSIS
              </p>

              <BrainCircuit
                size={16}
                className="text-cyan-400"
              />
            </div>

            <p className="mt-2 text-2xl font-semibold text-cyan-400">
              89%
            </p>

            <p className="mt-1 text-[9px] text-slate-500">
              Average confidence
            </p>
          </Glass>

        </div>


        {/* FILTERS */}
        <Glass className="mb-4 rounded-xl p-3">

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">

            <div className="relative flex-1">

              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search incidents, locations or IDs..."
                className="w-full rounded-lg border border-white/10 bg-black/20 py-2.5 pl-9 pr-3 text-xs text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/30"
              />

            </div>


            <div className="flex items-center gap-2">

              <Filter
                size={14}
                className="text-slate-500"
              />

              <select
                value={severityFilter}
                onChange={(e) =>
                  setSeverityFilter(e.target.value)
                }
                className="rounded-lg border border-white/10 bg-[#071522] px-3 py-2.5 text-xs text-slate-300 outline-none"
              >
                <option value="ALL">
                  All Severity
                </option>

                <option value="HIGH">
                  High
                </option>

                <option value="MEDIUM">
                  Medium
                </option>

                <option value="LOW">
                  Low
                </option>
              </select>

            </div>


            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value)
              }
              className="rounded-lg border border-white/10 bg-[#071522] px-3 py-2.5 text-xs text-slate-300 outline-none"
            >
              <option value="ALL">
                All Status
              </option>

              <option value="Active">
                Active
              </option>

              <option value="Investigating">
                Investigating
              </option>

              <option value="Monitoring">
                Monitoring
              </option>

              <option value="Resolved">
                Resolved
              </option>
            </select>

          </div>

        </Glass>

        {loading && incidents.length === 0 && (
          <div className="flex items-center justify-center py-12 text-sm text-cyan-400">
            Loading incidents...
          </div>
        )}
        {/* INCIDENT REGISTRY */}
        <Glass className="overflow-hidden rounded-xl">

          <div className="border-b border-white/10 px-5 py-4">

            <div className="flex items-center justify-between">

              <div>
                <h2 className="text-sm font-semibold">
                  Active Incident Registry
                </h2>

                <p className="mt-1 text-[9px] text-slate-500">
                  {filteredIncidents.length} incidents detected
                </p>
              </div>

              <div className="text-[9px] text-slate-500">
                LAST UPDATED: JUST NOW
              </div>

            </div>

          </div>


          {/* TABLE HEADER */}
          <div className="hidden grid-cols-[100px_1.8fr_1fr_100px_100px_150px_100px] gap-4 border-b border-white/10 bg-white/[0.02] px-5 py-3 text-[9px] tracking-wider text-slate-500 lg:grid">

            <span>ID</span>
            <span>INCIDENT</span>
            <span>LOCATION</span>
            <span>SEVERITY</span>
            <span>STATUS</span>
            <span>ASSIGNED UNIT</span>
            <span>ACTION</span>

          </div>


          {/* ROWS */}
          <div className="divide-y divide-white/5">

            {filteredIncidents.map(
              (incident) => (

                <div
                  key={incident.id}
                  className="grid gap-4 px-5 py-4 transition hover:bg-cyan-400/[0.03] lg:grid-cols-[100px_1.8fr_1fr_100px_100px_150px_100px] lg:items-center"
                >

                  <span className="font-mono text-[10px] text-cyan-400">
                    {incident.id}
                  </span>


                  <div>
                    <p className="text-xs font-medium">
                      {incident.title}
                    </p>

                    <p className="mt-1 text-[9px] text-slate-500">
                      {incident.type} · {incident.time}
                    </p>
                  </div>


                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400">

                    <MapPin
                      size={12}
                      className="text-cyan-400"
                    />

                    {incident.location}

                  </div>


                  <span
                    className={`w-fit rounded-md border px-2 py-1 text-[9px] font-semibold ${severityStyles[incident.severity]}`}
                  >
                    {incident.severity}
                  </span>


                  <div
                    className={`flex items-center gap-1.5 text-[10px] ${statusStyles[incident.status]}`}
                  >

                    <span className="h-1.5 w-1.5 rounded-full bg-current" />

                    {incident.status}

                  </div>


                  <div className="flex items-center gap-2 text-[10px] text-slate-300">

                    <Users
                      size={12}
                      className="text-cyan-400"
                    />

                    {incident.unit}

                  </div>


                  <button
                    onClick={async () => {
                      try {
                        const data = await getIncidentById(incident.dbId);

                        setSelectedIncident({
                          ...incident,
                          insights: data.insights?.map((item) => item.insight) || [],
                          recommendation:
                            data.incident.ai_recommendation ||
                            "No recommendation available.",
                        });
                      } catch (error) {
                        console.error("Failed to load incident details:", error);
                        setError(error.message || "Failed to load incident details");
                      }
                    }}
                    className="flex items-center justify-center gap-1.5 rounded-md border border-cyan-400/20 bg-cyan-400/5 px-3 py-2 text-[9px] text-cyan-400 transition hover:bg-cyan-400/10"
                  >
                    <Eye size={12} />
                    View
                  </button>

                </div>

              )
            )}

          </div>

        </Glass>
        {error && incidents.length === 0 && (
          <div className="flex items-center justify-center py-12 text-sm text-red-400">
            {error}
          </div>
        )}

      </main>


      {/* ================================================= */}
      {/* CREATE INCIDENT MODAL */}
      {/* ================================================= */}

      {showCreate && (

        <div className="fixed inset-0 z-[4000] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">

          <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-cyan-400/20 bg-[#071522] shadow-[0_0_60px_#22d3ee20]">

            {/* HEADER */}
            <div className="flex items-center justify-between border-b border-white/10 p-5">

              <div>
                <p className="text-[9px] tracking-[0.2em] text-cyan-400">
                  GEOREASONER
                </p>

                <h2 className="mt-1 text-lg font-semibold">
                  Create New Incident
                </h2>
              </div>


              <button
                onClick={() =>
                  setShowCreate(false)
                }
                className="text-slate-500 hover:text-white"
              >
                <X size={20} />
              </button>

            </div>


            {/* CONTENT */}
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">

              {/* INCIDENT TYPE */}
              <div>

                <label className="text-[9px] tracking-wider text-slate-500">
                  INCIDENT TYPE
                </label>

                <select
                  value={incidentType}
                  onChange={(e) =>
                    setIncidentType(
                      e.target.value
                    )
                  }
                  className="mt-2 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-3 text-xs text-white outline-none focus:border-cyan-400/30"
                >
                  <option value="Flood">
                    Flood
                  </option>

                  <option value="Structural">
                    Structural Damage
                  </option>

                  <option value="Infrastructure">
                    Infrastructure
                  </option>

                  <option value="Shelter">
                    Shelter
                  </option>
                </select>

              </div>


              {/* LOCATION */}
              <div>

                <label className="text-[9px] tracking-wider text-slate-500">
                  LOCATION
                </label>

                <input
                  value={incidentLocation}
                  onChange={(e) =>
                    setIncidentLocation(
                      e.target.value
                    )
                  }
                  placeholder="e.g. Riverside District"
                  className="mt-2 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-3 text-xs text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/30"
                />

              </div>


              {/* DESCRIPTION */}
              <div>

                <label className="text-[9px] tracking-wider text-slate-500">
                  DESCRIPTION
                </label>

                <textarea
                  value={incidentDescription}
                  onChange={(e) =>
                    setIncidentDescription(
                      e.target.value
                    )
                  }
                  placeholder="Describe the incident..."
                  rows={3}
                  className="mt-2 w-full resize-none rounded-lg border border-white/10 bg-black/20 px-3 py-3 text-xs text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/30"
                />

              </div>


              {/* IMAGE */}
              <div>

                <label className="text-[9px] tracking-wider text-slate-500">
                  EVIDENCE IMAGE
                </label>


                {!imagePreview ? (

                  <label className="mt-2 flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-cyan-400/20 bg-cyan-400/[0.02] p-8 transition hover:bg-cyan-400/[0.05]">

                    <Upload
                      size={28}
                      className="text-cyan-400"
                    />

                    <p className="mt-3 text-xs text-slate-300">
                      Upload disaster image
                    </p>

                    <p className="mt-1 text-[9px] text-slate-600">
                      JPG, PNG or WEBP
                    </p>

                    <input
                      type="file"
                      accept="image/*"
                      onChange={
                        handleImageUpload
                      }
                      className="hidden"
                    />

                  </label>

                ) : (

                  <div className="relative mt-2 overflow-hidden rounded-xl border border-cyan-400/20">

                    <img
                      src={imagePreview}
                      alt="Incident evidence"
                      className="h-56 w-full object-cover"
                    />

                    <button
                      onClick={() => {
                        setImagePreview(null);
                        setImageFile(null);
                        setAiResult(null);
                      }}
                      className="absolute right-3 top-3 rounded-lg bg-black/70 p-2 text-white"
                    >
                      <X size={14} />
                    </button>

                  </div>

                )}

              </div>


              {/* ANALYZE */}
              {imagePreview && !aiResult && (

                <button
                  onClick={analyzeImage}
                  disabled={analyzing}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-cyan-400 py-3 text-xs font-semibold text-black transition hover:bg-cyan-300 disabled:cursor-wait disabled:opacity-60"
                >

                  <BrainCircuit size={16} />

                  {analyzing
                    ? "Analyzing Image..."
                    : "Analyze Image"}

                </button>

              )}


              {/* AI RESULT */}
              {aiResult && (

                <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/[0.04] p-4">

                  <div className="flex items-center gap-2">

                    <BrainCircuit
                      size={18}
                      className="text-cyan-400"
                    />

                    <p className="text-[10px] font-semibold text-cyan-400">
                      AI ANALYSIS RESULT
                    </p>

                  </div>


                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">

                    <div>
                      <p className="text-[8px] text-slate-500">
                        TYPE
                      </p>

                      <p className="mt-1 text-xs font-semibold">
                        {aiResult.type}
                      </p>
                    </div>


                    <div>
                      <p className="text-[8px] text-slate-500">
                        SEVERITY
                      </p>

                      <p className="mt-1 text-xs font-semibold text-red-400">
                        {aiResult.severity}
                      </p>
                    </div>


                    <div>
                      <p className="text-[8px] text-slate-500">
                        CONFIDENCE
                      </p>

                      <p className="mt-1 text-xs font-semibold text-cyan-400">
                        {aiResult.confidence}%
                      </p>
                    </div>


                    <div>
                      <p className="text-[8px] text-slate-500">
                        DAMAGE
                      </p>

                      <p className="mt-1 text-xs font-semibold">
                        {aiResult.damage}
                      </p>
                    </div>

                  </div>


                  <div className="mt-4 rounded-lg border border-white/10 bg-black/20 p-3">

                    <p className="text-[8px] text-slate-500">
                      AI RECOMMENDATION
                    </p>

                    <p className="mt-1 text-[10px] leading-relaxed text-slate-300">
                      {aiResult.recommendation}
                    </p>

                  </div>

                </div>

              )}

            </div>


            {/* FOOTER */}
            <div className="flex justify-end gap-2 border-t border-white/10 p-5">

              <button
                onClick={() =>
                  setShowCreate(false)
                }
                className="rounded-lg border border-white/10 px-4 py-2.5 text-xs text-slate-400 hover:bg-white/5"
              >
                Cancel
              </button>

              {error && (
                <div className="mb-3 rounded-lg border border-red-400/20 bg-red-500/5 px-3 py-2 text-xs text-red-400">
                  {error}
                </div>
              )}

             <button
              onClick={createIncident}
              disabled={
                loading ||
                !imageFile ||
                !aiResult ||
                !incidentLocation ||
                !incidentDescription
              }
              className="rounded-lg bg-cyan-400 px-5 py-2.5 text-xs font-semibold text-black transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-30"
            >
              {loading ? "Creating..." : "Create Incident"}
            </button>

            </div>

          </div>

        </div>

      )}


      {/* ================================================= */}
      {/* INCIDENT DETAILS MODAL */}
      {/* ================================================= */}

      {selectedIncident && (

        <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">

          <div className="flex h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-cyan-400/20 bg-[#071522] shadow-[0_0_60px_#22d3ee15]">

            {/* HEADER */}
            <div className="flex items-start justify-between border-b border-white/10 p-5">

              <div>

                <p className="text-[9px] tracking-[0.2em] text-cyan-400">
                  INCIDENT DETAILS
                </p>

                <h2 className="mt-1 text-lg font-semibold">
                  {selectedIncident.title}
                </h2>

                <p className="mt-1 font-mono text-[9px] text-slate-500">
                  {selectedIncident.id}
                </p>

              </div>


              <button
                onClick={() =>
                  setSelectedIncident(null)
                }
                className="rounded-lg p-2 text-slate-500 hover:bg-white/5 hover:text-white"
              >
                <X size={18} />
              </button>

            </div>


            {/* SCROLLABLE DETAILS */}
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5 scrollbar-thin scrollbar-thumb-cyan-400/30 scrollbar-track-transparent">

              {/* IMAGE */}
              {selectedIncident.image && (

                <div className="overflow-hidden rounded-xl border border-red-400/20">

                  <img
                    src={selectedIncident.image}
                    alt={selectedIncident.title}
                    className="h-52 w-full object-cover"
                  />

                </div>

              )}


              {/* STATUS */}
              <div className="flex flex-wrap gap-2">

                <span
                  className={`rounded-md border px-3 py-1.5 text-[9px] font-semibold ${severityStyles[selectedIncident.severity]}`}
                >
                  {selectedIncident.severity} SEVERITY
                </span>

                <span
                  className={`rounded-md border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[9px] ${statusStyles[selectedIncident.status]}`}
                >
                  ● {selectedIncident.status}
                </span>

              </div>


              {/* DESCRIPTION */}
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">

                <p className="text-[9px] tracking-wider text-cyan-400">
                  DESCRIPTION
                </p>

                <p className="mt-2 text-xs leading-relaxed text-slate-300">
                  {selectedIncident.description}
                </p>

              </div>


              {/* METRICS */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">

                <div className="rounded-lg border border-white/10 p-3">
                  <p className="text-[8px] text-slate-500">
                    AI CONFIDENCE
                  </p>

                  <p className="mt-1 text-lg font-semibold text-cyan-400">
                    {selectedIncident.confidence}%
                  </p>
                </div>


                <div className="rounded-lg border border-white/10 p-3">
                  <p className="text-[8px] text-slate-500">
                    PEOPLE AFFECTED
                  </p>

                  <p className="mt-1 text-lg font-semibold">
                    {selectedIncident.affected.toLocaleString()}
                  </p>
                </div>


                <div className="rounded-lg border border-white/10 p-3">
                  <p className="text-[8px] text-slate-500">
                    LOCATION
                  </p>

                  <p className="mt-1 text-xs font-semibold">
                    {selectedIncident.location}
                  </p>
                </div>


                <div className="rounded-lg border border-white/10 p-3">
                  <p className="text-[8px] text-slate-500">
                    ASSIGNED
                  </p>

                  <p className="mt-1 text-xs font-semibold">
                    {selectedIncident.unit}
                  </p>
                </div>

              </div>


              {/* AI ANALYSIS */}
              <div className="rounded-xl border border-cyan-400/15 bg-cyan-400/[0.03] p-4">

                <div className="flex items-center gap-2">

                  <BrainCircuit
                    size={16}
                    className="text-cyan-400"
                  />

                  <p className="text-[9px] tracking-wider text-cyan-400">
                    AI ANALYSIS
                  </p>

                </div>


                <div className="mt-3 space-y-2">

                  {selectedIncident.insights.map(
                    (insight) => (

                      <p
                        key={insight}
                        className="flex gap-2 text-[10px] text-slate-300"
                      >

                        <ShieldAlert
                          size={13}
                          className="shrink-0 text-red-400"
                        />

                        {insight}

                      </p>

                    )
                  )}

                </div>

              </div>


              {/* RECOMMENDATION */}
              <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/5 p-4">

                <p className="text-[9px] tracking-wider text-cyan-400">
                  RECOMMENDED ACTION
                </p>

                <p className="mt-2 text-xs text-slate-300">
                  {selectedIncident.recommendation}
                </p>

              </div>


              {/* TIMELINE */}
              <div>

                <p className="mb-3 text-[9px] tracking-wider text-cyan-400">
                  INCIDENT TIMELINE
                </p>


                <div className="space-y-3">

                  <div className="flex gap-3">

                    <Clock
                      size={14}
                      className="mt-0.5 text-cyan-400"
                    />

                    <div>
                      <p className="text-[10px]">
                        Incident detected
                      </p>

                      <p className="text-[9px] text-slate-500">
                        AI monitoring system
                      </p>
                    </div>

                  </div>


                  <div className="flex gap-3">

                    <Users
                      size={14}
                      className="mt-0.5 text-cyan-400"
                    />

                    <div>

                      <p className="text-[10px]">
                        {selectedIncident.unit} assigned
                      </p>

                      <p className="text-[9px] text-slate-500">
                        Response coordination
                      </p>

                    </div>

                  </div>

                </div>

              </div>

            </div>


            {/* ACTIONS */}
            <div className="flex flex-col gap-2 border-t border-white/10 p-5 sm:flex-row sm:justify-end">

              {selectedIncident.status !==
                "Resolved" && (
                <>
                  <button
                    onClick={() =>
                      acknowledgeIncident(
                        selectedIncident
                      )
                    }
                    className="flex items-center justify-center gap-2 rounded-lg border border-cyan-400/20 bg-cyan-400/5 px-4 py-2 text-[10px] text-cyan-400 hover:bg-cyan-400/10"
                  >
                    <CheckCircle2
                      size={14}
                    />
                    Acknowledge
                  </button>
                  
                  <button
                    onClick={() => {
                      if (
                        window.confirm(
                          "Are you sure you want to delete this incident?"
                        )
                      ) {
                        handleDeleteIncident(selectedIncident);
                      }
                    }}
                    className="flex items-center justify-center gap-2 rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-2 text-[10px] text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 size={14} />
                    Delete
                </button>

                  <button
                    onClick={() =>
                      closeIncident(
                        selectedIncident
                      )
                    }
                    className="flex items-center justify-center gap-2 rounded-lg border border-red-400/20 bg-red-500/5 px-4 py-2 text-[10px] text-red-400 hover:bg-red-500/10"
                  >
                    <XCircle size={14} />
                    Close Incident
                  </button>
                </>
              )}

            </div>

          </div>

        </div>

      )}

    </div>
  );
}
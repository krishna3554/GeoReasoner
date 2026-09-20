import { useMemo, useState } from "react";
import {
  BrainCircuit,
  Building2,
  Camera,
  ChevronDown,
  FileWarning,
  MapPin,
  Search,
  ShieldAlert,
  TrendingUp,
  X,
  Users,
} from "lucide-react";

const damageData = [
  {
    id: "DMG-001",
    title: "Riverside Residential Block",
    location: "Riverside District",
    type: "Flood Damage",
    severity: "SEVERE",
    confidence: 94,
    buildings: 28,
    affected: 860,
    structural: "Moderate",
    status: "Requires Action",
    image: "/images/flood-incident.jpg",
    description:
      "Floodwater has entered multiple residential structures. Ground-floor areas show significant water exposure.",
    insights: [
      "28 buildings identified within the affected zone",
      "Ground-floor flooding detected",
      "Emergency evacuation recommended",
      "Structural inspection required after water recedes",
    ],
    recommendation:
      "Prioritize evacuation and deploy assessment teams to the Riverside residential block.",
  },
  {
    id: "DMG-002",
    title: "Eastwood Commercial Zone",
    location: "Eastwood Area",
    type: "Structural Damage",
    severity: "HIGH",
    confidence: 89,
    buildings: 17,
    affected: 430,
    structural: "High",
    status: "Under Assessment",
    image: "/images/building-damage.jpg",
    description:
      "Multiple commercial buildings show visible structural damage requiring detailed inspection.",
    insights: [
      "Visible wall and facade damage detected",
      "Potential structural instability",
      "Access should be restricted",
      "Engineering inspection recommended",
    ],
    recommendation:
      "Deploy structural assessment personnel and establish a restricted safety perimeter.",
  },
  {
    id: "DMG-003",
    title: "Bridge A Infrastructure",
    location: "Bridge A",
    type: "Infrastructure Damage",
    severity: "HIGH",
    confidence: 96,
    buildings: 0,
    affected: 1200,
    structural: "Critical",
    status: "Restricted",
    image: "/images/road-blocked.jpg",
    description:
      "Emergency road access is restricted due to infrastructure damage around Bridge A.",
    insights: [
      "Vehicle access currently restricted",
      "Infrastructure damage detected",
      "Emergency route affected",
      "Alternate route required",
    ],
    recommendation:
      "Maintain road restriction and redirect emergency vehicles through an alternate route.",
  },
  {
    id: "DMG-004",
    title: "Northfield Shelter",
    location: "Northfield School",
    type: "Facility Damage",
    severity: "LOW",
    confidence: 83,
    buildings: 1,
    affected: 320,
    structural: "Low",
    status: "Monitoring",
    image: "/images/shelter.jpg",
    description:
      "Minor facility damage detected while the location continues to operate as an emergency shelter.",
    insights: [
      "Minor facility damage detected",
      "Shelter remains operational",
      "Capacity should be monitored",
      "Additional resources may be required",
    ],
    recommendation:
      "Continue monitoring the facility and prepare a backup shelter if capacity increases.",
  },
];

const severityStyles = {
  SEVERE:
    "border-red-400/20 bg-red-500/10 text-red-400",
  HIGH:
    "border-orange-400/20 bg-orange-500/10 text-orange-400",
  MEDIUM:
    "border-yellow-400/20 bg-yellow-500/10 text-yellow-400",
  LOW:
    "border-cyan-400/20 bg-cyan-400/10 text-cyan-400",
};

const statusStyles = {
  "Requires Action": "text-red-400",
  "Under Assessment": "text-amber-400",
  Restricted: "text-orange-400",
  Monitoring: "text-cyan-400",
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

export default function DamageAnalysis() {
  const [records, setRecords] = useState(damageData);
  const [selectedDamage, setSelectedDamage] =
    useState(null);

  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState("ALL");
  const [type, setType] = useState("ALL");

  const filteredRecords = useMemo(() => {
    return records.filter((item) => {
      const matchesSearch =
        item.title
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        item.location
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        item.id
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesSeverity =
        severity === "ALL" ||
        item.severity === severity;

      const matchesType =
        type === "ALL" ||
        item.type === type;

      return (
        matchesSearch &&
        matchesSeverity &&
        matchesType
      );
    });
  }, [records, search, severity, type]);

  const totalBuildings = records.reduce(
    (sum, item) => sum + item.buildings,
    0
  );

  const totalAffected = records.reduce(
    (sum, item) => sum + item.affected,
    0
  );

  const severeCount = records.filter(
    (item) =>
      item.severity === "SEVERE" ||
      item.severity === "HIGH"
  ).length;

  const averageConfidence = Math.round(
    records.reduce(
      (sum, item) => sum + item.confidence,
      0
    ) / records.length
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
              GEOREASONER / DAMAGE INTELLIGENCE
            </p>

            <h1 className="mt-2 text-2xl font-semibold">
              Damage Analysis
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              AI-assisted assessment of disaster damage and affected infrastructure.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-cyan-400/20 bg-cyan-400/5 px-3 py-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />

            <span className="text-[10px] text-cyan-400">
              AI ANALYSIS ENGINE ONLINE
            </span>
          </div>

        </div>


        {/* SUMMARY */}
        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">

          <Glass className="rounded-xl p-4">

            <div className="flex items-center justify-between">
              <p className="text-[9px] text-slate-500">
                BUILDINGS ANALYZED
              </p>

              <Building2
                size={16}
                className="text-cyan-400"
              />
            </div>

            <p className="mt-2 text-2xl font-semibold">
              {totalBuildings}
            </p>

            <p className="mt-1 text-[9px] text-slate-500">
              Across affected zones
            </p>

          </Glass>


          <Glass className="rounded-xl p-4">

            <div className="flex items-center justify-between">
              <p className="text-[9px] text-slate-500">
                HIGH IMPACT AREAS
              </p>

              <ShieldAlert
                size={16}
                className="text-red-400"
              />
            </div>

            <p className="mt-2 text-2xl font-semibold">
              {severeCount}
            </p>

            <p className="mt-1 text-[9px] text-red-400">
              Requires immediate review
            </p>

          </Glass>


          <Glass className="rounded-xl p-4">

            <div className="flex items-center justify-between">
              <p className="text-[9px] text-slate-500">
                PEOPLE AFFECTED
              </p>

              <TrendingUp
                size={16}
                className="text-orange-400"
              />
            </div>

            <p className="mt-2 text-2xl font-semibold">
              {totalAffected.toLocaleString()}
            </p>

            <p className="mt-1 text-[9px] text-orange-400">
              Estimated impact
            </p>

          </Glass>


          <Glass className="rounded-xl p-4">

            <div className="flex items-center justify-between">
              <p className="text-[9px] text-slate-500">
                AI CONFIDENCE
              </p>

              <BrainCircuit
                size={16}
                className="text-cyan-400"
              />
            </div>

            <p className="mt-2 text-2xl font-semibold text-cyan-400">
              {averageConfidence}%
            </p>

            <p className="mt-1 text-[9px] text-slate-500">
              Average detection confidence
            </p>

          </Glass>

        </div>


        {/* FILTERS */}
        <Glass className="mb-4 rounded-xl p-3">

          <div className="flex flex-col gap-3 lg:flex-row">

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
                placeholder="Search damage records or locations..."
                className="w-full rounded-lg border border-white/10 bg-black/20 py-2.5 pl-9 pr-3 text-xs text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/30"
              />

            </div>


            <select
              value={severity}
              onChange={(e) =>
                setSeverity(e.target.value)
              }
              className="rounded-lg border border-white/10 bg-[#071522] px-3 py-2.5 text-xs text-slate-300 outline-none"
            >
              <option value="ALL">
                All Severity
              </option>

              <option value="SEVERE">
                Severe
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


            <select
              value={type}
              onChange={(e) =>
                setType(e.target.value)
              }
              className="rounded-lg border border-white/10 bg-[#071522] px-3 py-2.5 text-xs text-slate-300 outline-none"
            >
              <option value="ALL">
                All Damage Types
              </option>

              <option value="Flood Damage">
                Flood Damage
              </option>

              <option value="Structural Damage">
                Structural Damage
              </option>

              <option value="Infrastructure Damage">
                Infrastructure Damage
              </option>

              <option value="Facility Damage">
                Facility Damage
              </option>
            </select>

          </div>

        </Glass>


        {/* DAMAGE GRID */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">

          {filteredRecords.map((item) => (

            <Glass
              key={item.id}
              className="overflow-hidden rounded-xl transition hover:border-cyan-400/30"
            >

              {/* IMAGE */}
              <div className="relative h-44 overflow-hidden">

                <img
                  src={item.image}
                  alt={item.title}
                  className="h-full w-full object-cover transition duration-500 hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#071522] via-transparent to-transparent" />


                <div className="absolute left-3 top-3">

                  <span
                    className={`rounded-md border px-2 py-1 text-[9px] font-semibold ${severityStyles[item.severity]}`}
                  >
                    {item.severity}
                  </span>

                </div>


                <div className="absolute bottom-3 left-3 right-3">

                  <p className="text-[9px] text-slate-400">
                    {item.id}
                  </p>

                  <h2 className="mt-1 text-sm font-semibold">
                    {item.title}
                  </h2>

                </div>

              </div>


              {/* CARD CONTENT */}
              <div className="p-4">

                <div className="flex items-center gap-1.5 text-[9px] text-slate-500">

                  <MapPin
                    size={12}
                    className="text-cyan-400"
                  />

                  {item.location}

                </div>


                <div className="mt-4 grid grid-cols-3 gap-2">

                  <div className="rounded-lg border border-white/10 bg-white/[0.02] p-2">

                    <p className="text-[8px] text-slate-500">
                      BUILDINGS
                    </p>

                    <p className="mt-1 text-sm font-semibold">
                      {item.buildings}
                    </p>

                  </div>


                  <div className="rounded-lg border border-white/10 bg-white/[0.02] p-2">

                    <p className="text-[8px] text-slate-500">
                      AFFECTED
                    </p>

                    <p className="mt-1 text-sm font-semibold">
                      {item.affected.toLocaleString()}
                    </p>

                  </div>


                  <div className="rounded-lg border border-white/10 bg-white/[0.02] p-2">

                    <p className="text-[8px] text-slate-500">
                      AI
                    </p>

                    <p className="mt-1 text-sm font-semibold text-cyan-400">
                      {item.confidence}%
                    </p>

                  </div>

                </div>


                <div className="mt-4 flex items-center justify-between">

                  <div>

                    <p className="text-[8px] text-slate-500">
                      STATUS
                    </p>

                    <p
                      className={`mt-1 text-[9px] font-medium ${statusStyles[item.status]}`}
                    >
                      ● {item.status}
                    </p>

                  </div>


                  <button
                    onClick={() =>
                      setSelectedDamage(item)
                    }
                    className="flex items-center gap-1.5 rounded-lg border border-cyan-400/20 bg-cyan-400/5 px-3 py-2 text-[9px] text-cyan-400 transition hover:bg-cyan-400/10"
                  >
                    View Analysis
                    <ChevronDown size={12} />
                  </button>

                </div>

              </div>

            </Glass>

          ))}

        </div>


        {filteredRecords.length === 0 && (

          <Glass className="mt-4 rounded-xl p-12 text-center">

            <FileWarning
              size={28}
              className="mx-auto text-slate-600"
            />

            <p className="mt-3 text-sm text-slate-400">
              No damage records found
            </p>

          </Glass>

        )}

      </main>


      {/* ================================================= */}
      {/* DAMAGE DETAILS MODAL */}
      {/* ================================================= */}

      {selectedDamage && (

        <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">

          <div className="flex h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-cyan-400/20 bg-[#071522] shadow-[0_0_60px_#22d3ee18]">

            {/* HEADER */}
            <div className="flex shrink-0 items-center justify-between border-b border-white/10 p-5">

              <div>

                <p className="text-[9px] tracking-[0.2em] text-cyan-400">
                  AI DAMAGE ASSESSMENT
                </p>

                <h2 className="mt-1 text-lg font-semibold">
                  {selectedDamage.title}
                </h2>

                <p className="mt-1 font-mono text-[9px] text-slate-500">
                  {selectedDamage.id}
                </p>

              </div>


              <button
                onClick={() =>
                  setSelectedDamage(null)
                }
                className="rounded-lg p-2 text-slate-500 hover:bg-white/5 hover:text-white"
              >
                <X size={18} />
              </button>

            </div>


            {/* SCROLLABLE CONTENT */}
            <div className="min-h-0 flex-1 overflow-y-auto p-5 scrollbar-thin scrollbar-thumb-cyan-400/30 scrollbar-track-transparent">

              <div className="space-y-5">

                {/* IMAGE */}
                <div className="relative overflow-hidden rounded-xl border border-white/10">

                  <img
                    src={selectedDamage.image}
                    alt={selectedDamage.title}
                    className="h-64 w-full object-cover"
                  />

                  <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-lg border border-white/10 bg-black/70 px-3 py-2 backdrop-blur-xl">

                    <Camera
                      size={13}
                      className="text-cyan-400"
                    />

                    <span className="text-[9px] text-slate-300">
                      Evidence Image
                    </span>

                  </div>

                </div>


                {/* BASIC INFO */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">

                  <div className="rounded-lg border border-white/10 p-3">

                    <p className="text-[8px] text-slate-500">
                      DAMAGE TYPE
                    </p>

                    <p className="mt-1 text-xs font-semibold">
                      {selectedDamage.type}
                    </p>

                  </div>


                  <div className="rounded-lg border border-white/10 p-3">

                    <p className="text-[8px] text-slate-500">
                      SEVERITY
                    </p>

                    <p
                      className={`mt-1 text-xs font-semibold ${
                        selectedDamage.severity ===
                          "SEVERE" ||
                        selectedDamage.severity ===
                          "HIGH"
                          ? "text-red-400"
                          : "text-cyan-400"
                      }`}
                    >
                      {selectedDamage.severity}
                    </p>

                  </div>


                  <div className="rounded-lg border border-white/10 p-3">

                    <p className="text-[8px] text-slate-500">
                      AI CONFIDENCE
                    </p>

                    <p className="mt-1 text-xs font-semibold text-cyan-400">
                      {selectedDamage.confidence}%
                    </p>

                  </div>


                  <div className="rounded-lg border border-white/10 p-3">

                    <p className="text-[8px] text-slate-500">
                      STRUCTURAL RISK
                    </p>

                    <p className="mt-1 text-xs font-semibold">
                      {selectedDamage.structural}
                    </p>

                  </div>

                </div>


                {/* DESCRIPTION */}
                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">

                  <p className="text-[9px] tracking-wider text-cyan-400">
                    ASSESSMENT SUMMARY
                  </p>

                  <p className="mt-2 text-xs leading-relaxed text-slate-300">
                    {selectedDamage.description}
                  </p>

                </div>


                {/* DAMAGE STATISTICS */}
                <div>

                  <p className="mb-3 text-[9px] tracking-wider text-cyan-400">
                    DAMAGE STATISTICS
                  </p>

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">

                    <div className="rounded-xl border border-red-400/15 bg-red-500/5 p-4">

                      <Building2
                        size={17}
                        className="text-red-400"
                      />

                      <p className="mt-3 text-[9px] text-slate-500">
                        BUILDINGS AFFECTED
                      </p>

                      <p className="mt-1 text-xl font-semibold">
                        {selectedDamage.buildings}
                      </p>

                    </div>


                    <div className="rounded-xl border border-orange-400/15 bg-orange-500/5 p-4">

                      <UsersIcon />

                      <p className="mt-3 text-[9px] text-slate-500">
                        PEOPLE AFFECTED
                      </p>

                      <p className="mt-1 text-xl font-semibold">
                        {selectedDamage.affected.toLocaleString()}
                      </p>

                    </div>


                    <div className="rounded-xl border border-cyan-400/15 bg-cyan-400/5 p-4">

                      <BrainCircuit
                        size={17}
                        className="text-cyan-400"
                      />

                      <p className="mt-3 text-[9px] text-slate-500">
                        AI CONFIDENCE
                      </p>

                      <p className="mt-1 text-xl font-semibold text-cyan-400">
                        {selectedDamage.confidence}%
                      </p>

                    </div>

                  </div>

                </div>


                {/* AI INSIGHTS */}
                <div className="rounded-xl border border-cyan-400/15 bg-cyan-400/[0.03] p-4">

                  <div className="flex items-center gap-2">

                    <BrainCircuit
                      size={16}
                      className="text-cyan-400"
                    />

                    <p className="text-[9px] tracking-wider text-cyan-400">
                      AI DETECTED INDICATORS
                    </p>

                  </div>


                  <div className="mt-3 space-y-2">

                    {selectedDamage.insights.map(
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
                    AI RECOMMENDATION
                  </p>

                  <p className="mt-2 text-xs leading-relaxed text-slate-300">
                    {selectedDamage.recommendation}
                  </p>

                </div>


                {/* LOCATION */}
                <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.02] p-3">

                  <MapPin
                    size={15}
                    className="text-cyan-400"
                  />

                  <div>

                    <p className="text-[8px] text-slate-500">
                      AFFECTED LOCATION
                    </p>

                    <p className="mt-1 text-xs">
                      {selectedDamage.location}
                    </p>

                  </div>

                </div>

              </div>

            </div>


            {/* FOOTER */}
            <div className="flex shrink-0 items-center justify-between border-t border-white/10 p-5">

              <p className="text-[8px] text-amber-400">
                ⚠ AI assessment requires human verification
              </p>

              <button
                onClick={() =>
                  setSelectedDamage(null)
                }
                className="rounded-lg bg-cyan-400 px-4 py-2 text-[10px] font-semibold text-black hover:bg-cyan-300"
              >
                Close
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

function UsersIcon() {
  return (
    <Users
      size={17}
      className="text-orange-400"
    />
  );
}
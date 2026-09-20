import { useMemo, useState } from "react";
import {
  BrainCircuit,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Download,
  Eye,
  FileText,
  Filter,
  MapPin,
  Search,
  ShieldAlert,
  X,
} from "lucide-react";

function Glass({ children, className = "" }) {
  return (
    <div
      className={`border border-cyan-400/15 bg-[#071522]/75 backdrop-blur-xl ${className}`}
    >
      {children}
    </div>
  );
}

const reportsData = [
  {
    id: "RPT-001",
    title: "Riverside Flood Response Report",
    type: "Incident Report",
    incident: "Flood Risk — Riverside",
    location: "Riverside District",
    severity: "HIGH",
    status: "Generated",
    confidence: 91,
    affected: 4300,
    generated: "8 min ago",
    author: "AI Analysis Engine",
    summary:
      "Severe flooding detected across low-lying residential areas. Multiple roads are affected and emergency evacuation is recommended.",
    findings: [
      "Severe flooding detected in low-lying areas",
      "Multiple road blockages affecting evacuation",
      "Approximately 4,300 people potentially affected",
      "Rescue Unit 03 recommended for deployment",
    ],
    recommendation:
      "Deploy Rescue Unit 03 via Route B and establish an evacuation corridor.",
  },
  {
    id: "RPT-002",
    title: "Eastwood Structural Assessment",
    type: "Damage Assessment",
    incident: "Building Damage — Eastwood",
    location: "Eastwood Area",
    severity: "MEDIUM",
    status: "Generated",
    confidence: 87,
    affected: 680,
    generated: "21 min ago",
    author: "AI Damage Analysis",
    summary:
      "Multiple buildings show visible structural damage following the disaster event. Detailed engineering inspection is recommended.",
    findings: [
      "Visible structural damage detected",
      "Several buildings require inspection",
      "Potential secondary collapse risk",
      "Access restrictions recommended",
    ],
    recommendation:
      "Deploy structural assessment personnel and establish a restricted safety perimeter.",
  },
  {
    id: "RPT-003",
    title: "Bridge A Infrastructure Report",
    type: "Infrastructure Report",
    incident: "Road Blocked — Bridge A",
    location: "Bridge A",
    severity: "MEDIUM",
    status: "Generated",
    confidence: 94,
    affected: 1200,
    generated: "34 min ago",
    author: "AI Analysis Engine",
    summary:
      "Bridge A is currently restricted due to infrastructure damage. Emergency vehicle movement may be affected.",
    findings: [
      "Emergency access currently restricted",
      "Infrastructure damage detected",
      "Primary emergency route affected",
      "Alternate route required",
    ],
    recommendation:
      "Maintain road restriction and redirect emergency vehicles through an alternate route.",
  },
  {
    id: "RPT-004",
    title: "Northfield Shelter Capacity Report",
    type: "Resource Report",
    incident: "Shelter Capacity Alert",
    location: "Northfield School",
    severity: "LOW",
    status: "Draft",
    confidence: 82,
    affected: 320,
    generated: "48 min ago",
    author: "Resource Monitoring",
    summary:
      "Shelter occupancy is approaching the recommended capacity threshold while the facility remains operational.",
    findings: [
      "Shelter occupancy increasing",
      "Additional supplies may be required",
      "Nearby shelter capacity available",
      "Backup shelter preparation recommended",
    ],
    recommendation:
      "Prepare a secondary shelter and continue monitoring occupancy levels.",
  },
];

function severityClass(severity) {
  if (severity === "HIGH") {
    return "border-red-400/20 bg-red-500/10 text-red-400";
  }

  if (severity === "MEDIUM") {
    return "border-orange-400/20 bg-orange-500/10 text-orange-400";
  }

  return "border-cyan-400/20 bg-cyan-500/10 text-cyan-400";
}

function statusClass(status) {
  if (status === "Generated") {
    return "text-emerald-400";
  }

  return "text-orange-400";
}

export default function Reports() {
  const [reports, setReports] = useState(reportsData);
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("All Severity");
  const [typeFilter, setTypeFilter] = useState("All Report Types");
  const [selectedReport, setSelectedReport] = useState(null);
  const [showGenerate, setShowGenerate] = useState(false);

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const matchesSearch =
        report.title.toLowerCase().includes(search.toLowerCase()) ||
        report.incident.toLowerCase().includes(search.toLowerCase()) ||
        report.location.toLowerCase().includes(search.toLowerCase());

      const matchesSeverity =
        severityFilter === "All Severity" ||
        report.severity === severityFilter;

      const matchesType =
        typeFilter === "All Report Types" ||
        report.type === typeFilter;

      return matchesSearch && matchesSeverity && matchesType;
    });
  }, [reports, search, severityFilter, typeFilter]);

  const generatedCount = reports.filter(
    (report) => report.status === "Generated"
  ).length;

  const highPriorityCount = reports.filter(
    (report) => report.severity === "HIGH"
  ).length;

  const totalAffected = reports.reduce(
    (sum, report) => sum + report.affected,
    0
  );

  const averageConfidence = Math.round(
    reports.reduce((sum, report) => sum + report.confidence, 0) /
      reports.length
  );

  const generateReport = () => {
    const newReport = {
      id: `RPT-${String(reports.length + 1).padStart(3, "0")}`,
      title: "New Disaster Situation Report",
      type: "Situation Report",
      incident: "Current Disaster Situation",
      location: "Operational Zone",
      severity: "MEDIUM",
      status: "Generated",
      confidence: 89,
      affected: 540,
      generated: "Just now",
      author: "AI Analysis Engine",
      summary:
        "Automated situation report generated from current disaster intelligence and incident data.",
      findings: [
        "Current incidents analyzed",
        "Affected areas reviewed",
        "Emergency resources evaluated",
        "Response recommendations generated",
      ],
      recommendation:
        "Review the generated findings and confirm recommended response actions.",
    };

    setReports((prev) => [newReport, ...prev]);
    setShowGenerate(false);
    setSelectedReport(newReport);
  };

  const downloadReport = (report) => {
    const content = `
GeoReasoner — Disaster Response Report

Report ID: ${report.id}
Title: ${report.title}
Type: ${report.type}
Incident: ${report.incident}
Location: ${report.location}
Severity: ${report.severity}
AI Confidence: ${report.confidence}%
People Affected: ${report.affected}
Status: ${report.status}
Generated: ${report.generated}

SUMMARY
${report.summary}

KEY FINDINGS
${report.findings.map((item, index) => `${index + 1}. ${item}`).join("\n")}

RECOMMENDED ACTION
${report.recommendation}

Generated by GeoReasoner AI Analysis Engine.
Human verification is required before operational decisions.
`;

    const blob = new Blob([content], {
      type: "text/plain",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `${report.id}-report.txt`;
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#020b13] text-slate-100">
      {/* PAGE */}
      <main className="p-7">
        {/* HEADER */}
        <div className="mb-7 flex items-start justify-between">
          <div>
            <div className="mb-2 text-[11px] font-semibold tracking-[0.28em] text-cyan-400">
              GEOREASONER / REPORT INTELLIGENCE
            </div>

            <h1 className="text-3xl font-semibold tracking-tight">
              Reports
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Generate, review and manage disaster response intelligence
              reports.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-400/5 px-4 py-2.5">
            <div className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_12px_#22d3ee]" />
            <span className="text-xs text-cyan-300">
              REPORT ENGINE ONLINE
            </span>
          </div>
        </div>

        {/* SUMMARY CARDS */}
        <div className="mb-6 grid grid-cols-4 gap-4">
          <Glass className="rounded-xl p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wide text-slate-500">
                Reports Generated
              </span>

              <FileText size={18} className="text-cyan-400" />
            </div>

            <div className="text-3xl font-semibold">
              {generatedCount}
            </div>

            <div className="mt-1 text-xs text-slate-500">
              Active intelligence reports
            </div>
          </Glass>

          <Glass className="rounded-xl p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wide text-slate-500">
                High Priority
              </span>

              <ShieldAlert size={18} className="text-red-400" />
            </div>

            <div className="text-3xl font-semibold">
              {highPriorityCount}
            </div>

            <div className="mt-1 text-xs text-red-400">
              Requires immediate review
            </div>
          </Glass>

          <Glass className="rounded-xl p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wide text-slate-500">
                People Affected
              </span>

              <MapPin size={18} className="text-orange-400" />
            </div>

            <div className="text-3xl font-semibold">
              {totalAffected.toLocaleString()}
            </div>

            <div className="mt-1 text-xs text-orange-400">
              Estimated impact
            </div>
          </Glass>

          <Glass className="rounded-xl p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wide text-slate-500">
                AI Confidence
              </span>

              <BrainCircuit size={18} className="text-cyan-400" />
            </div>

            <div className="text-3xl font-semibold text-cyan-400">
              {averageConfidence}%
            </div>

            <div className="mt-1 text-xs text-slate-500">
              Average report confidence
            </div>
          </Glass>
        </div>

        {/* TOOLBAR */}
        <Glass className="mb-5 rounded-xl p-3">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search reports, incidents or locations..."
                className="h-11 w-full rounded-lg border border-slate-700/60 bg-[#06131f] pl-11 pr-4 text-sm text-slate-200 outline-none transition focus:border-cyan-400/40"
              />
            </div>

            <div className="flex h-11 items-center gap-2 rounded-lg border border-slate-700/60 bg-[#06131f] px-3">
              <Filter size={16} className="text-slate-500" />

              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="bg-transparent text-sm text-slate-300 outline-none"
              >
                <option>All Severity</option>
                <option>HIGH</option>
                <option>MEDIUM</option>
                <option>LOW</option>
              </select>
            </div>

            <div className="flex h-11 items-center rounded-lg border border-slate-700/60 bg-[#06131f] px-3">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-transparent text-sm text-slate-300 outline-none"
              >
                <option>All Report Types</option>
                <option>Incident Report</option>
                <option>Damage Assessment</option>
                <option>Infrastructure Report</option>
                <option>Resource Report</option>
                <option>Situation Report</option>
              </select>
            </div>

            <button
              onClick={() => setShowGenerate(true)}
              className="flex h-11 items-center gap-2 rounded-lg bg-cyan-400 px-4 text-sm font-semibold text-[#021018] transition hover:bg-cyan-300"
            >
              <FileText size={17} />
              Generate Report
            </button>
          </div>
        </Glass>

        {/* REPORT TABLE */}
        <Glass className="overflow-hidden rounded-xl">
          <div className="border-b border-cyan-400/10 px-5 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold">Report Registry</h2>
                <p className="mt-1 text-xs text-slate-500">
                  {filteredReports.length} reports available
                </p>
              </div>

              <div className="text-xs text-slate-500">
                AI-assisted intelligence
              </div>
            </div>
          </div>

          <div className="divide-y divide-cyan-400/10">
            {filteredReports.map((report) => (
              <div
                key={report.id}
                className="group flex items-center gap-5 px-5 py-4 transition hover:bg-cyan-400/[0.025]"
              >
                {/* ICON */}
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-cyan-400/15 bg-cyan-400/5">
                  <FileText size={19} className="text-cyan-400" />
                </div>

                {/* MAIN */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="truncate text-sm font-semibold">
                      {report.title}
                    </h3>

                    <span
                      className={`rounded-md border px-2 py-0.5 text-[9px] font-semibold ${severityClass(
                        report.severity
                      )}`}
                    >
                      {report.severity}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
                    <span>{report.id}</span>

                    <span className="flex items-center gap-1">
                      <MapPin size={13} />
                      {report.location}
                    </span>

                    <span>{report.type}</span>
                  </div>
                </div>

                {/* CONFIDENCE */}
                <div className="w-24 shrink-0">
                  <div className="mb-1 text-[9px] uppercase text-slate-600">
                    AI Confidence
                  </div>

                  <div className="text-sm font-semibold text-cyan-400">
                    {report.confidence}%
                  </div>

                  <div className="mt-1 h-1 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-cyan-400"
                      style={{ width: `${report.confidence}%` }}
                    />
                  </div>
                </div>

                {/* STATUS */}
                <div className="w-24 shrink-0">
                  <div className="mb-1 text-[9px] uppercase text-slate-600">
                    Status
                  </div>

                  <div
                    className={`flex items-center gap-1.5 text-xs ${statusClass(
                      report.status
                    )}`}
                  >
                    {report.status === "Generated" ? (
                      <CheckCircle2 size={13} />
                    ) : (
                      <Clock3 size={13} />
                    )}

                    {report.status}
                  </div>
                </div>

                {/* TIME */}
                <div className="hidden w-24 shrink-0 xl:block">
                  <div className="mb-1 text-[9px] uppercase text-slate-600">
                    Generated
                  </div>

                  <div className="text-xs text-slate-400">
                    {report.generated}
                  </div>
                </div>

                {/* ACTIONS */}
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    onClick={() => setSelectedReport(report)}
                    className="flex h-9 items-center gap-2 rounded-lg border border-cyan-400/20 bg-cyan-400/5 px-3 text-xs text-cyan-300 transition hover:bg-cyan-400/10"
                  >
                    <Eye size={15} />
                    View
                  </button>

                  <button
                    onClick={() => downloadReport(report)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 bg-[#06131f] text-slate-400 transition hover:border-cyan-400/30 hover:text-cyan-300"
                    title="Download report"
                  >
                    <Download size={15} />
                  </button>
                </div>
              </div>
            ))}

            {filteredReports.length === 0 && (
              <div className="px-5 py-16 text-center">
                <FileText
                  size={35}
                  className="mx-auto mb-3 text-slate-700"
                />

                <p className="text-sm text-slate-400">
                  No reports found
                </p>

                <p className="mt-1 text-xs text-slate-600">
                  Try changing your search or filters.
                </p>
              </div>
            )}
          </div>
        </Glass>
      </main>

      {/* VIEW REPORT MODAL */}
      {selectedReport && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm">
          <div className="flex h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-cyan-400/20 bg-[#071522] shadow-[0_0_70px_#22d3ee12]">
            {/* HEADER */}
            <div className="flex shrink-0 items-start justify-between border-b border-cyan-400/10 px-6 py-5">
              <div>
                <div className="mb-2 text-[10px] font-semibold tracking-[0.25em] text-cyan-400">
                  GEOREASONER / REPORT
                </div>

                <h2 className="text-xl font-semibold">
                  {selectedReport.title}
                </h2>

                <div className="mt-1 text-xs text-slate-500">
                  {selectedReport.id}
                </div>
              </div>

              <button
                onClick={() => setSelectedReport(null)}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-white/5 hover:text-slate-200"
              >
                <X size={21} />
              </button>
            </div>

            {/* SCROLL CONTENT */}
            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-cyan-400/30 scrollbar-track-transparent">
              {/* REPORT META */}
              <div className="grid grid-cols-4 gap-3">
                <div className="rounded-xl border border-slate-700/60 bg-[#06131f] p-4">
                  <div className="text-[9px] uppercase text-slate-600">
                    Type
                  </div>
                  <div className="mt-2 text-sm font-semibold">
                    {selectedReport.type}
                  </div>
                </div>

                <div className="rounded-xl border border-slate-700/60 bg-[#06131f] p-4">
                  <div className="text-[9px] uppercase text-slate-600">
                    Severity
                  </div>
                  <div
                    className={`mt-2 text-sm font-semibold ${
                      selectedReport.severity === "HIGH"
                        ? "text-red-400"
                        : selectedReport.severity === "MEDIUM"
                        ? "text-orange-400"
                        : "text-cyan-400"
                    }`}
                  >
                    {selectedReport.severity}
                  </div>
                </div>

                <div className="rounded-xl border border-slate-700/60 bg-[#06131f] p-4">
                  <div className="text-[9px] uppercase text-slate-600">
                    AI Confidence
                  </div>
                  <div className="mt-2 text-sm font-semibold text-cyan-400">
                    {selectedReport.confidence}%
                  </div>
                </div>

                <div className="rounded-xl border border-slate-700/60 bg-[#06131f] p-4">
                  <div className="text-[9px] uppercase text-slate-600">
                    People Affected
                  </div>
                  <div className="mt-2 text-sm font-semibold">
                    {selectedReport.affected.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* INCIDENT */}
              <div className="rounded-xl border border-cyan-400/10 bg-[#06131f] p-5">
                <div className="mb-3 flex items-center gap-2">
                  <ShieldAlert size={17} className="text-red-400" />

                  <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    Associated Incident
                  </span>
                </div>

                <div className="text-base font-semibold">
                  {selectedReport.incident}
                </div>

                <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                  <MapPin size={14} className="text-cyan-400" />
                  {selectedReport.location}
                </div>
              </div>

              {/* SUMMARY */}
              <div className="rounded-xl border border-cyan-400/10 bg-[#06131f] p-5">
                <div className="mb-3 text-[10px] font-semibold uppercase tracking-wide text-cyan-400">
                  Executive Summary
                </div>

                <p className="text-sm leading-6 text-slate-300">
                  {selectedReport.summary}
                </p>
              </div>

              {/* FINDINGS */}
              <div>
                <div className="mb-3 text-[10px] font-semibold uppercase tracking-wide text-cyan-400">
                  Key Findings
                </div>

                <div className="space-y-2">
                  {selectedReport.findings.map((finding, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 rounded-lg border border-slate-700/50 bg-[#06131f] p-3"
                    >
                      <CheckCircle2
                        size={16}
                        className="mt-0.5 shrink-0 text-cyan-400"
                      />

                      <span className="text-sm text-slate-300">
                        {finding}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI */}
              <div className="rounded-xl border border-cyan-400/15 bg-cyan-400/[0.035] p-5">
                <div className="mb-4 flex items-center gap-2">
                  <BrainCircuit
                    size={18}
                    className="text-cyan-400"
                  />

                  <span className="text-[10px] font-semibold uppercase tracking-wide text-cyan-400">
                    AI Analysis
                  </span>
                </div>

                <div className="mb-2 flex justify-between text-xs">
                  <span className="text-slate-500">
                    Confidence
                  </span>

                  <span className="font-semibold text-cyan-400">
                    {selectedReport.confidence}%
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-cyan-400"
                    style={{
                      width: `${selectedReport.confidence}%`,
                    }}
                  />
                </div>
              </div>

              {/* RECOMMENDATION */}
              <div className="rounded-xl border border-orange-400/15 bg-orange-400/[0.035] p-5">
                <div className="mb-3 text-[10px] font-semibold uppercase tracking-wide text-orange-400">
                  Recommended Action
                </div>

                <p className="text-sm leading-6 text-slate-300">
                  {selectedReport.recommendation}
                </p>
              </div>

              {/* INFO */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-slate-700/50 bg-[#06131f] p-4">
                  <div className="flex items-center gap-2 text-[9px] uppercase text-slate-600">
                    <CalendarDays size={13} />
                    Generated
                  </div>

                  <div className="mt-2 text-sm text-slate-300">
                    {selectedReport.generated}
                  </div>
                </div>

                <div className="rounded-lg border border-slate-700/50 bg-[#06131f] p-4">
                  <div className="text-[9px] uppercase text-slate-600">
                    Report Source
                  </div>

                  <div className="mt-2 text-sm text-slate-300">
                    {selectedReport.author}
                  </div>
                </div>
              </div>
            </div>

            {/* FOOTER */}
            <div className="flex shrink-0 items-center justify-between border-t border-cyan-400/10 px-6 py-4">
              <div className="flex items-center gap-2 text-[10px] text-yellow-400">
                <ShieldAlert size={14} />
                AI-generated content requires human verification
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => downloadReport(selectedReport)}
                  className="flex items-center gap-2 rounded-lg border border-cyan-400/20 px-4 py-2.5 text-xs text-cyan-300 transition hover:bg-cyan-400/10"
                >
                  <Download size={15} />
                  Download
                </button>

                <button
                  onClick={() => setSelectedReport(null)}
                  className="rounded-lg bg-cyan-400 px-5 py-2.5 text-xs font-semibold text-[#021018] transition hover:bg-cyan-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* GENERATE REPORT MODAL */}
      {showGenerate && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-cyan-400/20 bg-[#071522] p-6 shadow-[0_0_60px_#22d3ee12]">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <div className="mb-2 text-[10px] font-semibold tracking-[0.25em] text-cyan-400">
                  AI REPORT GENERATION
                </div>

                <h2 className="text-xl font-semibold">
                  Generate New Report
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Generate a situation report from current disaster data.
                </p>
              </div>

              <button
                onClick={() => setShowGenerate(false)}
                className="text-slate-500 hover:text-slate-200"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3">
              <div className="rounded-xl border border-cyan-400/10 bg-[#06131f] p-4">
                <div className="flex items-center gap-3">
                  <BrainCircuit
                    size={21}
                    className="text-cyan-400"
                  />

                  <div>
                    <div className="text-sm font-semibold">
                      AI Situation Analysis
                    </div>

                    <div className="mt-1 text-xs text-slate-500">
                      Analyze current incidents, damage and response
                      conditions.
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-700/50 bg-[#06131f] p-4">
                <div className="mb-2 text-[9px] uppercase text-slate-600">
                  Included Data
                </div>

                <div className="space-y-2 text-xs text-slate-400">
                  <div>✓ Active incidents</div>
                  <div>✓ Damage assessments</div>
                  <div>✓ Affected population</div>
                  <div>✓ AI recommendations</div>
                  <div>✓ Response intelligence</div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setShowGenerate(false)}
                className="rounded-lg border border-slate-700 px-4 py-2.5 text-xs text-slate-400 hover:bg-white/5"
              >
                Cancel
              </button>

              <button
                onClick={generateReport}
                className="flex items-center gap-2 rounded-lg bg-cyan-400 px-5 py-2.5 text-xs font-semibold text-[#021018] hover:bg-cyan-300"
              >
                <BrainCircuit size={15} />
                Generate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
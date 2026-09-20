import { useState, useEffect } from "react";

import {
  AlertTriangle,
  Car,
  Users,
  Activity,
  BrainCircuit,
  CloudRain,
  MapPin,
  Navigation,
  ShieldAlert,
  Drone,
  Search,
  Bell,
  Settings,
} from "lucide-react";

import {  
  MapContainer,
  TileLayer,
  Circle,
  Polygon,
  Marker,
  Popup,
  Polyline, 
} from "react-leaflet";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

const stats = [
  ["Active Incidents", "12", "+3", AlertTriangle, "red"],
  ["Blocked Roads", "07", "+2", Navigation, "amber"],
  ["Deployed Units", "18", "+4", Car, "cyan"],
  ["People Affected", "236", "+48", Users, "green"],
];

const incidents = [
  ["Flooding reported near Riverside", "20:18", "High"],
  ["Road collapse at Bridge A", "19:47", "Critical"],
  ["Building damage in Eastwood", "19:32", "Medium"],
  ["Landslide risk detected", "18:50", "Medium"],
  ["Power outage — Westvale", "18:20", "Low"],
];

function Glass({ children, className = "" }) {
  return (
    <div
      className={`border border-cyan-400/15 bg-[#071522]/75 backdrop-blur-xl shadow-[0_0_35px_rgba(0,180,255,0.04)] ${className}`}
    >
      {children}
    </div>
  );
}

function StatCard({ item }) {
  const [title, value, change, Icon, color] = item;

  const colors = {
    red: "text-red-400 bg-red-500/10 border-red-500/20",
    amber: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    cyan: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
    green: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  };

  return (
    <Glass className="h-[88px] rounded-xl p-3">
      <div className="flex h-full items-center gap-4">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${colors[color]}`}
        >
          <Icon size={23} />
        </div>

        <div className="min-w-0">
          <p className="text-[11px] text-slate-500">{title}</p>
          <div className="flex items-baseline gap-3">
            <span className="text-2xl font-semibold">{value}</span>
            <span className="text-[10px] text-emerald-400">
              ↑ {change}
            </span>
          </div>
        </div>

        <Activity className="ml-auto text-slate-700" size={16} />
      </div>
    </Glass>
  );
}

const incidentIcon = new L.DivIcon({
  className: "",
  html: `
    <div style="
      width:38px;
      height:38px;
      border-radius:50%;
      background:rgba(239,68,68,.2);
      border:1px solid #ef4444;
      box-shadow:0 0 25px rgba(239,68,68,.7);
      display:flex;
      align-items:center;
      justify-content:center;
      color:#f87171;
      font-size:20px;
    ">⚠</div>
  `,
  iconSize: [38, 38],
  iconAnchor: [19, 19],
});

const rescueIcon = new L.DivIcon({
  className: "",
  html: `
    <div style="
      width:38px;
      height:38px;
      border-radius:50%;
      background:rgba(34,211,238,.12);
      border:1px solid #22d3ee;
      box-shadow:0 0 20px rgba(34,211,238,.7);
      display:flex;
      align-items:center;
      justify-content:center;
      color:#22d3ee;
      font-size:18px;
    ">🚑</div>
  `,
  iconSize: [38, 38],
  iconAnchor: [19, 19],
});

const shelterIcon = new L.DivIcon({
  className: "",
  html: `
    <div style="
      width:36px;
      height:36px;
      border-radius:50%;
      background:rgba(16,185,129,.22);
      border:2px solid #10b981;
      box-shadow:0 0 22px rgba(16,185,129,.8);
      display:flex;
      align-items:center;
      justify-content:center;
      color:#34d399;
      font-size:18px;
      font-weight:bold;
    ">⌂</div>
  `,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

const blockedIcon = new L.DivIcon({
  className: "",
  html: `
    <div style="
      width:32px;height:32px;border-radius:50%;
      background:rgba(245,158,11,.15);
      border:1px solid #f59e0b;
      box-shadow:0 0 16px rgba(245,158,11,.6);
      display:flex;align-items:center;justify-content:center;
      color:#fbbf24;font-size:16px;
    ">⚠</div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

export default function Dashboard() {
    const [mapMode, setMapMode] = useState("dark");

    const [layers, setLayers] = useState({
    flood: true,
    incidents: true,
    roads: true,
    rescue: true,
    shelters: true,
    });

    const [showReport, setShowReport] = useState(false);

    const [aiAnalysis, setAiAnalysis] = useState({
    incident: "Riverside Flood",
    severity: "HIGH",
    confidence: 92,
    affected: 84,
    waterLevel: "2.4 m",
    recommendation:
      "Deploy Rescue Unit 01 to Riverside via Route A.",
  });

    const [alternateRoute, setAlternateRoute] = useState([]);
    const [rerouted, setRerouted] = useState(false);

    const toggleLayer = (name) => {
    setLayers((prev) => ({
        ...prev,
        [name]: !prev[name],
    }));
    };

    const [route, setRoute] = useState([]);
    const [route2, setRoute2] = useState([]);
    const [routeInfo, setRouteInfo] = useState(null);

    useEffect(() => {

    const start2 = [19.110, 72.905]; // Rescue Unit 03
    const end2 = [19.065, 72.885];   // Incident 2

    const url2 =
    `https://router.project-osrm.org/route/v1/driving/` +
    `${start2[1]},${start2[0]};${end2[1]},${end2[0]}` +
    `?overview=full&geometries=geojson`;

    fetch(url2)
    .then((res) => res.json())
    .then((data) => {
        if (data.code === "Ok") {
        const coordinates =
            data.routes[0].geometry.coordinates.map(
            ([lng, lat]) => [lat, lng]
            );

        setRoute2(coordinates);
        }
    });

    const start = [19.035, 72.845];   // Rescue Unit
    const end = [19.078, 72.870];     // Incident

    const url =
        `https://router.project-osrm.org/route/v1/driving/` +
        `${start[1]},${start[0]};${end[1]},${end[0]}` +
        `?overview=full&geometries=geojson`;

    fetch(url)
        .then((res) => res.json())
        .then((data) => {
        if (data.code === "Ok") {
            const coordinates =
            data.routes[0].geometry.coordinates.map(
                ([lng, lat]) => [lat, lng]
            );

            setRoute(coordinates);

            setRouteInfo({
            distance: (data.routes[0].distance / 1000).toFixed(1),
            duration: Math.round(data.routes[0].duration / 60),
            });
        }
        })
        .catch((error) => {
        console.error("Routing error:", error);
        });
    }, []);

    const handleGenerateReport = () => {
    alert("Generating detailed disaster response report...");
    };

    const calculateAlternateRoute = () => {
    const start = [19.035, 72.845];
    const waypoint = [19.055, 72.860];
    const end = [19.078, 72.870];

    const url =
        `https://router.project-osrm.org/route/v1/driving/` +
        `${start[1]},${start[0]};` +
        `${waypoint[1]},${waypoint[0]};` +
        `${end[1]},${end[0]}` +
        `?overview=full&geometries=geojson`;

    fetch(url)
        .then((res) => res.json())
        .then((data) => {
        if (data.code === "Ok") {
            const coordinates =
            data.routes[0].geometry.coordinates.map(
                ([lng, lat]) => [lat, lng]
            );

            setAlternateRoute(coordinates);
            setRerouted(true);
        }
        })
        .catch((error) => {
        console.error("Alternate routing error:", error);
        });
    };

  return (
    <div className="relative h-screen overflow-hidden bg-[#020914] text-white">

      {/* SPACE */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_45%_5%,#07598530,transparent_30%),radial-gradient(circle_at_80%_50%,#0891b220,transparent_30%)]" />

        <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:100px_100px]" />

        {/* Earth */}
        <div className="absolute -bottom-[280px] -left-[170px] h-[560px] w-[560px] rounded-full bg-[radial-gradient(circle_at_55%_40%,#2563eb55,#08234a_45%,#01060d_70%)] shadow-[0_0_100px_25px_rgba(14,165,233,0.15)]" />

        <div className="absolute -bottom-[180px] -left-[70px] h-[390px] w-[390px] rounded-full border-[8px] border-cyan-400/10 shadow-[inset_-30px_-20px_80px_#000,0_0_60px_#0ea5e933]" />
      </div>

      <div className="relative flex h-full flex-col">

        {/* TOP BAR */}
        <header className="flex h-[68px] shrink-0 items-center justify-between border-b border-cyan-400/10 px-6">

          <div className="flex w-[405px] items-center gap-3 rounded-lg border border-cyan-400/15 bg-white/[0.035] px-4 py-2.5">
            <Search size={17} className="text-cyan-400" />
            <span className="text-xs text-slate-500">
              Search location, incident, or resource...
            </span>
            <span className="ml-auto rounded bg-white/5 px-2 py-1 text-[9px] text-slate-500">
              Ctrl K
            </span>
          </div>

          <div className="flex items-center gap-5 text-xs">

            <span className="text-slate-500">
              Tue, 14 May 2024 &nbsp;|&nbsp; 20:42
            </span>

            <span className="flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-red-400">
              <span className="h-2 w-2 animate-pulse rounded-full bg-red-400 shadow-[0_0_8px_#ef4444]" />
              LIVE
            </span>

            <div className="flex items-center gap-2">
              <CloudRain className="text-cyan-400" size={23} />
              <div>
                <b>24°C</b>
                <p className="text-[9px] text-slate-500">Heavy Rain</p>
              </div>
            </div>

            <Bell size={17} className="text-slate-400" />
            <Settings size={17} className="text-slate-400" />
          </div>
        </header>

        {/* MAIN */}
        <main className="flex min-h-0 flex-1 flex-col gap-3 px-4 py-3">

          {/* HEADING */}
          <div className="flex shrink-0 items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-cyan-400">
                LIVE RESPONSE
              </p>

              <h1 className="text-[28px] font-semibold">
                Good Evening,{" "}
                <span className="text-slate-300">Responder</span>
              </h1>

              <p className="text-[11px] text-slate-500">
                Real-time intelligence. Smarter decisions. Lives first.
              </p>
            </div>

            <p className="max-w-[310px] text-right text-[11px] italic text-slate-500">
              "Technology cannot prevent disasters,
              but it can save lives."
            </p>
          </div>

          {/* STATS */}
          <div className="grid shrink-0 grid-cols-5 gap-2">

            {stats.map((item) => (
              <StatCard key={item[0]} item={item} />
            ))}

            {/* AI CONFIDENCE */}
            <Glass className="h-[88px] rounded-xl p-3">
              <div className="flex h-full items-center gap-4">

                <div className="relative flex h-14 w-14 items-center justify-center rounded-full border-[6px] border-cyan-400 shadow-[0_0_18px_#22d3ee66]">
                  <span className="text-sm font-semibold">87%</span>
                </div>

                <div>
                  <p className="text-sm font-medium">AI Confidence</p>
                  <p className="text-[10px] text-slate-500">
                    Overall Assessment
                  </p>
                </div>
              </div>
            </Glass>
          </div>

          {/* CENTER */}
          <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_360px] gap-3">

            {/* MAP */}
            <Glass className="relative min-h-0 overflow-hidden rounded-xl">

              {/* Simulated satellite terrain */}
              <MapContainer
                center={[19.076, 72.877]}
                zoom={11}
                zoomControl={false}
                className="relative z-0 h-full w-full"
                >
                
                {layers.roads && (
                <button
                onClick={calculateAlternateRoute}
                className="absolute bottom-3 left-44 z-[1000] rounded-lg border border-amber-400/20 bg-black/70 px-3 py-2 text-[10px] text-amber-400 backdrop-blur-xl hover:bg-amber-400/10"
                >
                🚧 Calculate Alternate Route
                </button>
                )}

                {/* DARK / TERRAIN */}
                {mapMode === "dark" && (
                <TileLayer
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
                    attribution="Tiles &copy; Esri"
                />
                )}

                {/* SATELLITE */}
                {mapMode === "satellite" && (
                <TileLayer
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                    attribution="Tiles &copy; Esri"
                />
                )}

                {/* HYBRID */}
                {mapMode === "hybrid" && (
                <>
                    <TileLayer
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                    attribution="Tiles &copy; Esri"
                    />

                    <TileLayer
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
                    />
                </>
                )}

                

                {/* FLOOD ZONE */}
                {layers.flood && (
                <Polygon
                    positions={[
                        [19.095, 72.850],
                        [19.105, 72.865],
                        [19.095, 72.885],
                        [19.075, 72.895],
                        [19.055, 72.885],
                        [19.050, 72.865],
                        [19.065, 72.850],
                        [19.080, 72.842],
                    ]}
                    pathOptions={{
                        color: "#ef4444",
                        fillColor: "#ef4444",
                        fillOpacity: 0.20,
                        weight: 2,
                    }}
                />
                )}

                {/* INCIDENTS */}
                {layers.incidents && (
                <>
                    {/* Flood Incident */}
                    <Marker
                    position={[19.078, 72.870]}
                    icon={incidentIcon}
                    eventHandlers={{
                        click: () =>
                        setAiAnalysis({
                            incident: "Flood Risk — Riverside",
                            severity: "HIGH",
                            confidence: 91,
                            affected: 4300,
                            waterLevel: "2.4 m",
                            recommendation:
                            "Deploy Rescue Unit 03 via Route B.",
                        }),
                    }}
                    >
                    <Popup>
                        <b>Flood Risk — Riverside</b>
                        <br />
                        Severity: HIGH
                        <br />
                        AI Confidence: 91%
                    </Popup>
                    </Marker>

                    {/* Building Damage */}
                    <Marker
                    position={[19.065, 72.885]}
                    icon={incidentIcon}
                    eventHandlers={{
                        click: () =>
                        setAiAnalysis({
                            incident: "Building Damage — Eastwood",
                            severity: "MEDIUM",
                            confidence: 87,
                            affected: 680,
                            waterLevel: "Normal",
                            recommendation:
                            "Deploy structural assessment team to Eastwood.",
                        }),
                    }}
                    >
                    <Popup>
                        <b>Building Damage — Eastwood</b>
                        <br />
                        Severity: MEDIUM
                        <br />
                        AI Confidence: 87%
                    </Popup>
                    </Marker>
                </>
                )}

                {/* BLOCKED ROADS */}
                {layers.roads && (
                <Marker
                    position={[19.090, 72.855]}
                    icon={blockedIcon}
                >
                    <Popup>Road Blocked — Bridge A</Popup>
                </Marker>
                )}

                {/* RESCUE ROUTES */}
                {layers.rescue && (
                <>
                    {route.length > 0 && (
                    <Polyline
                        positions={route}
                        pathOptions={{
                        color: "#22d3ee",
                        weight: 5,
                        opacity: 1,
                        }}
                    />
                    )}

                    {layers.rescue && route2.length > 0 && (
                    <Polyline
                        positions={route2}
                        pathOptions={{
                        color: "#a855f7",
                        weight: 5,
                        opacity: 1,
                        }}
                    />
                    )}

                    {layers.rescue && alternateRoute.length > 0 && (
                    <Polyline
                        positions={alternateRoute}
                        pathOptions={{
                        color: "#f59e0b",
                        weight: 6,
                        opacity: 1,
                        dashArray: "10 8",
                        }}
                    />
                    )}

                    <Marker position={[19.035, 72.845]} icon={rescueIcon}>
                    <Popup>Rescue Unit 01 — En Route</Popup>
                    </Marker>

                    <Marker position={[19.110, 72.905]} icon={rescueIcon}>
                    <Popup>Rescue Unit 03 — Deploying</Popup>
                    </Marker>
                </>
                )}

                {routeInfo && (
                <div className="absolute bottom-3 left-3 z-[1000] rounded-lg border border-cyan-400/20 bg-black/70 px-3 py-2 backdrop-blur-xl">
                    <p className="text-[9px] text-slate-500">
                    RESCUE ROUTE
                    </p>

                    <p className="text-xs text-cyan-400">
                    {routeInfo.distance} km · {routeInfo.duration} min
                    </p>
                </div>
                )}

                {/* SHELTERS */}
                {layers.shelters && (
                <>
                    <Marker
                    position={[19.115, 72.875]}
                    icon={shelterIcon}
                    >
                    <Popup>
                        <b>Northfield School</b>
                        <br />
                        Temporary Shelter
                        <br />
                        Capacity: 850
                    </Popup>
                    </Marker>

                    <Marker
                    position={[19.055, 72.910]}
                    icon={shelterIcon}
                    >
                    <Popup>
                        <b>Community Relief Center</b>
                        <br />
                        Capacity: 500
                    </Popup>
                    </Marker>
                </>
                )}
                </MapContainer>

              {/* Map header */}
              <div className="absolute left-4 top-3 z-[1000] flex items-center gap-3 rounded-lg border border-white/10 bg-black/60 px-4 py-2 backdrop-blur-xl">
                <MapPin size={17} className="text-cyan-400" />
                <b className="text-sm">Live Disaster Map</b>
                <span className="rounded-full bg-red-500/15 px-2 py-1 text-[9px] text-red-400">
                  LIVE
                </span>
              </div>

              {/* Map layers */}
              <div className="absolute left-4 top-16 z-[1000] rounded-lg border border-white/10 bg-black/55 p-3 backdrop-blur-xl">
                <p className="mb-2 text-[9px] text-slate-400">
                  MAP LAYERS
                </p>

                {[
                    ["flood", "Flood Zones"],
                    ["incidents", "Incidents"],
                    ["roads", "Road Status"],
                    ["rescue", "Rescue Units"],
                    ["shelters", "Shelters"],
                    ].map(([key, label]) => (
                    <button
                        key={key}
                        onClick={() => toggleLayer(key)}
                        className="mb-1.5 flex w-full items-center gap-2 text-left text-[10px] hover:text-white"
                    >
                        <span
                        className={`flex h-3.5 w-3.5 items-center justify-center rounded border text-[8px] ${
                            layers[key]
                            ? "border-cyan-400 bg-cyan-400 text-black"
                            : "border-slate-600 bg-transparent text-transparent"
                        }`}
                        >
                        ✓
                        </span>

                        {label}
                    </button>
                    ))}
              </div>

              {/* Map mode */}
              <div className="absolute right-3 top-3 z-[1000] flex overflow-hidden rounded-lg border border-white/10 bg-black/70 text-[10px] backdrop-blur-xl">

                    {[
                        ["dark", "Terrain"],
                        ["satellite", "Satellite"],
                        ["hybrid", "Hybrid"],
                    ].map(([value, label]) => (
                        <button
                        key={value}
                        onClick={() => setMapMode(value)}
                        className={`px-4 py-2 transition ${
                            mapMode === value
                            ? "bg-cyan-400 font-medium text-black"
                            : "text-slate-400 hover:bg-white/10"
                        }`}
                        >
                        {label}
                        </button>
                    ))}

                </div>

              {/* Map alert */}
              <div className="absolute bottom-3 right-3 z-[1000] rounded-lg border border-red-400/20 bg-black/60 px-4 py-3 backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="text-red-400" size={20} />
                  <div>
                    <p className="text-[11px] font-medium">
                      Severe flooding in low-lying areas
                    </p>
                    <p className="text-[9px] text-slate-500">
                      Riverside · 92% confidence
                    </p>
                  </div>
                </div>
              </div>
            </Glass>

            {/* AI */}
            <Glass className="min-h-0 overflow-y-auto rounded-xl p-5 scrollbar-thin scrollbar-thumb-cyan-400/30 scrollbar-track-transparent">

            {/* HEADER */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                <BrainCircuit
                    className="text-cyan-400"
                    size={22}
                />

                <h2 className="font-semibold">
                    AI Analysis
                </h2>
                </div>

                <span className="text-[10px] text-cyan-400">
                View Details →
                </span>
            </div>


            {/* CURRENT FOCUS */}
            <div className="mt-5 flex gap-3">

                {/* Incident visual */}
                <div className="relative h-[72px] w-[88px] shrink-0 overflow-hidden rounded-lg border border-red-400/20">
                    <img
                        src="/images/flood-incident.jpg"
                        alt="Flood incident"
                        className="h-full w-full object-cover"
                    />

                    <div className="absolute inset-0 bg-red-950/20" />
                </div>

                {/* Incident information */}
                <div className="min-w-0">

                <p className="text-[9px] text-slate-500">
                    CURRENT FOCUS
                </p>

                <h3 className="mt-1 text-sm font-semibold">
                {aiAnalysis.incident}
                </h3>

                <div className="mt-2 flex items-center gap-2">

                    <span className="rounded bg-red-500/15 px-2 py-1 text-[9px] text-red-400">
                    ● {aiAnalysis.severity}
                    </span>

                    <span className="text-[9px] text-slate-500">
                    AI Detected
                    </span>

                </div>

                </div>
            </div>


            {/* AI METRICS */}
            <div className="mt-4 grid grid-cols-2 gap-2">

                {/* Confidence */}
                <div className="rounded-lg border border-white/10 bg-white/[0.02] p-2.5">

                <p className="text-[8px] text-slate-500">
                    AI CONFIDENCE
                </p>

                <span className="text-cyan-400">
                {aiAnalysis.confidence}%
                </span>

                </div>


                {/* People at risk */}
                <div className="rounded-lg border border-white/10 bg-white/[0.02] p-2.5">

                <p className="text-[8px] text-slate-500">
                    PEOPLE AT RISK
                </p>

                <p className="mt-1 text-sm font-semibold text-white">
                ~{aiAnalysis.affected.toLocaleString()}
                </p>

                </div>

            </div>


            {/* CONFIDENCE BAR */}
            <div className="mt-3">

                <div className="flex justify-between text-[10px]">

                <span className="text-slate-500">
                    Prediction Confidence
                </span>

                <div
                className="h-full rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee]"
                style={{ width: `${aiAnalysis.confidence}%` }}
                />

                </div>

                <div className="mt-1 h-1.5 rounded-full bg-slate-800">

                <div
                    className="h-full w-[91%] rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee]"
                />

                </div>

            </div>


            {/* KEY INSIGHTS */}
            <p className="mt-5 text-[9px] text-cyan-400">
                KEY INSIGHTS
            </p>

            <div className="mt-2 space-y-2 text-[10px] text-slate-300">

                {[
                "Severe flooding detected in low-lying areas",
                "Multiple road blockages affecting evacuation",
                "Increased risk of building collapse",
                "Population in danger: ~4,300 people",
                ].map((x) => (

                <p
                    key={x}
                    className="flex gap-2"
                >

                    <ShieldAlert
                    size={13}
                    className="shrink-0 text-red-400"
                    />

                    <span>
                    {x}
                    </span>

                </p>

                ))}

            </div>


            {/* RECOMMENDED ACTIONS */}
            <p className="mt-5 text-[9px] text-cyan-400">
                RECOMMENDED ACTIONS
            </p>

            <div className="rounded border border-cyan-400/10 bg-cyan-400/[0.03] p-2 text-[9px]">
                <span className="mr-2 rounded bg-cyan-400 px-1.5 py-0.5 font-bold text-black">
                    1
                </span>

                {aiAnalysis.recommendation}
            </div>


            {/* REPORT BUTTON */}
            <button
            onClick={() => setShowReport(true)}
            className="mt-3 w-full rounded-lg bg-cyan-400 py-2 text-[10px] font-semibold text-black shadow-[0_0_20px_#22d3ee33] transition hover:bg-cyan-300"
            >
            Generate Detailed Report →
            </button>


            {/* HUMAN CONFIRMATION */}
            <p className="mt-2 text-center text-[8px] text-amber-400">
                ⚠ Human confirmation required
            </p>

            </Glass>
            {showReport && (
            <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm">

                <div className="w-full max-w-2xl rounded-2xl border border-cyan-400/20 bg-[#071522] p-6 shadow-[0_0_40px_#22d3ee22]">

                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div>
                    <p className="text-[9px] tracking-[0.2em] text-cyan-400">
                        GEOREASONER
                    </p>

                    <h2 className="mt-1 text-xl font-semibold">
                        Disaster Response Report
                    </h2>
                    </div>

                    <button
                    onClick={() => setShowReport(false)}
                    className="text-xl text-slate-400 hover:text-white"
                    >
                    ×
                    </button>
                </div>
                {/* INCIDENT IMAGE */}
                <div className="mt-5 overflow-hidden rounded-xl border border-red-400/20">
                <img
                    src="/images/flood-incident.jpg"
                    alt="Flood incident"
                    className="h-48 w-full object-cover"
                />
                </div>
                {/* Incident */}
                <div className="mt-5 rounded-lg border border-red-400/20 bg-red-500/5 p-4">
                    <p className="text-[9px] text-slate-500">
                    INCIDENT
                    </p>

                    <h3 className="mt-1 text-lg font-semibold">
                    {aiAnalysis.incident}
                    </h3>

                    <span className="mt-2 inline-block rounded bg-red-500/15 px-2 py-1 text-[9px] text-red-400">
                    ● {aiAnalysis.severity}
                    </span>
                </div>

                {/* Metrics */}
                <div className="mt-4 grid grid-cols-3 gap-3">

                    <div className="rounded-lg border border-white/10 p-3">
                    <p className="text-[9px] text-slate-500">
                        AI CONFIDENCE
                    </p>
                    <p className="mt-1 text-lg font-semibold text-cyan-400">
                        {aiAnalysis.confidence}%
                    </p>
                    </div>

                    <div className="rounded-lg border border-white/10 p-3">
                    <p className="text-[9px] text-slate-500">
                        PEOPLE AT RISK
                    </p>
                    <p className="mt-1 text-lg font-semibold">
                        {aiAnalysis.affected.toLocaleString()}
                    </p>
                    </div>

                    <div className="rounded-lg border border-white/10 p-3">
                    <p className="text-[9px] text-slate-500">
                        WATER LEVEL
                    </p>
                    <p className="mt-1 text-lg font-semibold">
                        {aiAnalysis.waterLevel}
                    </p>
                    </div>

                </div>

                {/* AI Recommendation */}
                <div className="mt-4 rounded-lg border border-cyan-400/15 bg-cyan-400/5 p-4">

                    <p className="text-[9px] tracking-wider text-cyan-400">
                    AI RECOMMENDATION
                    </p>

                    <p className="mt-2 text-sm text-slate-300">
                    {aiAnalysis.recommendation}
                    </p>

                </div>

                {/* Actions */}
                <div className="mt-4">
                    <p className="text-[9px] text-cyan-400">
                    RESPONSE ACTIONS
                    </p>

                    <div className="mt-2 space-y-2">

                    <div className="rounded border border-white/10 p-3 text-xs">
                        🚑 Deploy rescue unit
                    </div>

                    <div className="rounded border border-white/10 p-3 text-xs">
                        🏫 Activate emergency shelter
                    </div>

                    <div className="rounded border border-white/10 p-3 text-xs">
                        🚧 Monitor blocked roads
                    </div>

                    </div>
                </div>

                <p className="mt-5 text-center text-[8px] text-amber-400">
                    ⚠ AI-generated recommendation — human confirmation required
                </p>

                </div>
            </div>
            )}
          </div>

          {/* BOTTOM */}
          <div className="grid h-[142px] shrink-0 grid-cols-3 gap-3">

            {/* Incidents */}
            <Glass className="overflow-hidden rounded-xl p-4">
              <div className="flex justify-between">
                <h3 className="text-sm font-semibold">
                  Recent Incidents
                </h3>
                <span className="text-[9px] text-cyan-400">View All</span>
              </div>

              <div className="mt-2 space-y-1.5">
                {incidents.map(([name, time, level]) => (
                  <div
                    key={name}
                    className="flex items-center gap-2 text-[9px]"
                  >
                    <AlertTriangle size={11} className="text-red-400" />
                    <span className="flex-1 truncate">{name}</span>
                    <span className="text-slate-600">{time}</span>
                    <span className="text-red-400">{level}</span>
                  </div>
                ))}
              </div>
            </Glass>

            {/* Resources */}
            <Glass className="rounded-xl p-4">
              <div className="flex justify-between">
                <h3 className="text-sm font-semibold">
                  Active Resources
                </h3>
                <span className="text-[9px] text-cyan-400">View All</span>
              </div>

              <div className="mt-3 space-y-2 text-[9px]">
                {[
                  ["Rescue Unit 01", "En route", "12 km"],
                  ["Rescue Unit 02", "On site", "Riverside"],
                  ["Rescue Unit 03", "Deploying", "8 km"],
                  ["Drone A1", "Surveillance", "Zone B"],
                ].map(([a, b, c]) => (
                  <div key={a} className="flex justify-between">
                    <span>{a}</span>
                    <span className="text-cyan-400">{b}</span>
                    <span className="text-slate-500">{c}</span>
                  </div>
                ))}
              </div>
            </Glass>

            {/* Weather */}
            <Glass className="rounded-xl p-4">
              <div className="flex items-center gap-2">
                <CloudRain size={19} className="text-cyan-400" />
                <h3 className="text-sm font-semibold">
                  Weather & Risk Forecast
                </h3>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-[9px]">
                <div>
                  <p className="text-slate-500">Weather</p>
                  <p className="text-sm">Heavy Rain</p>
                </div>

                <div>
                  <p className="text-slate-500">Flood Risk</p>
                  <p className="text-red-400">HIGH</p>
                </div>

                <div>
                  <p className="text-slate-500">Wind Speed</p>
                  <p>28 km/h</p>
                </div>

                <div>
                  <p className="text-slate-500">Precipitation</p>
                  <p className="text-cyan-400">42 mm</p>
                </div>
              </div>
            </Glass>
          </div>

          {/* FOOTER */}
          <div className="flex shrink-0 justify-between px-2 text-[9px] text-slate-600">
            <span className="italic">
              "From data to decisions. From insight to impact."
            </span>
            <span>GeoReasoner v1.0</span>
          </div>

        </main>
      </div>
    </div>
  );

}


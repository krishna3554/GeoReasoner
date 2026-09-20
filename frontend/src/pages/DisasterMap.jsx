import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polygon,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import {
  AlertTriangle,
  Building2,
  ChevronDown,
  Crosshair,
  Layers,
  Map as MapIcon,
  Navigation,
  Search,
  Shield,
  Truck,
  Users,
  X,
} from "lucide-react";
import "leaflet/dist/leaflet.css";

/* =========================
   GLASS COMPONENT
========================= */

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
   MAP ICONS
========================= */

const incidentIcon = new L.DivIcon({
  className: "",
  html: `
    <div style="
      width:40px;
      height:40px;
      border-radius:50%;
      background:rgba(239,68,68,.20);
      border:1px solid #ef4444;
      box-shadow:0 0 25px rgba(239,68,68,.75);
      display:flex;
      align-items:center;
      justify-content:center;
      color:#f87171;
      font-size:20px;
    ">⚠</div>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

const mediumIncidentIcon = new L.DivIcon({
  className: "",
  html: `
    <div style="
      width:36px;
      height:36px;
      border-radius:50%;
      background:rgba(245,158,11,.18);
      border:1px solid #f59e0b;
      box-shadow:0 0 20px rgba(245,158,11,.7);
      display:flex;
      align-items:center;
      justify-content:center;
      color:#fbbf24;
      font-size:18px;
    ">⚠</div>
  `,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

const rescueIcon = new L.DivIcon({
  className: "",
  html: `
    <div style="
      width:38px;
      height:38px;
      border-radius:50%;
      background:rgba(34,211,238,.13);
      border:1px solid #22d3ee;
      box-shadow:0 0 22px rgba(34,211,238,.75);
      display:flex;
      align-items:center;
      justify-content:center;
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
      background:rgba(16,185,129,.20);
      border:2px solid #10b981;
      box-shadow:0 0 22px rgba(16,185,129,.75);
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
      width:34px;
      height:34px;
      border-radius:50%;
      background:rgba(245,158,11,.16);
      border:1px solid #f59e0b;
      box-shadow:0 0 18px rgba(245,158,11,.65);
      display:flex;
      align-items:center;
      justify-content:center;
      color:#fbbf24;
      font-size:17px;
    ">⚠</div>
  `,
  iconSize: [34, 34],
  iconAnchor: [17, 17],
});

/* =========================
   MAP DATA
========================= */

const incidents = [
  {
    id: "INC-001",
    title: "Flood Risk — Riverside",
    severity: "HIGH",
    type: "Flood",
    location: "Riverside District",
    position: [19.078, 72.87],
    confidence: 91,
    affected: 4300,
  },
  {
    id: "INC-002",
    title: "Building Damage — Eastwood",
    severity: "MEDIUM",
    type: "Structural",
    location: "Eastwood Area",
    position: [19.065, 72.885],
    confidence: 87,
    affected: 680,
  },
];

const blockedRoads = [
  {
    id: "RD-001",
    title: "Road Blocked — Bridge A",
    position: [19.09, 72.855],
    reason: "Infrastructure damage",
  },
];

const rescueUnits = [
  {
    id: "RU-01",
    name: "Rescue Unit 01",
    position: [19.035, 72.845],
    status: "Available",
    team: "Medical Response",
  },
  {
    id: "RU-02",
    name: "Rescue Unit 02",
    position: [19.055, 72.88],
    status: "En Route",
    team: "Search & Rescue",
  },
  {
    id: "RU-03",
    name: "Rescue Unit 03",
    position: [19.11, 72.905],
    status: "Available",
    team: "Emergency Response",
  },
];

const shelters = [
  {
    id: "SH-01",
    name: "Northfield School",
    position: [19.12, 72.89],
    capacity: 1200,
    occupied: 880,
  },
  {
    id: "SH-02",
    name: "Central Community Hall",
    position: [19.075, 72.84],
    capacity: 800,
    occupied: 420,
  },
];

/* =========================
   ROUTE COMPONENT
========================= */

function RouteLoader({ onRouteLoaded }) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (loaded) return;

    const start = [19.035, 72.845];
    const end = [19.078, 72.87];

    const url =
      `https://router.project-osrm.org/route/v1/driving/` +
      `${start[1]},${start[0]};${end[1]},${end[0]}` +
      `?overview=full&geometries=geojson`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.code === "Ok" && data.routes?.length) {
          const coordinates =
            data.routes[0].geometry.coordinates.map(
              ([lng, lat]) => [lat, lng]
            );

          onRouteLoaded({
            coordinates,
            distance: (data.routes[0].distance / 1000).toFixed(1),
            duration: Math.round(data.routes[0].duration / 60),
          });

          setLoaded(true);
        }
      })
      .catch((error) => {
        console.error("Route loading error:", error);
      });
  }, [loaded, onRouteLoaded]);

  return null;
}

/* =========================
   MAIN PAGE
========================= */

export default function DisasterMap() {
  const [mapMode, setMapMode] = useState("dark");

  const [layers, setLayers] = useState({
    flood: true,
    incidents: true,
    roads: true,
    rescue: true,
    shelters: true,
    routes: true,
  });

  const [search, setSearch] = useState("");
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [routeIncident, setRouteIncident] = useState(null);
  const [showLayers, setShowLayers] = useState(true);

  const toggleLayer = (name) => {
    setLayers((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  const filteredIncidents = incidents.filter(
    (incident) =>
      incident.title.toLowerCase().includes(search.toLowerCase()) ||
      incident.location.toLowerCase().includes(search.toLowerCase())
  );

  const handleRouteLoaded = (data) => {
    setRouteInfo(data);
  };

  return (
    <div className="relative h-screen overflow-hidden bg-[#020b13] text-slate-100">
      {/* =========================
          HEADER
      ========================= */}

      <div className="absolute left-5 right-5 top-5 z-[1000] flex items-start justify-between">
        <div>
          <div className="mb-2 text-[10px] font-semibold tracking-[0.28em] text-cyan-400">
            GEOREASONER / GEOSPATIAL INTELLIGENCE
          </div>

          <h1 className="text-2xl font-semibold">
            Disaster Map
          </h1>

          <p className="mt-1 text-xs text-slate-400">
            Operational view of incidents, hazards and emergency response assets.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-cyan-400/20 bg-[#071522]/90 px-4 py-2.5 backdrop-blur-xl">
          <div className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_#34d399]" />

          <span className="text-[10px] text-cyan-300">
            LIVE MAP ONLINE
          </span>
        </div>
      </div>

      {/* =========================
          SEARCH
      ========================= */}

      <Glass className="absolute left-5 top-28 z-[1000] w-[350px] rounded-xl p-2">
        <div className="relative">
          <Search
            size={17}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
          />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search incidents or locations..."
            className="h-10 w-full rounded-lg border border-slate-700/60 bg-[#06131f] pl-10 pr-3 text-xs text-slate-200 outline-none placeholder:text-slate-600 focus:border-cyan-400/40"
          />
        </div>
      </Glass>

      {/* =========================
          MAP MODE
      ========================= */}

      <Glass className="absolute right-5 top-28 z-[1000] rounded-xl p-1.5">
        <div className="flex items-center gap-1">
          {[
            ["dark", "Dark"],
            ["satellite", "Satellite"],
            ["hybrid", "Hybrid"],
          ].map(([mode, label]) => (
            <button
              key={mode}
              onClick={() => setMapMode(mode)}
              className={`rounded-lg px-3 py-2 text-[10px] transition ${
                mapMode === mode
                  ? "bg-cyan-400 text-[#021018]"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </Glass>

      {/* =========================
          LAYER PANEL
      ========================= */}

      <Glass className="absolute left-5 top-44 z-[1000] w-[230px] rounded-xl">
        <button
          onClick={() => setShowLayers((prev) => !prev)}
          className="flex w-full items-center justify-between border-b border-cyan-400/10 px-4 py-3"
        >
          <div className="flex items-center gap-2">
            <Layers size={16} className="text-cyan-400" />

            <span className="text-xs font-semibold">
              Map Layers
            </span>
          </div>

          <ChevronDown
            size={15}
            className={`text-slate-500 transition ${
              showLayers ? "rotate-180" : ""
            }`}
          />
        </button>

        {showLayers && (
          <div className="space-y-1 p-3">
            {[
              ["flood", "Flood Zones", "bg-red-500"],
              ["incidents", "Incidents", "bg-red-400"],
              ["roads", "Blocked Roads", "bg-orange-400"],
              ["rescue", "Rescue Units", "bg-cyan-400"],
              ["shelters", "Emergency Shelters", "bg-emerald-400"],
              ["routes", "Emergency Routes", "bg-purple-400"],
            ].map(([key, label, color]) => (
              <button
                key={key}
                onClick={() => toggleLayer(key)}
                className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-left transition hover:bg-white/5"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${color}`}
                  />

                  <span className="text-xs text-slate-400">
                    {label}
                  </span>
                </div>

                <div
                  className={`flex h-4 w-4 items-center justify-center rounded border ${
                    layers[key]
                      ? "border-cyan-400 bg-cyan-400"
                      : "border-slate-700"
                  }`}
                >
                  {layers[key] && (
                    <span className="text-[9px] font-bold text-[#021018]">
                      ✓
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </Glass>

      {/* =========================
          LEGEND
      ========================= */}

      <Glass className="absolute bottom-5 left-5 z-[1000] w-[230px] rounded-xl p-4">
        <div className="mb-3 flex items-center gap-2">
          <MapIcon size={15} className="text-cyan-400" />

          <span className="text-[10px] font-semibold uppercase tracking-wide">
            Map Legend
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
            High Risk
          </div>

          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-orange-400" />
            Medium
          </div>

          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-cyan-400" />
            Rescue
          </div>

          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            Shelter
          </div>

          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-purple-400" />
            Route
          </div>

          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-orange-400" />
            Blocked
          </div>
        </div>
      </Glass>

      {/* =========================
          ROUTE INFO
      ========================= */}

      {routeInfo && layers.routes && (
        <Glass className="absolute bottom-5 left-[255px] z-[1000] w-[260px] rounded-xl p-4">
          <div className="mb-3 flex items-center gap-2">
            <Navigation size={16} className="text-purple-400" />

            <span className="text-xs font-semibold">
              Active Emergency Route
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-[9px] uppercase text-slate-600">
                Distance
              </div>

              <div className="mt-1 text-sm font-semibold">
                {routeInfo.distance} km
              </div>
            </div>

            <div>
              <div className="text-[9px] uppercase text-slate-600">
                ETA
              </div>

              <div className="mt-1 text-sm font-semibold text-cyan-400">
                {routeInfo.duration} min
              </div>
            </div>
          </div>

          <div className="mt-3 text-[10px] text-slate-500">
            {routeIncident
                ? `Rescue Unit 03 → ${routeIncident.title}`
                : "Select an incident to plan a route"}
          </div>
        </Glass>
      )}

      {/* =========================
          SELECTED INCIDENT PANEL
      ========================= */}

      {selectedIncident && (
        <Glass className="absolute right-5 top-44 z-[1100] w-[300px] rounded-xl p-5 shadow-[0_0_40px_#22d3ee10]">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <div className="text-[9px] font-semibold tracking-[0.2em] text-cyan-400">
                INCIDENT DETAILS
              </div>

              <h2 className="mt-1 text-sm font-semibold">
                {selectedIncident.title}
              </h2>
            </div>

            <button
              onClick={() => setSelectedIncident(null)}
              className="text-slate-500 hover:text-slate-200"
            >
              <X size={17} />
            </button>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Severity
              </span>

              <span className="text-xs font-semibold text-red-400">
                {selectedIncident.severity}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Type
              </span>

              <span className="text-xs text-slate-300">
                {selectedIncident.type}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Location
              </span>

              <span className="text-xs text-slate-300">
                {selectedIncident.location}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">
                AI Confidence
              </span>

              <span className="text-xs font-semibold text-cyan-400">
                {selectedIncident.confidence}%
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">
                People Affected
              </span>

              <span className="text-xs text-slate-300">
                {selectedIncident.affected.toLocaleString()}
              </span>
            </div>
          </div>

          <button
            onClick={() => {
                if (!selectedIncident) return;

                const start = [19.11, 72.905]; // Rescue Unit 03
                const end = selectedIncident.position;

                const url =
                `https://router.project-osrm.org/route/v1/driving/` +
                `${start[1]},${start[0]};${end[1]},${end[0]}` +
                `?overview=full&geometries=geojson`;

                fetch(url)
                .then((res) => res.json())
                .then((data) => {
                    if (data.code === "Ok" && data.routes?.length) {
                    const coordinates =
                        data.routes[0].geometry.coordinates.map(
                        ([lng, lat]) => [lat, lng]
                        );

                    setRouteInfo({
                        coordinates,
                        distance: (data.routes[0].distance / 1000).toFixed(1),
                        duration: Math.round(data.routes[0].duration / 60),
                    });

                    setRouteIncident(selectedIncident);
                    }
                })
                .catch((error) => {
                    console.error("Route planning error:", error);
                });
            }}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg border border-cyan-400/20 bg-cyan-400/5 py-2.5 text-xs text-cyan-300 transition hover:bg-cyan-400/10"
            >
            <Navigation size={14} />
            Plan Response Route
            </button>
        </Glass>
      )}

      {/* =========================
          MAP
      ========================= */}

      <MapContainer
        center={[19.076, 72.877]}
        zoom={12}
        zoomControl={false}
        className="h-full w-full"
      >
        {/* DARK MAP */}
        {mapMode === "dark" && (
          <TileLayer
            attribution="Tiles © Esri"
            url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
          />
        )}

        {/* SATELLITE */}
        {mapMode === "satellite" && (
          <TileLayer
            attribution="Tiles © Esri"
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          />
        )}

        {/* HYBRID */}
        {mapMode === "hybrid" && (
          <>
            <TileLayer
              attribution="Tiles © Esri"
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />

            <TileLayer
              attribution="Tiles © Esri"
              url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
            />
          </>
        )}

        {/* =========================
            FLOOD ZONE
        ========================= */}

        {layers.flood && (
          <Polygon
            positions={[
              [19.095, 72.85],
              [19.105, 72.865],
              [19.095, 72.885],
              [19.075, 72.895],
              [19.055, 72.885],
              [19.05, 72.865],
              [19.065, 72.85],
              [19.08, 72.842],
            ]}
            pathOptions={{
              color: "#ef4444",
              fillColor: "#ef4444",
              fillOpacity: 0.2,
              weight: 2,
            }}
          />
        )}

        {/* =========================
            INCIDENTS
        ========================= */}

        {layers.incidents &&
          filteredIncidents.map((incident) => (
            <Marker
              key={incident.id}
              position={incident.position}
              icon={
                incident.severity === "HIGH"
                  ? incidentIcon
                  : mediumIncidentIcon
              }
              eventHandlers={{
                click: () => setSelectedIncident(incident),
              }}
            >
              <Popup>
                <b>{incident.title}</b>
                <br />
                Severity: {incident.severity}
                <br />
                AI Confidence: {incident.confidence}%
              </Popup>
            </Marker>
          ))}

        {/* =========================
            BLOCKED ROADS
        ========================= */}

        {layers.roads &&
          blockedRoads.map((road) => (
            <Marker
              key={road.id}
              position={road.position}
              icon={blockedIcon}
            >
              <Popup>
                <b>{road.title}</b>
                <br />
                {road.reason}
              </Popup>
            </Marker>
          ))}

        {/* =========================
            RESCUE UNITS
        ========================= */}

        {layers.rescue &&
          rescueUnits.map((unit) => (
            <Marker
              key={unit.id}
              position={unit.position}
              icon={rescueIcon}
            >
              <Popup>
                <b>{unit.name}</b>
                <br />
                Status: {unit.status}
                <br />
                Team: {unit.team}
              </Popup>
            </Marker>
          ))}

        {/* =========================
            SHELTERS
        ========================= */}

        {layers.shelters &&
          shelters.map((shelter) => (
            <Marker
              key={shelter.id}
              position={shelter.position}
              icon={shelterIcon}
            >
              <Popup>
                <b>{shelter.name}</b>
                <br />
                Capacity: {shelter.capacity}
                <br />
                Occupied: {shelter.occupied}
              </Popup>
            </Marker>
          ))}

        {/* =========================
            ACTIVE ROUTE
        ========================= */}

        {layers.routes && (
          <RouteLoader onRouteLoaded={handleRouteLoaded} />
        )}

        {layers.routes && routeInfo?.coordinates && (
          <Polyline
            positions={routeInfo.coordinates}
            pathOptions={{
              color: "#a855f7",
              weight: 6,
              opacity: 0.95,
            }}
          />
        )}
      </MapContainer>

      {/* =========================
          BOTTOM RIGHT STATUS
      ========================= */}

      <Glass className="absolute bottom-5 right-5 z-[1000] w-[250px] rounded-xl p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crosshair size={16} className="text-cyan-400" />

            <span className="text-xs font-semibold">
              Operational Status
            </span>
          </div>

          <span className="text-[9px] text-emerald-400">
            LIVE
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-slate-500">
              Active Incidents
            </span>

            <span className="text-red-400">
              2
            </span>
          </div>

          <div className="flex items-center justify-between text-[10px]">
            <span className="text-slate-500">
              Rescue Units
            </span>

            <span className="text-cyan-400">
              3
            </span>
          </div>

          <div className="flex items-center justify-between text-[10px]">
            <span className="text-slate-500">
              Shelters
            </span>

            <span className="text-emerald-400">
              2
            </span>
          </div>

          <div className="flex items-center justify-between text-[10px]">
            <span className="text-slate-500">
              Blocked Roads
            </span>

            <span className="text-orange-400">
              1
            </span>
          </div>
        </div>
      </Glass>
    </div>
  );
}
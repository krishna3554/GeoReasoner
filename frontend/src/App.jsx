import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import DisasterMap from "./pages/DisasterMap";
import Incidents from "./pages/Incidents";
import DamageAnalysis from "./pages/DamageAnalysis";
import Reports from "./pages/Reports";
import RoutesPage from "./pages/Routes";
import Resources from "./pages/Resources";
import Protocols from "./pages/Protocols";

function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-slate-950 text-white">
        <Sidebar />

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/map" element={<DisasterMap />} />
            <Route path="/incidents" element={<Incidents />} />
            <Route path="/damage-analysis" element={<DamageAnalysis />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/routes" element={<RoutesPage />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/protocols" element={<Protocols />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
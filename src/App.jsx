import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Layout/Sidebar';
import TopBar from './components/Layout/TopBar';
import IngresosTotales from './pages/IngresosTotales';
import IngresosOrigen from './pages/IngresosOrigen';
import IngresosCiudad from './pages/IngresosCiudad';
import IngresosAerolineas from './pages/IngresosAerolineas';
import IngresosPlazas from './pages/IngresosPlazas';
import OtrosIngresos from './pages/OtrosIngresos';
import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Sidebar />
        <TopBar />
        <main className="app__main">
          <Routes>
            <Route path="/" element={<Navigate to="/ingresos-totales" replace />} />
            
            {/* Ingresos Totales */}
            <Route path="/ingresos-totales" element={<IngresosTotales />} />
            <Route path="/totales" element={<Navigate to="/ingresos-totales" replace />} />
            
            {/* Ingresos Origen (Aeropuerto) */}
            <Route path="/ingresos-origen" element={<IngresosOrigen />} />
            <Route path="/origen" element={<Navigate to="/ingresos-origen" replace />} />
            
            {/* Ingresos Ciudad */}
            <Route path="/ingresos-ciudad" element={<IngresosCiudad />} />
            <Route path="/ciudad" element={<Navigate to="/ingresos-ciudad" replace />} />
            
            {/* Ingresos Aerolíneas */}
            <Route path="/ingresos-aerolineas" element={<IngresosAerolineas />} />
            <Route path="/aerolineas" element={<Navigate to="/ingresos-aerolineas" replace />} />
            <Route path="/ingresos-aerolíneas" element={<Navigate to="/ingresos-aerolineas" replace />} />
            
            {/* Ingresos Plazas */}
            <Route path="/ingresos-plazas" element={<IngresosPlazas />} />
            <Route path="/plazas" element={<Navigate to="/ingresos-plazas" replace />} />
            
            {/* Otros Ingresos */}
            <Route path="/otros-ingresos" element={<OtrosIngresos />} />
            <Route path="/otros" element={<Navigate to="/otros-ingresos" replace />} />
            
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/ingresos-totales" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

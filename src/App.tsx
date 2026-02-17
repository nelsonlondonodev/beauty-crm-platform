import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          {/* Add more routes here as we build them */}
          <Route path="/clients" element={<div className="p-4">Gestión de Clientes (Próximamente)</div>} />
          <Route path="/calendar" element={<div className="p-4">Agenda (Próximamente)</div>} />
          <Route path="/settings" element={<div className="p-4">Configuración (Próximamente)</div>} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;

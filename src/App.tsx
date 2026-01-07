import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import RegisterPage from './pages/RegisterPage';
import ExitPage from './pages/ExitPage';
import Tienda from './pages/Tiendas';
import Home from './pages/Home'; // Importamos tu nueva página Home
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 1. Ruta Raíz: Si la URL está vacía, muestra el Home */}
        <Route path="/" element={<Home />} />

        {/* 2. Ruta de Configuración / Selección de Tienda */}
        <Route path="/tiendas" element={<Tienda />} />

        {/* 3. Ruta de Salida */}
        <Route path="/exit" element={<ExitPage />} />

        {/* 4. Ruta Dinámica con storeId: 
             Si la URL tiene algo (ej: /105), abre el registro/ruleta.
        */}
        <Route path="/:storeId" element={<RegisterPage />} />

        {/* 5. Redirección de seguridad: 
             Si escriben algo que no existe después de una ruta conocida 
        */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
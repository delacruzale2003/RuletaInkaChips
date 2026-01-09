import React from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Settings, Menu } from 'lucide-react';

const Home: React.FC = () => {
    const navigate = useNavigate();
    const { storeId: paramStoreId } = useParams<{ storeId: string }>();
    const [searchParams] = useSearchParams();

    const activeStoreId = paramStoreId || searchParams.get("store");

    const goToStores = () => {
        if (activeStoreId) {
            navigate(`/tiendas?store=${activeStoreId}`);
        } else {
            navigate('/tiendas');
        }
    };

    const goToRegistros = () => {
        navigate('/registros'); // Ajusta esta ruta según tu App.tsx
    };

    return (
        <div className="relative min-h-screen bg-black flex flex-col items-center justify-center p-4 overflow-hidden">
            
            {/* 1. Logo centrado exactamente en el medio */}
            <div className="flex-1 flex items-center justify-center">
                <img 
                    src="/inkachipslogo.png" 
                    alt="Logo Inka Chips" 
                    className="w-55 h-auto drop-shadow-2xl" 
                />
            </div>

            {/* 2. Navbar Inferior con los dos botones */}
            <div className="absolute bottom-10 w-full flex justify-center items-center gap-6 px-4">
                
                {/* Botón de Registros (3 rayas) */}
                <button
                    onClick={goToRegistros}
                    style={{ backgroundColor: '#65c7c3' }}
                    className="flex items-center justify-center w-14 h-14 rounded-full text-white shadow-lg transform transition-all active:scale-90 hover:brightness-70"
                    title="Registros"
                >
                    <Menu size={28} />
                </button>

                {/* Botón de Configuración (Settings) */}
                <button
                    onClick={goToStores}
                    style={{ backgroundColor: '#65c7c3' }}
                    className="flex items-center justify-center w-14 h-14 rounded-full text-white shadow-lg transform transition-all active:scale-90 hover:brightness-70"
                    title="Configuración"
                >
                    <Settings size={28} />
                </button>
            </div>

        </div>
    );
};

export default Home;
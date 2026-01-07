import React from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Settings } from 'lucide-react';

const Home: React.FC = () => {
    const navigate = useNavigate();
    const { storeId: paramStoreId } = useParams<{ storeId: string }>();
    const [searchParams] = useSearchParams();

    // Mantenemos la lógica de storeId para que el flujo no se pierda
    const activeStoreId = paramStoreId || searchParams.get("store");

    const goToStores = () => {
        if (activeStoreId) {
            navigate(`/tiendas?store=${activeStoreId}`);
        } else {
            navigate('/tiendas');
        }
    };

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
            {/* Contenedor del Logo */}
            <div className="mb-8">
                <img 
                    src="/inkachipslogo.png" 
                    alt="Logo Sodimac" 
                    className="w-64 h-auto drop-shadow-md" 
                />
            </div>

            {/* Botón con el color específico #65c7c3 */}
            <button
                onClick={goToStores}
                style={{ backgroundColor: '#65c7c3' }}
                className="flex items-center gap-2 px-3 py-3 rounded-full text-white font-bold text-xl shadow-lg transform transition-transform active:scale-95 hover:brightness-110 mt-20"
            >
                <Settings size={24} />
                
            </button>
        </div>
    );
};

export default Home;
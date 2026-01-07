import React, { useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom"; 
import { useRegistration } from "../hooks/useRegistration";
import { Settings, X, MapPin } from 'lucide-react'; // Agregué MapPin para decorar el nombre

const RegisterPage: React.FC = () => {
    const navigate = useNavigate();
    const { storeId: paramStoreId } = useParams<{ storeId: string }>(); 
    const [searchParams] = useSearchParams();
    
    const activeStoreId = paramStoreId || searchParams.get("store");

    const [showGif, setShowGif] = useState(false);
    const [showTermsModal, setShowTermsModal] = useState(true);

    // ⚠️ He agregado 'storeName'. Asegúrate de que tu hook lo devuelva.
    // Si tu hook no lo devuelve aún, el código usará el ID como fallback visualmente.
    const { loading, message, handleSpin, storeName } = useRegistration(); 

    const goToStores = () => {
        if (activeStoreId) {
            navigate(`/tiendas?store=${activeStoreId}`);
        } else {
            navigate('/tiendas');
        }
    };

    const onSpinClick = async () => {
        if (showGif || loading || !activeStoreId) return;

        const result = await handleSpin();

        if (result.success && result.prizeName) {
            setShowGif(true);

            setTimeout(() => {
                navigate('/exit', {
                    state: { 
                        prizeName: result.prizeName, 
                        registerId: result.registerId,
                        isAnonymous: true,
                        storeId: activeStoreId 
                    },
                });
            }, 4000); 
        } 
    };

    const BRAND_ORANGE = "#000000ff"; 
    const containerStyle = { backgroundColor: BRAND_ORANGE };
    
    return (
        <div style={containerStyle} className="min-h-screen flex flex-col items-center justify-center p-4 overflow-hidden relative font-sans">
            
            <div className="absolute inset-0 bg-[url('/pattern.png')] opacity-10 pointer-events-none"></div>

            <img src="/inkachipslogo.png" alt="logo" className="w-40 h-auto mb-4 z-10 drop-shadow-md" />

            <div className="z-10 text-center mb-3">
                {/* Espacio reservado para título si se necesita */}
            </div>

            {/* === CONTENEDOR DE LA RULETA (IMAGEN/GIF) === */}
            <div className="relative z-10 w-80 h-80 sm:w-96 sm:h-96 flex items-center justify-center">
                
                {/* Flecha indicadora */}
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 z-30 pointer-events-none">
                    <img 
                        src="/downarrow.png" 
                        alt="Flecha Ganadora" 
                        className="w-20 h-20 object-contain drop-shadow-2xl"
                    />
                </div>

                {/* IMAGEN DE FONDO (Ruleta) */}
                <img 
                    src={showGif ? "/ruletainkachips.gif" : "/ruletainkachips.png"} 
                    alt="Ruleta" 
                    className="w-full h-full object-contain drop-shadow-2xl"
                />

                {/* BOTÓN CENTRAL (Logo) */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-40">
                    <style>{`
                        @keyframes heartbeat {
                            0%, 100% { transform: scale(1); }
                            50% { transform: scale(1.1); }
                        }
                        .animate-heartbeat {
                            animation: heartbeat 1.5s infinite ease-in-out;
                        }
                    `}</style>

                    <button
                        onClick={onSpinClick}
                        disabled={showGif || loading || !activeStoreId}
                        className={`
                            w-33 h-33 rounded-full bg-gray-900 border-2 border-white shadow-lg
                            flex items-center justify-center transition-transform hover:scale-110 active:scale-95
                            ${showGif ? 'cursor-default' : 'cursor-pointer animate-heartbeat'}
                        `}
                    >
                        {loading ? (
                            <span className="text-xs text-black font-bold">...</span>
                        ) : (
                            <img 
                                src="/inkachipslogo.png" 
                                alt="GO" 
                                className="w-21 h-21 object-contain" 
                            />
                        )}
                    </button>
                </div>
            </div>
            
            {/* === NAVBAR INFERIOR CON NOMBRE DE TIENDA === */}
            <div className="z-20 mt-10 flex flex-col items-center gap-3">
                
                {/* Fila de Botones */}
                <div className="flex items-center gap-4">
                    {/* BOTÓN JUEGA AQUÍ */}
                    <button 
                        onClick={onSpinClick} 
                        disabled={showGif || loading || !activeStoreId}
                        style={{ backgroundColor: '#5dc4c0' }}
                        className={`
                            flex items-center px-8 py-2 rounded-full text-white font-black shadow-lg transform transition-all border-2 border-transparent
                            ${showGif || loading || !activeStoreId 
                                ? 'grayscale opacity-70 cursor-not-allowed' 
                                : 'hover:brightness-110 active:scale-95' 
                            }
                        `}
                    >
                        <span className="text-2xl tracking-tight font-creativeLand">Juega Aqui</span>
                    </button>

                    {/* BOTÓN SETTINGS */}
                    <button 
                        onClick={goToStores}
                        disabled={showGif} 
                        style={{ backgroundColor: '#5dc4c0' }}
                        className={`
                            flex items-center justify-center w-12 h-12 rounded-full text-white border-2 border-white/20 shadow-lg transform transition-transform 
                            ${showGif 
                                ? 'grayscale opacity-50 cursor-not-allowed' 
                                : 'active:scale-95 hover:brightness-110'
                            }
                        `}
                    >
                        <Settings size={28} />
                    </button>
                </div>

                {/* === NOMBRE DE LA TIENDA (NUEVO) === */}
                {activeStoreId && (
                    <div className="flex items-center gap-1 text-white/80 mt-1 animate-fade-in">
                        <MapPin size={14} className="text-[#5dc4c0]" />
                        <span className="text-sm font-medium tracking-wide uppercase">
                            {storeName || `Tienda: ${activeStoreId}`}
                        </span>
                    </div>
                )}
            
            </div>

            {message && (
                <div className="mt-4 z-20 bg-white/90 text-red-600 px-4 py-2 rounded-lg font-bold shadow-lg text-center mx-4">
                    {message}
                </div>
            )}
            
             {showTermsModal && (
                <div className="fixed inset-0 bg-gray-900/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                     <div className="bg-white rounded-3xl p-6 w-full max-w-md max-h-[85vh] flex flex-col shadow-2xl">
                        <div className="flex justify-between items-center mb-4 border-b pb-2">
                            <h2 className="text-2xl font-black text-gray-800 uppercase italic">Términos y Condiciones</h2>
                            <button onClick={() => setShowTermsModal(false)} className="text-gray-500 hover:text-red-500">
                                <X size={28} />
                            </button>
                        </div>
                        <div className="flex-grow overflow-y-auto text-gray-600 text-sm space-y-3 pr-2 scrollbar-thin scrollbar-thumb-orange-500">
                            <p><strong>Vigencia:</strong> Hasta el 31 de enero del 2026.</p>
                            {/* Puedes agregar más texto aquí */}
                        </div>
                        <button
                            onClick={() => setShowTermsModal(false)}
                            className="mt-4 w-full py-3 rounded-xl text-white font-bold text-xl shadow-md transition-transform active:scale-95"
                            style={{ backgroundColor: BRAND_ORANGE }}
                        >
                            ACEPTAR
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RegisterPage;
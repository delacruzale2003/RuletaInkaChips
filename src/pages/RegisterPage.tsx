import React, { useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom"; 
import { useRegistration } from "../hooks/useRegistration";
import { Settings, MapPin, User, FileText, Phone, Check } from 'lucide-react';

const RegisterPage: React.FC = () => {
    const navigate = useNavigate();
    const { storeId: paramStoreId } = useParams<{ storeId: string }>(); 
    const [searchParams] = useSearchParams();
    
    const activeStoreId = paramStoreId || searchParams.get("store");

    const [showGif, setShowGif] = useState(false);
    
    // Estados para controlar los modales
    // Eliminado: const [showTermsModal, setShowTermsModal] = useState(true);
    const [showRegisterModal, setShowRegisterModal] = useState(true); // Ahora inicia en true
    const [isRegistered, setIsRegistered] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(false); // Nuevo estado para el checkbox

    const { 
        loading, 
        message, 
        handleSpin, 
        storeName,
        name, setName,
        dni, setDni,
        phoneNumber, setPhoneNumber
    } = useRegistration(); 

    const goToStores = () => {
        if (activeStoreId) {
            navigate(`/tiendas?store=${activeStoreId}`);
        } else {
            navigate('/tiendas');
        }
    };

    const handleRegisterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Validamos campos y checkbox
        if (name && dni && phoneNumber && termsAccepted) {
            setShowRegisterModal(false);
            setIsRegistered(true);
        }
    };

    const onSpinClick = async () => {
        if (showGif || loading || !activeStoreId || !isRegistered) {
            if (!isRegistered && !loading && !showGif) setShowRegisterModal(true);
            return;
        }

        const result = await handleSpin();

        if (result.success && result.prizeName) {
            setShowGif(true);
            setTimeout(() => {
                navigate('/exit', {
                    state: { 
                        prizeName: result.prizeName, 
                        registerId: result.registerId,
                        isAnonymous: false,
                        storeId: activeStoreId 
                    },
                });
            }, 4000); 
        } 
    };

    const BRAND_ORANGE = "#000000ff"; 
    const containerStyle = { backgroundColor: BRAND_ORANGE };
    const TURQUOISE = '#5dc4c0';
    
    return (
        <div style={containerStyle} className="min-h-screen flex flex-col items-center justify-center p-4 overflow-hidden relative font-sans">
            
            <div className="absolute inset-0 bg-[url('/pattern.png')] opacity-10 pointer-events-none"></div>

            <img src="/inkachipslogo.png" alt="logo" className="w-40 h-auto mb-4 z-10 drop-shadow-md" />

            {/* === CONTENEDOR DE LA RULETA === */}
            <div className={`relative z-10 w-80 h-80 sm:w-96 sm:h-96 flex items-center justify-center transition-opacity duration-500 ${!isRegistered ? 'opacity-50 blur-sm' : 'opacity-100'}`}>
                
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 z-30 pointer-events-none">
                    <img src="/downarrow.png" alt="Flecha Ganadora" className="w-20 h-20 object-contain drop-shadow-2xl"/>
                </div>

                <img 
                    src={showGif ? "/ruletainkachips.gif" : "/ruletainkachips.png"} 
                    alt="Ruleta" 
                    className="w-full h-full object-contain drop-shadow-2xl"
                />

                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-40">
                    <style>{`
                        @keyframes heartbeat {
                            0%, 100% { transform: scale(1); }
                            50% { transform: scale(1.1); }
                        }
                        .animate-heartbeat { animation: heartbeat 1.5s infinite ease-in-out; }
                    `}</style>

                    <button
                        onClick={onSpinClick}
                        disabled={showGif || loading || !activeStoreId || !isRegistered}
                        className={`
                            w-33 h-33 rounded-full bg-gray-900 border-2 border-white shadow-lg
                            flex items-center justify-center transition-transform hover:scale-110 active:scale-95
                            ${(showGif || !isRegistered) ? 'cursor-default' : 'cursor-pointer animate-heartbeat'}
                        `}
                    >
                        {loading ? (
                            <span className="text-xs text-white font-bold">...</span>
                        ) : (
                            <img src="/inkachipslogo.png" alt="GO" className="w-21 h-21 object-contain" />
                        )}
                    </button>
                </div>
            </div>
            
            {/* === NAVBAR INFERIOR === */}
            <div className="z-20 mt-10 flex flex-col items-center gap-3">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={onSpinClick} 
                        disabled={showGif || loading || !activeStoreId || !isRegistered}
                        style={{ backgroundColor: TURQUOISE }}
                        className={`
                            flex items-center px-8 py-2 rounded-full text-white font-black shadow-lg transform transition-all border-2 border-transparent
                            ${showGif || loading || !activeStoreId || !isRegistered
                                ? 'grayscale opacity-70 cursor-not-allowed' 
                                : 'hover:brightness-110 active:scale-95' 
                            }
                        `}
                    >
                        <span className="text-2xl tracking-tight font-creativeLand">
                            {isRegistered ? "Juega Aqui" : "Regístrate"}
                        </span>
                    </button>

                    <button 
                        onClick={goToStores}
                        disabled={showGif} 
                        style={{ backgroundColor: TURQUOISE }}
                        className={`
                            flex items-center justify-center w-12 h-12 rounded-full text-white border-2 border-white/20 shadow-lg transform transition-transform 
                            ${showGif ? 'grayscale opacity-50 cursor-not-allowed' : 'active:scale-95 hover:brightness-110'}
                        `}
                    >
                        <Settings size={28} />
                    </button>
                </div>

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
                <div className="mt-4 z-20 bg-white/90 text-red-600 px-4 py-2 rounded-lg font-bold shadow-lg text-center mx-4 max-w-xs">
                    {message}
                </div>
            )}
            
            {/* ======================================= */}
            {/* 2. MODAL DE REGISTRO (FORMULARIO)       */}
            {/* ======================================= */}
            {showRegisterModal && (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
        <div className="bg-black border border-white  font-mont-bold rounded-3xl p-5  w-full max-w-98 shadow-2xl relative mt-10">
            
            {/* --- IMAGEN FLOTANTE SUPERIOR --- */}
            <div className="absolute -top-35 left-1/2 transform -translate-x-1/2 z-20">
                <img 
                    src="/inkachipslogo.png" 
                    alt="Logo InkaChips" 
                    className="w-45 h-auto drop-shadow-lg" 
                />
            </div>

            {/* Cabecera del Formulario */}
            <div className="text-center mb-6 ">
                <h2 className="text-xl font-bold text-white mb-1 ">1.REGISTRATE PARA PARTICIPAR</h2>
                <p className="text-white text-sm text-start">Llena tus datos y participa por fabulosos premios</p>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-4">
                
                {/* Input Nombre */}
                <div>
                    <label className="block text-white text-sm font-bold mb-1 ">Nombres y Apellidos</label>
                    <div className="relative">
                        
                        <input 
                            type="text" 
                            placeholder="Ej. Juan Pérez"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="w-full pl-5 pr-4 py-2 bg-black border border-white rounded-full text-white placeholder-gray-500 focus:outline-none focus:border-[#65c7c3] focus:ring-1 focus:ring-[#65c7c3] transition-colors"
                        />
                    </div>
                </div>

                {/* Input DNI */}
                <div>
                    <label className="block text-white text-sm font-bold mb-1 ">Número de DNI</label>
                    <div className="relative">
                        
                        <input 
                            type="tel" 
                            placeholder="8 dígitos"
                            value={dni}
                            onChange={(e) => setDni(e.target.value)}
                            maxLength={11}
                            required
                            className="w-full pl-5 pr-4 py-2 bg-black border border-white rounded-full text-white placeholder-gray-500 focus:outline-none focus:border-[#65c7c3] focus:ring-1 focus:ring-[#65c7c3] transition-colors"
                        />
                    </div>
                </div>

                {/* Input Teléfono */}
                <div>
                    <label className="block text-white text-sm font-bold mb-1 ">Teléfono</label>
                    <div className="relative">
                        
                        <input 
                            type="tel" 
                            placeholder="9 dígitos"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            maxLength={9}
                            required
                            className="w-full pl-5 pr-4 py-2 bg-black border border-white rounded-full text-white placeholder-gray-500 focus:outline-none focus:border-[#65c7c3] focus:ring-1 focus:ring-[#65c7c3] transition-colors"
                        />
                    </div>
                </div>

                {/* CHECKBOX TÉRMINOS Y CONDICIONES */}
                <div className="flex items-start gap-3 mt-4 px-2">
                    <div className="relative flex items-center pt-1">
                        <input
                            type="checkbox"
                            id="terms"
                            checked={termsAccepted}
                            onChange={(e) => setTermsAccepted(e.target.checked)}
                            className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-white bg-transparent transition-all checked:bg-[#65c7c3] checked:border-[#65c7c3]"
                        />
                        {/* Icono check blanco */}
                        <div className="pointer-events-none absolute top-1 left-0 text-white opacity-0 peer-checked:opacity-100 flex items-center justify-center w-5 h-5">
                            <Check size={14} strokeWidth={4} />
                        </div>
                    </div>
                    <label htmlFor="terms" className="text-xs text-gray-300 cursor-pointer select-none leading-tight">
                        Acepto los términos y condiciones de uso de imagen para fines publicitarios.
                    </label>
                </div>

                {/* BOTÓN ENVIAR */}
                <button
                    type="submit"
                    disabled={!termsAccepted}
                    className={`w-full mt-6 py-3 rounded-full text-white font-black text-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2 tracking-widest
                        ${termsAccepted 
                            ? 'hover:brightness-110 shadow-[0_0_15px_rgba(101,199,195,0.4)]' 
                            : 'opacity-50 cursor-not-allowed grayscale'
                        }
                    `}
                    style={{ backgroundColor: '#65c7c3' }}
                >
                    ENVIAR
                </button>
            </form>
        </div>
    </div>
)}
        </div>
    );
};

export default RegisterPage;
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { API_URL, CAMPAIGN_ID } from "../constants/RegistrationConstants";
import type { RouteParams } from "../constants/RegistrationConstants";

export interface SpinResult {
    success: boolean;
    prizeName?: string;
    registerId?: string;
}

// 1. Actualizamos la interfaz para incluir los setters y valores del formulario
interface RouletteHook {
    loading: boolean;
    message: string;
    storeId: string | undefined;
    storeName: string;
    // Campos del formulario
    name: string;
    dni: string;
    phoneNumber: string;
    setName: (val: string) => void;
    setDni: (val: string) => void;
    setPhoneNumber: (val: string) => void;
    // Acción
    handleSpin: () => Promise<SpinResult>; 
}

export const useRegistration = (): RouletteHook => {
    // === ESTADOS ===
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [storeName, setStoreName] = useState("");
    
    // === NUEVOS ESTADOS PARA EL FORMULARIO ===
    const [name, setName] = useState("");
    const [dni, setDni] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");

    // === HOOKS DE ROUTER ===
    const { storeId } = useParams<RouteParams>();

    // === OBTENER INFO DE LA TIENDA AL CARGAR (Sin cambios) ===
    useEffect(() => {
        const fetchStoreInfo = async () => {
            if (!storeId) return;

            try {
                const res = await fetch(`${API_URL}/api/v1/admin/stores/${storeId}`);
                
                if (res.ok) {
                    const json = await res.json();
                    if (json.success && json.data) {
                        setStoreName(json.data.name);
                    }
                } else {
                    console.error("Error en respuesta del servidor:", res.status);
                }
            } catch (error) {
                console.error("Error de conexión:", error);
            }
        };

        fetchStoreInfo();
    }, [storeId]);

    // === ACCIÓN DE REGISTRAR Y GIRAR (ACTUALIZADO) ===
    const handleSpin = async (): Promise<SpinResult> => {
        setMessage("");
        
        // 1. Validación local antes de enviar
        if (!storeId) {
            setMessage("Error: No se identificó la tienda.");
            return { success: false };
        }
        if (!name.trim() || !dni.trim() || !phoneNumber.trim()) {
            setMessage("⚠️ Por favor completa todos los datos para jugar.");
            return { success: false };
        }

        setLoading(true);

        try {
            // 2. Llamada al nuevo endpoint '/register-spin'
            const res = await fetch(`${API_URL}/api/v1/register-spin`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    storeId, 
                    campaign: CAMPAIGN_ID,
                    // Enviamos los datos del formulario
                    name, 
                    dni, 
                    phoneNumber 
                }),
            });
            
            const resJson = await res.json();

            if (res.ok) {
                return { 
                    success: true, 
                    prizeName: resJson.prize, 
                    registerId: resJson.registerId 
                };
            } else {
                setMessage(`⚠️ ${resJson.message || "Error al procesar el giro."}`);
                return { success: false };
            }
        } catch (err) {
            console.error(err);
            setMessage("❌ Error de conexión con el servidor.");
            return { success: false };
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        message,
        storeId,
        storeName,
        // Retornamos los estados y setters para usarlos en los inputs
        name, setName,
        dni, setDni,
        phoneNumber, setPhoneNumber,
        handleSpin,
    };
};
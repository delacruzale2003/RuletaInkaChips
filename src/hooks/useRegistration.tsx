import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { API_URL, CAMPAIGN_ID } from "../constants/RegistrationConstants";
import type { RouteParams } from "../constants/RegistrationConstants";

export interface SpinResult {
    success: boolean;
    prizeName?: string;
    registerId?: string;
}

// 2. Actualizamos la interfaz del Hook para incluir storeName
interface RouletteHook {
    loading: boolean;
    message: string;
    storeId: string | undefined;
    storeName: string; // <--- NUEVO
    handleSpin: () => Promise<SpinResult>; 
}

export const useRegistration = (): RouletteHook => {
    // === ESTADOS ===
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [storeName, setStoreName] = useState(""); // <--- Estado para el nombre

    // === HOOKS DE ROUTER ===
    const { storeId } = useParams<RouteParams>();

    // === NUEVO: OBTENER INFO DE LA TIENDA AL CARGAR ===
    useEffect(() => {
    const fetchStoreInfo = async () => {
        if (!storeId) return;

        try {
            const res = await fetch(`${API_URL}/api/v1/admin/stores/${storeId}`);
            
            if (res.ok) {
                const json = await res.json();
                
                // Según tu captura de pantalla:
                // El objeto tiene: { data: { name: "test", ... }, success: true, ... }
                if (json.success && json.data) {
                    setStoreName(json.data.name); // <--- Cambiamos esta línea para entrar a .data
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

    // === ACCIÓN DE GIRAR ===
    const handleSpin = async (): Promise<SpinResult> => {
        setMessage("");
        
        if (!storeId) return { success: false };

        setLoading(true);

        try {
            const res = await fetch(`${API_URL}/api/v1/spin-roulette`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ storeId, campaign: CAMPAIGN_ID }),
            });
            const resJson = await res.json();

            if (res.ok) {
                return { 
                    success: true, 
                    prizeName: resJson.prize, 
                    registerId: resJson.registerId 
                };
            } else {
                setMessage(`⚠️ ${resJson.message || "Error"}`);
                return { success: false };
            }
        } catch (err) {
            setMessage("❌ Error de conexión");
            return { success: false };
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        message,
        storeId,
        storeName, // <--- Retornamos el nombre para usarlo en la UI
        handleSpin,
    };
};
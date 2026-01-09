import { useEffect, useState } from 'react';
import {
    IconX,
} from "@tabler/icons-react";
import { CircleArrowDown } from "lucide-react";
import { motion } from "framer-motion";
import * as XLSX from 'xlsx';

// ==========================================================
// 🚨 Tipos Actualizados (SQL/Express)
// ==========================================================

interface Tienda {
    id: string;
    name: string;
}

interface Registro {
    id: string;
    store_id: string;
    prize_id: string;
    name: string;
    phone_number: string;
    dni: string;
    campaign: string;
    status: string;
    created_at: string;
    store_name: string;
    prize_name: string;
    photo_url: string;
}

interface LatestRegister extends Registro {
    store_name: string;
    prize_name: string;
    photo_url: string;
}

export default function Registross() {
    const [registros, setRegistros] = useState<LatestRegister[]>([]);
    const [modalFoto, setModalFoto] = useState<string | null>(null);
    const [cargando, setCargando] = useState(false);

    const campaignName = import.meta.env.VITE_CAMPAIGN || 'CAMPAÑA_DEFAULT';

    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

    const apiAdmin = `${API_BASE_URL}/api/v1/admin`;

    const [tiendaSeleccionada, setTiendaSeleccionada] = useState<string>('');
    const [tiendasUnicas, setTiendasUnicas] = useState<Tienda[]>([]);

    // --- CARGAR REGISTROS (FILTRADO y con CANCELACIÓN) ---
    useEffect(() => {
        const controller = new AbortController();
        const signal = controller.signal;

        const fetchRegistros = async () => {
            setCargando(true);
            try {
                const queryParams = new URLSearchParams({
                    campaign: campaignName,
                });

                if (tiendaSeleccionada) {
                    queryParams.append('storeId', tiendaSeleccionada);
                }

                const res = await fetch(`${apiAdmin}/registers/latest?${queryParams.toString()}`, { signal });

                // Si la petición fue cancelada, ignoramos la respuesta
                if (signal.aborted) return;

                if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);

                const result = await res.json();

                setRegistros(result.data || []);

            } catch (err: any) {
                if (err.name === 'AbortError') return;
                console.error('Error cargando registros:', err);
            } finally {
                setCargando(false);
            }
        };

        fetchRegistros();

        return () => {
            controller.abort();
        };
    }, [tiendaSeleccionada, campaignName, apiAdmin]);

    // --- CARGAR TIENDAS ---
    useEffect(() => {
        const fetchTiendas = async () => {
            try {
                const res = await fetch(`${apiAdmin}/stores?page=1&limit=100&campaign=${campaignName}`);
                if (!res.ok) return;
                const result = await res.json();
                setTiendasUnicas(result.data.stores || []);
            } catch (err) {
                console.error('Error cargando tiendas:', err);
            }
        };
        fetchTiendas();
    }, [campaignName, apiAdmin]);

    // --- FORMATO DE FECHA ---
    const convertirFechaPeru = (fechaUTC: string) => {
        if (!fechaUTC) return '-';
        const fecha = new Date(fechaUTC);
        const opciones: Intl.DateTimeFormatOptions = {
            timeZone: 'America/Lima',
            day: '2-digit', month: '2-digit', year: '2-digit',
            hour: 'numeric', minute: '2-digit', hour12: true,
        };
        return fecha.toLocaleString('es-PE', opciones);
    };

    // --- EXPORTACIÓN GENERAL (Descarga de la Campaña Completa) ---
    const handleDescargarCampaña = async () => {
        try {
            const res = await fetch(`${apiAdmin}/registers/latest?campaign=${campaignName}&limit=99999`);
            const result = await res.json();

            // 💡 MODIFICADO: Se eliminaron Teléfono y DNI del mapeo
            const filas = (result.data || []).map((r: LatestRegister) => ({
                'ID Registro': r.id, 
                'Tienda': r.store_name ?? 'Desconocida', 
                //'Nombre Cliente': r.name ?? '—',
                // 'Teléfono': r.phone_number ?? '—',  <-- Eliminado
                // 'DNI': r.dni ?? '—',                <-- Eliminado
                'Estado': r.prize_name ? 'GANADOR' : 'NO GANÓ',
                'Premio': r.prize_name ?? '—', 
                'Fecha Registro': convertirFechaPeru(r.created_at),
            }));

            const hoja = XLSX.utils.json_to_sheet(filas);
            const libro = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(libro, hoja, 'Registros');
            XLSX.writeFile(libro, `registros_${campaignName}_completo.xlsx`);
        } catch (err) {
            console.error('Error al descargar campaña:', err);
            alert('Error al descargar. Revisa la consola.'); 
        }
    };

    // --- EXPORTACIÓN FILTRADA POR TIENDA ---
    const handleDescargarTienda = async () => {
        if (!tiendaSeleccionada) return;

        const selectedStoreName = tiendasUnicas.find(t => t.id === tiendaSeleccionada)?.name || 'Tienda';

        try {
            const res = await fetch(`${apiAdmin}/registers/latest?campaign=${campaignName}&storeId=${tiendaSeleccionada}&limit=99999`);
            const result = await res.json();

            // 💡 MODIFICADO: Se eliminaron Teléfono y DNI del mapeo
            const filas = (result.data || []).map((r: LatestRegister) => ({
                'Tienda': r.store_name, 
                //'Cliente': r.name, 
                // 'Teléfono': r.phone_number,  <-- Eliminado
                // 'DNI': r.dni,                <-- Eliminado
                'Premio': r.prize_name ?? '—', 
                'Fecha Registro': convertirFechaPeru(r.created_at),
            }));

            const hoja = XLSX.utils.json_to_sheet(filas);
            const libro = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(libro, hoja, 'Registros');
            XLSX.writeFile(libro, `registros_tienda_${selectedStoreName}.xlsx`);
        } catch (err) {
            console.error('Error al descargar tienda:', err);
            alert('Error al descargar por tienda. Revisa la consola.');
        }
    };

    // --- RENDERIZADO ---
    return (
        <div className="p-4 bg-black min-h-screen">
            <h1 className="text-2xl font-bold text-gray-100 mb-4">
                Registros de premios: {campaignName}
            </h1>

            <div className="flex gap-4 mb-6 flex-wrap">
                {/* Botón Negro (Campaña Completa) */}
                <button
                    onClick={handleDescargarCampaña}
                    className="flex items-center gap-3 px-4 py-2.5 bg-gray-100 text-black hover:border rounded-full hover:bg-black transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 hover:text-white"
                >
                    <CircleArrowDown size={20} strokeWidth={1.5} />
                    <span className="font-medium">Descargar campaña completa</span>
                </button>

                {/* Botón Blanco (Tienda Seleccionada) */}
                <button
                    onClick={handleDescargarTienda}
                    disabled={!tiendaSeleccionada}
                    className="flex items-center gap-3 px-6 py-2.5 bg-white text-gray-900 border border-gray-200 rounded-full hover:bg-black disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 hover:text-white"
                >
                    <CircleArrowDown size={20} strokeWidth={1.5} />
                    <span className="font-medium">
                        Descargar tienda {tiendaSeleccionada ? `(${tiendasUnicas.find(t => t.id === tiendaSeleccionada)?.name})` : ''}
                    </span>
                </button>
            </div>
            <div className="max-w-sm mb-4">
                <label className="block text-sm text-white mb-1">Filtrar por tienda</label>
                <select
                    value={tiendaSeleccionada}
                    // Al cambiar el filtro, solo actualizamos el estado, y el useEffect se encarga de llamar a fetchRegistros
                    onChange={(e) => { setTiendaSeleccionada(e.target.value); }}
                    className="w-full px-3 py-2 rounded-md border border-gray-300 text-white bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">Todas las tiendas ({campaignName})</option>
                    {tiendasUnicas.map((t) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                </select>
            </div>

            <div className="overflow-x-auto bg-white rounded-lg shadow">
                {cargando ? (
                    <div className="p-8 text-center text-gray-500 font-medium">Cargando registros...</div>
                ) : (
                    <motion.div
                        key={tiendaSeleccionada || 'all'}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
                    >
                        <table className="min-w-full">
                            <thead className="bg-gray-200 border-b">
                                <tr className="text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                                    <th className="p-3">Tienda</th><th className="p-3">Premio</th><th className="p-3">Fecha</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {registros.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="p-4 text-center text-gray-500">No se encontraron registros.</td>
                                    </tr>
                                ) : registros.map((r) => (
                                    <tr key={r.id} className="hover:bg-gray-50 text-sm text-gray-700 text-center">
                                        <td className="p-2">{r.store_name ?? <span className="text-red-400">Desconocida</span>}</td>
                                        
                                        
                                       
                                        
                                        <td className="p-2">
                                            {r.prize_name ? (
                                                <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs font-bold">
                                                    {r.prize_name}
                                                </span>
                                            ) : (
                                                <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full text-xs">
                                                    No ganó
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-2 text-xs text-gray-500">{convertirFechaPeru(r.created_at)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </motion.div>
                )}
            </div>

            <div className="flex justify-center items-center gap-4 mt-6">
                <span className="text-white text-sm">Mostrando {registros.length} últimos registros</span>
            </div>

            {/* MODAL DE FOTO (Zoom) */}
            {modalFoto && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setModalFoto(null)}>
                    <motion.div
                        className="relative bg-white p-2 rounded-lg max-w-3xl max-h-[90vh] overflow-auto"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setModalFoto(null)}
                            className="absolute top-2 right-2 bg-gray-200 rounded-full p-1 hover:bg-gray-300 text-gray-800 transition z-10"
                        >
                            <IconX size={20} />
                        </button>
                        <img
                            src={modalFoto}
                            alt="Zoom"
                            className="w-full h-auto block max-w-full max-h-[85vh]"
                        />
                    </motion.div>
                </div>
            )}
        </div>
    );
}
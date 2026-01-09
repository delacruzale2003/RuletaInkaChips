import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// Usamos los mismos datos que ya tienes en 'registros'
interface Registro {
    store_name: string;
    prize_name: string | null;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#e1438d'];

export const Dashboard: React.FC<{ data: Registro[] }> = ({ data }) => {

    // 1. Calcular Datos para Gráfico de Barras (Registros por Tienda)
    const dataPorTienda = useMemo(() => {
        const counts: Record<string, number> = {};
        data.forEach(r => {
            const store = r.store_name || 'Desconocida';
            counts[store] = (counts[store] || 0) + 1;
        });
        return Object.keys(counts).map(key => ({ name: key, cantidad: counts[key] }));
    }, [data]);

    // 2. Calcular Datos para Gráfico de Torta (Ganadores vs No Ganadores)
    const dataGanadores = useMemo(() => {
        let ganadores = 0;
        let noGanadores = 0;
        data.forEach(r => {
            if (r.prize_name) ganadores++;
            else noGanadores++;
        });
        return [
            { name: 'Ganadores', value: ganadores },
            { name: 'Sigan Participando', value: noGanadores },
        ];
    }, [data]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-4">
            
            {/* GRÁFICO 1: BARRAS */}
            <div className="bg-white p-4 rounded-xl shadow-lg">
                <h3 className="text-lg font-bold mb-4 text-gray-700">Registros por Tienda</h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={dataPorTienda}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" fontSize={12} tick={{fill: '#666'}} />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="cantidad" fill="#5dc4c0" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* GRÁFICO 2: TORTA */}
            <div className="bg-white p-4 rounded-xl shadow-lg">
                <h3 className="text-lg font-bold mb-4 text-gray-700">Tasa de Premiación</h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={dataGanadores}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {dataGanadores.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={index === 0 ? '#4ade80' : '#f87171'} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};
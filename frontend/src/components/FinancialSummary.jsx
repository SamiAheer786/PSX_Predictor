import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const transformFinancials = (financials) => {
    if (!financials || !Array.isArray(financials)) return [];

    const yearMap = {};

    // Extract keys we want to chart
    const keys = ['EPS', 'DPS', 'BVPS'];

    financials.forEach(metric => {
        if (keys.includes(metric.label)) {
            metric.data.forEach(point => {
                if (!yearMap[point.year]) yearMap[point.year] = { year: point.year };
                yearMap[point.year][metric.label] = parseFloat(point.value);
            });
        }
    });

    return Object.values(yearMap).sort((a, b) => parseInt(a.year) - parseInt(b.year));
};

const FinancialSummary = ({ financials }) => {
    const data = useMemo(() => transformFinancials(financials), [financials]);

    if (!data.length) return <div className="card text-slate-500">No financial data available</div>;

    return (
        <div className="card space-y-4">
            <h3 className="text-lg font-bold text-white border-b border-slate-700 pb-2">Financial Summary</h3>
            <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                        <XAxis dataKey="year" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                        <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }}
                            itemStyle={{ color: '#f1f5f9' }}
                            cursor={{ fill: '#334155', opacity: 0.4 }}
                        />
                        <Legend />
                        <Bar dataKey="EPS" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="DPS" fill="#10b981" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="BVPS" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default FinancialSummary;

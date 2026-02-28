import React from 'react';
import {
    ResponsiveContainer,
    ComposedChart,
    Line,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    Area,
    AreaChart,
    BarChart,
    Cell,
    PieChart,
    Pie,
    LineChart
} from 'recharts';

const COLORS = {
    revenue: '#3b82f6',
    netIncome: '#10b981',
    expenses: '#ef4444',
    assets: '#3b82f6',
    liabilities: '#ef4444',
    equity: '#10b981',
    ocf: '#10b981',
    icf: '#f59e0b',
    fcf: '#8b5cf6',
    margin: '#f59e0b',
    grid: 'rgba(30, 41, 59, 0.5)',
    text: '#94a3b8',
    pie: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']
};

const formatValue = (val) => {
    if (Math.abs(val) >= 1000) return `${(val / 1000).toFixed(1)}B`;
    return `${val.toFixed(0)}M`;
};

const CustomTooltip = ({ active, payload, label, unit = '' }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-2xl backdrop-blur-md">
                <p className="text-white font-bold text-xs mb-2">{label}</p>
                {payload.map((entry, index) => (
                    <div key={index} className="flex items-center gap-3 text-[11px] py-0.5">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.payload?.fill }} />
                        <span className="text-slate-400">{entry.name}:</span>
                        <span className="text-white font-mono font-bold ml-auto">
                            {unit === '%' ? `${entry.value.toFixed(2)}%` : formatValue(entry.value)}
                        </span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

export const ComparisonChart = ({ data, title, bars = [], lines = [] }) => (
    <div className="card p-6 bg-slate-900/40 border-slate-800">
        <h4 className="text-sm font-bold text-slate-400 mb-6 uppercase tracking-wider">{title}</h4>
        <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} vertical={false} />
                    <XAxis dataKey="year" stroke={COLORS.text} fontSize={10} axisLine={false} tickLine={false} />
                    <YAxis stroke={COLORS.text} fontSize={10} axisLine={false} tickLine={false} tickFormatter={formatValue} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: 20 }} />
                    {bars.map(bar => (
                        <Bar key={bar.key} name={bar.name} dataKey={bar.key} fill={bar.color || COLORS.revenue} radius={[4, 4, 0, 0]} barSize={30} />
                    ))}
                    {lines.map(line => (
                        <Line key={line.key} type="monotone" name={line.name} dataKey={line.key} stroke={line.color || COLORS.netIncome} strokeWidth={3} dot={{ r: 4, fill: line.color || COLORS.netIncome }} />
                    ))}
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    </div>
);

export const TrendChart = ({ data, title, metrics = [], unit = '' }) => (
    <div className="card p-6 bg-slate-900/40 border-slate-800">
        <h4 className="text-sm font-bold text-slate-400 mb-6 uppercase tracking-wider">{title}</h4>
        <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <defs>
                        {metrics.map(m => (
                            <linearGradient key={`grad-${m.key}`} id={`grad-${m.key}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={m.color} stopOpacity={0.3} />
                                <stop offset="95%" stopColor={m.color} stopOpacity={0} />
                            </linearGradient>
                        ))}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} vertical={false} />
                    <XAxis dataKey="year" stroke={COLORS.text} fontSize={10} axisLine={false} tickLine={false} />
                    <YAxis stroke={COLORS.text} fontSize={10} axisLine={false} tickLine={false} tickFormatter={unit === '%' ? (v) => `${v}%` : formatValue} />
                    <Tooltip content={<CustomTooltip unit={unit} />} />
                    <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: 20 }} />
                    {metrics.map(m => (
                        <Area key={m.key} type="monotone" name={m.name} dataKey={m.key} stroke={m.color} fill={`url(#grad-${m.key})`} strokeWidth={3} />
                    ))}
                </AreaChart>
            </ResponsiveContainer>
        </div>
    </div>
);

export const CompositionChart = ({ data, title, keys = [] }) => (
    <div className="card p-6 bg-slate-900/40 border-slate-800">
        <h4 className="text-sm font-bold text-slate-400 mb-6 uppercase tracking-wider">{title}</h4>
        <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} vertical={false} />
                    <XAxis dataKey="year" stroke={COLORS.text} fontSize={10} axisLine={false} tickLine={false} />
                    <YAxis stroke={COLORS.text} fontSize={10} axisLine={false} tickLine={false} tickFormatter={formatValue} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: 20 }} />
                    {keys.map(k => (
                        <Bar key={k.key} name={k.name} dataKey={k.key} stackId="a" fill={k.color} barSize={40} />
                    ))}
                </BarChart>
            </ResponsiveContainer>
        </div>
    </div>
);

export const GroupedBarChart = ({ data, title, bars = [] }) => (
    <div className="card p-6 bg-slate-900/40 border-slate-800">
        <h4 className="text-sm font-bold text-slate-400 mb-6 uppercase tracking-wider">{title}</h4>
        <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} vertical={false} />
                    <XAxis dataKey="year" stroke={COLORS.text} fontSize={10} axisLine={false} tickLine={false} />
                    <YAxis stroke={COLORS.text} fontSize={10} axisLine={false} tickLine={false} tickFormatter={formatValue} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: 20 }} />
                    {bars.map((bar, idx) => (
                        <Bar key={bar.key} name={bar.name} dataKey={bar.key} fill={bar.color || COLORS.pie[idx % COLORS.pie.length]} radius={[4, 4, 0, 0]} />
                    ))}
                </BarChart>
            </ResponsiveContainer>
        </div>
    </div>
);

export const BasicPieChart = ({ data, title }) => (
    <div className="card p-6 bg-slate-900/40 border-slate-800">
        <h4 className="text-sm font-bold text-slate-400 mb-6 uppercase tracking-wider">{title}</h4>
        <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        nameKey="name"
                        stroke="none"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS.pie[index % COLORS.pie.length]} />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend verticalAlign="bottom" align="center" iconType="circle" />
                </PieChart>
            </ResponsiveContainer>
        </div>
    </div>
);

export const SimpleLineChart = ({ data, title, metrics = [], unit = '' }) => (
    <div className="card p-6 bg-slate-900/40 border-slate-800">
        <h4 className="text-sm font-bold text-slate-400 mb-6 uppercase tracking-wider">{title}</h4>
        <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} vertical={false} />
                    <XAxis dataKey="year" stroke={COLORS.text} fontSize={10} axisLine={false} tickLine={false} />
                    <YAxis stroke={COLORS.text} fontSize={10} axisLine={false} tickLine={false} tickFormatter={unit === '%' ? (v) => `${v}%` : formatValue} />
                    <Tooltip content={<CustomTooltip unit={unit} />} />
                    <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: 20 }} />
                    {metrics.map(m => (
                        <Line key={m.key} type="monotone" name={m.name} dataKey={m.key} stroke={m.color} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </div>
    </div>
);

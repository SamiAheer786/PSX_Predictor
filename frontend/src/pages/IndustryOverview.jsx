import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine,
    PieChart, Pie, Legend
} from 'recharts';
import { getMarketSummary, getSectors } from '../api';

// ─── Helpers ────────────────────────────────────────────────────────────────

const fmt = (n, decimals = 2) => {
    if (n === null || n === undefined || isNaN(n)) return '—';
    return Number(n).toLocaleString('en-PK', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
};

const fmtVol = (n) => {
    if (!n) return '—';
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return n.toString();
};

const colorForReturn = (r) => {
    if (r === null || r === undefined) return '#94a3b8';
    return r >= 0 ? '#10b981' : '#ef4444';
};

// ─── Sector Color Palette ────────────────────────────────────────────────────

const SECTOR_COLORS = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
    '#ec4899', '#14b8a6', '#f97316', '#a3e635', '#06b6d4',
    '#e879f9', '#fbbf24', '#34d399', '#60a5fa', '#fb7185',
    '#818cf8', '#4ade80', '#facc15', '#2dd4bf', '#c084fc',
];

// ─── Summary Stat Card ───────────────────────────────────────────────────────

const StatCard = ({ label, value, sub, color = '#3b82f6', icon }) => (
    <div style={{
        background: 'linear-gradient(135deg, rgba(30,41,59,0.9) 0%, rgba(15,23,42,0.95) 100%)',
        border: `1px solid ${color}30`,
        borderRadius: 12,
        padding: '16px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        minWidth: 130,
        flex: 1,
        boxShadow: `0 4px 20px ${color}15`,
    }}>
        <div style={{ fontSize: 11, color: '#94a3b8', letterSpacing: '0.08em', fontWeight: 700, textTransform: 'uppercase' }}>
            {icon && <span style={{ marginRight: 5 }}>{icon}</span>}{label}
        </div>
        <div style={{ fontSize: 22, fontWeight: 900, color: color, lineHeight: 1.2 }}>{value}</div>
        {sub && <div style={{ fontSize: 11, color: '#64748b' }}>{sub}</div>}
    </div>
);

// ─── Sector Card ─────────────────────────────────────────────────────────────

const SectorCard = ({ sector, companies, accentColor, onSelect, isSelected }) => {
    const validReturns = companies.map(c => c.return).filter(r => r !== null);
    const avgReturn = validReturns.length ? validReturns.reduce((a, b) => a + b, 0) / validReturns.length : 0;
    const totalVol = companies.reduce((s, c) => s + (c.volume || 0), 0);
    const topGainer = companies.reduce((best, c) => (!best || (c.return || -Infinity) > (best.return || -Infinity)) ? c : best, null);
    const topLoser = companies.reduce((worst, c) => (!worst || (c.return || Infinity) < (worst.return || Infinity)) ? c : worst, null);
    const positive = companies.filter(c => (c.return || 0) >= 0).length;
    const negative = companies.length - positive;

    return (
        <div
            onClick={onSelect}
            style={{
                background: isSelected
                    ? `linear-gradient(135deg, ${accentColor}20 0%, rgba(15,23,42,0.98) 100%)`
                    : 'linear-gradient(135deg, rgba(30,41,59,0.85) 0%, rgba(15,23,42,0.95) 100%)',
                border: `1.5px solid ${isSelected ? accentColor : accentColor + '30'}`,
                borderRadius: 14,
                padding: '18px 20px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: isSelected ? `0 0 20px ${accentColor}30` : `0 4px 15px rgba(0,0,0,0.3)`,
            }}
        >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ fontWeight: 800, fontSize: 13, color: isSelected ? accentColor : '#e2e8f0', lineHeight: 1.3, maxWidth: '70%' }}>
                    {sector}
                </div>
                <div style={{
                    background: `${accentColor}20`, borderRadius: 20, padding: '3px 10px',
                    fontSize: 11, fontWeight: 700, color: accentColor
                }}>
                    {companies.length} cos
                </div>
            </div>

            {/* Avg Return */}
            <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, color: '#64748b', marginBottom: 2 }}>Avg Daily Return</div>
                <div style={{ fontSize: 24, fontWeight: 900, color: colorForReturn(avgReturn) }}>
                    {avgReturn >= 0 ? '+' : ''}{avgReturn.toFixed(2)}%
                </div>
            </div>

            {/* Stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
                <div>
                    <div style={{ fontSize: 10, color: '#64748b' }}>Volume</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8' }}>{fmtVol(totalVol)}</div>
                </div>
                <div>
                    <div style={{ fontSize: 10, color: '#64748b' }}>Adv / Dec</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8' }}>
                        <span style={{ color: '#10b981' }}>{positive}</span>
                        <span style={{ color: '#64748b' }}> / </span>
                        <span style={{ color: '#ef4444' }}>{negative}</span>
                    </div>
                </div>
                {topGainer && (
                    <div>
                        <div style={{ fontSize: 10, color: '#64748b' }}>Top Gainer</div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#10b981' }}>
                            {topGainer.symbol} <span style={{ fontSize: 10 }}>+{topGainer.return?.toFixed(2)}%</span>
                        </div>
                    </div>
                )}
                {topLoser && (
                    <div>
                        <div style={{ fontSize: 10, color: '#64748b' }}>Top Loser</div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#ef4444' }}>
                            {topLoser.symbol} <span style={{ fontSize: 10 }}>{topLoser.return?.toFixed(2)}%</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Mini bar: positive vs negative ratio */}
            <div style={{ display: 'flex', height: 4, borderRadius: 4, overflow: 'hidden', background: '#1e293b' }}>
                <div style={{ width: `${(positive / companies.length) * 100}%`, background: '#10b981', transition: 'width 0.4s' }} />
                <div style={{ width: `${(negative / companies.length) * 100}%`, background: '#ef4444', transition: 'width 0.4s' }} />
            </div>
        </div>
    );
};

// ─── Company Table ────────────────────────────────────────────────────────────

const COLS = [
    { key: 'symbol', label: 'Symbol', align: 'left' },
    { key: 'company_name', label: 'Company', align: 'left' },
    { key: 'ldcp', label: 'LDCP', align: 'right' },
    { key: 'open', label: 'Open', align: 'right' },
    { key: 'high', label: 'High', align: 'right' },
    { key: 'low', label: 'Low', align: 'right' },
    { key: 'current', label: 'Current', align: 'right' },
    { key: 'change', label: 'Change', align: 'right' },
    { key: 'volume', label: 'Volume', align: 'right' },
    { key: 'return', label: 'Return%', align: 'right' },
];

const CompanyTable = ({ companies, sector }) => {
    const [sortKey, setSortKey] = useState('return');
    const [sortDir, setSortDir] = useState(-1); // -1 desc, 1 asc
    const [search, setSearch] = useState('');

    const handleSort = (key) => {
        if (sortKey === key) setSortDir(d => d * -1);
        else { setSortKey(key); setSortDir(-1); }
    };

    const filtered = useMemo(() => {
        let list = [...companies];
        if (search) {
            const q = search.toLowerCase();
            list = list.filter(c =>
                c.symbol?.toLowerCase().includes(q) ||
                c.company_name?.toLowerCase().includes(q)
            );
        }
        list.sort((a, b) => {
            const av = a[sortKey] ?? -Infinity;
            const bv = b[sortKey] ?? -Infinity;
            return (av < bv ? -1 : av > bv ? 1 : 0) * sortDir;
        });
        return list;
    }, [companies, sortKey, sortDir, search]);

    return (
        <div style={{
            background: 'rgba(15,23,42,0.95)',
            border: '1px solid rgba(51,65,85,0.7)',
            borderRadius: 14,
            overflow: 'hidden',
        }}>
            {/* Table header bar */}
            <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(51,65,85,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                <div style={{ fontWeight: 800, fontSize: 14, color: '#e2e8f0' }}>
                    {sector} — <span style={{ color: '#64748b', fontWeight: 500, fontSize: 13 }}>{filtered.length} companies</span>
                </div>
                <input
                    placeholder="Search symbol or name…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{
                        background: 'rgba(30,41,59,0.8)', border: '1px solid rgba(71,85,105,0.5)',
                        borderRadius: 8, padding: '7px 14px', color: '#e2e8f0', fontSize: 13,
                        outline: 'none', width: 220
                    }}
                />
            </div>

            {/* Scrollable table */}
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                        <tr style={{ background: 'rgba(30,41,59,0.7)' }}>
                            {COLS.map(col => (
                                <th
                                    key={col.key}
                                    onClick={() => handleSort(col.key)}
                                    style={{
                                        padding: '10px 14px', textAlign: col.align,
                                        color: sortKey === col.key ? '#3b82f6' : '#94a3b8',
                                        fontWeight: 700, fontSize: 11, letterSpacing: '0.06em',
                                        textTransform: 'uppercase', cursor: 'pointer', whiteSpace: 'nowrap',
                                        userSelect: 'none',
                                    }}
                                >
                                    {col.label} {sortKey === col.key ? (sortDir === -1 ? '↓' : '↑') : ''}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((row, i) => {
                            const ret = row.return ?? 0;
                            const retColor = colorForReturn(ret);
                            return (
                                <tr
                                    key={row.symbol + i}
                                    style={{
                                        borderBottom: '1px solid rgba(51,65,85,0.3)',
                                        background: i % 2 === 0 ? 'transparent' : 'rgba(30,41,59,0.3)',
                                        transition: 'background 0.15s',
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(59,130,246,0.07)'}
                                    onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : 'rgba(30,41,59,0.3)'}
                                >
                                    <td style={{ padding: '10px 14px', fontWeight: 700, color: '#60a5fa', whiteSpace: 'nowrap' }}>{row.symbol}</td>
                                    <td style={{ padding: '10px 14px', color: '#cbd5e1', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.company_name}</td>
                                    <td style={{ padding: '10px 14px', textAlign: 'right', color: '#e2e8f0' }}>{fmt(row.ldcp)}</td>
                                    <td style={{ padding: '10px 14px', textAlign: 'right', color: '#94a3b8' }}>{fmt(row.open)}</td>
                                    <td style={{ padding: '10px 14px', textAlign: 'right', color: '#94a3b8' }}>{fmt(row.high)}</td>
                                    <td style={{ padding: '10px 14px', textAlign: 'right', color: '#94a3b8' }}>{fmt(row.low)}</td>
                                    <td style={{ padding: '10px 14px', textAlign: 'right', color: '#e2e8f0', fontWeight: 600 }}>{fmt(row.current)}</td>
                                    <td style={{ padding: '10px 14px', textAlign: 'right', color: retColor, fontWeight: 600 }}>
                                        {row.change !== null ? (row.change >= 0 ? '+' : '') + fmt(row.change) : '—'}
                                    </td>
                                    <td style={{ padding: '10px 14px', textAlign: 'right', color: '#94a3b8' }}>{fmtVol(row.volume)}</td>
                                    <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                                        <span style={{
                                            background: `${retColor}20`, color: retColor,
                                            fontWeight: 700, borderRadius: 6, padding: '2px 8px', fontSize: 12,
                                        }}>
                                            {ret >= 0 ? '+' : ''}{ret.toFixed(2)}%
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan={COLS.length} style={{ padding: 32, textAlign: 'center', color: '#475569' }}>
                                    No companies match your search.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// ─── Analysis Components ───────────────────────────────────────────────────

const AnalysisCard = ({ title, children, fullWidth = false }) => (
    <div style={{
        background: 'linear-gradient(135deg, rgba(30,41,59,0.9) 0%, rgba(15,23,42,0.95) 100%)',
        border: '1px solid rgba(51,65,85,0.6)',
        borderRadius: 14, padding: '20px',
        gridColumn: fullWidth ? '1 / -1' : 'auto',
        display: 'flex', flexDirection: 'column',
    }}>
        <div style={{ fontWeight: 800, fontSize: 13, color: '#e2e8f0', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 4, height: 16, background: '#3b82f6', borderRadius: 2 }} />
            {title}
        </div>
        <div style={{ flex: 1, minHeight: 250 }}>
            {children}
        </div>
    </div>
);

const MarketBreadthChart = ({ data }) => {
    const chartData = [
        { name: 'Gainers', value: data.gainers, color: '#10b981' },
        { name: 'Losers', value: data.losers, color: '#ef4444' },
        { name: 'Unchanged', value: data.unchanged, color: '#64748b' },
    ];

    return (
        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%" cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        nameKey="name"
                        stroke="none"
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }}
                        itemStyle={{ color: '#e2e8f0' }}
                    />
                    <Legend verticalAlign="bottom" height={36} />
                </PieChart>
            </ResponsiveContainer>
            <div style={{ position: 'absolute', textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 900, color: '#e2e8f0' }}>{data.total}</div>
                <div style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase' }}>Stocks</div>
            </div>
        </div>
    );
};

const HorizontalBarChart = ({ data, dataKey, nameKey, color, unit = "" }) => (
    <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 0, right: 40, top: 0, bottom: 0 }}>
            <XAxis type="number" hide />
            <YAxis
                type="category"
                dataKey={nameKey}
                width={80}
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
            />
            <Tooltip
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }}
            />
            <Bar dataKey={dataKey} radius={[0, 4, 4, 0]} barSize={12}>
                {data.map((entry, i) => (
                    <Cell key={i} fill={typeof color === 'function' ? color(entry[dataKey]) : color} />
                ))}
            </Bar>
        </BarChart>
    </ResponsiveContainer>
);

const MarketAnalysis = ({ summaryData }) => {
    const allCompanies = useMemo(() => Object.values(summaryData).flat(), [summaryData]);

    const stats = useMemo(() => {
        const gainers = allCompanies.filter(c => (c.change || 0) > 0).length;
        const losers = allCompanies.filter(c => (c.change || 0) < 0).length;
        return {
            gainers,
            losers,
            unchanged: allCompanies.length - gainers - losers,
            total: allCompanies.length
        };
    }, [allCompanies]);

    const topGainers = useMemo(() =>
        [...allCompanies].sort((a, b) => (b.return || 0) - (a.return || 0)).slice(0, 10),
        [allCompanies]);

    const topLosers = useMemo(() =>
        [...allCompanies].sort((a, b) => (a.return || 0) - (b.return || 0)).slice(0, 10),
        [allCompanies]);

    const mostActiveVol = useMemo(() =>
        [...allCompanies].sort((a, b) => (b.volume || 0) - (a.volume || 0)).slice(0, 10),
        [allCompanies]);

    const mostActiveChange = useMemo(() =>
        [...allCompanies].sort((a, b) => Math.abs(b.change || 0) - Math.abs(a.change || 0)).slice(0, 10),
        [allCompanies]);

    const volatileStocks = useMemo(() =>
        [...allCompanies].map(c => ({
            ...c,
            volatility: c.open ? ((c.high - c.low) / c.open) * 100 : 0
        })).sort((a, b) => b.volatility - a.volatility).slice(0, 10),
        [allCompanies]);

    const sectorStats = useMemo(() => {
        return Object.entries(summaryData).map(([sector, cos]) => {
            const returns = cos.map(c => c.return).filter(r => r !== null);
            const avg = returns.length ? returns.reduce((a, b) => a + b, 0) / returns.length : 0;
            const leader = cos.reduce((best, c) => (!best || (c.return || -Infinity) > (best.return || -Infinity)) ? c : best, null);
            return { sector, avg: parseFloat(avg.toFixed(2)), leader };
        }).sort((a, b) => b.avg - a.avg);
    }, [summaryData]);

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 20 }}>
            <AnalysisCard title="Market Breadth">
                <MarketBreadthChart data={stats} />
            </AnalysisCard>

            <AnalysisCard title="Top 10 Gainers (Return %)">
                <HorizontalBarChart data={topGainers} dataKey="return" nameKey="symbol" color="#10b981" />
            </AnalysisCard>

            <AnalysisCard title="Top 10 Losers (Return %)">
                <HorizontalBarChart data={topLosers} dataKey="return" nameKey="symbol" color="#ef4444" />
            </AnalysisCard>

            <AnalysisCard title="Most Active by Volume">
                <HorizontalBarChart data={mostActiveVol} dataKey="volume" nameKey="symbol" color="#3b82f6" />
            </AnalysisCard>

            <AnalysisCard title="Highest Price Change (Absolute)">
                <HorizontalBarChart data={mostActiveChange} dataKey="change" nameKey="symbol" color={v => v >= 0 ? '#10b981' : '#ef4444'} />
            </AnalysisCard>

            <AnalysisCard title="Top 10 Most Volatile (High-Low %)">
                <HorizontalBarChart data={volatileStocks} dataKey="volatility" nameKey="symbol" color="#f59e0b" />
            </AnalysisCard>

            <AnalysisCard title="Sector Performance Heatmap" fullWidth>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10 }}>
                    {sectorStats.map(s => {
                        const opacity = Math.min(0.2 + Math.abs(s.avg) / 5, 1);
                        const bgColor = s.avg >= 0 ? `rgba(16, 185, 129, ${opacity})` : `rgba(239, 68, 68, ${opacity})`;
                        return (
                            <div key={s.sector} style={{
                                background: bgColor, borderRadius: 8, padding: '12px',
                                display: 'flex', flexDirection: 'column', gap: 4,
                                border: '1px solid rgba(255,255,255,0.1)'
                            }}>
                                <div style={{ fontSize: 10, fontWeight: 800, color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {s.sector}
                                </div>
                                <div style={{ fontSize: 16, fontWeight: 900, color: '#fff' }}>
                                    {s.avg >= 0 ? '+' : ''}{s.avg}%
                                </div>
                            </div>
                        );
                    })}
                </div>
            </AnalysisCard>

            <AnalysisCard title="Sector Leaders" fullWidth>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                        <thead>
                            <tr style={{ background: 'rgba(30,41,59,0.7)' }}>
                                <th style={{ padding: '10px 14px', textAlign: 'left', color: '#94a3b8', fontSize: 11, textTransform: 'uppercase' }}>Sector</th>
                                <th style={{ padding: '10px 14px', textAlign: 'left', color: '#94a3b8', fontSize: 11, textTransform: 'uppercase' }}>Leading Stock</th>
                                <th style={{ padding: '10px 14px', textAlign: 'right', color: '#94a3b8', fontSize: 11, textTransform: 'uppercase' }}>Return %</th>
                                <th style={{ padding: '10px 14px', textAlign: 'right', color: '#94a3b8', fontSize: 11, textTransform: 'uppercase' }}>Volume</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sectorStats.slice(0, 15).map((s, i) => (
                                <tr key={s.sector} style={{ borderBottom: '1px solid rgba(51,65,85,0.3)' }}>
                                    <td style={{ padding: '8px 14px', color: '#94a3b8' }}>{s.sector}</td>
                                    <td style={{ padding: '8px 14px', color: '#3b82f6', fontWeight: 700 }}>{s.leader?.symbol}</td>
                                    <td style={{ padding: '8px 14px', textAlign: 'right', color: '#10b981', fontWeight: 700 }}>+{s.leader?.return?.toFixed(2)}%</td>
                                    <td style={{ padding: '8px 14px', textAlign: 'right', color: '#64748b' }}>{fmtVol(s.leader?.volume)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </AnalysisCard>
        </div>
    );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const IndustryOverview = () => {
    const [summaryData, setSummaryData] = useState(null);   // { sector: [...companies] }
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedSectors, setSelectedSectors] = useState([]); // [] = all
    const [activeTab, setActiveTab] = useState('cards'); // 'cards' | 'table' | 'chart'
    const [lastRefreshed, setLastRefreshed] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = useCallback(async (refresh = false) => {
        try {
            setRefreshing(true);
            const data = await getMarketSummary(refresh);
            if (data.error) throw new Error(data.error);
            setSummaryData(data);
            setLastRefreshed(new Date());
            setError(null);
        } catch (err) {
            setError(err.message || 'Failed to fetch market summary');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => { fetchData(false); }, [fetchData]);

    const allSectors = useMemo(() => summaryData ? Object.keys(summaryData).sort() : [], [summaryData]);

    const visibleSectors = useMemo(() => {
        if (!summaryData) return [];
        const keys = selectedSectors.length > 0 ? selectedSectors : allSectors;
        return keys.filter(k => summaryData[k]);
    }, [summaryData, selectedSectors, allSectors]);

    const toggleSector = (sector) => {
        setSelectedSectors(prev =>
            prev.includes(sector) ? prev.filter(s => s !== sector) : [...prev, sector]
        );
    };

    // Aggregate stats across all visible sectors
    const overallStats = useMemo(() => {
        if (!summaryData || visibleSectors.length === 0) return null;
        const allCos = visibleSectors.flatMap(s => summaryData[s] || []);
        const returns = allCos.map(c => c.return).filter(r => r !== null);
        const volumes = allCos.map(c => c.volume).filter(v => v !== null);
        const advancing = allCos.filter(c => (c.return || 0) >= 0).length;
        return {
            totalCompanies: allCos.length,
            avgReturn: returns.length ? returns.reduce((a, b) => a + b, 0) / returns.length : 0,
            totalVolume: volumes.reduce((a, b) => a + b, 0),
            advancing,
            declining: allCos.length - advancing,
        };
    }, [summaryData, visibleSectors]);

    // ── Render ───────────────────────────────────────────────────────────────

    if (loading) return (
        <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{ width: 48, height: 48, border: '3px solid rgba(59,130,246,0.2)', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
                <div style={{ color: '#94a3b8', fontSize: 14 }}>Loading PSX market summary…</div>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        </div>
    );

    if (error) return (
        <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12, padding: 32, textAlign: 'center', maxWidth: 500 }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>⚠️</div>
                <div style={{ color: '#fca5a5', fontWeight: 700, fontSize: 16, marginBottom: 8 }}>Failed to load market data</div>
                <div style={{ color: '#94a3b8', fontSize: 13, marginBottom: 20 }}>{error}</div>
                <button
                    onClick={() => { setLoading(true); fetchData(true); }}
                    style={{ background: '#3b82f6', color: 'white', border: 'none', borderRadius: 8, padding: '10px 24px', fontWeight: 700, cursor: 'pointer' }}
                >
                    Retry
                </button>
            </div>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', background: '#0f172a', color: '#e2e8f0', fontFamily: "'Inter', sans-serif" }}>
            <div style={{ maxWidth: 1440, margin: '0 auto', padding: '24px 24px 48px' }}>

                {/* ── Page Header ─────────────────────────────────────────── */}
                <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                        <h1 style={{ fontSize: 28, fontWeight: 900, margin: 0, background: 'linear-gradient(90deg,#60a5fa,#818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            Industry Overview
                        </h1>
                        <p style={{ margin: '6px 0 0', color: '#64748b', fontSize: 13 }}>
                            Live PSX market data grouped by sector
                            {lastRefreshed && ` · Last updated ${lastRefreshed.toLocaleTimeString()}`}
                        </p>
                    </div>
                    <button
                        onClick={() => fetchData(true)}
                        disabled={refreshing}
                        style={{
                            background: refreshing ? 'rgba(59,130,246,0.2)' : 'rgba(59,130,246,0.15)',
                            border: '1px solid rgba(59,130,246,0.4)',
                            borderRadius: 8, padding: '8px 18px', color: '#60a5fa',
                            fontWeight: 700, fontSize: 13, cursor: refreshing ? 'wait' : 'pointer',
                            display: 'flex', alignItems: 'center', gap: 8,
                        }}
                    >
                        <span style={{ display: 'inline-block', animation: refreshing ? 'spin 0.8s linear infinite' : 'none' }}>↻</span>
                        {refreshing ? 'Refreshing…' : 'Refresh'}
                    </button>
                </div>

                {/* ── Overall Stats Bar ────────────────────────────────────── */}
                {overallStats && (
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
                        <StatCard label="Sectors" value={visibleSectors.length} sub={`of ${allSectors.length} total`} color="#3b82f6" icon="🏭" />
                        <StatCard label="Companies" value={overallStats.totalCompanies} color="#8b5cf6" icon="🏢" />
                        <StatCard label="Avg Return" value={`${overallStats.avgReturn >= 0 ? '+' : ''}${overallStats.avgReturn.toFixed(2)}%`} color={colorForReturn(overallStats.avgReturn)} icon="📈" />
                        <StatCard label="Advancing" value={overallStats.advancing} color="#10b981" icon="▲" />
                        <StatCard label="Declining" value={overallStats.declining} color="#ef4444" icon="▼" />
                        <StatCard label="Total Volume" value={fmtVol(overallStats.totalVolume)} color="#f59e0b" icon="📊" />
                    </div>
                )}

                {/* ── Sector Filter Pills ──────────────────────────────────── */}
                <div style={{
                    background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(51,65,85,0.5)',
                    borderRadius: 12, padding: 16, marginBottom: 24,
                }}>
                    <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700, letterSpacing: '0.08em', marginBottom: 10, textTransform: 'uppercase' }}>
                        Filter by Sector
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        <button
                            onClick={() => setSelectedSectors([])}
                            style={{
                                borderRadius: 20, padding: '5px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                                border: `1.5px solid ${selectedSectors.length === 0 ? '#3b82f6' : 'rgba(71,85,105,0.5)'}`,
                                background: selectedSectors.length === 0 ? 'rgba(59,130,246,0.2)' : 'rgba(30,41,59,0.6)',
                                color: selectedSectors.length === 0 ? '#60a5fa' : '#94a3b8',
                                transition: 'all 0.15s',
                            }}
                        >
                            All Sectors
                        </button>
                        {allSectors.map((sector, i) => {
                            const active = selectedSectors.includes(sector);
                            const color = SECTOR_COLORS[i % SECTOR_COLORS.length];
                            return (
                                <button
                                    key={sector}
                                    onClick={() => toggleSector(sector)}
                                    style={{
                                        borderRadius: 20, padding: '5px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                                        border: `1.5px solid ${active ? color : 'rgba(71,85,105,0.4)'}`,
                                        background: active ? `${color}20` : 'rgba(30,41,59,0.5)',
                                        color: active ? color : '#94a3b8',
                                        transition: 'all 0.15s',
                                    }}
                                >
                                    {sector}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* ── View Tabs ────────────────────────────────────────────── */}
                <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid rgba(51,65,85,0.5)', marginBottom: 24 }}>
                    {[
                        { id: 'cards', label: '🗂 Sector Cards' },
                        { id: 'table', label: '📋 Company Table' },
                        { id: 'chart', label: '📊 Analysis' },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                padding: '10px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                                background: 'transparent', border: 'none',
                                borderBottom: `2.5px solid ${activeTab === tab.id ? '#3b82f6' : 'transparent'}`,
                                color: activeTab === tab.id ? '#60a5fa' : '#64748b',
                                transition: 'all 0.15s',
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* ── Sector Cards View ────────────────────────────────────── */}
                {activeTab === 'cards' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
                        {visibleSectors.map((sector, i) => (
                            <SectorCard
                                key={sector}
                                sector={sector}
                                companies={summaryData[sector]}
                                accentColor={SECTOR_COLORS[allSectors.indexOf(sector) % SECTOR_COLORS.length]}
                                isSelected={selectedSectors.includes(sector)}
                                onSelect={() => {
                                    toggleSector(sector);
                                    setActiveTab('table');
                                }}
                            />
                        ))}
                    </div>
                )}

                {/* ── Company Table View ───────────────────────────────────── */}
                {activeTab === 'table' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        {visibleSectors.map(sector => (
                            <CompanyTable
                                key={sector}
                                sector={sector}
                                companies={summaryData[sector]}
                            />
                        ))}
                    </div>
                )}

                {/* ── Analysis View ────────────────────────────────────────────── */}
                {activeTab === 'chart' && (
                    <MarketAnalysis summaryData={Object.fromEntries(visibleSectors.map(s => [s, summaryData[s]]))} />
                )}

                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        </div>
    );
};

export default IndustryOverview;

import React, { useMemo } from 'react';
import { ResponsiveContainer, Sankey, Tooltip } from 'recharts';

const formatValue = (val) => {
    if (val >= 1000) {
        return `PKRs${(val / 1000).toFixed(2)}b`;
    }
    return `PKRs${val.toFixed(2)}m`;
};

const SankeyNode = ({ x, y, width, height, index, payload, containerWidth }) => {
    const isOut = x + width + 6 > containerWidth;
    const color = payload.color || '#3b82f6';
    const isBadge = ['Revenue', 'Earnings', 'Gross Profit', 'Net Profit', 'Expenses'].includes(payload.name);

    return (
        <g>
            <rect
                x={x}
                y={y}
                width={width}
                height={height}
                fill={color}
                fillOpacity="1"
                rx={1}
            />
            {isBadge && (
                <rect
                    x={isOut ? x - 75 : x + width + 6}
                    y={y + height / 2 - 24}
                    width={70}
                    height={20}
                    rx={8}
                    fill={color}
                    fillOpacity="0.8"
                />
            )}
            <text
                x={isOut ? (isBadge ? x - 40 : x - 6) : (isBadge ? x + width + 41 : x + width + 6)}
                y={y + height / 2 - (isBadge ? 14 : 6)}
                textAnchor="middle"
                fontSize="12"
                fill={isBadge ? "#ffffff" : "#e2e8f0"}
                fontWeight={isBadge ? "bold" : "500"}
            >
                {payload.name}
            </text>
            <text
                x={isOut ? x - 6 : x + width + 6}
                y={y + height / 2 + (isBadge ? 10 : 8)}
                textAnchor={isOut ? 'end' : 'start'}
                fontSize="11"
                fill="#94a3b8"
                fontWeight="400"
            >
                {formatValue(payload.value)}
            </text>
        </g>
    );
};

const SankeyChart = ({ data }) => {
    const containerRef = React.useRef(null);
    const [containerWidth, setContainerWidth] = React.useState(0);

    React.useEffect(() => {
        const handleResize = () => {
            if (containerRef.current) {
                setContainerWidth(containerRef.current.offsetWidth);
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const sankeyData = useMemo(() => {
        if (!data || !Array.isArray(data)) return null;

        // We need the latest year's data. 
        // Data format: [{ label: "Net sales", data: [{ year: "2023", value: "100" }, ...] }, ...]

        // 1. Identify all available years from the first item
        if (data.length === 0 || !data[0].data) return null;
        const years = data[0].data.map(d => d.year);
        const latestYear = years[years.length - 1];

        // 2. Extract values for the latest year
        const getValue = (label) => {
            const item = data.find(d => d.label === label);
            if (!item) return 0;
            const yearData = item.data.find(d => d.year === latestYear);
            return yearData ? Math.max(0, parseFloat(yearData.value)) : 0;
        };

        const netSales = getValue('Net sales');
        const costOfSales = getValue('Cost of sales');
        const grossProfit = getValue('Gross profit');
        const sellingExp = getValue('Selling/distribution expenses');
        const adminExp = getValue('Administrative expenses');
        const operatingProfit = getValue('Operating profit');
        const otherIncome = getValue('Other income');
        const financialCharges = getValue('Financial charges');
        const otherCharges = getValue('Other charges');
        const pbt = getValue('Profit before tax');
        const taxation = getValue('Taxation');
        const pat = getValue('Profit after tax');

        if (netSales === 0) return null;

        const colors = {
            blue: '#3b82f6',
            orange: '#d97706',
            teal: '#2dd4bf',
            gray: '#64748b'
        };

        // Define nodes
        const nodes = [
            { name: 'Revenue', color: colors.blue },           // 0
            { name: 'Cost of Sales', color: colors.orange },     // 1
            { name: 'Gross Profit', color: colors.teal },      // 2
            { name: 'Selling Exp', color: colors.orange },       // 3
            { name: 'Admin Exp', color: colors.orange },         // 4
            { name: 'Operating Profit', color: colors.teal },  // 5
            { name: 'Other Income', color: colors.blue },      // 6
            { name: 'Financial Charges', color: colors.orange }, // 7
            { name: 'Other Charges', color: colors.orange },     // 8
            { name: 'Profit Before Tax', color: colors.teal }, // 9
            { name: 'Taxation', color: colors.orange },          // 10
            { name: 'Earnings', color: colors.teal }            // 11
        ];

        // Define links
        const links = [];

        // 1. Revenue -> CoS + GP
        if (costOfSales > 0) links.push({ source: 0, target: 1, value: costOfSales, color: colors.orange });
        if (grossProfit > 0) links.push({ source: 0, target: 2, value: grossProfit, color: colors.teal });

        // 2. GP -> Selling + Admin + Balance to Op Profit
        if (sellingExp > 0) links.push({ source: 2, target: 3, value: sellingExp, color: colors.orange });
        if (adminExp > 0) links.push({ source: 2, target: 4, value: adminExp, color: colors.orange });

        const opProfitFromGP = Math.max(0, grossProfit - (sellingExp + adminExp));
        if (opProfitFromGP > 0) links.push({ source: 2, target: 5, value: opProfitFromGP, color: colors.teal });

        // 3. Operating Profit & Other Income -> Charges + PBT
        // Input to stage 3 = Op Profit + Other Income
        // Output from stage 3 = Fin Charges + Other Charges + PBT

        if (otherIncome > 0) {
            // Other Income is a source, so we show it flowing to PBT
            links.push({ source: 6, target: 9, value: otherIncome, color: colors.blue });
        }

        if (financialCharges > 0) links.push({ source: 5, target: 7, value: financialCharges, color: colors.orange });
        if (otherCharges > 0) links.push({ source: 5, target: 8, value: otherCharges, color: colors.orange });

        const pbtFromOpProfit = Math.max(0, operatingProfit - (financialCharges + otherCharges));
        if (pbtFromOpProfit > 0) links.push({ source: 5, target: 9, value: pbtFromOpProfit, color: colors.teal });

        // 4. PBT -> Taxation + Net Profit
        if (taxation > 0) links.push({ source: 9, target: 10, value: taxation, color: colors.orange });
        if (pat > 0) links.push({ source: 9, target: 11, value: pat, color: colors.teal });

        return { nodes, links, year: latestYear };
    }, [data]);

    if (!sankeyData || sankeyData.links.length === 0) {
        return (
            <div className="h-64 flex items-center justify-center bg-slate-800 rounded-lg text-slate-400 font-medium">
                Insufficient data for Sankey visualization
            </div>
        );
    }

    return (
        <div className="bg-[#0f172a] rounded-xl p-8 border border-slate-800 shadow-2xl" ref={containerRef}>
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold text-white tracking-tight">Income Statement Flow</h3>
                <span className="px-3 py-1 bg-slate-800 text-slate-300 text-xs font-bold rounded-full border border-slate-700">
                    {sankeyData.year} ANNUAL
                </span>
            </div>
            <div className="h-[450px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <Sankey
                        data={sankeyData}
                        node={<SankeyNode containerWidth={containerWidth} />}
                        link={{ stroke: '#334155', fill: '#334155', strokeOpacity: 0.15 }}
                        margin={{ top: 40, bottom: 40, left: 20, right: 140 }}
                        iterations={64}
                        nodePadding={40}
                    >
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#1e293b',
                                border: 'none',
                                borderRadius: '8px',
                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                color: '#f8fafc'
                            }}
                            itemStyle={{ color: '#f8fafc' }}
                            formatter={(value) => [formatValue(value), 'Amount']}
                        />
                    </Sankey>
                </ResponsiveContainer>
            </div>
            <div className="mt-6 flex gap-6 justify-center">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-xs text-slate-400 font-medium">Revenue / Income</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-teal-500"></div>
                    <span className="text-xs text-slate-400 font-medium">Profit / Earnings</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-orange-600"></div>
                    <span className="text-xs text-slate-400 font-medium">Costs / Expenses</span>
                </div>
            </div>
        </div>
    );
};

export default SankeyChart;

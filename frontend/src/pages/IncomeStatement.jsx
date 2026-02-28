import React, { useEffect, useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { getIncomeStatement, getCashFlow } from '../api';
import DataTable from '../components/DataTable';
import SankeyChart from '../components/SankeyChart';
import { ComparisonChart, TrendChart, GroupedBarChart, BasicPieChart } from '../components/FinancialCharts';

const IncomeStatement = () => {
    const { companyId } = useOutletContext();
    const [data, setData] = useState(null);
    const [cfData, setCfData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (companyId) {
            setLoading(true);
            Promise.all([
                getIncomeStatement(companyId),
                getCashFlow(companyId)
            ])
                .then(([isRes, cfRes]) => {
                    let finalIsData = isRes.annual;
                    if (finalIsData && finalIsData.length > 0 && finalIsData[0].data && finalIsData[0].data[0] && !finalIsData[0].data[0].year) {
                        const flattened = [];
                        finalIsData.forEach(section => {
                            flattened.push({ ...section, data: [], bold: true, isHeader: true });
                            if (Array.isArray(section.data)) {
                                flattened.push(...section.data);
                            }
                        });
                        finalIsData = flattened;
                    }
                    setData(finalIsData);
                    setCfData(cfRes.indirect || cfRes.annual);
                })
                .finally(() => setLoading(false));
        }
    }, [companyId]);

    const chartData = useMemo(() => {
        if (!data) return null;

        const findRow = (st, label) => st?.find(d => d.label?.toLowerCase().includes(label.toLowerCase()));

        const rev = findRow(data, 'Net sales') || findRow(data, 'Revenue');
        const cos = findRow(data, 'Cost of sales');
        const gp = findRow(data, 'Gross Profit');
        const op = findRow(data, 'Operating Profit');
        const ni = findRow(data, 'Profit after tax') || findRow(data, 'Net Income');
        const ocf = findRow(cfData, 'Operating Cash Flow') || findRow(cfData, 'Net cash flow from operating activities');

        if (!rev) return null;

        const sorted = rev.data.map(d => {
            const yearStr = d.year;
            const getVal = (row) => {
                const item = row?.data?.find(p => p.year === yearStr);
                return item ? parseFloat(item.value) : 0;
            };

            const r = getVal(rev);
            const n = getVal(ni);
            const g = getVal(gp);
            const o = getVal(op);
            const c = getVal(cos);

            return {
                year: yearStr,
                revenue: r,
                costOfSales: Math.abs(c),
                grossProfit: g,
                netIncome: n,
                ocf: getVal(ocf),
                grossMargin: r > 0 ? (g / r) * 100 : 0,
                operatingMargin: r > 0 ? (o / r) * 100 : 0,
                netMargin: r > 0 ? (n / r) * 100 : 0
            };
        }).sort((a, b) => {
            const yearA = a.year.includes('-') ? parseInt(a.year.split('-')[1]) : parseInt(a.year);
            const yearB = b.year.includes('-') ? parseInt(b.year.split('-')[1]) : parseInt(b.year);
            if (isNaN(yearA) || isNaN(yearB)) {
                return a.year.localeCompare(b.year);
            }
            return yearA - yearB;
        });

        return sorted.slice(-5);
    }, [data, cfData]);

    const pieData = useMemo(() => {
        if (!data || !chartData || chartData.length === 0) return null;
        const latestYear = chartData[chartData.length - 1].year;

        const findVal = (label) => {
            const row = data.find(d => d.label?.toLowerCase().includes(label.toLowerCase()));
            const item = row?.data?.find(p => p.year === latestYear);
            return item ? Math.abs(parseFloat(item.value)) : 0;
        };

        const admin = findVal('Administrative');
        const dist = findVal('Distribution') || findVal('Selling');
        const finance = findVal('Finance cost') || findVal('Financial charges');
        const tax = findVal('Taxation');
        const other = findVal('Other operating expenses') || findVal('Other expenses');

        return [
            { name: 'Admin', value: admin },
            { name: 'Distribution', value: dist },
            { name: 'Finance', value: finance },
            { name: 'Tax', value: tax },
            { name: 'Other', value: other }
        ].filter(d => d.value > 0);
    }, [data, chartData]);

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-white">Income Statement (Annual)</h2>

            {chartData && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <ComparisonChart
                        title="Revenue vs Net Income"
                        data={chartData}
                        bars={[{ key: 'revenue', name: 'Revenue', color: '#3b82f6' }]}
                        lines={[{ key: 'netIncome', name: 'Net Income', color: '#10b981' }]}
                    />
                    <TrendChart
                        title="Profitability Margins (%)"
                        data={chartData}
                        unit="%"
                        metrics={[
                            { key: 'grossMargin', name: 'Gross Margin', color: '#f59e0b' },
                            { key: 'operatingMargin', name: 'Operating Margin', color: '#8b5cf6' },
                            { key: 'netMargin', name: 'Net Margin', color: '#10b981' }
                        ]}
                    />
                    <ComparisonChart
                        title="Earnings Quality (OCF/NI)"
                        data={chartData}
                        bars={[{ key: 'ocf', name: 'Op. Cash Flow', color: '#10b981' }]}
                        lines={[{ key: 'netIncome', name: 'Net Income', color: '#ef4444' }]}
                    />

                    <GroupedBarChart
                        title="Revenue vs Costs"
                        data={chartData}
                        bars={[
                            { key: 'revenue', name: 'Revenue', color: '#3b82f6' },
                            { key: 'costOfSales', name: 'Cost of Sales', color: '#ef4444' },
                            { key: 'grossProfit', name: 'Gross Profit', color: '#10b981' }
                        ]}
                    />

                    {pieData && pieData.length > 0 && (
                        <BasicPieChart
                            title={`Expense Mix (${chartData[chartData.length - 1].year})`}
                            data={pieData}
                        />
                    )}
                </div>
            )}

            {data && !loading && <SankeyChart data={data} />}

            <DataTable data={data} loading={loading} />
        </div>
    );
};

export default IncomeStatement;

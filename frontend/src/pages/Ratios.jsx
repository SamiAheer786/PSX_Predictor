import React, { useEffect, useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { getRatios } from '../api';
import DataTable from '../components/DataTable';
import { TrendChart, SimpleLineChart } from '../components/FinancialCharts';

const RatioSection = ({ section, data }) => {
    const chartData = useMemo(() => {
        const primaryRatios = {
            'Profitability': 'ROE',
            'Valuation': 'PER',
            'Liquidity': 'Current Ratio',
            'Turnover': ['Receivable days', 'Inventory days', 'Payable days']
        };

        const ratioLabel = primaryRatios[section];
        if (!ratioLabel) return null;

        if (Array.isArray(ratioLabel)) {
            // Multi-metric chart for Efficiency
            const years = new Set();
            ratioLabel.forEach(label => {
                const row = data.find(r => r.label?.includes(label));
                row?.data?.forEach(d => years.add(d.year));
            });

            return Array.from(years).map(year => {
                const point = { year };
                ratioLabel.forEach(label => {
                    const row = data.find(r => r.label?.includes(label));
                    const item = row?.data?.find(d => d.year === year);
                    const key = label.toLowerCase().replace(' ', '');
                    point[key] = item ? parseFloat(item.value) : 0;
                });
                return point;
            }).sort((a, b) => {
                const yearA = a.year.includes('-') ? parseInt(a.year.split('-')[1]) : parseInt(a.year);
                const yearB = b.year.includes('-') ? parseInt(b.year.split('-')[1]) : parseInt(b.year);
                return yearA - yearB;
            }).slice(-5);
        }

        const row = data.find(r => r.label?.includes(ratioLabel));
        if (!row) return null;

        const sorted = row.data.map(d => ({
            year: d.year,
            value: parseFloat(d.value)
        })).sort((a, b) => {
            const yearA = a.year.includes('-') ? parseInt(a.year.split('-')[1]) : parseInt(a.year);
            const yearB = b.year.includes('-') ? parseInt(b.year.split('-')[1]) : parseInt(b.year);
            return yearA - yearB;
        });

        return sorted.slice(-5);
    }, [section, data]);

    const chartTitle = {
        'Profitability': 'Return on Equity (ROE) Trend',
        'Valuation': 'Price-to-Earnings (P/E) Trend',
        'Liquidity': 'Current Ratio Trend',
        'Turnover': 'Operating Efficiency (Days)'
    }[section];

    const renderChart = () => {
        if (!chartData) return null;

        if (section === 'Turnover') {
            return (
                <SimpleLineChart
                    title={chartTitle}
                    data={chartData}
                    metrics={[
                        { key: 'receivabledays', name: 'Receivable Days', color: '#10b981' },
                        { key: 'inventorydays', name: 'Inventory Days', color: '#f59e0b' },
                        { key: 'payabledays', name: 'Payable Days', color: '#ef4444' }
                    ]}
                />
            );
        }

        return (
            <TrendChart
                title={chartTitle}
                data={chartData}
                unit={section === 'Profitability' ? '%' : ''}
                metrics={[
                    { key: 'value', name: section === 'Profitability' ? 'ROE %' : 'Value', color: section === 'Valuation' ? '#3b82f6' : '#10b981' }
                ]}
            />
        );
    };

    return (
        <div className="space-y-6">
            <div className="max-w-4xl">
                {renderChart()}
            </div>
            <DataTable
                title={section}
                data={data}
                loading={false}
            />
        </div>
    );
};

const Ratios = () => {
    const { companyId } = useOutletContext();
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (companyId) {
            setLoading(true);
            getRatios(companyId)
                .then(res => setSections(res))
                .catch(console.error)
                .finally(() => setLoading(false));
        }
    }, [companyId]);

    if (loading) return <div className="text-slate-400 p-6">Loading ratios...</div>;

    return (
        <div className="space-y-12">
            <h2 className="text-xl font-bold text-white px-6 pt-6">Financial Ratios</h2>
            <div className="px-6 pb-6 space-y-12">
                {sections.map((section, idx) => (
                    <RatioSection
                        key={idx}
                        section={section.section}
                        data={section.data}
                    />
                ))}
            </div>
        </div>
    );
};

export default Ratios;

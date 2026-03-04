import React, { useState, useMemo } from 'react';
import { TrendChart, SimpleLineChart, GroupedBarChart } from './FinancialCharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#14b8a6'];

const extractSingleRatioData = (data, ratioLabel) => {
    const row = data.find(r => r.label === ratioLabel);
    if (!row || !row.data) return null;
    return row.data.map(d => ({
        year: d.year,
        value: d.value && !isNaN(parseFloat(d.value)) ? parseFloat(d.value) : null
    })).sort((a, b) => {
        const yearA = a.year.includes('-') ? parseInt(a.year.split('-')[1]) : parseInt(a.year);
        const yearB = b.year.includes('-') ? parseInt(b.year.split('-')[1]) : parseInt(b.year);
        return yearA - yearB;
    });
};

const extractMultiRatioData = (data, selectedLabels) => {
    if (!selectedLabels || selectedLabels.length === 0) return null;

    const years = new Set();
    const ratioRows = selectedLabels.map(label => data.find(row => row.label === label)).filter(Boolean);

    if (ratioRows.length === 0) return null;

    ratioRows.forEach(row => {
        row.data?.forEach(d => years.add(d.year));
    });

    const chartData = Array.from(years).sort((a, b) => {
        const yearA = a.includes('-') ? parseInt(a.split('-')[1]) : parseInt(a);
        const yearB = b.includes('-') ? parseInt(b.split('-')[1]) : parseInt(b);
        return yearA - yearB;
    }).map(year => {
        const point = { year };
        selectedLabels.forEach(label => {
            const row = data.find(r => r.label === label);
            if (row) {
                const item = row.data?.find(d => d.year === year);
                const key = label.toLowerCase().replace(/[^a-z0-9]/g, '');
                point[key] = item && item.value && !isNaN(parseFloat(item.value)) ? parseFloat(item.value) : null;
            }
        });
        return point;
    });

    return chartData;
};

const DynamicDataView = ({ data, title, defaultChartType = 'area' }) => {
    const [selectedVariables, setSelectedVariables] = useState([]);

    const validVariables = useMemo(() => {
        if (!data || !Array.isArray(data)) return [];
        return data.filter(row => {
            if (!row.label || !row.data || row.data.length === 0) return false;
            return row.data.some(d => d.value && !isNaN(parseFloat(d.value)));
        });
    }, [data]);

    const defaultVariables = useMemo(() => validVariables.slice(0, 4), [validVariables]);

    const toggleVariable = (label) => {
        setSelectedVariables(prev =>
            prev.includes(label)
                ? prev.filter(l => l !== label)
                : [...prev, label]
        );
    };

    const renderDefaultCharts = () => {
        if (defaultVariables.length === 0) return null;

        const charts = defaultVariables.map((row, idx) => {
            const chartData = extractSingleRatioData(data, row.label);
            if (!chartData || chartData.length === 0) return null;

            const unit = row.unit === '%' || (title && (title.includes('Margin') || title.includes('Return') || title.includes('Growth'))) ? '%' : '';

            const chartProps = {
                title: `${row.label} Trend`,
                data: chartData,
                unit: unit,
            };

            const color = COLORS[idx % COLORS.length];

            let ChartComponent;
            if (defaultChartType === 'bar') {
                ChartComponent = GroupedBarChart;
                chartProps.bars = [{ key: 'value', name: row.label, color }];
            } else if (defaultChartType === 'line') {
                ChartComponent = SimpleLineChart;
                chartProps.metrics = [{ key: 'value', name: row.label, color }];
            } else {
                ChartComponent = TrendChart;
                chartProps.metrics = [{ key: 'value', name: row.label, color }];
            }

            return (
                <div key={row.label} className="w-full">
                    <ChartComponent {...chartProps} />
                </div>
            );
        }).filter(Boolean);

        if (charts.length === 0) return null;

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 mt-6">
                {charts}
            </div>
        );
    };

    const renderCustomComparison = () => {
        if (validVariables.length === 0) return null;

        const chartData = extractMultiRatioData(data, selectedVariables);

        const metrics = selectedVariables.map((label, idx) => ({
            key: label.toLowerCase().replace(/[^a-z0-9]/g, ''),
            name: label,
            color: COLORS[idx % COLORS.length]
        }));

        const isPercentage = title && (title.includes('Margin') || title.includes('Return') || title.includes('Growth'));

        return (
            <div className="card p-6 bg-slate-900/40 border-slate-800 mb-8">
                <h4 className="text-sm font-bold text-slate-400 mb-4 uppercase tracking-wider">Compare Variables</h4>

                <div className="flex flex-wrap gap-2 mb-6 max-h-48 overflow-y-auto custom-scrollbar p-1">
                    {validVariables.map(row => {
                        const isSelected = selectedVariables.includes(row.label);
                        return (
                            <button
                                key={row.label}
                                onClick={() => toggleVariable(row.label)}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border whitespace-nowrap ${isSelected
                                        ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20'
                                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                                    }`}
                            >
                                {row.label}
                            </button>
                        );
                    })}
                </div>

                {selectedVariables.length > 0 ? (
                    <div className="max-w-4xl h-72">
                        <SimpleLineChart
                            title="Custom Comparison"
                            data={chartData}
                            metrics={metrics}
                            unit={isPercentage ? '%' : ''}
                        />
                    </div>
                ) : (
                    <div className="h-32 flex items-center justify-center text-slate-500 text-sm border border-dashed border-slate-700 rounded-lg">
                        Select multiple variables above to plot a comparison chart
                    </div>
                )}
            </div>
        );
    };

    if (validVariables.length === 0) return null;

    return (
        <div className="space-y-4 mb-12 animate-fade-in border border-slate-800/60 rounded-xl p-6 bg-slate-950/20">
            {title && (
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h3 className="text-xl font-bold font-display text-white border-l-4 border-blue-500 pl-3">
                        {title} Default Variables
                    </h3>
                    <div className="bg-slate-800/50 px-4 py-1.5 rounded-full border border-slate-700/50">
                        <span className="text-xs font-medium text-slate-300">
                            Showing top 4 variables as <span className="text-blue-400 font-bold uppercase">{defaultChartType}</span> charts
                        </span>
                    </div>
                </div>
            )}

            {renderDefaultCharts()}
            {renderCustomComparison()}
        </div>
    );
};

export default DynamicDataView;

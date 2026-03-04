import React, { useEffect, useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { getCashFlow } from '../api';
import DataTable from '../components/DataTable';
import { ComparisonChart, TrendChart, BasicPieChart } from '../components/FinancialCharts';
import DynamicDataView from '../components/DynamicDataView';

const CashFlow = () => {
    const { companyId } = useOutletContext();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (companyId) {
            setLoading(true);
            getCashFlow(companyId)
                .then(res => setData(res.indirect || res.annual)) // Use indirect usually, fallback to annual/direct
                .catch(console.error)
                .finally(() => setLoading(false));
        }
    }, [companyId]);

    const chartData = useMemo(() => {
        if (!data) return null;

        const findRow = (label) => data.find(d => d.label?.toLowerCase().includes(label.toLowerCase()));
        const ocf = findRow('Operating Cash Flow') || findRow('Net cash flow from operating activities');
        const icf = findRow('Investing Cash Flow') || findRow('Net cash flow from investing activities');
        const fcf_act = findRow('Financing Cash Flow') || findRow('Net cash flow from financing activities');
        const capex = findRow('Net capital expenditure') || findRow('fixed assets');

        if (!ocf) return null;

        const sorted = ocf.data.map(d => {
            const yearStr = d.year;
            const getVal = (row) => {
                const item = row?.data?.find(p => p.year === yearStr);
                return item ? parseFloat(item.value) : 0;
            };

            const o = getVal(ocf);
            const i = getVal(icf);
            const f = getVal(fcf_act);
            const c = Math.abs(getVal(capex));

            return {
                year: yearStr,
                ocf: o,
                icf: i,
                fcf_act: f,
                capex: c,
                freeCashFlow: o - c
            };
        }).sort((a, b) => {
            const yearA = a.year.includes('-') ? parseInt(a.year.split('-')[1]) : parseInt(a.year);
            const yearB = b.year.includes('-') ? parseInt(b.year.split('-')[1]) : parseInt(b.year);
            if (isNaN(yearA) || isNaN(yearB)) return a.year.localeCompare(b.year);
            return yearA - yearB;
        });

        return sorted.slice(-5);
    }, [data]);

    const usageMix = useMemo(() => {
        if (!data || !chartData || chartData.length === 0) return null;
        const latestYear = chartData[chartData.length - 1].year;

        const findVal = (label) => {
            const row = data.find(d => d.label?.toLowerCase().includes(label.toLowerCase()));
            const item = row?.data?.find(p => p.year === latestYear);
            return item ? Math.abs(parseFloat(item.value)) : 0;
        };

        return [
            { name: 'Capex', value: findVal('fixed assets') || findVal('Net capital expenditure') },
            { name: 'Dividends', value: findVal('Dividend paid') },
            { name: 'Debt Repayment', value: findVal('Repayment of loans') || findVal('Long term loans repaid') },
            { name: 'Investments', value: findVal('Investments purchased') || findVal('Short term investments') }
        ].filter(d => d.value > 0);
    }, [data, chartData]);

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-white">Cash Flow Statement (Annual)</h2>

            {data && <DynamicDataView data={data} title="Cash Flow" defaultChartType="line" />}

            {chartData && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <ComparisonChart
                        title="Cash Flow Components"
                        data={chartData}
                        bars={[
                            { key: 'ocf', name: 'Operating', color: '#10b981' },
                            { key: 'icf', name: 'Investing', color: '#f59e0b' },
                            { key: 'fcf_act', name: 'Financing', color: '#3b82f6' }
                        ]}
                    />
                    <TrendChart
                        title="Free Cash Flow Trend"
                        data={chartData}
                        metrics={[
                            { key: 'freeCashFlow', name: 'Free Cash Flow', color: '#8b5cf6' }
                        ]}
                    />
                    <ComparisonChart
                        title="Capex Coverage (OCF vs Capex)"
                        data={chartData}
                        bars={[{ key: 'ocf', name: 'Op. Cash Flow', color: '#10b981' }]}
                        lines={[{ key: 'capex', name: 'Capex', color: '#ef4444' }]}
                    />

                    {usageMix && usageMix.length > 0 && (
                        <BasicPieChart
                            title={`Cash Usage Mix (${chartData[chartData.length - 1].year})`}
                            data={usageMix}
                        />
                    )}
                </div>
            )}

            <DataTable data={data} loading={loading} />
        </div>
    );
};

export default CashFlow;

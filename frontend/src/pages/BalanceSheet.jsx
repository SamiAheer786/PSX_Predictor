import React, { useEffect, useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { getBalanceSheet } from '../api';
import DataTable from '../components/DataTable';
import { CompositionChart, TrendChart, ComparisonChart, GroupedBarChart, BasicPieChart } from '../components/FinancialCharts';

const BalanceSheet = () => {
    const { companyId } = useOutletContext();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (companyId) {
            setLoading(true);
            getBalanceSheet(companyId)
                .then(res => {
                    let finalData = res.annual;
                    // Check for nested structure
                    if (finalData && finalData.length > 0 && finalData[0].data && finalData[0].data[0] && !finalData[0].data[0].year) {
                        const flattened = [];
                        finalData.forEach(section => {
                            flattened.push({ ...section, data: [], bold: true, isHeader: true });
                            if (Array.isArray(section.data)) {
                                flattened.push(...section.data);
                            }
                        });
                        finalData = flattened;
                    }
                    setData(finalData);
                })
                .catch(err => console.error("BS Fetch Error:", err))
                .finally(() => setLoading(false));
        }
    }, [companyId]);

    const chartData = useMemo(() => {
        if (!data) return null;

        const findRow = (label) => data.find(d => d.label?.toLowerCase().includes(label.toLowerCase()));

        const assets = findRow('Total assets');
        const liabilities = findRow('Total liabilities');
        const equity = findRow('Total equity');
        const cAssets = findRow('Total current assets');
        const ncAssets = findRow('Total non-current assets');
        const cLiab = findRow('Total current liabilities');
        const ncLiab = findRow('Total non-current liabilities');
        const cash = findRow('Cash & bank balances') || findRow('Cash and cash equivalents');
        const ltDebt = findRow('Long-term debt') || findRow('Long term loans');
        const stDebt = findRow('Short term borrowings') || findRow('Short term loans');

        if (!assets) return null;

        const sorted = assets.data.map(d => {
            const yearStr = d.year;
            const getVal = (row) => {
                const item = row?.data?.find(p => p.year === yearStr);
                return item ? parseFloat(item.value) : 0;
            };

            const lDebt = getVal(ltDebt);
            const sDebt = getVal(stDebt);

            return {
                year: yearStr,
                assets: getVal(assets),
                liabilities: getVal(liabilities),
                equity: getVal(equity),
                currentAssets: getVal(cAssets),
                nonCurrentAssets: getVal(ncAssets),
                currentLiabilities: getVal(cLiab),
                nonCurrentLiabilities: getVal(ncLiab),
                cash: getVal(cash),
                totalDebt: lDebt + sDebt
            };
        }).sort((a, b) => {
            const yearA = a.year.includes('-') ? parseInt(a.year.split('-')[1]) : parseInt(a.year);
            const yearB = b.year.includes('-') ? parseInt(b.year.split('-')[1]) : parseInt(b.year);
            if (isNaN(yearA) || isNaN(yearB)) return a.year.localeCompare(b.year);
            return yearA - yearB;
        });

        return sorted.slice(-5);
    }, [data]);

    const assetMix = useMemo(() => {
        if (!data || !chartData || chartData.length === 0) return null;
        const latestYear = chartData[chartData.length - 1].year;

        const findVal = (label) => {
            const row = data.find(d => d.label?.toLowerCase().includes(label.toLowerCase()));
            const item = row?.data?.find(p => p.year === latestYear);
            return item ? Math.abs(parseFloat(item.value)) : 0;
        };

        return [
            { name: 'Cash', value: findVal('Cash & bank balances') || findVal('Cash and cash equivalents') },
            { name: 'Receivables', value: findVal('Trade debts') || findVal('Account receivables') },
            { name: 'Inventory', value: findVal('Stock-in-trade') || findVal('Inventory') },
            { name: 'Fixed Assets', value: findVal('Property, plant and equipment') },
            { name: 'Investments', value: findVal('Long term investments') }
        ].filter(d => d.value > 0);
    }, [data, chartData]);

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-white">Balance Sheet (Annual)</h2>

            {chartData && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <CompositionChart
                        title="Capital Structure"
                        data={chartData}
                        keys={[
                            { key: 'liabilities', name: 'Liabilities', color: '#ef4444' },
                            { key: 'equity', name: 'Equity', color: '#10b981' }
                        ]}
                    />
                    <TrendChart
                        title="Asset Composition"
                        data={chartData}
                        metrics={[
                            { key: 'currentAssets', name: 'Current Assets', color: '#3b82f6' },
                            { key: 'nonCurrentAssets', name: 'Non-Current Assets', color: '#8b5cf6' }
                        ]}
                    />
                    <ComparisonChart
                        title="Liquidity Buffer (Cash vs Debt)"
                        data={chartData}
                        bars={[{ key: 'cash', name: 'Cash', color: '#10b981' }]}
                        lines={[{ key: 'totalDebt', name: 'Total Debt', color: '#ef4444' }]}
                    />

                    <GroupedBarChart
                        title="Liability Structure"
                        data={chartData}
                        bars={[
                            { key: 'currentLiabilities', name: 'Current Liab.', color: '#f59e0b' },
                            { key: 'nonCurrentLiabilities', name: 'Non-Current Liab.', color: '#ef4444' }
                        ]}
                    />

                    {assetMix && assetMix.length > 0 && (
                        <BasicPieChart
                            title={`Asset Mix (${chartData[chartData.length - 1].year})`}
                            data={assetMix}
                        />
                    )}
                </div>
            )}

            <DataTable data={data} loading={loading} />
        </div>
    );
};

export default BalanceSheet;

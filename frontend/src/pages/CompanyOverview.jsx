import React, { useState, useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { getCompanyOverview } from '../api';
import StockPriceChart from '../components/StockPriceChart';
import OverviewGrid from '../components/OverviewGrid';

const CompanyOverview = () => {
    const { companyId } = useOutletContext();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (companyId) {
            setLoading(true);
            getCompanyOverview(companyId)
                .then(setData)
                .catch(console.error)
                .finally(() => setLoading(false));
        }
    }, [companyId]);

    const grids = useMemo(() => {
        if (!data) return {};

        const { quote, stock_data, financials, chart_data, balance_sheet } = data;

        // Helper to find last value in financials/stock_data series
        const getLast = (arr, label) => {
            const item = arr?.find(x => x.label === label);
            return item?.data?.[item.data.length - 1]?.value || "-";
        };

        // Helper to formatting numbers
        const fmtNum = (n) => isNaN(n) ? "-" : Number(n).toLocaleString();

        // 1. Trading Data
        const tradingData = [
            { label: "Open", value: quote?.open },
            { label: "High", value: quote?.high },
            { label: "Low", value: quote?.low },
            { label: "LDCP", value: quote?.last_close },
            { label: "Volume", value: quote?.volume },
            { label: "Value (PKRmn)", value: "-" },
            { label: "Circuit Breaker", value: quote?.circuit_breaker },
            { label: "Day Range", value: quote?.day_range },
        ];

        // 2. Returns & History calculations from Stock Chart Data
        const getReturn = (labelStr) => {
            // chart_data is likely an array of objects: [{ lable: "1M", data: [...]}, { lable: "3M", ... }]
            // Or if it's a single object for "ALL", we might need to filter. 
            // Based on probe, it's a list. We find the one with matching label.
            if (!Array.isArray(chart_data)) return "-";

            const item = chart_data.find(d => d.lable === labelStr);
            if (!item || !item.data || item.data.length < 2) return "-";

            // Sort by date just in case
            // Assuming data is [{x: "date", y: "price"}, ...]
            const points = item.data;
            const first = parseFloat(points[0].y);
            const last = parseFloat(points[points.length - 1].y);

            if (!first) return "-";

            const ret = ((last - first) / first) * 100;
            return ret.toFixed(1);
        };

        // Extract 52-week from range
        const [w52Low, w52High] = quote?.week_52_range?.split(' — ') || ["-", "-"];

        // 52 Week Average: Use "1Y" data if available to calc average
        const get52WeekAvg = () => {
            if (!Array.isArray(chart_data)) return "-";
            const item = chart_data.find(d => d.lable === "1Y") || chart_data.find(d => d.lable === "ALL");
            if (!item?.data) return "-";

            const sum = item.data.reduce((acc, curr) => acc + (parseFloat(curr.y) || 0), 0);
            const avg = sum / item.data.length;
            return avg.toFixed(2);
        };

        const returnsData = [
            { label: "52-Week High", value: w52High },
            { label: "1M Return (%)", value: getReturn("1M") },
            { label: "1Y Return (%)", value: quote?.one_year_change?.replace('%', '') || getReturn("1Y") },
            { label: "52-Week Low", value: w52Low },
            { label: "3M Return (%)", value: getReturn("3M") },
            { label: "3Y Return (%)", value: getReturn("3Y") },
            { label: "52-Week Average", value: fmtNum(get52WeekAvg()) },
            { label: "6M Return (%)", value: getReturn("6M") },
            { label: "5Y Return (%)", value: getReturn("5Y") },
        ];

        // 3. Valuation: Calculate EV from Balance Sheet
        // Need to find "Cash and Bank Balances" and "Total Debt" in Balance Sheet
        // Balance Sheet structure assumed: [{ data: [{ label: "Cash...", value: ... }]}] or similar
        const getBSValue = (labelPart) => {
            if (!balance_sheet || !Array.isArray(balance_sheet) || balance_sheet.length === 0) return 0;
            // Check if it's grouped by year (list of objects with data array)
            // We want the LATEST year (usually first in list or we sort)
            // Probed data implies structure might be list of items.

            for (const yearGroup of balance_sheet) {
                if (yearGroup.data && Array.isArray(yearGroup.data)) {
                    const found = yearGroup.data.find(d => d.label && d.label.toLowerCase().includes(labelPart.toLowerCase()));
                    if (found && found.value) return parseFloat(found.value.replace(/,/g, ''));
                }
            }
            return 0;
        };

        const cash = getBSValue("Cash and Bank");
        const longTermLoan = getBSValue("Long Term Loan");
        const shortTermLoan = getBSValue("Short Term Loan");
        const currentPortion = getBSValue("Current Portion of Long Term");

        const totalDebt = longTermLoan + shortTermLoan + currentPortion;

        const price = parseFloat(quote?.last_close?.replace(/,/g, '').replace('Rs.', '')) || 0;
        // Total Shares in MN
        const outstandingSharesObj = stock_data?.find(x => x.label === "Outstanding Shares - Adjusted");
        const totalSharesObj = outstandingSharesObj?.data?.find(x => x.label === "Total Shares");
        const totalShares = parseFloat(totalSharesObj?.data?.[totalSharesObj.data.length - 1]?.value || 0);

        // Market Cap = Price * Shares (in Millions) -> Result in Millions (PKR)
        const marketCap = totalShares * price;

        // EV = Market Cap + Debt - Cash
        const ev = marketCap + totalDebt - cash;

        const pe = quote?.pe_ratio || getLast(financials, "PER");
        const pbv = getLast(financials, "PBV");
        const dy = getLast(financials, "Div Yield");

        const valuationData = [
            { label: "PE", value: pe },
            { label: "Div Yield", value: dy },
            { label: "PBV", value: pbv },
            { label: "Enterprise Value (PKR-mn)", value: fmtNum(ev.toFixed(1)) },
            { label: "Total Debt (PKR-mn)", value: fmtNum(totalDebt.toFixed(1)) },
            { label: "Cash (PKR-mn)", value: fmtNum(cash.toFixed(1)) },
        ];

        // 4. Equity Profile
        const freeFloatObj = outstandingSharesObj?.data?.find(x => x.label === "Free Float");
        const freeFloatPercent = freeFloatObj?.data?.[freeFloatObj.data.length - 1]?.value || 0;
        const freeFloatSharesObj = outstandingSharesObj?.data?.find(x => x.label === "Free Float Shares");
        const freeFloatShares = freeFloatSharesObj?.data?.[freeFloatSharesObj.data.length - 1]?.value || 0;

        const equityData = [
            { label: "Market Cap (PKR-mn)", value: fmtNum(marketCap.toFixed(2)) },
            { label: "Shares (PKR-mn)", value: totalShares },
            { label: "Free Float (PKR-mn)", value: freeFloatShares },
            { label: "Free Float (%)", value: freeFloatPercent },
        ];

        return { tradingData, returnsData, valuationData, equityData };
    }, [data]);

    if (loading) return <div className="text-slate-400 p-8">Loading overview...</div>;
    if (!data) return <div className="text-slate-400 p-8">Unable to load company data.</div>;

    return (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Left Column: Chart */}
            <div className="xl:col-span-2">
                <StockPriceChart
                    data={data.stock_data}
                    chartData={data.chart_data}
                    company={data.company}
                    quote={data.quote}
                />

                {/* Description below chart */}
                <div className="mt-8 bg-white dark:bg-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-800">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">About {data.company?.name}</h3>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                        {data.profile?.business_description || "No description available."}
                    </p>
                </div>
            </div>

            {/* Right Column: Data Tables */}
            <div className="space-y-6">
                <OverviewGrid title="Trading Data" data={grids.tradingData} columns={2} />
                <OverviewGrid title="Returns & History" data={grids.returnsData} columns={2} />
                <OverviewGrid title="Valuation" data={grids.valuationData} columns={2} />
                <OverviewGrid title="Equity Profile" data={grids.equityData} columns={2} />
            </div>
        </div>
    );
};

export default CompanyOverview;

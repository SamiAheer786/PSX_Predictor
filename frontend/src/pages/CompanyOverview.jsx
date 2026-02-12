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

        const { quote, stock_data, financials, profile } = data;

        // Helper to find last value in financials/stock_data series
        const getLast = (arr, label) => {
            const item = arr?.find(x => x.label === label);
            return item?.data?.[item.data.length - 1]?.value || "-";
        };

        // Trading Data
        const tradingData = [
            { label: "Open", value: quote?.open },
            { label: "High", value: quote?.high },
            { label: "Low", value: quote?.low },
            { label: "LDCP", value: quote?.last_close }, // Using last close as proxy
            { label: "Volume", value: quote?.volume },
            { label: "Value (PKRmn)", value: "-" }, // Not readily available
            { label: "Circuit Breaker", value: quote?.circuit_breaker },
            { label: "Day Range", value: quote?.day_range },
        ];

        // Returns & History
        // Extract 52-week from range string "790.00 — 1,304.00"
        const [w52Low, w52High] = quote?.week_52_range?.split(' — ') || ["-", "-"];

        const returnsData = [
            { label: "52-Week High", value: w52High },
            { label: "1M Return (%)", value: "-" }, // Need calculation
            { label: "1Y Return (%)", value: quote?.one_year_change?.replace('%', '') },
            { label: "52-Week Low", value: w52Low },
            { label: "3M Return (%)", value: "-" },
            { label: "3Y Return (%)", value: "-" },
            { label: "52-Week Average", value: "-" },
            { label: "6M Return (%)", value: "-" },
            { label: "5Y Return (%)", value: "-" },
        ];

        // Valuation
        // PER is in quote or financials
        const pe = quote?.pe_ratio || getLast(financials, "PER");
        const pbv = getLast(financials, "PBV");
        const dy = getLast(financials, "Div Yield");

        const valuationData = [
            { label: "PE", value: pe },
            { label: "Div Yield", value: dy },
            { label: "PBV", value: pbv },
            { label: "Enterprise Value (PKR-mn)", value: "-" },
            { label: "Total Debt (PKR-mn)", value: "-" },
            { label: "Cash (PKR-mn)", value: "-" },
        ];

        // Equity Profile
        // Share count in stock_data -> Outstanding Shares - Adjusted -> Total Shares
        const outstandingSharesObj = stock_data?.find(x => x.label === "Outstanding Shares - Adjusted");
        const totalSharesObj = outstandingSharesObj?.data?.find(x => x.label === "Total Shares");
        const totalShares = totalSharesObj?.data?.[totalSharesObj.data.length - 1]?.value || 0;

        const freeFloatObj = outstandingSharesObj?.data?.find(x => x.label === "Free Float"); // %
        const freeFloatPercent = freeFloatObj?.data?.[freeFloatObj.data.length - 1]?.value || 0;

        const freeFloatSharesObj = outstandingSharesObj?.data?.find(x => x.label === "Free Float Shares"); // mn
        const freeFloatShares = freeFloatSharesObj?.data?.[freeFloatSharesObj.data.length - 1]?.value || 0;

        // Market Cap = Price * Shares
        const price = parseFloat(quote?.last_close?.replace(/,/g, '').replace('Rs.', '')) || 0;
        const marketCap = (totalShares * price).toFixed(2); // Shares in mn * price = mn PKR? Needs unit check. 
        // If shares are in MN, Market Cap is in MN.

        const equityData = [
            { label: "Market Cap (PKR-mn)", value: isNaN(marketCap) ? "-" : parseFloat(marketCap).toLocaleString() },
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

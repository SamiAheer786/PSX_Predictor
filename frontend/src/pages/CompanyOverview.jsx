import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { getCompanyOverview } from '../api';
import FinancialSummary from '../components/FinancialSummary';
import ValuationTable from '../components/ValuationTable';
import StockData from '../components/StockData';
import KeyPeople from '../components/KeyPeople';
import BusinessDescription from '../components/BusinessDescription';

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

    if (loading) return <div className="text-slate-400">Loading overview...</div>;
    if (!data) return null;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
                <FinancialSummary financials={data.financials} />
                <StockData stockData={data.stock_data} quote={data.quote} />
            </div>

            <div className="space-y-8">
                <ValuationTable industry={data.industry} currentStats={data.quote} />
                <KeyPeople people={data.profile?.key_people} />
                <BusinessDescription description={data.profile?.business_description} />
            </div>
        </div>
    );
};

export default CompanyOverview;

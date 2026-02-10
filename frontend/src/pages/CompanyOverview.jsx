import React, { useState, useEffect } from 'react';
import { getCompanies, getCompanyOverview } from '../api';
import Header from '../components/Header';
import FinancialSummary from '../components/FinancialSummary';
import ValuationTable from '../components/ValuationTable';
import StockData from '../components/StockData';
import KeyPeople from '../components/KeyPeople';
import BusinessDescription from '../components/BusinessDescription';

const CompanyOverview = () => {
    const [companies, setCompanies] = useState([]);
    const [selectedCompanyId, setSelectedCompanyId] = useState(1); // Default to first company
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        getCompanies().then(setCompanies).catch(console.error);
    }, []);

    useEffect(() => {
        setLoading(true);
        getCompanyOverview(selectedCompanyId)
            .then(setData)
            .catch((err) => {
                console.error(err);
                setError("Failed to load company data.");
            })
            .finally(() => setLoading(false));
    }, [selectedCompanyId]);

    if (loading) return <div className="flex h-screen items-center justify-center text-xl text-blue-400">Loading AskAnalyst...</div>;
    if (error) return <div className="text-red-500 text-center mt-10">{error}</div>;
    if (!data) return null;

    return (
        <div className="container mx-auto px-4 py-8 space-y-8 max-w-7xl">
            {/* Search / Selector */}
            <div className="flex justify-end">
                <select
                    className="bg-slate-800 border border-slate-700 rounded px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={selectedCompanyId}
                    onChange={(e) => setSelectedCompanyId(Number(e.target.value))}
                >
                    {companies.map(c => (
                        <option key={c.value} value={c.value}>{c.label2} - {c.name}</option>
                    ))}
                </select>
            </div>

            <Header company={data.company} quote={data.quote} />

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
        </div>
    );
};

export default CompanyOverview;
